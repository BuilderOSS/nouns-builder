import SWR_KEYS from '@buildeross/constants/swrKeys'
import { auctionAbi } from '@buildeross/sdk/contract'
import { getBids } from '@buildeross/sdk/subgraph'
import { awaitSubgraphSync } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useRouter } from 'next/router'
import { useDaoStore } from 'src/stores/useDaoStore'
import { useSWRConfig } from 'swr'
import { useConfig, useWatchContractEvent } from 'wagmi'
import { readContract } from 'wagmi/actions'

export const useAuctionEvents = ({
  chainId,
  collection,
  tokenId,
  isTokenActiveAuction,
}: {
  chainId: CHAIN_ID
  collection: string
  tokenId: string
  isTokenActiveAuction: boolean
}) => {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { auction } = useDaoStore((state) => state.addresses)
  const config = useConfig()

  useWatchContractEvent({
    address: isTokenActiveAuction ? auction : undefined,
    abi: auctionAbi,
    eventName: 'AuctionCreated',
    chainId,
    onLogs: async (logs) => {
      await awaitSubgraphSync(chainId, logs[0].blockNumber)

      await mutate([SWR_KEYS.AUCTION, chainId, auction], () =>
        readContract(config, {
          abi: auctionAbi,
          address: auction as AddressType,
          chainId,
          functionName: 'auction',
        })
      )

      const tokenId = logs[0].args.tokenId as bigint

      await mutate([SWR_KEYS.AUCTION_BIDS, chainId, auction, tokenId], () =>
        getBids(chainId, collection, tokenId.toString())
      )

      await router.push(`/dao/${router.query.network}/${collection}/${tokenId}`)
    },
  })

  useWatchContractEvent({
    address: isTokenActiveAuction ? auction : undefined,
    abi: auctionAbi,
    eventName: 'AuctionBid',
    onLogs: async (logs) => {
      await awaitSubgraphSync(chainId, logs[0].blockNumber)

      await mutate([SWR_KEYS.AUCTION, chainId, auction], () =>
        readContract(config, {
          abi: auctionAbi,
          address: auction as AddressType,
          chainId: chainId,
          functionName: 'auction',
        })
      )

      await mutate([SWR_KEYS.AUCTION_BIDS, chainId, auction, tokenId], () =>
        getBids(chainId, auction as string, tokenId)
      )
    },
  })
}
