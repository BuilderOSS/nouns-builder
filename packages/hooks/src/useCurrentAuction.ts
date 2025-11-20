import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { auctionAbi } from '@buildeross/sdk/contract'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { useMemo } from 'react'
import useSWR from 'swr'
import { useConfig } from 'wagmi'
import { readContracts } from 'wagmi/actions'

interface UseCurrentAuctionParams {
  chainId: CHAIN_ID
  auctionAddress: AddressType
}

interface CurrentAuctionData {
  paused: boolean
  currentTokenId: bigint | undefined
  highestBid: bigint | undefined
  highestBidder: AddressType | undefined
  startTime: number | undefined
  endTime: number | undefined
  settled: boolean
  isActive: boolean
  hasEnded: boolean
  isLoading: boolean
  error?: Error
}

export const useCurrentAuction = ({
  chainId,
  auctionAddress,
}: UseCurrentAuctionParams): CurrentAuctionData => {
  const config = useConfig()

  const { data, error, isLoading } = useSWR(
    chainId && auctionAddress
      ? ([SWR_KEYS.AUCTION, chainId, auctionAddress] as const)
      : null,
    ([, _chainId, _auctionAddress]) =>
      readContracts(config, {
        allowFailure: false,
        contracts: [
          {
            abi: auctionAbi,
            address: _auctionAddress as AddressType,
            functionName: 'auction',
            chainId: _chainId,
          },
          {
            address: _auctionAddress as AddressType,
            chainId: _chainId,
            abi: auctionAbi,
            functionName: 'paused',
          },
        ] as const,
      }),
    { revalidateOnFocus: true }
  )

  const [auction, paused] = data ?? [undefined, undefined]

  const auctionData = useMemo(() => {
    const [currentTokenId, highestBid, highestBidder, startTime, endTime, settled] =
      unpackOptionalArray(auction, 6)

    const hasEnded = endTime ? Number(endTime) < Date.now() / 1000 : false
    const isActive = !settled && endTime !== undefined && !hasEnded

    return {
      paused: Boolean(paused),
      currentTokenId,
      highestBid,
      highestBidder,
      startTime,
      endTime,
      settled: Boolean(settled),
      isActive,
      hasEnded,
      isLoading,
      error,
    }
  }, [auction, paused, isLoading, error])

  return auctionData
}
