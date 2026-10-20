import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import type { AuctionStatusFragment } from '../sdk.generated'

/**
 * JSON-safe snapshot of an auction's state, used to detect new bids,
 * new auctions and settlements without watching contract events over RPC.
 */
export type AuctionStatus = {
  /** `${tokenAddress}:${tokenId}` */
  id: string
  /** DAO token address (lowercase) */
  daoId: string
  auctionAddress: string
  tokenId: string
  startTime: number
  endTime: number
  extended: boolean
  settled: boolean
  bidCount: number
  /** amount in wei as a decimal string */
  highestBid: { amount: string; bidder: string } | null
  token: { name: string; image: string | null }
}

export type LiveAuctionsSnapshot = {
  syncedBlock: number
  /** keyed by DAO token address (lowercase) */
  auctions: Record<string, AuctionStatus>
}

export type DaosAuctionStatusResult = {
  syncedBlock: number
  /** keyed by DAO token address (lowercase); null when the DAO has no auction */
  auctions: Record<string, AuctionStatus | null>
}

const PAGE_SIZE = 1000
const MAX_PAGES = 5

export const toAuctionStatus = (auction: AuctionStatusFragment): AuctionStatus => ({
  id: auction.id,
  daoId: auction.dao.id.toLowerCase(),
  auctionAddress: String(auction.dao.auctionAddress).toLowerCase(),
  tokenId: String(auction.token.tokenId),
  startTime: Number(auction.startTime),
  endTime: Number(auction.endTime),
  extended: auction.extended,
  settled: auction.settled,
  bidCount: auction.bidCount,
  highestBid: auction.highestBid
    ? {
        amount: String(auction.highestBid.amount),
        bidder: String(auction.highestBid.bidder).toLowerCase(),
      }
    : null,
  token: {
    name: auction.token.name,
    image: auction.token.image ?? null,
  },
})

/**
 * Fetches every unsettled auction on a chain in as few requests as possible.
 * Each DAO has at most one unsettled auction, so the result is keyed by DAO.
 *
 * Throws on failure so callers can decide whether to serve stale data.
 */
export const liveAuctionsRequest = async (
  chainId: CHAIN_ID
): Promise<LiveAuctionsSnapshot> => {
  const sdk = SDK.connect(chainId)
  const auctions: Record<string, AuctionStatus> = {}
  let syncedBlock = 0

  for (let page = 0; page < MAX_PAGES; page++) {
    // eslint-disable-next-line no-await-in-loop
    const data = await sdk.liveAuctions({ first: PAGE_SIZE, skip: page * PAGE_SIZE })

    // eslint-disable-next-line no-underscore-dangle
    if (page === 0) syncedBlock = data._meta?.block.number ?? 0

    for (const auction of data.auctions) {
      const status = toAuctionStatus(auction)
      auctions[status.daoId] = status
    }

    if (data.auctions.length < PAGE_SIZE) break
  }

  return { syncedBlock, auctions }
}

/**
 * Fetches the current auction for a batch of DAOs in one request. Used for
 * DAOs with no unsettled auction (e.g. just settled, or the auction is paused).
 * DAOs the subgraph doesn't know are returned as null.
 *
 * Throws on failure so callers can decide whether to serve stale data.
 */
export const daosAuctionStatusRequest = async (
  chainId: CHAIN_ID,
  daoIds: string[]
): Promise<DaosAuctionStatusResult> => {
  const ids = daoIds.map((id) => id.toLowerCase())
  const data = await SDK.connect(chainId).daosCurrentAuction({ ids, first: ids.length })

  const auctions: Record<string, AuctionStatus | null> = {}
  for (const id of ids) auctions[id] = null
  for (const dao of data.daos) {
    auctions[dao.id.toLowerCase()] = dao.currentAuction
      ? toAuctionStatus(dao.currentAuction)
      : null
  }

  return {
    // eslint-disable-next-line no-underscore-dangle
    syncedBlock: data._meta?.block.number ?? 0,
    auctions,
  }
}
