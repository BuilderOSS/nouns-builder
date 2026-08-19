import { AddressType, CHAIN_ID } from '@buildeross/types'
import { isTestnetChain } from '@buildeross/utils'

export interface MigrationConfig {
  name: string
  symbol: string
  reservedUntilTokenId: bigint
  currentTokenId: bigint
  founders?: {
    wallet: string
    ownershipPct: number
    vestExpiry: number
  }[]
  reservePrice: bigint
  duration: bigint
  proposalThresholdBps: bigint
  quorumThresholdBps: bigint
  votingDelay: bigint
  votingPeriod: bigint
  proposalUpdatablePeriod?: bigint
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate a migration configuration before deployment
 */
export const validateMigrationConfig = (config: MigrationConfig): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Basic validation
  if (!config.name || config.name.trim().length === 0) {
    errors.push('DAO name is required')
  }

  if (!config.symbol || config.symbol.trim().length === 0) {
    errors.push('Token symbol is required')
  }

  if (config.reservedUntilTokenId < 0n) {
    errors.push('Reserved tokens must be non-negative')
  }

  if (config.currentTokenId < 0n) {
    errors.push('Current token ID must be non-negative')
  }

  if (config.reservedUntilTokenId > config.currentTokenId) {
    warnings.push('Reserved token ID is higher than current token ID')
  }

  // Founder validation
  if (config.founders && config.founders.length > 0) {
    let totalOwnership = 0

    config.founders.forEach((founder, idx) => {
      if (
        !founder.wallet ||
        founder.wallet === '0x0000000000000000000000000000000000000000'
      ) {
        errors.push(`Founder ${idx + 1}: Invalid wallet address`)
      }

      if (founder.ownershipPct < 0 || founder.ownershipPct > 100) {
        errors.push(`Founder ${idx + 1}: Ownership must be between 0-100`)
      }

      totalOwnership += founder.ownershipPct

      if (founder.vestExpiry < 0) {
        errors.push(`Founder ${idx + 1}: Vest expiry must be non-negative`)
      }
    })

    if (totalOwnership > 100) {
      errors.push(`Total founder ownership (${totalOwnership}%) exceeds 100%`)
    }

    if (totalOwnership > 99) {
      warnings.push(
        'Total founder ownership is very high, leaving little for public minting'
      )
    }
  }

  // Auction validation
  if (config.reservePrice < 0n) {
    errors.push('Reserve price must be non-negative')
  }

  if (config.duration < 60n) {
    warnings.push('Auction duration is very short (less than 1 minute)')
  }

  if (config.duration > 86400n * 7n) {
    warnings.push('Auction duration is very long (more than 1 week)')
  }

  // Governance validation
  if (config.proposalThresholdBps < 0n || config.proposalThresholdBps > 10000n) {
    errors.push('Proposal threshold must be between 0-10000 basis points')
  }

  if (config.quorumThresholdBps < 0n || config.quorumThresholdBps > 10000n) {
    errors.push('Quorum threshold must be between 0-10000 basis points')
  }

  if (config.votingDelay < 0n) {
    errors.push('Voting delay must be non-negative')
  }

  if (config.votingPeriod < 3600n) {
    warnings.push('Voting period is very short (less than 1 hour)')
  }

  if (config.proposalThresholdBps > 1000n) {
    warnings.push('Proposal threshold is high (>10%), may limit proposal creation')
  }

  if (config.quorumThresholdBps < 500n) {
    warnings.push('Quorum threshold is low (<5%), proposals may pass too easily')
  }

  // Proposal updatable period validation (v3+ feature)
  if (config.proposalUpdatablePeriod !== undefined) {
    if (config.proposalUpdatablePeriod < 0n) {
      errors.push('Proposal updatable period must be non-negative')
    }

    if (config.proposalUpdatablePeriod > config.votingPeriod) {
      errors.push('Proposal updatable period must be less than or equal to voting period')
    }

    if (config.proposalUpdatablePeriod > 86400n * 7n) {
      warnings.push('Proposal updatable period is very long (more than 1 week)')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate deployed addresses
 */
export const validateDeployedAddresses = (addresses: {
  token?: AddressType
  metadata?: AddressType
  auction?: AddressType
  treasury?: AddressType
  governor?: AddressType
}): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  const zeroAddress = '0x0000000000000000000000000000000000000000'

  if (!addresses.token || addresses.token === zeroAddress) {
    errors.push('Token address is missing or invalid')
  }

  if (!addresses.metadata || addresses.metadata === zeroAddress) {
    errors.push('Metadata address is missing or invalid')
  }

  if (!addresses.auction || addresses.auction === zeroAddress) {
    errors.push('Auction address is missing or invalid')
  }

  if (!addresses.treasury || addresses.treasury === zeroAddress) {
    errors.push('Treasury address is missing or invalid')
  }

  if (!addresses.governor || addresses.governor === zeroAddress) {
    errors.push('Governor address is missing or invalid')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate that source and target chains are compatible
 * - Mainnet DAOs can migrate to any network (mainnet or testnet)
 * - Testnet DAOs can only migrate to other testnet chains
 */
export const validateChainMigration = (
  sourceChainId: CHAIN_ID,
  targetChainId: CHAIN_ID
): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  const sourceIsTestnet = isTestnetChain(sourceChainId)
  const targetIsTestnet = isTestnetChain(targetChainId)

  // Only restrict testnet sources - they can only migrate to testnets
  if (sourceIsTestnet && !targetIsTestnet) {
    errors.push(
      'Testnet DAOs can only migrate to other testnet chains. Please select a testnet target chain.'
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Compare source and target configs to ensure they match
 */
export const compareConfigs = (
  source: MigrationConfig,
  target: MigrationConfig
): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // These should match exactly
  if (source.name !== target.name) {
    warnings.push(`DAO name changed from "${source.name}" to "${target.name}"`)
  }

  if (source.symbol !== target.symbol) {
    warnings.push(`Symbol changed from "${source.symbol}" to "${target.symbol}"`)
  }

  // These can differ but note the changes
  if (source.reservePrice !== target.reservePrice) {
    warnings.push(
      `Reserve price changed from ${source.reservePrice} to ${target.reservePrice}`
    )
  }

  if (source.duration !== target.duration) {
    warnings.push(
      `Auction duration changed from ${source.duration} to ${target.duration}`
    )
  }

  if (source.proposalThresholdBps !== target.proposalThresholdBps) {
    warnings.push(
      `Proposal threshold changed from ${source.proposalThresholdBps} to ${target.proposalThresholdBps}`
    )
  }

  if (source.quorumThresholdBps !== target.quorumThresholdBps) {
    warnings.push(
      `Quorum threshold changed from ${source.quorumThresholdBps} to ${target.quorumThresholdBps}`
    )
  }

  if (source.votingDelay !== target.votingDelay) {
    warnings.push(
      `Voting delay changed from ${source.votingDelay} to ${target.votingDelay}`
    )
  }

  if (source.votingPeriod !== target.votingPeriod) {
    warnings.push(
      `Voting period changed from ${source.votingPeriod} to ${target.votingPeriod}`
    )
  }

  if (source.proposalUpdatablePeriod !== target.proposalUpdatablePeriod) {
    warnings.push(
      `Proposal updatable period changed from ${source.proposalUpdatablePeriod || 'none'} to ${target.proposalUpdatablePeriod || 'none'}`
    )
  }

  // Founder comparison
  if (source.founders && target.founders) {
    if (source.founders.length !== target.founders.length) {
      warnings.push(
        `Number of founders changed from ${source.founders.length} to ${target.founders.length}`
      )
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
