import { AddressType } from '@buildeross/types'
import { isAddress } from 'viem'

export interface DaoMemberSimplified {
  ownerAlias: AddressType
  owner: AddressType
  tokens: number[]
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    reserved: number
    allocated: number
    remaining: number
    exceeds: number
  }
}

export function validateMemberAllocation(
  memberSnapshot: DaoMemberSimplified[],
  reservedUntilTokenId: bigint
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const reserved = Number(reservedUntilTokenId)

  // Collect all token IDs and validate
  const allTokenIds: number[] = []
  const addressSet = new Set<string>()

  for (const member of memberSnapshot) {
    // Validate address
    if (!isAddress(member.owner)) {
      errors.push(`Invalid address: ${member.owner}`)
      continue
    }

    // Check for duplicate addresses
    const lowerAddr = member.owner.toLowerCase()
    if (addressSet.has(lowerAddr)) {
      errors.push(`Duplicate address: ${member.owner}`)
    }
    addressSet.add(lowerAddr)

    // Validate token IDs
    for (const tokenId of member.tokens) {
      // Check if token ID is within reserved range
      if (tokenId >= reserved) {
        errors.push(
          `Token ID ${tokenId} exceeds reserved range (0-${reserved - 1}) for address ${member.owner}`
        )
      }

      // Check for duplicate token IDs
      if (allTokenIds.includes(tokenId)) {
        errors.push(`Duplicate token ID ${tokenId} assigned to multiple addresses`)
      }

      allTokenIds.push(tokenId)
    }

    // Warn if member has no tokens
    if (member.tokens.length === 0) {
      warnings.push(`Address ${member.owner} has no tokens assigned`)
    }
  }

  const allocated = allTokenIds.length
  const remaining = Math.max(0, reserved - allocated)
  const exceeds = Math.max(0, allocated - reserved)

  // Check if allocation exceeds reserved
  if (allocated > reserved) {
    errors.push(
      `Total allocated tokens (${allocated}) exceeds reserved count (${reserved}). Remove ${exceeds} tokens to continue.`
    )
  }

  // Warn if under-allocated
  if (allocated < reserved && allocated > 0) {
    warnings.push(
      `${remaining} tokens not allocated (may include burnt tokens on source chain). These will remain reserved for future minting.`
    )
  }

  const stats = {
    reserved,
    allocated,
    remaining,
    exceeds,
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats,
  }
}

export function getUnallocatedTokenIds(
  memberSnapshot: DaoMemberSimplified[],
  reservedUntilTokenId: bigint
): number[] {
  const allocated = new Set<number>()

  for (const member of memberSnapshot) {
    for (const tokenId of member.tokens) {
      allocated.add(tokenId)
    }
  }

  const unallocated: number[] = []
  const reserved = Number(reservedUntilTokenId)

  for (let i = 0; i < reserved; i++) {
    if (!allocated.has(i)) {
      unallocated.push(i)
    }
  }

  return unallocated
}

export function autoAssignTokenIds(
  memberSnapshot: DaoMemberSimplified[],
  reservedUntilTokenId: bigint,
  count: number
): number[] {
  const unallocated = getUnallocatedTokenIds(memberSnapshot, reservedUntilTokenId)
  return unallocated.slice(0, count)
}
