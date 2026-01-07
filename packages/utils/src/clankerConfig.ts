import type { Address } from 'viem'

// Clanker SDK types and constants based on the reference implementation

/**
 * Pool position presets from Clanker SDK
 * These are standard configurations for different types of token launches
 */
export enum POOL_POSITIONS {
  Project = 'Project',
  Creator = 'Creator',
  // Add other presets as they become available in the SDK
}

/**
 * Fee configuration presets from Clanker SDK
 * These determine the fee structure for trading
 */
export enum FEE_CONFIGS {
  DynamicBasic = 'DynamicBasic',
  Fixed = 'Fixed',
  // Add other presets as they become available in the SDK
}

/**
 * Configuration for vault (lockup/vesting)
 */
export interface VaultConfig {
  percentage: number // 1-90% of token supply
  lockupDuration: number // in seconds, minimum 7 days
  vestingDuration: number // in seconds, can be 0
  recipient?: Address // optional, defaults to tokenAdmin
}

/**
 * Configuration for rewards distribution
 */
export interface RewardRecipient {
  recipient: Address
  admin: Address
  bps: number // basis points (100 = 1%, 10000 = 100%)
  token: 'Paired' | 'Both' // which tokens to receive as rewards
}

/**
 * Configuration for developer buy
 */
export interface DevBuyConfig {
  ethAmount: number // ETH amount to purchase on deployment
}

/**
 * Pool configuration options
 */
export type ClankerPoolConfig = POOL_POSITIONS | 'Custom'

/**
 * Helper function to generate symbol from name
 * Removes vowels and spaces, converts to uppercase, limits to 4 chars
 */
export function generateSymbol(name: string): string {
  return `$${name
    .toUpperCase()
    .replace(/[AEIOU\s]/g, '')
    .slice(0, 4)}`
}

/**
 * Convert days to seconds for duration fields
 */
export function convertDaysToSeconds(days: number): number {
  return days * 24 * 60 * 60
}

/**
 * Convert seconds to days for display purposes
 */
export function convertSecondsToDays(seconds: number): number {
  return Math.floor(seconds / (24 * 60 * 60))
}

/**
 * Validate vault configuration
 */
export function validateVaultConfig(config: VaultConfig): string | null {
  if (config.percentage < 1 || config.percentage > 90) {
    return 'Vault percentage must be between 1 and 90'
  }

  const minLockupSeconds = convertDaysToSeconds(7)
  if (config.lockupDuration < minLockupSeconds) {
    return 'Lockup duration must be at least 7 days'
  }

  if (config.vestingDuration < 0) {
    return 'Vesting duration cannot be negative'
  }

  return null
}

/**
 * Create a default vault configuration
 */
export function createDefaultVaultConfig(): VaultConfig {
  return {
    percentage: 10,
    lockupDuration: convertDaysToSeconds(30),
    vestingDuration: convertDaysToSeconds(30),
  }
}

/**
 * Pool configuration options for UI dropdown
 */
export const POOL_POSITION_OPTIONS = [
  {
    value: POOL_POSITIONS.Project,
    label: 'Project',
    description: 'Optimized for long-term projects',
  },
  {
    value: POOL_POSITIONS.Creator,
    label: 'Creator',
    description: 'Optimized for creator coins',
  },
  {
    value: 'Custom',
    label: 'Custom',
    description: 'Custom configuration based on market cap',
  },
]

/**
 * Fee configuration options for UI dropdown
 */
export const FEE_CONFIG_OPTIONS = [
  {
    value: FEE_CONFIGS.DynamicBasic,
    label: 'Dynamic Basic',
    description: 'Fees adjust based on trading volume',
  },
  {
    value: FEE_CONFIGS.Fixed,
    label: 'Fixed',
    description: 'Fixed fee percentage for all trades',
  },
]

/**
 * Minimum FDV in USD
 */
export const MIN_FDV_USD = 49
export const DEFAULT_FDV_USD = 10000
