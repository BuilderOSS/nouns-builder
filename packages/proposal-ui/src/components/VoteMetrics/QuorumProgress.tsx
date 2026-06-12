import { Box, Flex, Text } from '@buildeross/zord'
import React from 'react'

export type QuorumProgressProps = {
  forVotes: number
  quorumVotes: number
}

export const QuorumProgress: React.FC<QuorumProgressProps> = ({
  forVotes,
  quorumVotes,
}) => {
  const met = forVotes >= quorumVotes
  const remaining = Math.max(quorumVotes - forVotes, 0)
  const scaleMax = Math.max(forVotes, quorumVotes)
  const fillPct = scaleMax > 0 ? (forVotes / scaleMax) * 100 : 0
  const markerPct = scaleMax > 0 ? (quorumVotes / scaleMax) * 100 : 0

  const status = met
    ? 'Quorum reached'
    : `${remaining} more For ${remaining === 1 ? 'vote' : 'votes'} needed`

  const footer =
    quorumVotes > 0
      ? `${forVotes} of ${quorumVotes} For ${quorumVotes === 1 ? 'vote' : 'votes'}`
      : 'No quorum required'

  return (
    <Flex
      direction="column"
      p={{ '@initial': 'x4', '@768': 'x6' }}
      borderWidth="normal"
      borderColor="border"
      borderStyle="solid"
      borderRadius="curved"
      w="100%"
      data-testid="quorum-progress"
    >
      <Flex justify="space-between" align="center" mb="x4">
        <Text fontSize={16} fontWeight="display">
          Quorum
        </Text>
        <Text color="tertiary">{status}</Text>
      </Flex>
      <Box
        position="relative"
        w="100%"
        style={{ height: 24 }}
        role="img"
        aria-label={footer}
      >
        <Box
          position="absolute"
          w="100%"
          h="x2"
          borderRadius="round"
          backgroundColor="border"
          style={{ top: 8 }}
        >
          <Box
            h="100%"
            borderRadius="round"
            backgroundColor="positive"
            style={{ width: `${fillPct}%` }}
          />
        </Box>
        {quorumVotes > 0 && (
          <Box
            data-testid="quorum-marker"
            position="absolute"
            backgroundColor="text1"
            style={{
              top: 0,
              left: `${markerPct}%`,
              width: 3,
              height: 24,
              transform: 'translateX(-50%)',
            }}
          />
        )}
      </Box>
      <Text color="text3" mt="x2">
        {footer}
      </Text>
    </Flex>
  )
}
