import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { PUBLIC_SUBGRAPH_URL } from '@buildeross/constants/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { DEFAULT_ZORA_TOTAL_SUPPLY, walletSnippet } from '@buildeross/utils'
import { chainIdToSlug } from '@buildeross/utils/chains'
import { gql, GraphQLClient } from 'graphql-request'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getZoraCoinUsdPrice } from 'src/services/coinPriceService'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { formatEther } from 'viem'

import {
  coiningHighlights as fallbackCoiningHighlights,
  dropHighlights as fallbackDropHighlights,
  proposalHighlights as fallbackProposalHighlights,
} from '../../../modules/about/data'
import type {
  AboutShowcaseResponse,
  CoiningHighlight,
  DroposalHighlight,
  DroposalStatus,
} from '../../../modules/about/types'

type ShowcaseZoraDrop = {
  id: string
  name: string
  description?: string | null
  imageURI?: string | null
  animationURI?: string | null
  creator: string
  totalSalesAmount: string
  createdAt: string
  dao?: {
    name: string
    tokenAddress: string
  } | null
}

type ShowcaseZoraCoin = {
  id: string
  coinAddress: string
  name: string
  symbol: string
  caller: string
  createdAt: string
  dao?: {
    name: string
    tokenAddress: string
  } | null
}

type ShowcaseProposal = {
  id: string
  proposalId: string
  proposalNumber: number
  title?: string | null
  description?: string | null
  timeCreated: string
  voteEnd: string
  voteCount: number
  queued: boolean
  executed: boolean
  canceled: boolean
  vetoed: boolean
  dao: {
    name: string
    tokenAddress: string
  }
}

type ShowcaseQueryResponse = {
  zoraCoins: ShowcaseZoraCoin[]
  zoraDrops: ShowcaseZoraDrop[]
  proposals: ShowcaseProposal[]
}

type CrossChainCoin = ShowcaseZoraCoin & { chainId: CHAIN_ID }
type CrossChainDrop = ShowcaseZoraDrop & { chainId: CHAIN_ID }
type CrossChainProposal = ShowcaseProposal & { chainId: CHAIN_ID }

const ABOUT_SHOWCASE_QUERY = gql`
  query AboutShowcase($coinFirst: Int!, $dropFirst: Int!, $proposalFirst: Int!) {
    zoraCoins(
      first: $coinFirst
      orderBy: createdAt
      orderDirection: desc
      where: { dao_not: null }
    ) {
      id
      coinAddress
      name
      symbol
      caller
      createdAt
      dao {
        name
        tokenAddress
      }
    }
    zoraDrops(
      first: $dropFirst
      orderBy: totalSalesAmount
      orderDirection: desc
      where: { dao_not: null, totalSalesAmount_gt: 0 }
    ) {
      id
      name
      description
      imageURI
      animationURI
      creator
      totalSalesAmount
      createdAt
      dao {
        name
        tokenAddress
      }
    }
    proposals(
      first: $proposalFirst
      orderBy: timeCreated
      orderDirection: desc
      where: { title_not: null }
    ) {
      id
      proposalId
      proposalNumber
      title
      description
      timeCreated
      voteEnd
      voteCount
      queued
      executed
      canceled
      vetoed
      dao {
        name
        tokenAddress
      }
    }
  }
`

const previewSurfaces = [
  'linear-gradient(135deg, #F9E7FF 0%, #D9EEFF 100%)',
  'linear-gradient(135deg, #FFF0CC 0%, #FFD9BF 100%)',
  'linear-gradient(135deg, #DFFFF0 0%, #D5F8FF 100%)',
  'linear-gradient(135deg, #E2EBFF 0%, #EDE8FF 100%)',
]

const compactVotes = (votes: number) =>
  `${new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(votes)} voters`

const compactMarketCap = (marketCapUsd: number) =>
  `$${new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(marketCapUsd)} market cap`

