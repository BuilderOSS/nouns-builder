import type {
  ProposalDescriptionMetadataV1,
  ProposalTransactionBundle,
} from '@buildeross/types'

type BuildProposalMetadataParams = {
  title?: string
  description?: string
  transactionBundles?: ProposalTransactionBundle[]
  representedAddress?: string
  discussionUrl?: string
}

export const buildProposalMetadata = ({
  title,
  description,
  transactionBundles,
  representedAddress,
  discussionUrl,
}: BuildProposalMetadataParams): string =>
  JSON.stringify({
    version: 1,
    title: title?.trim() || '',
    description: description?.trim() || '',
    ...(transactionBundles ? { transactionBundles } : {}),
    ...(representedAddress?.trim()
      ? { representedAddress: representedAddress.trim() }
      : {}),
    ...(discussionUrl?.trim() ? { discussionUrl: discussionUrl.trim() } : {}),
  } satisfies ProposalDescriptionMetadataV1)
