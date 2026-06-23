import { CandidateGroupSummary } from '@buildeross/sdk'
import { Box, Flex, Label, Paragraph, Stack, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import React from 'react'

import { candidateCard, statusStyle, titleStyle } from './CandidateList.css'
import { CandidateState, CandidateStatus } from './CandidateStatus'

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
      {candidates.map((candidate) => {
        const candidateState = candidate.versions?.[0]?.proposal?.id
          ? CandidateState.Promoted
          : CandidateState.Draft

        return (
          <Flex
            key={candidate.id}
            onClick={() => onSelectCandidate?.(candidate.candidateNumber.toString())}
            direction="column"
            borderStyle={'solid'}
            borderRadius={'curved'}
            borderWidth={'normal'}
            p={{ '@initial': 'x4', '@768': 'x6' }}
            my={'x2'}
            className={candidateCard}
            style={{ cursor: onSelectCandidate ? 'pointer' : 'default' }}
          >
            <Flex
              direction={{ '@initial': 'column', '@768': 'row' }}
              wrap="nowrap"
              gap="x1"
              w="100%"
            >
              <Box display={{ '@initial': 'none', '@768': 'flex' }} w={'x8'} mr={'x2'}>
                <Label size="lg" color={'text4'}>
                  {candidate.candidateNumber}
                </Label>
              </Box>
              <Box
                mr="auto"
                mt={{ '@initial': 'x2', '@768': 'x0' }}
                className={titleStyle}
                style={{ order: 2 }}
              >
                <Label size="lg">
                  {candidate.versions?.[0]?.title ||
                    `Candidate ${candidate.id.slice(0, 8)}...`}
                </Label>
                <Paragraph color="tertiary" mt={'x1'}>
                  {dayjs(dayjs.unix(candidate.createdAt)).format('MMM DD, YYYY')}
                </Paragraph>
              </Box>

              <Flex className={statusStyle} align={'center'} style={{ flexShrink: 0 }}>
                <CandidateStatus state={candidateState} />
              </Flex>
              <Flex
                display={{ '@initial': 'flex', '@768': 'none' }}
                justify={'flex-end'}
                h={'x0'}
              >
                <Label size="lg" color={'text4'}>
                  {candidate.candidateNumber}
                </Label>
              </Flex>
            </Flex>
          </Flex>
        )
      })}
    </Stack>
  )
}
