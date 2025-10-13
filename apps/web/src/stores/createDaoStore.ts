import type { DaoContractAddresses } from '@buildeross/types'
import { createStore } from 'zustand'

export type DaoStoreProps = {
  addresses: DaoContractAddresses
  setAddresses: (addresses: DaoContractAddresses) => void
}

export type { DaoContractAddresses }

export const createDaoStore = (init?: DaoContractAddresses) =>
  createStore<DaoStoreProps>((set) => ({
    addresses: {
      token: undefined,
      metadata: undefined,
      auction: undefined,
      treasury: undefined,
      governor: undefined,
      ...init,
    },
    setAddresses: (addresses: DaoContractAddresses) => set({ addresses }),
  }))
