import { CHAIN_ID } from '@buildeross/types'
import { createPublicClient, http, PublicClient } from 'viem'
import { foundry } from 'wagmi/chains'

import { chains, transports } from './wagmi/chains'

let providerMap: Map<CHAIN_ID, PublicClient>

export function getProvider(chainId: CHAIN_ID): PublicClient {
  if (!providerMap) providerMap = new Map()
  if (!providerMap.has(chainId)) {
    // Use static provider to prevent re-querying for chain id since this won't change
    //
    if (chainId === CHAIN_ID.FOUNDRY) {
      providerMap.set(
        chainId,
        createPublicClient({
          chain: foundry,
          transport: http(foundry.rpcUrls.default.http[0]),
        }),
      )
    } else {
      providerMap.set(
        chainId,
        createPublicClient({
          chain: chains.find((x) => x.id === chainId),
          transport: transports[chainId],
        }),
      )
    }
  }
  return providerMap.get(chainId)!
}
