import { AddressType } from '@buildeross/types'

/**
 * Wallet addresses allowed to access the cross-chain migration wizard
 * Empty array = open to all wallets
 * Add addresses to restrict access
 */
export const MIGRATION_WALLET_WHITELIST: AddressType[] = []

/**
 * Helper function to check if a wallet has access to the cross-chain migration wizard
 * @param wallet - The wallet address to check
 * @returns true if wallet has access (whitelist is empty OR wallet is in whitelist)
 */
export const isMigrationAllowed = (wallet: AddressType): boolean => {
  if (MIGRATION_WALLET_WHITELIST.length === 0) {
    return true // Open to all when whitelist is empty
  }
  return MIGRATION_WALLET_WHITELIST.some(
    (allowed) => allowed.toLowerCase() === wallet.toLowerCase()
  )
}
