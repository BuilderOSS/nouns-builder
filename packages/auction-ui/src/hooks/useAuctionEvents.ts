import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { useAuctionStatus } from '@buildeross/hooks/useAuctionStatus'
import type { AuctionStatus } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import React from 'react'
import { useSWRConfig } from 'swr'

export type AuctionStatusChange = {
  created: boolean
  bid: boolean
  settled: boolean
}

/**
 * Compares two auction status snapshots for the same DAO and reports what
 * happened in between. A missing previous snapshot (first observation) is
 * never reported as a change.
 */
export const diffAuctionStatus = (
  prev: AuctionStatus | null | undefined,
  next: AuctionStatus | null | undefined
): AuctionStatusChange => {
  const none = { created: false, bid: false, settled: false }
  if (prev === undefined || !next) return none

  if (!prev || prev.id !== next.id) return { ...none, created: true }

  return {
    created: false,
    bid:
      prev.bidCount !== next.bidCount ||
      prev.highestBid?.amount !== next.highestBid?.amount,
    settled: !prev.settled && next.settled,
  }
}

/**
 * Keeps auction data fresh by polling the cached auction status API (backed by
 * the subgraph) and refreshing the auction and bids when something changes.
 */
export const useAuctionEvents = ({
  chainId,
  auctionAddress,
  tokenAddress,
  onAuctionCreated,
  onAuctionBidCreated,
  enabled = true,
}: {
  chainId: CHAIN_ID
  auctionAddress: AddressType
  tokenAddress: AddressType
  enabled?: boolean
  onAuctionCreated?: (tokenId: bigint) => void
  onAuctionBidCreated?: (tokenId: bigint) => void
}) => {
  const { mutate } = useSWRConfig()

  const daoId = tokenAddress?.toLowerCase()
  const daos = React.useMemo(() => (daoId ? [daoId] : []), [daoId])

  const { data } = useAuctionStatus({
    chainId,
    daos,
    enabled: !!auctionAddress && !!tokenAddress && enabled,
  })

  // Keep callbacks in refs so new closures don't retrigger the effect
  const onAuctionCreatedRef = React.useRef(onAuctionCreated)
  const onAuctionBidCreatedRef = React.useRef(onAuctionBidCreated)
  React.useEffect(() => {
    onAuctionCreatedRef.current = onAuctionCreated
    onAuctionBidCreatedRef.current = onAuctionBidCreated
  }, [onAuctionCreated, onAuctionBidCreated])

  const prevRef = React.useRef<{ daoId: string; status: AuctionStatus | null }>(undefined)

  React.useEffect(() => {
    // DAOs the API couldn't resolve are omitted from the response; skip them
    if (!daoId || !data || !(daoId in data.auctions)) return

    const next = data.auctions[daoId]
    const prev = prevRef.current?.daoId === daoId ? prevRef.current.status : undefined
    prevRef.current = { daoId, status: next }

    const change = diffAuctionStatus(prev, next)
    if (!next || (!change.created && !change.bid && !change.settled)) return

    // Capture callbacks before refreshing: the refreshed auction can change
    // which callbacks the caller passes (e.g. onAuctionCreated is only set
    // while the viewed token is the live auction).
    const onCreated = onAuctionCreatedRef.current
    const onBid = onAuctionBidCreatedRef.current

    const refreshAuction = mutate([
      SWR_KEYS.AUCTION,
      chainId,
      auctionAddress.toLowerCase(),
    ])
    const refreshBids =
      change.created || change.bid
        ? mutate([SWR_KEYS.AUCTION_BIDS, chainId, daoId, next.tokenId])
        : undefined

    Promise.all([refreshAuction, refreshBids]).then(() => {
      const tokenId = BigInt(next.tokenId)
      if (change.created) onCreated?.(tokenId)
      else if (change.bid) onBid?.(tokenId)
    })
  }, [data, daoId, chainId, auctionAddress, mutate])
}
