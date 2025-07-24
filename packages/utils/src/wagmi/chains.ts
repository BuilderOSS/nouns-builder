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
  {} as Record<CHAIN_ID, Transport>,
)
