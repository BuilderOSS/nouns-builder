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
  cachedEOAConnector: Connector | null
  cachedEOAAddress: Address | null
  getEOAConnector(): Promise<Connector | null>
  getEOAAddress(): Promise<Address | null>
}

export interface SavedSafeInfo extends SafeInfo {
  eoaConnectorId: string
  timestamp: number
}
