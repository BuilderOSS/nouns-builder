import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { PUBLIC_SUBGRAPH_URL } from '@buildeross/constants/subgraph'
import { Auction_OrderBy, exploreDaosRequest } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { chainIdToSlug } from '@buildeross/utils/chains'
import { gql, GraphQLClient } from 'graphql-request'
import type { NextApiRequest, NextApiResponse } from 'next'
import { summarizeDaoDescription } from 'src/utils/api/ai/summaries'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { parseEther } from 'viem'

import type { AboutDao, AboutDaoTabsResponse } from '../../../modules/about/types'

const MIN_AUCTION_SALES = parseEther('0.001').toString()
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30

type DaoQueryItem = {
  id: string
  name: string
  description: string
  tokenAddress: string
  contractImage?: string | null
  totalSupply: number
  totalAuctionSales: string
  latestToken: Array<{ name: string; image?: string | null; tokenId: string }>
  firstToken: Array<{ mintedAt: string }>
  recentAuctions: Array<{
    id: string
    endTime: string
    winningBid?: { amount: string } | null
  }>
  currentAuction?: {
    endTime: string
    highestBid?: { amount: string } | null
    token?: { tokenId: string; name: string; image?: string | null } | null
  } | null
}

type DaoQueryResponse = {
  daos: DaoQueryItem[]
}

type CrossChainDaoCandidate = {
  chainId: CHAIN_ID
  dao: DaoQueryItem
}

type CrossChainActiveDao = {
  chainId: CHAIN_ID
  dao: NonNullable<Awaited<ReturnType<typeof exploreDaosRequest>>>['daos'][number]
}

type FeaturedDaoConfigItem = {
  name: string
  aliases?: readonly string[]
  description: string
  signalLabel: string
  signalValue: string
  fallbackChainId: CHAIN_ID
}

const ABOUT_DAO_TABS_QUERY = gql`
  query AboutDaoTabs(
    $daoFirst: Int!
    $daoWhere: DAO_filter
    $recentAuctionWhere: Auction_filter
    $recentAuctionFirst: Int!
  ) {
    daos(
      first: $daoFirst
      where: $daoWhere
      orderBy: totalAuctionSales
      orderDirection: desc
    ) {
      id
      name
      description
      tokenAddress
      contractImage
      totalSupply
      totalAuctionSales
      latestToken: tokens(first: 1, orderBy: mintedAt, orderDirection: desc) {
        name
        image
        tokenId
      }
      firstToken: tokens(first: 1, orderBy: mintedAt, orderDirection: asc) {
        mintedAt
      }
      currentAuction {
        endTime
        highestBid {
          amount
        }
        token {
          tokenId
          name
          image
        }
      }
      recentAuctions: auctions(
        first: $recentAuctionFirst
        orderBy: endTime
        orderDirection: desc
        where: $recentAuctionWhere
      ) {
        id
        endTime
        winningBid {
          amount
        }
      }
    }
  }
`

const buildDaoHref = (chainId: CHAIN_ID, tokenAddress: string) =>
  `/dao/${chainIdToSlug(chainId)}/${tokenAddress}`

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

const getSurface = (index: number) =>
  ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#E0F2FE'][index % 4]

const FEATURED_DAO_CONFIG: readonly FeaturedDaoConfigItem[] = [
  {
    name: 'Builder DAO',
    aliases: ['BuilderDAO'],
    description: 'Stewards Builder upgrades, ecosystem tooling, and protocol operations.',
    signalLabel: 'Role',
    signalValue: 'Protocol steward',
    fallbackChainId: CHAIN_ID.BASE,
  },
  {
    name: 'Gnars DAO',
    aliases: ['Gnars'],
    description: 'Funds skate, surf, and snow culture through auctions and governance.',
    signalLabel: 'Focus',
    signalValue: 'Sports culture',
    fallbackChainId: CHAIN_ID.BASE,
  },
  {
    name: 'Collective Nouns',
    description: 'Explores shared ownership and member-led treasury deployment.',
    signalLabel: 'Focus',
    signalValue: 'Art collective',
    fallbackChainId: CHAIN_ID.BASE,
  },
  {
    name: 'Nouns DAO Africa',
    description: 'Supports regional builders and creatives using Nounish governance.',
    signalLabel: 'Focus',
    signalValue: 'Regional empowerment',
    fallbackChainId: CHAIN_ID.ETHEREUM,
  },
] as const

