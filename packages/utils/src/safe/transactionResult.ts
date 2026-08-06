import type { Hex } from 'viem'

export type SafeTransactionResultKind = 'onchain' | 'safe-proposed'

// LRU cache for Safe proposal hashes to prevent unbounded memory growth
const MAX_SAFE_PROPOSAL_HASHES = 100
const safeProposalHashes: Hex[] = []

export function recordSafeProposalHash(hash: Hex): void {
  // Remove if already exists to move to end
  const existingIndex = safeProposalHashes.indexOf(hash)
  if (existingIndex !== -1) {
    safeProposalHashes.splice(existingIndex, 1)
  }

  // Add to end
  safeProposalHashes.push(hash)

  // Remove oldest if over limit
  if (safeProposalHashes.length > MAX_SAFE_PROPOSAL_HASHES) {
    safeProposalHashes.shift()
  }
}

export function isSafeProposalHash(hash: Hex): boolean {
  return safeProposalHashes.includes(hash)
}
