import { Proposal } from '@buildeross/sdk/subgraph'
import { Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

export interface UpdatingProposalBannerProps {
  updateProposalId: string
  updatingProposal?: Proposal
  onCreateNew?: () => void
}

export const UpdatingProposalBanner: React.FC<UpdatingProposalBannerProps> = ({
  updateProposalId,
  updatingProposal,
  onCreateNew,
}) => {
  return (
    <Flex
      align="center"
      gap="x3"
      p="x4"
      mb="x4"
      borderRadius="curved"
      borderWidth="thin"
      style={{
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
      }}
    >
      <Icon id="refresh" size="md" style={{ color: '#F59E0B' }} />
      <Stack gap="x1">
        <Text fontWeight="label" style={{ color: '#92400E' }}>
          Updating Proposal{' '}
          {updatingProposal?.proposalNumber
            ? `#${updatingProposal.proposalNumber}`
            : updateProposalId?.slice(0, 10)}
          ...
        </Text>
        <Text variant="paragraph-sm" style={{ color: '#92400E' }}>
          You're creating an updated version of this proposal. Changes will replace the
          original during the updatable period.
        </Text>
      </Stack>
      {onCreateNew && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onCreateNew}
          style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
        >
          Create new proposal
        </Button>
      )}
    </Flex>
  )
}
