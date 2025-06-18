import { PublicClient, createPublicClient } from 'viem'

import { chains, transports } from 'src/data/contract/chains'
import { CHAIN_ID } from 'src/typings'

let providerMap: Map<CHAIN_ID, PublicClient>

export function getProvider(chainId: CHAIN_ID): PublicClient {
  if (!providerMap) providerMap = new Map()
  if (!providerMap.has(chainId)) {
    // Use static provider to prevent re-querying for chain id since this won't change
    providerMap.set(
      chainId,
      createPublicClient({
        chain: chains.find((x) => x.id === chainId),
        transport: transports[chainId],
      })
    )
  }
  return providerMap.get(chainId)!
}
