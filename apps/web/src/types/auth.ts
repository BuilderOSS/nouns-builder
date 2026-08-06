import type { Address } from 'viem'
import type { Connector } from 'wagmi'

// Session data from /api/siwe/me
export interface SessionData {
  address?: Address
  eoaAddress?: Address
  safeAddress?: Address
  safeChainId?: number
}

// Auth errors (typed discriminated union with consistent message field)
export type AuthError =
  | { code: 'WALLET_NOT_CONNECTED'; message?: string }
  | { code: 'SIGNATURE_REJECTED'; message: string }
  | { code: 'INVALID_NONCE'; message?: string }
  | { code: 'SAFE_NOT_FOUND'; address: Address; message?: string }
  | { code: 'NOT_SAFE_OWNER'; address: Address; safeAddress: Address; message?: string }
  | { code: 'VERIFICATION_FAILED'; message: string }
  | { code: 'NETWORK_ERROR'; message: string }

// Safe info structure (matches @buildeross/utils)
export interface SafeInfo {
  safeAddress: Address
  chainId: number
  threshold: number
  owners: Address[]
  isReadOnly: boolean
  nonce?: number
  version?: string
}

// Wallet types
export interface WalletInfo {
  id: string
  name: string
  iconUrl?: string
  isRainbowKitConnector: boolean
  connector?: Connector
}
