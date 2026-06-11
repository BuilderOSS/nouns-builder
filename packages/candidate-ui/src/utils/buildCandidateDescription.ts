import type { ProposalTransactionBundle } from '@buildeross/types'
import { buildProposalMetadata } from '@buildeross/utils/proposalMetadata'

type BuildCandidateDescriptionParams = {
  title?: string
  summary?: string
  discussionUrl?: string
  transactionBundles?: ProposalTransactionBundle[]
}

export const buildCandidateDescription = ({
  title,
  summary,
  discussionUrl,
  transactionBundles,
}: BuildCandidateDescriptionParams): string =>
  buildProposalMetadata({
    title,
    description: summary,
    discussionUrl,
    transactionBundles,
  })
