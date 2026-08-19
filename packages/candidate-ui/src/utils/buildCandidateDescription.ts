import type { ProposalTransactionBundle } from '@buildeross/types'
import { buildProposalMetadata } from '@buildeross/utils/proposalMetadata'

type BuildCandidateDescriptionParams = {
  title?: string
  summary?: string
  discussionUrl?: string
  transactionBundles?: ProposalTransactionBundle[]
  salt?: string
  proposer?: `0x${string}`
}

export const buildCandidateDescription = ({
  title,
  summary,
  discussionUrl,
  transactionBundles,
  salt,
  proposer,
}: BuildCandidateDescriptionParams): string =>
  JSON.stringify({
    ...JSON.parse(
      buildProposalMetadata({
        title,
        description: summary,
        discussionUrl,
        transactionBundles,
      })
    ),
    ...(salt && proposer
      ? {
          candidate: {
            salt,
            proposer,
          },
        }
      : {}),
  })
