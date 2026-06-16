import { CandidateList } from '@buildeross/candidate-ui'
import { type CandidateGroupsResponse, getCandidateGroups } from '@buildeross/sdk'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { Box, Button, Flex, Text } from '@buildeross/zord'
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
        <Flex width={'100%'} justify={'space-between'} align={'center'}>
          <Text variant="heading-sm" style={{ fontWeight: 800 }}>
            Proposal Candidates
          </Text>
        </Flex>
        <Flex
          width={'100%'}
          mt={'x4'}
          p={'x4'}
          justify={'center'}
          borderColor={'border'}
          borderStyle={'solid'}
          borderRadius={'curved'}
          borderWidth={'normal'}
        >
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
        <Flex
          width={'100%'}
          mt={'x4'}
          p={'x4'}
          justify={'center'}
          borderColor={'border'}
          borderStyle={'solid'}
          borderRadius={'curved'}
          borderWidth={'normal'}
        >
          <Text color="text3">Loading candidates...</Text>
        </Flex>
      )}

      {data && data.candidateGroups.length === 0 && (
        <Flex
          direction={'column'}
          width={'100%'}
          mt={'x4'}
          p={'x6'}
          align={'center'}
          borderColor={'border'}
          borderStyle={'solid'}
          borderRadius={'curved'}
          borderWidth={'normal'}
        >
          <Text color="text3" textAlign="center">
            No candidates yet.
          </Text>
          <Text
            color="text4"
            fontSize={14}
            textAlign="center"
            mt="x2"
            style={{ maxWidth: '400px' }}
          >
            Candidates are proposal drafts that can gather community feedback and
            signatures before being submitted on-chain.
          </Text>
          <Button onClick={onOpenCandidateCreate} mt="x4">
            Create First Candidate
          </Button>
        </Flex>
      )}

      {data && data.candidateGroups.length > 0 && (
        <Box mt="x6">
          <Text color="text3" fontSize={14} mb="x4">
            {data.candidateGroups.length} candidate
            {data.candidateGroups.length !== 1 ? 's' : ''} found
          </Text>
          <CandidateList
            candidates={data.candidateGroups}
            onSelectCandidate={onSelectCandidate}
          />
        </Box>
      )}
    </Flex>
  )
}
