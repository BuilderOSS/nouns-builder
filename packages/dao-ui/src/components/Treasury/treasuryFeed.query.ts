import { PUBLIC_SUBGRAPH_URL } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import axios from 'axios'

import type { AuctionLike, ProposalLike } from './recentTransactions.helper'

/**
 * The feed needs six proposal fields and three auction fields. The generated
 * `proposals` SDK query pulls the whole `Proposal` fragment (description,
 * calldatas, every vote, candidate versions…) for every row, which is both a
 * large payload and a hard dependency on the newest subgraph schema — a DAO on
 * a chain whose subgraph lags behind gets nothing at all. Asking for exactly
 * what the card renders keeps it working on older deployments.
 */
const TREASURY_FEED_QUERY = `
  query treasuryFeed($dao: String!, $daoId: ID!, $first: Int!, $auctionFirst: Int!) {
    proposals(
      where: { dao: $dao, executed: true }
      orderBy: executedAt
      orderDirection: desc
      first: $first
    ) {
      proposalNumber
      title
      values
      executed
      executedAt
      executionTransactionHash
    }
    dao(id: $daoId) {
      auctions(
        where: { settled: true }
        orderBy: endTime
        orderDirection: desc
        first: $auctionFirst
      ) {
        id
        endTime
        winningBid {
          amount
          transactionHash
        }
      }
    }
  }
`

export interface TreasuryFeedData {
  proposals: ProposalLike[]
  auctions: AuctionLike[]
}

interface TreasuryFeedResponse {
  data?: {
    proposals?: ProposalLike[] | null
    dao?: { auctions?: AuctionLike[] | null } | null
  }
  errors?: { message: string }[]
}

export const fetchTreasuryFeed = async (
  chainId: CHAIN_ID,
  tokenAddress: string,
  limit: number
): Promise<TreasuryFeedData> => {
  const subgraphUrl = PUBLIC_SUBGRAPH_URL.get(chainId)
  if (!subgraphUrl) return { proposals: [], auctions: [] }

  const dao = tokenAddress.toLowerCase()
  const { data } = await axios.post<TreasuryFeedResponse>(subgraphUrl, {
    query: TREASURY_FEED_QUERY,
    // Settled auctions that drew no bid are dropped downstream, so ask for
    // more of them than the feed shows.
    variables: { dao, daoId: dao, first: limit, auctionFirst: limit * 2 },
  })

  if (data.errors?.length) {
    throw new Error(data.errors.map((e) => e.message).join('; '))
  }

  return {
    proposals: data.data?.proposals ?? [],
    auctions: data.data?.dao?.auctions ?? [],
  }
}
