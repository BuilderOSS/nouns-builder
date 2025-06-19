import { OwnedNft } from 'alchemy-sdk'
import useSWR from 'swr'
import { Address, isAddress } from 'viem'

import SWR_KEYS from 'src/constants/swrKeys'
import { CHAIN_ID } from 'src/typings'
import { getNFTBalance } from 'src/utils/alchemy'

export type NFTBalanceReturnType = {
  nfts?: OwnedNft[]
  isLoading: boolean
  error?: Error | null
}

export const useNFTBalance = (
  chainId?: CHAIN_ID,
  address?: Address
): NFTBalanceReturnType => {
  const { data, error, isLoading } = useSWR(
    !!address && !!chainId && isAddress(address)
      ? [SWR_KEYS.NFT_BALANCES, chainId, address]
      : null,
    async () => getNFTBalance(chainId as CHAIN_ID, address as `0x${string}`),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    nfts: data,
    isLoading,
    error,
  }
}
