import {
  getAlchemyServerRpcUrl,
  PUBLIC_ALL_CHAINS,
  RPC_URLS,
} from '@buildeross/constants'
import { Chain, CHAIN_ID } from '@buildeross/types'
import { http, HttpTransportConfig, Transport } from 'viem'
import { fallback } from 'wagmi'

import { alchemyServerFetch, isAlchemyServerAuthConfigured } from '../alchemyAuth'

export const chains = PUBLIC_ALL_CHAINS

/**
 * Ordered RPC transports for a chain, ending with the chain's default public RPC.
 * On the server, alchemy goes first through a keyless URL with an
 * `Authorization` header, since the public key is domain-locked.
 */
export const getRpcTransports = (
  chainId: CHAIN_ID,
  config?: HttpTransportConfig
): Transport[] => {
  const list: Transport[] = []

  if (typeof window === 'undefined' && isAlchemyServerAuthConfigured()) {
    const alchemy = getAlchemyServerRpcUrl(chainId)
    if (alchemy) list.push(http(alchemy, { ...config, fetchFn: alchemyServerFetch }))
  }

  for (const rpc of RPC_URLS[chainId] ?? []) {
    list.push(http(rpc, config))
  }
  list.push(http(undefined, config))

  return list
}

export const transports: Record<CHAIN_ID, Transport> = chains.reduce(
  (acc: Record<CHAIN_ID, Transport>, chain: Chain) => ({
    ...acc,
    [chain.id]: fallback(getRpcTransports(chain.id)),
  }),
  {} as Record<CHAIN_ID, Transport>
)

/**
 * How often viem polls (receipt waits, block/event watchers). viem defaults to
 * half the block time capped at 4s, i.e. 1s on 2s-block L2s; 2s halves the RPC
 * calls with little impact on UX.
 */
export const pollingInterval: Partial<Record<CHAIN_ID, number>> = {
  [CHAIN_ID.ETHEREUM]: 4_000,
  [CHAIN_ID.SEPOLIA]: 4_000,
  [CHAIN_ID.BASE]: 2_000,
  [CHAIN_ID.BASE_SEPOLIA]: 2_000,
  [CHAIN_ID.OPTIMISM]: 2_000,
}
