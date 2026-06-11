import { CandidateGroupSummary } from '@buildeross/sdk'
import { Stack, Text } from '@buildeross/zord'
import React from 'react'

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
        <div
          key={candidate.id}
          onClick={() => onSelectCandidate?.(candidate.id)}
          style={{ cursor: onSelectCandidate ? 'pointer' : 'default' }}
        >
          <Text fontWeight="label">Candidate {candidate.id.slice(0, 8)}...</Text>
          <Text color="text3" fontSize={14}>
            Versions: {candidate.versionCount.toString()} | Comments:{' '}
            {candidate.commentCount.toString()}
          </Text>
        </div>
      ))}
    </Stack>
  )
}
