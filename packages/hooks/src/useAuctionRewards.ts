import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import {
  getAuctionRewards,
  type GetAuctionRewardsResponse,
} from '@buildeross/sdk/contract'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'

export type UseAuctionRewardsProps = {
  chainId?: CHAIN_ID
  auctionAddress?: AddressType
}

export type UseAuctionRewardsReturnType = {
  data: GetAuctionRewardsResponse | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<GetAuctionRewardsResponse>
}

export const useAuctionRewards = ({
  chainId,
  auctionAddress,
}: UseAuctionRewardsProps): UseAuctionRewardsReturnType => {
  const { data, error, isValidating, isLoading, mutate } =
    useSWR<GetAuctionRewardsResponse>(
      chainId && auctionAddress
        ? ([SWR_KEYS.AUCTION_REWARDS, chainId, auctionAddress] as const)
        : null,
      async ([, _chainId, _auctionAddress]) =>
        getAuctionRewards(_chainId as CHAIN_ID, _auctionAddress as AddressType),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        dedupingInterval: 60_000,
      }
    )

  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}
