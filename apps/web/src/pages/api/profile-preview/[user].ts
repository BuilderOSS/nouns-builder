import {
  PUBLIC_DEFAULT_CHAINS,
  PUBLIC_IS_TESTNET,
  PUBLIC_SUBGRAPH_URL,
} from '@buildeross/constants'
import { BASE_URL } from '@buildeross/constants/baseUrl'
import { AddressType } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'
import { withCors } from 'src/utils/api/cors'
import { isAddress, keccak256 } from 'viem'

const CACHE_TTL_SECONDS = 300
const REQUEST_TIMEOUT_MS = 5000
const CACHE_PREFIX = PUBLIC_IS_TESTNET
  ? 'testnet:profile-preview:user'
  : 'profile-preview:user'
const PAGE_SIZE = 500
const PROFILE_PREVIEW_ALLOWED_ORIGINS = Array.from(
  new Set([
    BASE_URL,
    'https://nouns.build',
    'https://testnet.nouns.build',
    '*.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ])
)

const DAO_ACTIVITY_QUERY = `
  query DaoActivity($owner: Bytes!, $first: Int!, $skip: Int!) {
    daotokenOwners(
      where: { owner: $owner }
      first: $first
      skip: $skip
      orderBy: daoTokenCount
      orderDirection: desc
    ) {
      daoTokenCount
      dao {
        name
        contractImage
        tokenAddress
        auctionAddress
      }
    }
  }
`

const ACTIVITY_COUNTS_QUERY = `
  query ActivityCounts($owner: Bytes!, $first: Int!, $skip: Int!) {
    proposals(where: { proposer: $owner }, first: $first, skip: $skip) {
      id
    }
    proposalVotes(where: { voter: $owner }, first: $first, skip: $skip) {
      id
    }
  }
`

interface ChainPreviewResult {
  topDaos: Array<{
    name: string
    contractImage: string
    collectionAddress: AddressType
    auctionAddress: AddressType
    chainId: number
    daoTokenCount: number
  }>
  stats: {
    totalDaos: number
    totalVotes: number
    totalProposals: number
  }
}

interface ProfilePreviewResponse extends ChainPreviewResult {
  partial?: boolean
  failedChains?: number[]
}

const createCacheKey = (address: AddressType) =>
  `${CACHE_PREFIX}:${keccak256(address).slice(0, 18)}`

const requestSubgraph = async <TData>(
  url: string,
  query: string,
  variables: Record<string, string | number>
): Promise<TData> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Subgraph request timed out after ${REQUEST_TIMEOUT_MS}ms`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error(`Subgraph request failed with status ${response.status}`)
  }

  const body = (await response.json()) as {
    data?: TData
    errors?: Array<{ message: string }>
  }

  if (body.errors?.length) {
    throw new Error(body.errors.map((error) => error.message).join('; '))
  }

  if (!body.data) {
    throw new Error('Subgraph response missing data')
  }

  return body.data
}

const fetchChainPreview = async (
  chainId: number,
  address: AddressType
): Promise<ChainPreviewResult> => {
  const url = PUBLIC_SUBGRAPH_URL.get(chainId)

  if (!url) {
    return {
      topDaos: [],
      stats: {
        totalDaos: 0,
        totalVotes: 0,
        totalProposals: 0,
      },
    }
  }

  const allDaos: ChainPreviewResult['topDaos'] = []
  let totalDaos = 0
  let daoSkip = 0

  while (true) {
    const daoResponse = await requestSubgraph<{
      daotokenOwners: Array<{
        daoTokenCount: number
        dao: {
          name: string
          contractImage: string
          tokenAddress: AddressType
          auctionAddress: AddressType
        } | null
      }>
    }>(url, DAO_ACTIVITY_QUERY, {
      owner: address.toLowerCase(),
      first: PAGE_SIZE,
      skip: daoSkip,
    })

    const daoPage = daoResponse.daotokenOwners
      .filter(
        (
          owner
        ): owner is {
          daoTokenCount: number
          dao: {
            name: string
            contractImage: string
            tokenAddress: AddressType
            auctionAddress: AddressType
          }
        } => !!owner.dao
      )
      .map((owner) => ({
        name: owner.dao.name || 'Untitled DAO',
        contractImage: owner.dao.contractImage || '',
        collectionAddress: owner.dao.tokenAddress,
        auctionAddress: owner.dao.auctionAddress,
        chainId,
        daoTokenCount: owner.daoTokenCount,
      }))

    allDaos.push(...daoPage)
    totalDaos += daoPage.length

    if (daoResponse.daotokenOwners.length < PAGE_SIZE) {
      break
    }

    daoSkip += PAGE_SIZE
  }

  let totalVotes = 0
  let totalProposals = 0
  let skip = 0

  while (true) {
    const response = await requestSubgraph<{
      proposals: Array<{ id: string }>
      proposalVotes: Array<{ id: string }>
    }>(url, ACTIVITY_COUNTS_QUERY, {
      owner: address.toLowerCase(),
      first: PAGE_SIZE,
      skip,
    })

    totalProposals += response.proposals.length
    totalVotes += response.proposalVotes.length

    if (
      response.proposals.length < PAGE_SIZE &&
      response.proposalVotes.length < PAGE_SIZE
    ) {
      break
    }

    skip += PAGE_SIZE
  }

  return {
    topDaos: allDaos,
    stats: {
      totalDaos,
      totalVotes,
      totalProposals,
    },
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user } = req.query

  if (!user || typeof user !== 'string') {
    return res.status(400).json({ error: 'User parameter is required' })
  }

  if (!isAddress(user, { strict: false })) {
    return res.status(400).json({ error: 'Invalid address format' })
  }

  const address = user.toLowerCase() as AddressType
  const cacheKey = createCacheKey(address)
  const redis = getRedisConnection()

  try {
    if (redis) {
      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          res.setHeader(
            'Cache-Control',
            `public, max-age=${CACHE_TTL_SECONDS}, stale-while-revalidate=${Math.floor(CACHE_TTL_SECONDS / 2)}`
          )
          return res.status(200).json(JSON.parse(cached))
        }
      } catch (error) {
        console.error('Profile preview cache read failed:', error)
      }
    }

    const settledResults = await Promise.allSettled(
      PUBLIC_DEFAULT_CHAINS.map((chain) => fetchChainPreview(chain.id, address))
    )

    const successfulResults: ChainPreviewResult[] = []
    const failedChains: number[] = []

    settledResults.forEach((result, index) => {
      const chainId = PUBLIC_DEFAULT_CHAINS[index]?.id

      if (!chainId) return

      if (result.status === 'fulfilled') {
        successfulResults.push(result.value)
      } else {
        failedChains.push(chainId)
        console.error(`Profile preview fetch failed for chain ${chainId}`, result.reason)
      }
    })

    if (!successfulResults.length) {
      return res.status(502).json({
        error: 'Profile preview unavailable',
        failedChains,
      })
    }

    const response: ProfilePreviewResponse = {
      topDaos: successfulResults
        .flatMap((result) => result.topDaos)
        .sort((a, b) => b.daoTokenCount - a.daoTokenCount)
        .slice(0, 4),
      stats: successfulResults.reduce(
        (acc, result) => ({
          totalDaos: acc.totalDaos + result.stats.totalDaos,
          totalVotes: acc.totalVotes + result.stats.totalVotes,
          totalProposals: acc.totalProposals + result.stats.totalProposals,
        }),
        {
          totalDaos: 0,
          totalVotes: 0,
          totalProposals: 0,
        }
      ),
    }

    if (failedChains.length) {
      response.partial = true
      response.failedChains = failedChains
    }

    if (redis) {
      try {
        await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(response))
      } catch (error) {
        console.error('Profile preview cache write failed:', error)
      }
    }

    res.setHeader(
      'Cache-Control',
      `public, max-age=${CACHE_TTL_SECONDS}, stale-while-revalidate=${Math.floor(CACHE_TTL_SECONDS / 2)}`
    )

    return res.status(200).json(response)
  } catch (error) {
    console.error('Profile preview API error:', error)
    return res.status(500).json({ error: 'Failed to load profile preview' })
  }
}

export default withCors({ allowedOrigins: PROFILE_PREVIEW_ALLOWED_ORIGINS })(handler)
