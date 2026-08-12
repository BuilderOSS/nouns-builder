import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import {
  type ProfileDashboardChainResult,
  profileDashboardQuery,
} from '@buildeross/sdk/subgraph'
import type { CHAIN_ID } from '@buildeross/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { isAddress } from 'viem'

export type ProfileDashboardApiResponse = {
  chains: Array<{
    chainId: CHAIN_ID
    chainName: string
    chainSlug: string
    result?: ProfileDashboardChainResult
    error?: string
  }>
}

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number) => {
  let timeout: ReturnType<typeof setTimeout>
  return Promise.race([
    promise.finally(() => clearTimeout(timeout)),
    new Promise<T>((_, reject) => {
      timeout = setTimeout(
        () =>
          reject(new Error(`Profile dashboard request timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    }),
  ])
}

export default async function handler(
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

  const settled = await Promise.allSettled(
    PUBLIC_DEFAULT_CHAINS.map(async (chain) => ({
      chainId: chain.id,
      chainName: chain.name,
      chainSlug: chain.slug,
      result: await withTimeout(profileDashboardQuery(chain.id, address), 12_000),
    }))
  )

  const chains = settled.map((result, index) => {
    const chain = PUBLIC_DEFAULT_CHAINS[index]
    if (result.status === 'fulfilled') return result.value

    console.warn('Profile dashboard chain unavailable', {
      chainId: chain.id,
      address,
      error: result.reason instanceof Error ? result.reason.message : result.reason,
    })
    return {
      chainId: chain.id,
      chainName: chain.name,
      chainSlug: chain.slug,
      error: 'Profile data unavailable for this chain.',
    }
  })

  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
  return res.status(200).json({ chains })
}
