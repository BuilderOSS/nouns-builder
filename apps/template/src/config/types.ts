import type { AddressType, Chain, DaoContractAddresses } from '@buildeross/types'

export type RequiredDaoContractAddresses = DaoContractAddresses & {
  token: AddressType
  auction: AddressType
  governor: AddressType
  metadata: AddressType
  treasury: AddressType
}

export type DaoConfig = {
  chain: Chain
  addresses: RequiredDaoContractAddresses
  name: string
}
