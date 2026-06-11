import { CandidateList } from '@buildeross/candidate-ui'
import { type CandidateGroupsResponse, getCandidateGroups } from '@buildeross/sdk'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { Button, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'
import useSWR from 'swr'

import { activitySection } from '../../styles/Section.css'

export interface CandidatesProps {
  onOpenCandidateCreate: () => void
  onSelectCandidate: (candidateId: string) => void
}

export const Candidates: React.FC<CandidatesProps> = ({
  onOpenCandidateCreate,
  onSelectCandidate,
}) => {
  const chain = useChainStore((x) => x.chain)
  const addresses = useDaoStore((state) => state.addresses)

  const { data, error, isLoading } = useSWR<CandidateGroupsResponse>(
    addresses.token ? ['candidates', chain.id, addresses.token] : null,
    () => getCandidateGroups(chain.id, addresses.token!),
    {
      revalidateOnMount: true,
    }
  )

  if (error) {
    return (
      <Flex direction={'column'} className={activitySection} mx={'auto'}>
        <Flex width={'100%'} justify={'center'} align={'center'} py={'x8'}>
          <Text color="negative">Failed to load candidates. Please try again.</Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex direction={'column'} className={activitySection} mx={'auto'}>
      <Flex width={'100%'} justify={'space-between'} align={'center'}>
        <Text variant="heading-sm" style={{ fontWeight: 800 }}>
          Proposal Candidates
        </Text>

        <Button onClick={onOpenCandidateCreate}>Create Candidate</Button>
      </Flex>

      {isLoading && !data && (
        <Flex width={'100%'} justify={'center'} align={'center'} py={'x8'}>
          <Text color="text3">Loading candidates...</Text>
        </Flex>
      )}

      {data && data.candidateGroups.length === 0 && (
        <Stack align="center" gap="x4" py="x16">
          <Text color="text3" textAlign="center">
            No candidates yet
          </Text>
          <Text
            color="text4"
            fontSize={14}
            textAlign="center"
            style={{ maxWidth: '400px' }}
          >
            Candidates are proposal drafts that can gather community feedback and
            signatures before being submitted on-chain.
          </Text>
          <Button onClick={onOpenCandidateCreate} mt="x4">
            Create First Candidate
          </Button>
        </Stack>
      )}

      {data && data.candidateGroups.length > 0 && (
        <Stack gap="x4" mt="x6">
          <Text color="text3" fontSize={14}>
            {data.candidateGroups.length} candidate
            {data.candidateGroups.length !== 1 ? 's' : ''} found
          </Text>
          <CandidateList
            candidates={data.candidateGroups}
            onSelectCandidate={onSelectCandidate}
          />
        </Stack>
      )}
    </Flex>
  )
}
