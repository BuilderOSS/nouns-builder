import type {
  AddressType,
  ProposalDescriptionMetadataV1,
  TransactionBundle,
} from '@buildeross/types'

import { TRANSACTION_TYPES } from '../constants/transactionTypes'

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export interface ParsedProposalData {
  title: string
  summary: string
  representedAddress?: string
  discussionUrl?: string
  transactions: TransactionBundle[]
}

/**
 * Parse a proposal's on-chain data back into the TransactionBundle format
 * that can be loaded into the proposal creation form.
 *
 * This is the reverse operation of what ReviewProposalForm does when creating
 * the description JSON and transaction arrays.
 */
export function parseProposalTransactions(
  description: string,
  targets: string[],
  values: string[],
  calldatas: string[]
): ParsedProposalData {
  let parsed: ProposalDescriptionMetadataV1

  try {
    parsed = JSON.parse(description) as ProposalDescriptionMetadataV1
  } catch (err) {
    // If description isn't valid JSON, return minimal data
    console.error('Failed to parse proposal description:', err)
    return {
      title: '',
      summary: description,
      transactions: [],
    }
  }

  const bundleMeta = parsed.transactionBundles || []

  let currentIndex = 0
  const bundles: TransactionBundle[] = []

  for (const meta of bundleMeta) {
    const bundleTransactions = []

    // Slice the transaction arrays for this bundle
    for (let i = 0; i < meta.callCount; i++) {
      const idx = currentIndex + i

      if (idx >= targets.length) {
        console.warn(`Transaction index ${idx} out of bounds (${targets.length} total)`)
        break
      }

      bundleTransactions.push({
        target: targets[idx] as AddressType,
        value: values[idx],
        calldata: calldatas[idx],
        functionSignature: '', // Can't reconstruct from calldata, leave empty
      })
    }

    // Generate title from type (capitalize & remove dashes)
    const title = toTitleCase(meta.type.replace(/-/g, ' '))

    // Use stored summary or fallback to type subtitle
    const typeSubtitle = TRANSACTION_TYPES[meta.type]?.subTitle
    const summary = meta.summary || typeSubtitle || title

    bundles.push({
      type: meta.type,
      title,
      summary,
      transactions: bundleTransactions,
    })

    currentIndex += meta.callCount
  }

  return {
    title: parsed.title || '',
    summary: parsed.description || '',
    representedAddress: parsed.representedAddress,
    discussionUrl: parsed.discussionUrl,
    transactions: bundles,
  }
}
