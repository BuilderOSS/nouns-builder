import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { auctionAbi } from '@buildeross/sdk/contract'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { useMemo } from 'react'
import useSWR from 'swr'
import { useConfig } from 'wagmi'
import { readContract } from 'wagmi/actions'

interface UseCurrentAuctionParams {
  chainId: CHAIN_ID
  auctionAddress: AddressType
}

interface CurrentAuctionData {
  currentTokenId?: bigint
  highestBid?: bigint
  highestBidder?: AddressType
  startTime?: bigint
  endTime?: bigint
  settled?: boolean
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

  const {
    data: auction,
    error,
    isLoading,
  } = useSWR(
    chainId && auctionAddress
      ? ([SWR_KEYS.AUCTION, chainId, auctionAddress] as const)
      : null,
    ([, _chainId, _auctionAddress]) =>
      readContract(config, {
        abi: auctionAbi,
        address: _auctionAddress as AddressType,
        functionName: 'auction',
        chainId: _chainId,
      }),
    { revalidateOnFocus: true }
  )

  const auctionData = useMemo(() => {
    const [currentTokenId, highestBid, highestBidder, startTime, endTime, settled] =
      unpackOptionalArray(auction, 6)

    const hasEnded = endTime ? Number(endTime) < Date.now() / 1000 : false
    const isActive = !settled && endTime !== undefined && !hasEnded

    return {
      currentTokenId: currentTokenId as bigint | undefined,
      highestBid: highestBid as bigint | undefined,
      highestBidder: highestBidder as AddressType | undefined,
      startTime: startTime as bigint | undefined,
      endTime: endTime as bigint | undefined,
      settled: settled as boolean | undefined,
      isActive,
      hasEnded,
      isLoading,
      error,
    }
  }, [auction, isLoading, error])

  return auctionData
}
