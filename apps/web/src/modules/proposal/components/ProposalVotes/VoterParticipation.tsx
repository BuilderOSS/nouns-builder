import { Box, Text } from '@buildeross/zord'

import { VoterParticipationVariants } from './VoterParticipation.css'

export interface VoterParticipationProps {
  totalVotes: number
  maxVotes: number
}

const POSITIVE_VOTER_PARTICIPATION_RATE = 20

export const VoterParticipation: React.FC<VoterParticipationProps> = ({
  totalVotes,
  maxVotes,
}) => {
  const participation = (totalVotes / maxVotes) * 100

  return (
    <Box
      borderStyle="solid"
      borderColor="border"
      borderRadius="curved"
      w="100%"
      py="x4"
      px={{ '@initial': 'x4', '@768': 'x6' }}
    >
      <Text variant="heading-xs" fontWeight={'display'}>
        Voter participation
      </Text>
      {maxVotes ? (
        <Text
          variant="heading-md"
          fontWeight={'label'}
          className={
            VoterParticipationVariants[
              participation >= POSITIVE_VOTER_PARTICIPATION_RATE ? 'positive' : 'neutral'
            ]
          }
          mt="x4"
        >
          {maxVotes ? participation.toPrecision(3) : '--'}%
        </Text>
      ) : (
        <Text variant="heading-md" fontWeight={'label'} mt="x4">
          --%
        </Text>
      )}
      <Text color="text2">{`${totalVotes} out of ${maxVotes} possible votes`}</Text>
    </Box>
  )
}
