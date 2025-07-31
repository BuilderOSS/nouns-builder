import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { Chain } from '@buildeross/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface ChainStoreProps {
  chain: Chain
  setChain: (chain: Chain) => void
}

export const CHAIN_STORE_IDENTIFIER = `nouns-builder-chain-${process.env.NEXT_PUBLIC_NETWORK_TYPE}`

export const useChainStore = create(
  persist<ChainStoreProps>(
    (set) => ({
      chain: PUBLIC_DEFAULT_CHAINS[0],
      setChain: (chain) => set({ chain }),
    }),
    {
      name: CHAIN_STORE_IDENTIFIER,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)

export const getChainFromLocalStorage = (): Chain => {
  const rawChain = localStorage.getItem(CHAIN_STORE_IDENTIFIER)
  return rawChain ? JSON.parse(rawChain)?.state?.chain : PUBLIC_DEFAULT_CHAINS[0]
}