const compactEthAmount = (amountInEth: number) =>
  `ETH ${new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amountInEth)} sold`

const cleanSentence = (value?: string | null) => {
  const base = value
    ?.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    ?.replace(/\[[^\]]+\]\([^)]+\)/g, ' ')
    ?.replace(/[`*_>#-]/g, ' ')
    ?.replace(/\s+/g, ' ')
    ?.trim()

  if (!base) return null

  const [firstSentence] = base.split(/(?<=[.!?])\s+/)
  const concise = firstSentence || base

  return concise.length > 120 ? `${concise.slice(0, 117).trimEnd()}...` : concise
}

const deriveProposalStatus = (
  proposal: ShowcaseProposal,
  now: number
): DroposalStatus | null => {
  if (proposal.canceled || proposal.vetoed) return null
  if (proposal.executed) return 'Executed'
  if (proposal.queued) return 'Funded'
  if (Number(proposal.voteEnd) > now) return 'Active'
  return 'Passed'
}

const fetchShowcaseDataForChain = async (
  chainId: CHAIN_ID
): Promise<{
  coins: CrossChainCoin[]
  drops: CrossChainDrop[]
  proposals: CrossChainProposal[]
}> => {
  const subgraphUrl = PUBLIC_SUBGRAPH_URL.get(chainId)

  if (!subgraphUrl) {
    return { coins: [], drops: [], proposals: [] }
  }

  const client = new GraphQLClient(subgraphUrl, {
    headers: { 'Content-Type': 'application/json' },
  })

  const data = await client.request<ShowcaseQueryResponse>(ABOUT_SHOWCASE_QUERY, {
    coinFirst: 30,
    dropFirst: 12,
    proposalFirst: 20,
  })

  return {
    coins: (data.zoraCoins ?? []).map((coin) => ({ ...coin, chainId })),
    drops: (data.zoraDrops ?? []).map((drop) => ({ ...drop, chainId })),
    proposals: (data.proposals ?? []).map((proposal) => ({ ...proposal, chainId })),
  }
}

const buildCoiningHighlights = async (
  coins: CrossChainCoin[]
): Promise<CoiningHighlight[]> => {
  const coinsWithMarketCap = await Promise.all(
    coins
      .filter((coin) => coin.dao?.tokenAddress && coin.coinAddress && coin.name)
      .map(async (coin) => {
        const priceUsd = await getZoraCoinUsdPrice(coin.coinAddress, coin.chainId).catch(
          () => null
        )

        const marketCapUsd =
          priceUsd && Number.isFinite(priceUsd)
            ? priceUsd * DEFAULT_ZORA_TOTAL_SUPPLY
            : null

        return {
          coin,
          marketCapUsd,
        }
      })
  )

  return coinsWithMarketCap
    .filter(
      (
        item
      ): item is {
        coin: CrossChainCoin
        marketCapUsd: number
      } => item.marketCapUsd !== null && item.marketCapUsd > 0
    )
    .sort((a, b) => b.marketCapUsd - a.marketCapUsd)
    .slice(0, 4)
    .map(({ coin, marketCapUsd }, index) => ({
      id: `${coin.chainId}-${coin.id}`,
      title: coin.name,
      creator: walletSnippet(coin.caller as `0x${string}`),
      dao: coin.dao?.name || 'Builder DAO',
      chainLabel:
        PUBLIC_DEFAULT_CHAINS.find((chain) => chain.id === coin.chainId)?.name || 'Base',
      amount: compactMarketCap(marketCapUsd),
      href: `/coin/${chainIdToSlug(coin.chainId)}/${coin.coinAddress}`,
      eyebrow: 'DAO paired coin',
      accent: '#2563EB',
      surface: previewSurfaces[index % previewSurfaces.length],
      previewLabel: coin.symbol || 'Content coin',
    }))
}

const buildDropHighlights = (drops: CrossChainDrop[]): DroposalHighlight[] => {
  const now = Math.floor(Date.now() / 1000)

  return drops
    .filter((drop) => drop.dao?.tokenAddress && drop.name)
    .sort((a, b) => Number(b.totalSalesAmount || '0') - Number(a.totalSalesAmount || '0'))
    .slice(0, 5)
    .map((drop) => ({
      id: `${drop.chainId}-${drop.id}`,
      title: drop.name,
      dao: drop.dao?.name || 'Builder DAO',
      amount: compactEthAmount(Number(formatEther(BigInt(drop.totalSalesAmount || '0')))),
      status: Number(drop.createdAt) > now - 60 * 60 * 24 * 14 ? 'Live' : 'Recent',
      summary:
        cleanSentence(drop.description) ||
        'A live onchain drop distributing content through Builder.',
      href: `/drop/${chainIdToSlug(drop.chainId)}/${drop.id}`,
      category:
        PUBLIC_DEFAULT_CHAINS.find((chain) => chain.id === drop.chainId)?.name ||
        'Onchain drop',
    }))
}

const buildProposalHighlights = (
  proposals: CrossChainProposal[]
): DroposalHighlight[] => {
  const now = Math.floor(Date.now() / 1000)

  return proposals
    .map((proposal) => ({
      proposal,
      status: deriveProposalStatus(proposal, now),
    }))
    .filter(
      (
        item
      ): item is {
        proposal: CrossChainProposal
        status: DroposalStatus
      } => Boolean(item.status)
    )
    .sort((a, b) => {
      if (a.status === 'Active' && b.status !== 'Active') return -1
      if (a.status !== 'Active' && b.status === 'Active') return 1
      return Number(b.proposal.timeCreated) - Number(a.proposal.timeCreated)
    })
    .slice(0, 5)
    .map(({ proposal, status }) => ({
      id: `${proposal.chainId}-${proposal.id}`,
      title: proposal.title?.trim() || `Proposal #${proposal.proposalNumber}`,
      dao: proposal.dao.name,
      amount: compactVotes(proposal.voteCount || 0),
      status,
      summary:
        cleanSentence(proposal.description) ||
        `Proposal #${proposal.proposalNumber} in ${proposal.dao.name}.`,
      href: `/dao/${chainIdToSlug(proposal.chainId)}/${proposal.dao.tokenAddress}/vote/${proposal.proposalId}`,
      category:
        PUBLIC_DEFAULT_CHAINS.find((chain) => chain.id === proposal.chainId)?.name ||
        'DAO proposal',
    }))
}