const chainById = new Map(
  PUBLIC_DEFAULT_CHAINS.map((chain) => [chain.id, chain] as const)
)

const normalizeDaoName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const isNameMatch = (targets: string[], candidateName?: string | null) => {
  const candidate = normalizeDaoName(candidateName || '')

  if (!candidate) return false

  return targets.some((target) => {
    const normalizedTarget = normalizeDaoName(target)

    return (
      candidate === normalizedTarget ||
      candidate.includes(normalizedTarget) ||
      normalizedTarget.includes(candidate)
    )
  })
}

const shortenDescription = (description?: string | null) => {
  const base = description?.trim()

  if (!base) return null

  const [firstSentence] = base.split(/(?<=[.!?])\s+/)
  const concise = firstSentence || base

  return concise.length > 110 ? `${concise.slice(0, 107).trimEnd()}...` : concise
}

const createDaoDescriptionResolver = () => {
  const summaries = new Map<string, Promise<string | null>>()
  const aiConfigured = Boolean(
    process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY
  )

  return (description?: string | null) => {
    const base = description?.trim()

    if (!base) {
      return Promise.resolve(null)
    }

    if (!aiConfigured) {
      return Promise.resolve(shortenDescription(base))
    }

    if (!summaries.has(base)) {
      summaries.set(
        base,
        summarizeDaoDescription(base)
          .then((summary) => summary || shortenDescription(base))
          .catch(() => shortenDescription(base))
      )
    }

    return summaries.get(base)!
  }
}

const mapDao = (
  dao: DaoQueryItem,
  chainId: CHAIN_ID,
  index: number,
  signalLabel: string,
  signalValue: string,
  badge: string,
  category: AboutDao['category'],
  descriptionOverride?: string | null
): AboutDao => ({
  id: `${dao.id}-${badge.toLowerCase()}`,
  name: dao.name || 'Untitled DAO',
  description:
    descriptionOverride ||
    shortenDescription(dao.description) ||
    'Live Builder DAO with recent auction and member activity.',
  signalLabel,
  signalValue,
  href: buildDaoHref(chainId, dao.tokenAddress),
  badge,
  surface: getSurface(index),
  textAccent: '#1E3A8A',
  initials: getInitials(dao.name || 'DAO'),
  imageUrl: dao.contractImage || dao.latestToken[0]?.image || null,
  recentAuctionImage:
    dao.currentAuction?.token?.image || dao.latestToken[0]?.image || null,
  chainIcon: chainById.get(chainId)?.icon || null,
  chainName: chainById.get(chainId)?.name || null,
  category,
})

const fetchDaoCandidates = async (
  chainId: CHAIN_ID,
  options: { totalAuctionSalesGt?: string; first?: number; nameContains?: string } = {}
): Promise<DaoQueryItem[]> => {
  const subgraphUrl = PUBLIC_SUBGRAPH_URL.get(chainId)

  if (!subgraphUrl) {
    throw new Error(`No subgraph URL configured for chain ${chainId}`)
  }

  const client = new GraphQLClient(subgraphUrl, {
    headers: { 'Content-Type': 'application/json' },
  })

  const now = Math.floor(Date.now() / 1000)

  const data = await client.request<DaoQueryResponse>(ABOUT_DAO_TABS_QUERY, {
    daoFirst: options.first ?? 150,
    daoWhere: {
      totalSupply_gt: 0,
      ...(options.nameContains ? { name_contains_nocase: options.nameContains } : {}),
      ...(options.totalAuctionSalesGt
        ? { totalAuctionSales_gt: options.totalAuctionSalesGt }
        : {}),
    },
    recentAuctionFirst: 40,
    recentAuctionWhere: {
      settled: true,
      endTime_gt: now - THIRTY_DAYS_IN_SECONDS,
    },
  })

  return data.daos ?? []
}

