import { PUBLIC_ALL_CHAINS, RPC_URLS } from '@buildeross/constants'
import { Chain, CHAIN_ID } from '@buildeross/types'
import { http, Transport } from 'viem'
import { fallback } from 'wagmi'

export const chains = PUBLIC_ALL_CHAINS

export const transports: Record<CHAIN_ID, Transport> = chains.reduce(
  (acc: Record<CHAIN_ID, Transport>, chain: Chain) => {
    const list = []

    const rpcs = RPC_URLS[chain.id]

    if (!!rpcs) {
      for (const rpc of rpcs) {
        list.push(http(rpc))
      }
    }
    list.push(http())

    return {
      ...acc,
      [chain.id]: fallback(list),
    }
  },
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
