import { AddressType } from '@buildeross/types'
import { createStore } from 'zustand'

export interface DaoContractAddresses {
  token?: AddressType
  metadata?: AddressType
  auction?: AddressType
  treasury?: AddressType
  governor?: AddressType
}

export interface DaoStoreProps {
  addresses: DaoContractAddresses
  setAddresses: (addresses: DaoContractAddresses) => void
}

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
