import { TransactionTypeIcon } from '@buildeross/proposal-ui'
import { type CandidateVersion } from '@buildeross/sdk'
import {
  type CHAIN_ID,
  type DaoContractAddresses,
  type ProposalDescriptionMetadataV1,
} from '@buildeross/types'
import { TransactionType } from '@buildeross/types'
import { DecodedTransactions } from '@buildeross/ui/DecodedTransactions'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

type DecodedTransactionsProp = React.ComponentProps<
  typeof DecodedTransactions
>['decodedTransactions']

interface CandidateDetailsSectionProps {
  description: string
  discussionUrl?: string | null
  decodedTransactions?: DecodedTransactionsProp
  isDecodingTransactions?: boolean
  proposalMetadata?: ProposalDescriptionMetadataV1
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  versions?: CandidateVersion[]
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box mb={{ '@initial': 'x6', '@768': 'x13' }}>
    <Box fontSize={20} mb={{ '@initial': 'x4', '@768': 'x5' }} fontWeight="display">
      {title}
    </Box>
    {children}
  </Box>
)

export const CandidateDetailsSection: React.FC<CandidateDetailsSectionProps> = ({
  description,
  discussionUrl,
  decodedTransactions,
  isDecodingTransactions,
  proposalMetadata,
  chainId,
  addresses,
  versions,
}) => {
  return (
    <Stack gap="x6">
      <Section title="Description">
        <Box>
          <MarkdownDisplay>{description}</MarkdownDisplay>
        </Box>
      </Section>

      {discussionUrl && (
        <Section title="Discussion">
          <a href={discussionUrl} rel="noreferrer" target="_blank">
            {discussionUrl}
          </a>
        </Section>
      )}

      <Section title="Proposed Transactions">
        {decodedTransactions?.length ? (
          <DecodedTransactions
            chainId={chainId}
            addresses={addresses}
            decodedTransactions={decodedTransactions}
            proposalMetadata={proposalMetadata}
            isDecoding={isDecodingTransactions}
          />
        ) : (
          <Text color="text3">No transactions in this candidate.</Text>
        )}
      </Section>

      {versions && versions.length > 0 && (
        <Section title={`Edit History (${versions.length})`}>
          <Stack gap="x4">
            {versions.map((version) => (
              <Stack
                key={version.id}
                p="x3"
                gap="x3"
                borderColor="border"
                borderStyle="solid"
                borderWidth="normal"
                borderRadius="curved"
              >
                <Flex align="center" gap="x2">
                  <TransactionTypeIcon transactionType={TransactionType.CUSTOM} />
                  <Stack gap="x1">
                    <Text fontWeight="heading">
                      Version {version.versionNumber.toString()}
                    </Text>
                    <Text color="text3">
                      {version.signatureCount.toString()} signatures
                    </Text>
                  </Stack>
                </Flex>
                {version.title && <Text>{version.title}</Text>}
              </Stack>
            ))}
          </Stack>
        </Section>
      )}
    </Stack>
  )
}
