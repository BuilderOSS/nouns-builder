import type { EIP1193Provider, SafeInfo, SendTransactionParams } from '../providers/types'

export interface SafeTransactionParams {
  safeInfo: SafeInfo
  transaction: SendTransactionParams
  transactions?: SendTransactionParams[]
  eoaProvider: EIP1193Provider
  mode: 'execute' | 'propose' // execute for 1/N, propose for multi-sig
}

export interface SafeTransactionResult {
  txHash?: string // Ethereum tx hash for execute mode
  safeTxHash?: string // Safe tx hash for propose mode
  mode: 'execute' | 'propose'
}

export type SafeTransactionHandler = (
  params: SafeTransactionParams
) => Promise<SafeTransactionResult>

/**
 * Global handler for Safe multi-sig transactions
 * Set by SafeTransactionProvider on mount
 */
let globalHandler: SafeTransactionHandler | null = null

/**
 * Register global handler for Safe multi-sig transactions
 * Called once by SafeTransactionProvider on mount
 */
export function registerSafeTransactionHandler(handler: SafeTransactionHandler): void {
  globalHandler = handler
}

/**
 * Get the registered global handler
 * Called by SafeOwnerProvider when multi-sig transaction is initiated
 */
export function getSafeTransactionHandler(): SafeTransactionHandler | null {
  return globalHandler
}

/**
 * Unregister handler (for cleanup/testing)
 */
export function unregisterSafeTransactionHandler(): void {
  globalHandler = null
}
