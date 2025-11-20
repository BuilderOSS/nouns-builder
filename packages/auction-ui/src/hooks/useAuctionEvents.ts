import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { auctionAbi } from '@buildeross/sdk/contract'
import { awaitSubgraphSync } from '@buildeross/sdk/subgraph'
import { useDaoStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import React from 'react'
import { useSWRConfig } from 'swr'
import { useWatchContractEvent } from 'wagmi'

export const useAuctionEvents = ({
  chainId,
  isTokenActiveAuction,
  onAuctionCreated,
  onAuctionBidCreated,
}: {
  chainId: CHAIN_ID
  isTokenActiveAuction: boolean
  onAuctionCreated?: (tokenId: bigint) => void
  onAuctionBidCreated?: (tokenId: bigint) => void
}) => {
  const { mutate } = useSWRConfig()
  const { auction } = useDaoStore((state) => state.addresses)

  const refreshAuctionAndBids = React.useCallback(
    async (_blockNumber: bigint, _tokenId: bigint) => {
      if (!auction) return

      await awaitSubgraphSync(chainId, _blockNumber)

      await mutate([SWR_KEYS.AUCTION, chainId, auction.toLowerCase()])

      await mutate([
        SWR_KEYS.AUCTION_BIDS,
        chainId,
        auction.toLowerCase(),
        _tokenId.toString(),
      ])
    },
    [chainId, auction, mutate]
  )

  useWatchContractEvent({
    address: isTokenActiveAuction ? auction : undefined,
    abi: auctionAbi,
    eventName: 'AuctionCreated',
    chainId,
    onLogs: async (logs) => {
      const tokenId = logs[0].args.tokenId as bigint
      await refreshAuctionAndBids(logs[0].blockNumber, tokenId)
      onAuctionCreated?.(tokenId)
    },
  })

  useWatchContractEvent({
    address: isTokenActiveAuction ? auction : undefined,
    abi: auctionAbi,
    eventName: 'AuctionBid',
    onLogs: async (logs) => {
      const tokenId = logs[0].args.tokenId as bigint
      await refreshAuctionAndBids(logs[0].blockNumber, tokenId)
      onAuctionBidCreated?.(tokenId)
    },
  })
}
