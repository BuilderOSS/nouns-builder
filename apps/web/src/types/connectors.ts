import type { Address } from 'viem'
import type { Connector } from 'wagmi'

import type { SafeInfo } from './auth'

// Extend wagmi connector types for SafeOwnerConnector
declare module 'wagmi' {
  interface Register {
    connector: {
      safeOwner: SafeOwnerConnectorType
    }
  }
}

export interface SafeOwnerConnectorType extends Connector {
  id: 'safeOwner'
  name: 'Safe Owner'
  safeInfo: SavedSafeInfo | null
  cachedOwnerConnector: Connector | null
  cachedOwnerAddress: Address | null
  getOwnerConnector(): Promise<Connector | null>
  getOwnerAddress(): Promise<Address | null>
}

export interface SavedSafeInfo extends SafeInfo {
  ownerConnectorId: string
  timestamp: number
}
