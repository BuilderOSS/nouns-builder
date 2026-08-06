import { describe, expect, it } from 'vitest'

import { isSafeProposalHash, recordSafeProposalHash } from './transactionResult'

describe('Safe transaction result registry', () => {
  it('recognizes recorded Safe proposal hashes only', () => {
    const hash = `0x${'1'.repeat(64)}` as `0x${string}`

    expect(isSafeProposalHash(hash)).toBe(false)
    recordSafeProposalHash(hash)
    expect(isSafeProposalHash(hash)).toBe(true)
  })

  it('maintains LRU cache with max size', () => {
    // Clear any existing hashes by recording 101 new ones
    const hashes = Array.from(
      { length: 101 },
      (_, i) => `0x${i.toString(16).padStart(64, '0')}` as `0x${string}`
    )

    hashes.forEach(recordSafeProposalHash)

    // First hash should be evicted (LRU), last 100 should remain
    expect(isSafeProposalHash(hashes[0])).toBe(false)
    expect(isSafeProposalHash(hashes[1])).toBe(true)
    expect(isSafeProposalHash(hashes[100])).toBe(true)
  })

  it('moves hash to end when recorded again', () => {
    const hash1 = `0x${'1'.repeat(64)}` as `0x${string}`
    const hash2 = `0x${'2'.repeat(64)}` as `0x${string}`

    recordSafeProposalHash(hash1)
    recordSafeProposalHash(hash2)

    // Record hash1 again - should move to end
    recordSafeProposalHash(hash1)

    // Both should still be recognized
    expect(isSafeProposalHash(hash1)).toBe(true)
    expect(isSafeProposalHash(hash2)).toBe(true)
  })
})
