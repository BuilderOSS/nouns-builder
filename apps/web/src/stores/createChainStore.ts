import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { Chain } from '@buildeross/types'
import { createStore } from 'zustand'
import { createJSONStorage, persist, StorageValue } from 'zustand/middleware'

export const CHAIN_STORE_IDENTIFIER = `nouns-builder-chain-${process.env.NEXT_PUBLIC_NETWORK_TYPE}`

export type ChainStoreProps = {
  chain: Chain
  setChain: (chain: Chain) => void
}

export const createChainStore = (init?: Chain) => {
  const storage = createJSONStorage<ChainStoreProps>(() => localStorage)

  if (typeof window !== 'undefined' && init && storage) {
    const item = storage.getItem(CHAIN_STORE_IDENTIFIER) as StorageValue<ChainStoreProps>
    if (item) {
      try {
        const merged: StorageValue<ChainStoreProps> = {
          ...item,
          state: {
            ...item.state,
            chain: init,
          },
        }
        storage.setItem(CHAIN_STORE_IDENTIFIER, merged)
      } catch {
        console.warn('createChainStore: failed to merge init into storage')
      }
    }
  }

  const initialChain = init ?? PUBLIC_DEFAULT_CHAINS[0]

  const store = createStore(
    persist<ChainStoreProps>(
      (set) => ({
        chain: initialChain,
        setChain: (chain) => set({ chain }),
      }),
      {
        name: CHAIN_STORE_IDENTIFIER,
        storage,
        version: 1,
      }
    )
  )

  return store
}