const fetchCrossChainDaoCandidates = async (
  options: { totalAuctionSalesGt?: string; first?: number } = {}
): Promise<CrossChainDaoCandidate[]> => {
  const results = await Promise.all(
    PUBLIC_DEFAULT_CHAINS.map(async (chain) => {
      const daos = await fetchDaoCandidates(chain.id, options)

      return daos.map((dao) => ({ chainId: chain.id, dao }))
    })
  )

  return results.flat()
}

const findFeaturedMatch = (targets: string[], candidates: CrossChainDaoCandidate[]) =>
  candidates.find((item) => isNameMatch(targets, item.dao.name))

const fetchFeaturedMatch = async (targets: string[]) => {
  const results = await Promise.all(
    PUBLIC_DEFAULT_CHAINS.flatMap((chain) =>
      targets.map(async (target) => {
        const daos = await fetchDaoCandidates(chain.id, {
          first: 25,
          nameContains: target,
        })

        return daos.map((dao) => ({ chainId: chain.id, dao }))
      })
    )
  )

  return findFeaturedMatch(targets, results.flat())
}

const buildFeaturedDaos = async (
  resolveDescription: ReturnType<typeof createDaoDescriptionResolver>
): Promise<AboutDaoTabsResponse['featured']> => {
  const results = await Promise.all(
    PUBLIC_DEFAULT_CHAINS.map(async (chain) => {
      const daos = await fetchDaoCandidates(chain.id, { first: 800 })

      return daos.map((dao) => ({ chainId: chain.id, dao }))
    })
  )

  const featuredCandidates = results.flat()

  return Promise.all(
    FEATURED_DAO_CONFIG.map(async (item, index) => {
      const targets = [item.name, ...(item.aliases ?? [])]
      const match =
        findFeaturedMatch(targets, featuredCandidates) ||
        (await fetchFeaturedMatch(targets))

      if (!match) {
        return {
          id: `${normalizeDaoName(item.name).replace(/\s+/g, '-')}-featured`,
          name: item.name,
          description: item.description,
          signalLabel: item.signalLabel,
          signalValue: item.signalValue,
          href: '/explore',
          badge: 'Featured',
          surface: getSurface(index),
          textAccent: '#1E3A8A',
          initials: getInitials(item.name),
          imageUrl: null,
          recentAuctionImage: null,
          chainIcon: chainById.get(item.fallbackChainId)?.icon || null,
          chainName: chainById.get(item.fallbackChainId)?.name || null,
          category: 'featured' as const,
        }
      }

      const description =
        (await resolveDescription(match.dao.description || item.description)) ||
        shortenDescription(match.dao.description || item.description)

      return {
        ...mapDao(
          {
            ...match.dao,
            description: match.dao.description || item.description,
          },
          match.chainId,
          index,
          item.signalLabel,
          item.signalValue,
          'Featured',
          'featured',
          description
        ),
        name: item.name,
      }
    })
  )
}

const buildTrendingDaos = async (
  items: CrossChainDaoCandidate[],
  resolveDescription: ReturnType<typeof createDaoDescriptionResolver>
) =>
  Promise.all(
    items
      .map((item) => ({
        ...item,
        recentSalesCount: item.dao.recentAuctions.length,
        recentVolume: item.dao.recentAuctions.reduce(
          (total, auction) => total + BigInt(auction.winningBid?.amount ?? '0'),
          0n
        ),
      }))
      .filter((item) => item.recentSalesCount > 0)
      .sort((a, b) => {
        if (b.recentSalesCount !== a.recentSalesCount) {
          return b.recentSalesCount - a.recentSalesCount
        }
        if (b.recentVolume === a.recentVolume) {
          return 0
        }
        return b.recentVolume > a.recentVolume ? 1 : -1
      })
      .slice(0, 4)
      .map(async (item, index) =>
        mapDao(
          item.dao,
          item.chainId,
          index,
          'Sales in 30d',
          `${item.recentSalesCount} settled`,
          'Trending',
          'trending',
          (await resolveDescription(item.dao.description)) ||
            shortenDescription(item.dao.description)
        )
      )
  )

