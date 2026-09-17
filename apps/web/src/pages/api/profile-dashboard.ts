import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import {
  type ProfileDashboardChainResult,
  profileDashboardQuery,
  type ProfileDashboardQueryMode,
} from '@buildeross/sdk/subgraph'
import type { CHAIN_ID } from '@buildeross/types'
import { withTimeout } from '@buildeross/utils/withTimeout'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { type Hex, isAddress, keccak256 } from 'viem'

const CACHE_TTL_SECONDS = 60
const CACHE_PREFIX = 'profile-dashboard:v4'
const SUPPORTED_MODES = new Set<ProfileDashboardQueryMode>(['all', 'summary', 'tokens'])
const inFlightRequests = new Map<string, Promise<ProfileDashboardApiResponse>>()
const profileDashboardQueryWithSignal = profileDashboardQuery as (
  chainId: CHAIN_ID,
  address: string,
  options: { mode?: ProfileDashboardQueryMode; signal?: AbortSignal }
) => Promise<ProfileDashboardChainResult>

export type ProfileDashboardApiResponse = {
  mode: ProfileDashboardQueryMode
  chains: Array<{
    chainId: CHAIN_ID
    chainName: string
    chainSlug: string
    result?: ProfileDashboardChainResult
    error?: string
  }>
}

export const getProfileDashboardCacheKey = (
  address: string,
  mode: ProfileDashboardQueryMode
) => {
  const addressHash = keccak256(address.toLowerCase() as Hex).slice(0, 18)
  return `${CACHE_PREFIX}:${mode}:${addressHash}`
}

const isProfileDashboardApiResponse = (
  value: unknown,
  mode: ProfileDashboardQueryMode
): value is ProfileDashboardApiResponse => {
  if (!value || typeof value !== 'object') return false
  const response = value as Partial<ProfileDashboardApiResponse>
  return (
    response.mode === mode &&
    Array.isArray(response.chains) &&
    response.chains.every(
      (chain) =>
        !!chain &&
        typeof chain.chainId === 'number' &&
        typeof chain.chainName === 'string' &&
        typeof chain.chainSlug === 'string' &&
        (!!chain.result || typeof chain.error === 'string')
    )
  )
}

const fetchDashboard = async (
  address: string,
  mode: ProfileDashboardQueryMode
): Promise<ProfileDashboardApiResponse> => {
  const settled = await Promise.allSettled(
    PUBLIC_DEFAULT_CHAINS.map(async (chain) => {
      const controller = new AbortController()

      return {
        chainId: chain.id,
        chainName: chain.name,
        chainSlug: chain.slug,
        result: await withTimeout(
          () =>
            profileDashboardQueryWithSignal(chain.id, address, {
              mode,
              signal: controller.signal,
            }),
          12_000,
          `Profile dashboard ${mode} request for chain ${chain.id}`,
          () => controller.abort()
        ),
      }
    })
  )

  const chains = settled.map((result, index) => {
    const chain = PUBLIC_DEFAULT_CHAINS[index]
    if (result.status === 'fulfilled') return result.value

    console.warn('Profile dashboard chain unavailable', {
      chainId: chain.id,
      address,
      mode,
      error: result.reason instanceof Error ? result.reason.message : result.reason,
    })
    return {
      chainId: chain.id,
      chainName: chain.name,
      chainSlug: chain.slug,
      error: 'Profile data unavailable for this chain.',
    }
  })

  return { mode, chains }
}

export async function profileDashboardHandler(
  req: NextApiRequest,
  res: NextApiResponse<ProfileDashboardApiResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const address = typeof req.query.address === 'string' ? req.query.address : ''
  if (!isAddress(address, { strict: false })) {
    return res.status(400).json({ error: 'Invalid profile address' })
  }

  const requestedMode = typeof req.query.mode === 'string' ? req.query.mode : 'all'
  if (!SUPPORTED_MODES.has(requestedMode as ProfileDashboardQueryMode)) {
    return res.status(400).json({ error: 'Invalid dashboard mode' })
  }

  const mode = requestedMode as ProfileDashboardQueryMode
  const normalizedAddress = address.toLowerCase()
  const cacheKey = getProfileDashboardCacheKey(normalizedAddress, mode)
  const redis = getRedisConnection()

  if (redis) {
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached) as unknown
        if (isProfileDashboardApiResponse(parsed, mode)) {
          res.setHeader('X-Profile-Dashboard-Cache', 'HIT')
          res.setHeader(
            'Cache-Control',
            'public, s-maxage=60, stale-while-revalidate=120'
          )
          return res.status(200).json(parsed)
        }
      }
    } catch (error) {
      console.error('Profile dashboard cache read failed:', error)
    }
  }

  let request = inFlightRequests.get(cacheKey)
  if (!request) {
    request = fetchDashboard(normalizedAddress, mode)
    inFlightRequests.set(cacheKey, request)
    request.finally(() => inFlightRequests.delete(cacheKey)).catch(() => undefined)
  }

  const response = await request

  if (redis && response.chains.some((chain) => !!chain.result)) {
    try {
      await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(response))
    } catch (error) {
      console.error('Profile dashboard cache write failed:', error)
    }
  }

  res.setHeader('X-Profile-Dashboard-Cache', 'MISS')
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
  return res.status(200).json(response)
}

export default withRateLimit({
  keyPrefix: 'api:profileDashboard',
  maxRequests: 20,
  windowSeconds: 60,
})(profileDashboardHandler)
