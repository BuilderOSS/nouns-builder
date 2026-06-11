import { AddressType } from '@buildeross/types'

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
    warnings.push(`DAO name changed: "${source.name}" � "${target.name}"`)
  }

  if (source.symbol !== target.symbol) {
    warnings.push(`Symbol changed: "${source.symbol}" � "${target.symbol}"`)
  }

  // These can differ but note the changes
  if (source.reservePrice !== target.reservePrice) {
    warnings.push(
      `Reserve price changed: ${source.reservePrice} � ${target.reservePrice}`
    )
  }

  if (source.duration !== target.duration) {
    warnings.push(`Auction duration changed: ${source.duration} � ${target.duration}`)
  }

  if (source.proposalThresholdBps !== target.proposalThresholdBps) {
    warnings.push(
      `Proposal threshold changed: ${source.proposalThresholdBps} � ${target.proposalThresholdBps}`
    )
  }

  if (source.quorumThresholdBps !== target.quorumThresholdBps) {
    warnings.push(
      `Quorum threshold changed: ${source.quorumThresholdBps} � ${target.quorumThresholdBps}`
    )
  }

  if (source.votingDelay !== target.votingDelay) {
    warnings.push(`Voting delay changed: ${source.votingDelay} � ${target.votingDelay}`)
  }

  if (source.votingPeriod !== target.votingPeriod) {
    warnings.push(
      `Voting period changed: ${source.votingPeriod} � ${target.votingPeriod}`
    )
  }

  // Founder comparison
  if (source.founders && target.founders) {
    if (source.founders.length !== target.founders.length) {
      warnings.push(
        `Number of founders changed: ${source.founders.length} � ${target.founders.length}`
      )
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
