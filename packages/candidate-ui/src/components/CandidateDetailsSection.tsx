import {
  BundledDecodedTransactions,
  ProposalMarkdown,
  ProposalSection,
} from '@buildeross/proposal-ui'
import { type CandidateVersion } from '@buildeross/sdk'
import {
  type CHAIN_ID,
  type DaoContractAddresses,
  type ProposalDescriptionMetadataV1,
} from '@buildeross/types'
import { Stack, Text } from '@buildeross/zord'
import React from 'react'

interface CandidateDetailsSectionProps {
  description: string
  discussionUrl?: string | null
  decodedTransactions?: React.ComponentProps<
    typeof BundledDecodedTransactions
  >['decodedTransactions']
  isDecodingTransactions?: boolean
  proposalMetadata?: ProposalDescriptionMetadataV1
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  versions?: CandidateVersion[]
}

export const CandidateDetailsSection: React.FC<CandidateDetailsSectionProps> = ({
  description,
  discussionUrl,
  decodedTransactions,
  isDecodingTransactions,
  proposalMetadata,
  chainId,
  addresses,
}) => {
  return (
    <Stack gap={{ '@initial': 'x4', '@768': 'x6' }}>
      <ProposalSection title="Description">
        <ProposalMarkdown>{description}</ProposalMarkdown>
      </ProposalSection>

      {discussionUrl && (
        <ProposalSection title="Discussion">
          <a href={discussionUrl} rel="noreferrer" target="_blank">
            {discussionUrl}
          </a>
        </ProposalSection>
      )}

      <ProposalSection title="Proposed Transactions">
        {decodedTransactions?.length ? (
          <BundledDecodedTransactions
            chainId={chainId}
            addresses={addresses}
            decodedTransactions={decodedTransactions}
            proposalMetadata={proposalMetadata}
            transactionBundles={proposalMetadata?.transactionBundles}
            isDecoding={isDecodingTransactions}
          />
        ) : (
          <Text color="text3">No transactions in this candidate.</Text>
        )}
      </ProposalSection>
    </Stack>
  )
}
