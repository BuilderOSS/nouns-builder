import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { auctionAbi } from '@buildeross/sdk/contract'
import { awaitSubgraphSync, getBids } from '@buildeross/sdk/subgraph'
import { useDaoStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import React from 'react'
import { useSWRConfig } from 'swr'
import { useConfig, useWatchContractEvent } from 'wagmi'
import { readContract } from 'wagmi/actions'

export const useAuctionEvents = ({
  chainId,
  collection,
  isTokenActiveAuction,
  onAuctionCreated,
  onAuctionBidCreated,
}: {
  chainId: CHAIN_ID
  collection: string
  isTokenActiveAuction: boolean
  onAuctionCreated?: (tokenId: bigint) => void
  onAuctionBidCreated?: (tokenId: bigint) => void
}) => {
  const { mutate } = useSWRConfig()
  const { auction } = useDaoStore((state) => state.addresses)
  const config = useConfig()

  const refreshAuctionAndBids = React.useCallback(
    async (_blockNumber: bigint, _tokenId: bigint) => {
      await awaitSubgraphSync(chainId, _blockNumber)

      await mutate([SWR_KEYS.AUCTION, chainId, auction], () =>
        readContract(config, {
          abi: auctionAbi,
          address: auction as AddressType,
          chainId,
          functionName: 'auction',
        })
      )

      await mutate([SWR_KEYS.AUCTION_BIDS, chainId, auction, _tokenId.toString()], () =>
        getBids(chainId, collection, _tokenId.toString())
      )
    },
    [chainId, collection, auction, mutate, config]
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
