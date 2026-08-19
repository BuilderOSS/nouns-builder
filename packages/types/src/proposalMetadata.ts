import { TransactionType } from './transaction'

export type ProposalTransactionBundle = {
  type: TransactionType
  summary?: string
  callCount: number
}

export type ProposalDescriptionMetadataV1 = {
  version: 1
  title: string
  description: string
  representedAddress?: string
  discussionUrl?: string
  transactionBundles?: ProposalTransactionBundle[]
  candidate?: {
    salt: string
    proposer: `0x${string}`
  }
  proposal?: {
    salt: string
    proposer: `0x${string}`
  }
}

export type ProposalTransactionBundleContext = {
  bundleIndex: number
  bundleType: TransactionType
  bundleIntent?: string
  bundleTypeTitle?: string
  positionInBundle: number
  bundleCallCount: number
}
