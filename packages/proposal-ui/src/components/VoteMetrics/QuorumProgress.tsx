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
  const hasQuorum = quorumVotes > 0
  // Bar scales to the QUORUM, not max(for,quorum). Clamp to 100 so "exceeded" = full bar.
  const fillPct = hasQuorum ? Math.min((forVotes / quorumVotes) * 100, 100) : 100
  const pct = hasQuorum ? Math.round((forVotes / quorumVotes) * 100) : null
  // Marker only shown when there's a quorum to mark AND the bar isn't already full
  // (when met, fill end IS the threshold, so no separate marker needed).
  const showMarker = hasQuorum && !met
  const markerPct = 100 // threshold sits at the right end of the quorum-scaled track

  const footer = hasQuorum
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
      {/* ROW 1 — label + status chip */}
      <Flex justify="space-between" align="center" mb="x4">
        <Text fontSize={16} fontWeight="display">
          Quorum
        </Text>
        <Box
          px="x2"
          py="x1"
          borderRadius="curved"
          backgroundColor={met ? 'positiveDisabled' : 'background2'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          {met && (
            <Box
              as="span"
              aria-hidden
              borderRadius="round"
              backgroundColor="positive"
              style={{ width: 6, height: 6, flexShrink: 0 }}
            />
          )}
          <Text fontSize={12} fontWeight="display" color={met ? 'text1' : 'text2'}>
            {met ? 'Reached' : `${remaining} to go`}
          </Text>
        </Box>
      </Flex>

      {/* ROW 2 — HERO metric (text1, NEVER green) */}
      <Flex align="baseline" gap="x2" mb={hasQuorum ? 'x1' : 'x4'}>
        <Text fontWeight="display" color="text1" style={{ fontSize: 28, lineHeight: 1 }}>
          {forVotes}
        </Text>
        {hasQuorum && (
          <Text fontSize={16} color="text3">
            / {quorumVotes} needed
          </Text>
        )}
      </Flex>
      {hasQuorum && (
        <Text fontSize={14} color="text2" mb="x4">
          {pct}% of quorum
        </Text>
      )}

      {/* ROW 3 — bar: track + fill + (conditional) text2 marker */}
      <Box
        position="relative"
        w="100%"
        style={{ height: 12 }}
        borderRadius="round"
        backgroundColor="background2"
        role="img"
        aria-label={footer}
      >
        <Box
          h="100%"
          borderRadius="round"
          backgroundColor="positive"
          style={{ width: `${fillPct}%`, minWidth: forVotes > 0 ? 4 : 0 }}
        />
        {showMarker && (
          <Box
            data-testid="quorum-marker"
            position="absolute"
            backgroundColor="text2"
            style={{
              top: -3,
              height: 18,
              width: 2,
              left: `${markerPct}%`,
              transform: 'translateX(-50%)',
            }}
          />
        )}
      </Box>

      {/* ROW 4 — threshold label (makes the marker self-evident) */}
      {showMarker && (
        <Box position="relative" mt="x1" style={{ height: 16 }}>
          <Text
            position="absolute"
            fontSize={12}
            color="text3"
            style={{
              left: `${markerPct}%`,
              transform: 'translateX(-100%)',
              whiteSpace: 'nowrap',
            }}
          >
            Quorum {quorumVotes}
          </Text>
        </Box>
      )}
    </Flex>
  )
}
