import { CHAIN_ID } from './chain'
import { AddressType } from './hex'

export type L2MigratedResponse = {
  migrated:
    | {
        l2TokenAddress: AddressType
        chainId: CHAIN_ID
      }
    | undefined
}
