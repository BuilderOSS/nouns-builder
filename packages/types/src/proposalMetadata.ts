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
}

export type ProposalTransactionBundleContext = {
  bundleIndex: number
  bundleType: TransactionType
  bundleIntent?: string
  bundleTypeTitle?: string
  positionInBundle: number
  bundleCallCount: number
}
