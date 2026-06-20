import type {
  ProposalDescriptionMetadataV1,
  ProposalTransactionBundle,
} from '@buildeross/types'

export const generateProposalSalt = () => {
  const bytes = new Uint8Array(32)
  globalThis.crypto.getRandomValues(bytes)
  return `0x${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`
}

type BuildProposalMetadataParams = {
  title?: string
  description?: string
  transactionBundles?: ProposalTransactionBundle[]
  representedAddress?: string
  discussionUrl?: string
  proposalSalt?: string
  proposer?: `0x${string}`
}

export const buildProposalMetadata = ({
  title,
  description,
  transactionBundles,
  representedAddress,
  discussionUrl,
  proposalSalt,
  proposer,
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
    ...(proposalSalt?.trim() && proposer
      ? {
          proposal: {
            salt: proposalSalt.trim(),
            proposer,
          },
        }
      : {}),
  } satisfies ProposalDescriptionMetadataV1)