const buildNewDaos = async (
  items: CrossChainDaoCandidate[],
  resolveDescription: ReturnType<typeof createDaoDescriptionResolver>
) =>
  Promise.all(
    items
      .filter((item) => item.dao.totalSupply > 3 && item.dao.firstToken[0]?.mintedAt)
      .sort(
        (a, b) =>
          Number(b.dao.firstToken[0].mintedAt) - Number(a.dao.firstToken[0].mintedAt)
      )
      .slice(0, 4)
      .map(async (item, index) =>
        mapDao(
          item.dao,
          item.chainId,
          index,
          'Supply sold',
          `${item.dao.totalSupply} tokens`,
          'New',
          'new',
          (await resolveDescription(item.dao.description)) ||
            shortenDescription(item.dao.description)
        )
      )
  )

const buildActiveDaos = async (
  daoCandidates: CrossChainDaoCandidate[],
  resolveDescription: ReturnType<typeof createDaoDescriptionResolver>
) => {
  const now = Math.floor(Date.now() / 1000)
  const activeResults = await Promise.all(
    PUBLIC_DEFAULT_CHAINS.map(async (chain) => {
      const result = await exploreDaosRequest(chain.id, 12, 0, Auction_OrderBy.EndTime)

      return (result?.daos ?? []).map((dao) => ({
        chainId: chain.id,
        dao,
      }))
    })
  )

  const activeDaos = activeResults.flat() as CrossChainActiveDao[]

  return Promise.all(
    activeDaos
      .filter((item) => item.dao.endTime && Number(item.dao.endTime) > now)
      .sort((a, b) => Number(a.dao.endTime) - Number(b.dao.endTime))
      .slice(0, 4)
      .map(async (item, index) => {
        const matchingDao = daoCandidates.find(
          (candidate) =>
            candidate.chainId === item.chainId &&
            candidate.dao.tokenAddress.toLowerCase() ===
              item.dao.dao.tokenAddress.toLowerCase()
        )

        const descriptionSource = matchingDao?.dao.description
        const description =
          (await resolveDescription(descriptionSource)) ||
          shortenDescription(descriptionSource) ||
          'Live Builder DAO with recent auction and member activity.'

        return {
          id: `${item.chainId}-${item.dao.dao.tokenAddress}-active`,
          name: item.dao.dao.name || item.dao.token?.name || 'Untitled DAO',
          description,
          signalLabel: 'Ends soon',
          signalValue: `${Math.max(1, Math.round((Number(item.dao.endTime) - now) / 3600))}h left`,
          href: buildDaoHref(item.chainId, item.dao.dao.tokenAddress),
          badge: 'Active',
          surface: getSurface(index),
          textAccent: '#1E3A8A',
          initials: getInitials(item.dao.dao.name || item.dao.token?.name || 'DAO'),
          imageUrl: matchingDao?.dao.contractImage || item.dao.token?.image || null,
          recentAuctionImage: item.dao.token?.image || null,
          chainIcon: chainById.get(item.chainId)?.icon || null,
          chainName: chainById.get(item.chainId)?.name || null,
          category: 'active' as const,
        }
      })
  )
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const resolveDescription = createDaoDescriptionResolver()

    const [featuredDaos, daoCandidates] = await Promise.all([
      buildFeaturedDaos(resolveDescription),
      fetchCrossChainDaoCandidates({
        totalAuctionSalesGt: MIN_AUCTION_SALES,
        first: 150,
      }),
    ])

    const payload: AboutDaoTabsResponse = {
      featured: featuredDaos,
      trending: await buildTrendingDaos(daoCandidates, resolveDescription),
      new: await buildNewDaos(daoCandidates, resolveDescription),
      active: await buildActiveDaos(daoCandidates, resolveDescription),
    }

    const { maxAge, swr } = CACHE_TIMES.EXPLORE
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )

    return res.status(200).json(payload)
  } catch (error) {
    console.error('About dao tabs error:', error)
    return res.status(500).json({ error: 'Failed to load about page DAO tabs' })
  }
}

export default withCors()(
  withRateLimit({
    maxRequests: 60,
    windowSeconds: 60,
    keyPrefix: 'about:dao-tabs',
  })(handler)
)
