import { CandidateGroupSummary } from '@buildeross/sdk'
import { Box, Flex, Label, Paragraph, Stack, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import React from 'react'

import { candidateCard, stats, title } from './CandidateList.css'

export interface CandidateListProps {
  candidates: CandidateGroupSummary[]
  onSelectCandidate?: (candidateId: string) => void
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  onSelectCandidate,
}) => {
  if (candidates.length === 0) {
    return (
      <Text color="text3" textAlign="center" py="x8">
        No candidates found
      </Text>
    )
  }

  return (
    <Stack gap="x4">
      {candidates.map((candidate) => (
        <Flex
          key={candidate.id}
          onClick={() => onSelectCandidate?.(candidate.id)}
          direction="column"
          borderStyle={'solid'}
          borderRadius={'curved'}
          borderWidth={'normal'}
          p={{ '@initial': 'x4', '@768': 'x6' }}
          my={'x2'}
          className={candidateCard}
          style={{ cursor: onSelectCandidate ? 'pointer' : 'default' }}
        >
          <Flex direction={{ '@initial': 'column', '@768': 'row' }} gap="x3" w="100%">
            <Box className={title}>
              <Label size="lg">
                {candidate.leadingVersion?.title ||
                  `Candidate ${candidate.id.slice(0, 8)}...`}
              </Label>
              <Paragraph color="tertiary" mt="x1">
                {dayjs(dayjs.unix(candidate.createdAt)).format('MMM DD, YYYY')}
              </Paragraph>
            </Box>

            <Flex
              className={stats}
              direction={{ '@initial': 'column', '@768': 'row' }}
              gap={{ '@initial': 'x1', '@768': 'x4' }}
              justify={{ '@initial': 'flex-start', '@768': 'flex-end' }}
              align={{ '@initial': 'flex-start', '@768': 'center' }}
            >
              <Text color="text3" fontSize={14}>
                V{candidate.latestVersionNumber.toString()} ·{' '}
                {candidate.versionCount.toString()} version
                {candidate.versionCount.toString() === '1' ? '' : 's'}
              </Text>
              <Text color="text3" fontSize={14}>
                {candidate.commentCount.toString()} comment
                {candidate.commentCount.toString() === '1' ? '' : 's'}
              </Text>
              <Text color="text3" fontSize={14}>
                {candidate.currentForCount.toString()} for ·{' '}
                {candidate.currentAgainstCount.toString()} against ·{' '}
                {candidate.currentAbstainCount.toString()} abstain
              </Text>
            </Flex>
          </Flex>
        </Flex>
      ))}
    </Stack>
  )
}
