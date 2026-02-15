import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { CHAIN_ID } from '@buildeross/types'
import type { Sablier } from 'sablier'
import { sablier } from 'sablier'
import { Abi, type Chain } from 'viem'

// Build a Set of Sablier-supported chain IDs for fast lookup
const SABLIER_CHAIN_IDS = new Set(
  sablier.evm.chains.getAll().map((chain: Chain) => chain.id as number)
)

// Whitelist of chains we support that are also supported by Sablier
export const SUPPORTED_SABLIER_CHAINS: CHAIN_ID[] = PUBLIC_ALL_CHAINS.map(
  (chain) => chain.id
).filter((chainId: CHAIN_ID) => SABLIER_CHAIN_IDS.has(chainId))

// Check if a chain supports Sablier
export function isSablierSupported(chainId: CHAIN_ID): boolean {
  return SUPPORTED_SABLIER_CHAINS.includes(chainId)
}

// Error message for unsupported chains
export const UNSUPPORTED_CHAIN_ERROR =
  'Sablier streams are not supported on this network. Please switch to a supported chain.'

// Get the latest lockup release from Sablier package (synchronous)
// This can be referenced from other files instead of calling getLatest separately
export const LATEST_LOCKUP_RELEASE: Sablier.EVM.Release = sablier.releases.getLatest({
  protocol: 'lockup',
})

// Sablier Lockup contract ABI (includes all functions we need)
// This is the unified contract that replaced LockupLinear, LockupDynamic, etc.
export const lockupAbi = LATEST_LOCKUP_RELEASE.abi.SablierLockup as Abi

// Sablier BatchLockup contract ABI for creating multiple streams
export const batchLockupAbi = LATEST_LOCKUP_RELEASE.abi.SablierBatchLockup as Abi

// Stream status enum
export enum StreamStatus {
  PENDING = 0,
  STREAMING = 1,
  SETTLED = 2,
  CANCELED = 3,
  DEPLETED = 4,
}
