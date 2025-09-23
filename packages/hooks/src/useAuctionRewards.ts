import { SWR_KEYS } from '@buildeross/constants'
import { getAuctionRewards, GetAuctionRewardsResponse } from '@buildeross/sdk'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import useSWR from 'swr'

export type UseAuctionRewardsProps = {
  chainId?: CHAIN_ID
  auctionAddress?: AddressType
}

export type UseAuctionRewardsReturnType = {
  data?: GetAuctionRewardsResponse
  isLoading: boolean
  error?: Error | null
  mutate: () => Promise<GetAuctionRewardsResponse | undefined>
}

export const useAuctionRewards = ({
  chainId,
  auctionAddress,
}: UseAuctionRewardsProps): UseAuctionRewardsReturnType => {
  const { data, error, isLoading, mutate } = useSWR<GetAuctionRewardsResponse>(
    chainId && auctionAddress
      ? [SWR_KEYS.AUCTION_REWARDS, chainId, auctionAddress]
      : null,
    async () => getAuctionRewards(chainId as CHAIN_ID, auctionAddress as AddressType),
  )

  return {
    data,
    isLoading,
    error,
    mutate,
  }
}
