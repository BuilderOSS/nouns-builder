import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { PUBLIC_SUBGRAPH_URL } from '@buildeross/constants/subgraph'
import { gql, GraphQLClient } from 'graphql-request'
import type { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { formatEther } from 'viem'

import type { AboutSnapshotResponse } from '../../../modules/about/types'

type SnapshotDao = {
  id: string
  totalAuctionSales: string
  proposalCount: number
  ownerCount: number
  totalSupply: number
  currentAuction?: {
    id: string
    endTime: string
    settled: boolean
  } | null
}

type SnapshotQueryResponse = {
  daos: SnapshotDao[]
}

type SnapshotOwner = {
  owner: string
}

type SnapshotOwnersQueryResponse = {
  daoTokenOwners: SnapshotOwner[]
}

const ABOUT_SNAPSHOT_QUERY = gql`
  query AboutSnapshot($first: Int!, $where: DAO_filter) {
    daos(first: $first, where: $where, orderBy: totalAuctionSales, orderDirection: desc) {
      id
      totalAuctionSales
      proposalCount
      ownerCount
      totalSupply
      currentAuction {
        id
        endTime
        settled
      }
    }
  }
`

const ABOUT_SNAPSHOT_OWNERS_QUERY = gql`
  query AboutSnapshotOwners($first: Int!, $skip: Int!) {
    daoTokenOwners(first: $first, skip: $skip) {
      owner
    }
  }
`

const compactNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)

const compactEth = (value: number) =>
  `ETH ${new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)}`

const OWNER_PAGE_SIZE = 1000

const fetchChainSnapshot = async (subgraphUrl: string): Promise<SnapshotDao[]> => {
  const client = new GraphQLClient(subgraphUrl, {
    headers: { 'Content-Type': 'application/json' },
  })

  const data = await client.request<SnapshotQueryResponse>(ABOUT_SNAPSHOT_QUERY, {
    first: 1000,
    where: {
      totalSupply_gt: 0,
    },
  })

  return data.daos ?? []
}

// TODO: This full scan of daoTokenOwners via paginated queries runs on every cache miss,
// causing unbounded latency on the public API. Move this logic to a background job/cron that
// periodically precomputes unique owner sets, then have the handler read that cached result.
// Not done now because it requires a separate background process + persistence layer.
const fetchUniqueOwnersForChain = async (subgraphUrl: string): Promise<Set<string>> => {
  const client = new GraphQLClient(subgraphUrl, {
    headers: { 'Content-Type': 'application/json' },
  })

  const owners = new Set<string>()
  let skip = 0

  while (true) {
    const data = await client.request<SnapshotOwnersQueryResponse>(
      ABOUT_SNAPSHOT_OWNERS_QUERY,
      {
        first: OWNER_PAGE_SIZE,
        skip,
      }
    )

    const page = data.daoTokenOwners ?? []

    for (const item of page) {
      if (item.owner) {
        owners.add(item.owner.toLowerCase())
      }
    }

    if (page.length < OWNER_PAGE_SIZE) {
      break
    }

    skip += OWNER_PAGE_SIZE
  }

  return owners
}

const buildSnapshotResponse = async (): Promise<AboutSnapshotResponse> => {
  const now = Math.floor(Date.now() / 1000)
  const chainSnapshots = await Promise.all(
    PUBLIC_DEFAULT_CHAINS.map(async (chain) => {
      const subgraphUrl = PUBLIC_SUBGRAPH_URL.get(chain.id)
      if (!subgraphUrl) {
        return { daos: [], uniqueOwners: null as Set<string> | null }
      }

      const [daos, uniqueOwners] = await Promise.all([
        fetchChainSnapshot(subgraphUrl),
        fetchUniqueOwnersForChain(subgraphUrl).catch((error) => {
          console.error(
            `About snapshot unique owner fetch failed for chain ${chain.id}:`,
            error
          )
          return null
        }),
      ])

      return { daos, uniqueOwners }
    })
  )

  const daos = chainSnapshots.flatMap((snapshot) => snapshot.daos)

  const totalDaos = daos.length
  const totalAuctionSales = daos.reduce((total, dao) => {
    const sales = Number(formatEther(BigInt(dao.totalAuctionSales || '0')))
    return total + sales
  }, 0)
  const activeAuctions = daos.filter(
    (dao) =>
      dao.currentAuction &&
      !dao.currentAuction.settled &&
      Number(dao.currentAuction.endTime) > now
  ).length
  const totalProposals = daos.reduce(
    (total, dao) => total + Number(dao.proposalCount || 0),
    0
  )
  const uniqueOwners = new Set<string>()

  for (const snapshot of chainSnapshots) {
    if (!snapshot.uniqueOwners) continue

    for (const owner of snapshot.uniqueOwners) {
      uniqueOwners.add(owner)
    }
  }

  const allOwnerScansSucceeded = chainSnapshots.every((snapshot) => snapshot.uniqueOwners)
  const fallbackTotalMembers = daos.reduce(
    (total, dao) => total + Number(dao.ownerCount || 0),
    0
  )

  const totalMembers = allOwnerScansSucceeded ? uniqueOwners.size : fallbackTotalMembers
  const totalTokens = daos.reduce((total, dao) => total + Number(dao.totalSupply || 0), 0)

  return {
    stats: [
      {
        id: 'daos',
        label: 'DAOs launched',
        value: compactNumber(totalDaos),
        detail: 'Live DAO count indexed across Builder-supported public networks.',
        icon: '🚀',
      },
      {
        id: 'treasury',
        label: 'Auction value raised',
        value: compactEth(totalAuctionSales),
        detail:
          'Cumulative native-token auction sales flowing into community treasuries.',
        icon: '💰',
      },
      {
        id: 'auctions',
        label: 'Active auctions',
        value: compactNumber(activeAuctions),
        detail: 'Current live auctions still accepting bids across the ecosystem.',
        icon: '⏰',
      },
      {
        id: 'proposals',
        label: 'Governance proposals',
        value: compactNumber(totalProposals),
        detail: 'Total proposals created across DAOs using Builder governance.',
        icon: '📜',
      },
      {
        id: 'members',
        label: 'Members holding tokens',
        value: compactNumber(totalMembers),
        detail: 'Distinct DAO token holders participating across Builder communities.',
        icon: '👥',
      },
      {
        id: 'tokens',
        label: 'Tokens auctioned',
        value: compactNumber(totalTokens),
        detail: 'Member tokens minted and distributed through recurring auctions.',
        icon: '🔥',
      },
    ],
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload = await buildSnapshotResponse()
    const { maxAge, swr } = CACHE_TIMES.EXPLORE

    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )

    return res.status(200).json(payload)
  } catch (error) {
    console.error('About snapshot error:', error)
    return res.status(500).json({ error: 'Failed to load about snapshot stats' })
  }
}

export default withCors()(
  withRateLimit({
    maxRequests: 60,
    windowSeconds: 60,
    keyPrefix: 'about:snapshot',
  })(handler)
)
