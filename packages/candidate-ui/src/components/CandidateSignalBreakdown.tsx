import { Box, Flex, Text, theme } from '@buildeross/zord'
import React from 'react'

export interface CandidateSignalBreakdownProps {
  forVotes: bigint
  againstVotes: bigint
  abstainVotes: bigint
}

export const CandidateSignalBreakdown: React.FC<CandidateSignalBreakdownProps> = ({
  forVotes,
  againstVotes,
  abstainVotes,
}) => {
  const voteTally = [
    { label: 'For', value: Number(forVotes.toString()), color: theme.colors.positive },
    {
      label: 'Against',
      value: Number(againstVotes.toString()),
      color: theme.colors.negative,
    },
    {
      label: 'Abstain',
      value: Number(abstainVotes.toString()),
      color: theme.colors.text4,
    },
  ]

  const totalSignalWeight = voteTally.reduce((sum, vote) => sum + vote.value, 0)

  return (
    <Box
      p={{ '@initial': 'x4', '@768': 'x6' }}
      mb={{ '@initial': 'x4', '@768': 'x5' }}
      borderWidth="normal"
      borderColor="border"
      borderStyle="solid"
      borderRadius="curved"
      style={{ background: theme.colors.background1 }}
    >
      <Flex justify="space-between" align="center" gap="x3" mb="x3" wrap>
        <Text fontSize={16} fontWeight="display">
          Signal breakdown
        </Text>
        <Text color="text3" fontSize={14}>
          {totalSignalWeight > 0
            ? `${totalSignalWeight} total signal weight`
            : 'No signals yet'}
        </Text>
      </Flex>

      <Box
        style={{
          display: 'flex',
          width: '100%',
          height: 16,
          overflow: 'hidden',
          borderRadius: 999,
          border: `1px solid ${theme.colors.border}`,
          background: theme.colors.background2,
        }}
      >
        {totalSignalWeight > 0 ? (
          voteTally.map((vote) => {
            if (vote.value === 0) return null

            return (
              <Box
                key={vote.label}
                style={{
                  flex: `${vote.value} 1 0%`,
                  background: vote.color,
                }}
              />
            )
          })
        ) : (
          <Box style={{ width: '100%', background: 'transparent' }} />
        )}
      </Box>

      <Flex
        direction={{ '@initial': 'column', '@768': 'row' }}
        gap={{ '@initial': 'x2', '@768': 'x4' }}
        wrap
        mt="x3"
      >
        {voteTally.map((vote) => (
          <Flex key={vote.label} align="center" gap="x2">
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: vote.color,
                flexShrink: 0,
              }}
            />
            <Text color="text3" fontSize={14}>
              {vote.label}: {vote.value}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}
