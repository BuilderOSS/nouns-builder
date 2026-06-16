import { Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

export interface CandidateUpdatingBannerProps {
  candidateId: string
  versionNumber?: number
}

export const CandidateUpdatingBanner: React.FC<CandidateUpdatingBannerProps> = ({
  candidateId,
  versionNumber,
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
          Updating Candidate {candidateId.slice(0, 10)}...
          {versionNumber ? ` v${versionNumber}` : ''}
        </Text>
        <Text variant="paragraph-sm" style={{ color: '#92400E' }}>
          You&apos;re creating a new version of this candidate. Changes will replace the
          current version and reset all existing signatures.
        </Text>
      </Stack>
    </Flex>
  )
}
