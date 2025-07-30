import SWR_KEYS from '@buildeross/constants/swrKeys'
import { SubgraphSDK } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { useRouter } from 'next/router'
import useSWR from 'swr'

type UseNextAndPreviousTokensResponse = {
  next?: number
  prev?: number
  latest?: number
}

export const useNextAndPreviousTokens = ({
  chainId,
  collection,
  tokenId,
}: {
  chainId: CHAIN_ID
  collection: string
  tokenId: number
}): UseNextAndPreviousTokensResponse => {
  const { isReady } = useRouter()

  const { data } = useSWR(
    isReady
      ? [SWR_KEYS.DAO_NEXT_AND_PREVIOUS_TOKENS, chainId, collection, tokenId]
      : null,
    () =>
      SubgraphSDK.connect(chainId)
        .daoNextAndPreviousTokens({ tokenId, tokenAddress: collection.toLowerCase() })
        .then((x) => ({
          next: x.next.length > 0 ? parseInt(x.next[0].tokenId) : undefined,
          prev: x.prev.length > 0 ? parseInt(x.prev[0].tokenId) : undefined,
          latest: x.latest.length > 0 ? parseInt(x.latest[0].tokenId) : undefined,
        }))
  )

  return data ?? {}
}
