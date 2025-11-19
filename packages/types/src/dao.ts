import { AddressType } from './hex'

export type DaoContractAddresses = {
  token?: AddressType
  metadata?: AddressType
  auction?: AddressType
  treasury?: AddressType
  governor?: AddressType
}

export type RequiredDaoContractAddresses = DaoContractAddresses & {
  token: AddressType
  auction: AddressType
  governor: AddressType
  metadata: AddressType
  treasury: AddressType
}
