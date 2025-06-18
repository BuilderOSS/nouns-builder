import { Transport, http } from 'viem'
import { fallback } from 'wagmi'

import { PUBLIC_ALL_CHAINS, PUBLIC_IS_TESTNET } from 'src/constants/defaultChains'
import { RPC_URLS } from 'src/constants/rpc'
import { CHAIN_ID, Chain } from 'src/typings'

export const L1_CHAINS = PUBLIC_IS_TESTNET ? [CHAIN_ID.SEPOLIA] : [CHAIN_ID.ETHEREUM]

export const L2_CHAINS = PUBLIC_IS_TESTNET
  ? [CHAIN_ID.ZORA_SEPOLIA, CHAIN_ID.BASE_SEPOLIA, CHAIN_ID.OPTIMISM_SEPOLIA]
  : [CHAIN_ID.ZORA, CHAIN_ID.BASE, CHAIN_ID.OPTIMISM]

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
