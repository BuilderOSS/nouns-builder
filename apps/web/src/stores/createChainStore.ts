import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { Chain } from '@buildeross/types'
import { createStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const CHAIN_STORE_IDENTIFIER = 'CHAIN_STORE'

export interface ChainStoreProps {
  chain: Chain
  setChain: (chain: Chain) => void
}

export const createChainStore = (init?: Chain) =>
  createStore(
    persist<ChainStoreProps>(
      (set) => ({
        chain: init ? { ...PUBLIC_DEFAULT_CHAINS[0], ...init } : PUBLIC_DEFAULT_CHAINS[0],
        setChain: (chain) => set({ chain }),
      }),
      {
        name: CHAIN_STORE_IDENTIFIER,
        storage: createJSONStorage(() => localStorage),
        version: 1,
      }
    )
  )
