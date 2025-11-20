import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { auctionAbi } from '@buildeross/sdk/contract'
import { awaitSubgraphSync } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import React from 'react'
import { useSWRConfig } from 'swr'
import { useWatchContractEvent } from 'wagmi'

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

  const refreshAuctionAndBids = React.useCallback(
    async (_blockNumber: bigint, _tokenId: bigint) => {
      await awaitSubgraphSync(chainId, _blockNumber)

      await mutate([SWR_KEYS.AUCTION, chainId, auctionAddress.toLowerCase()])

      await mutate([
        SWR_KEYS.AUCTION_BIDS,
        chainId,
        tokenAddress.toLowerCase(),
        _tokenId.toString(),
      ])
    },
    [chainId, auctionAddress, tokenAddress, mutate]
  )

  useWatchContractEvent({
    address: auctionAddress,
    enabled: !!auctionAddress && enabled,
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
    address: auctionAddress,
    enabled: !!auctionAddress && enabled,
    abi: auctionAbi,
    eventName: 'AuctionBid',
    chainId,
    onLogs: async (logs) => {
      const tokenId = logs[0].args.tokenId as bigint
      await refreshAuctionAndBids(logs[0].blockNumber, tokenId)
      onAuctionBidCreated?.(tokenId)
    },
  })
}