const buildShowcaseResponse = async (): Promise<AboutShowcaseResponse> => {
  const chainData = await Promise.all(
    PUBLIC_DEFAULT_CHAINS.map((chain) => fetchShowcaseDataForChain(chain.id))
  )

  const coins = chainData.flatMap((item) => item.coins)
  const drops = chainData.flatMap((item) => item.drops)
  const proposals = chainData.flatMap((item) => item.proposals)

  return {
    coining: await buildCoiningHighlights(coins),
    drops: buildDropHighlights(drops),
    proposals: buildProposalHighlights(proposals),
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload = await buildShowcaseResponse()
    const { maxAge, swr } = CACHE_TIMES.EXPLORE

    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )

    return res.status(200).json({
      coining: payload.coining.length ? payload.coining : fallbackCoiningHighlights,
      drops: payload.drops.length ? payload.drops : fallbackDropHighlights,
      proposals: payload.proposals.length
        ? payload.proposals
        : fallbackProposalHighlights,
    })
  } catch (error) {
    console.error('About showcase error:', error)

    return res.status(200).json({
      coining: fallbackCoiningHighlights,
      drops: fallbackDropHighlights,
      proposals: fallbackProposalHighlights,
    })
  }
}

export default withCors()(
  withRateLimit({
    maxRequests: 60,
    windowSeconds: 60,
    keyPrefix: 'about:showcase',
  })(handler)
)
