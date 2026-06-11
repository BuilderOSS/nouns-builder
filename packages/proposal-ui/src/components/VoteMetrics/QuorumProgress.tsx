import { Flex, Text, vars } from '@buildeross/zord'
import React from 'react'

export type QuorumProgressProps = {
  forVotes: number
  quorumVotes: number
}

const SVG_WIDTH = 500

export const QuorumProgress: React.FC<QuorumProgressProps> = ({
  forVotes,
  quorumVotes,
}) => {
  const met = forVotes >= quorumVotes
  const remaining = Math.max(quorumVotes - forVotes, 0)
  const scaleMax = Math.max(forVotes, quorumVotes)
  const fillWidth = scaleMax > 0 ? (forVotes / scaleMax) * SVG_WIDTH : 0
  const markerX = scaleMax > 0 ? (quorumVotes / scaleMax) * SVG_WIDTH : 0

  const status = met
    ? 'Quorum reached'
    : `${remaining} more FOR ${remaining === 1 ? 'vote' : 'votes'} needed`

  const footer =
    quorumVotes > 0
      ? `${forVotes} of ${quorumVotes} FOR ${quorumVotes === 1 ? 'vote' : 'votes'}`
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
      <svg
        width="100%"
        height="24"
        viewBox="0 0 500 24"
        preserveAspectRatio="none"
        role="img"
        aria-label={footer}
      >
        <rect x={0} y={8} width={SVG_WIDTH} height={8} rx={4} fill={vars.color.border} />
        <rect
          x={0}
          y={8}
          width={fillWidth}
          height={8}
          rx={4}
          fill={vars.color.positive}
        />
        {quorumVotes > 0 && (
          <rect
            data-testid="quorum-marker"
            x={markerX - 1.5}
            y={0}
            width={3}
            height={24}
            fill={vars.color.text1}
          />
        )}
      </svg>
      <Text color="text3" mt="x2">
        {footer}
      </Text>
    </Flex>
  )
}
