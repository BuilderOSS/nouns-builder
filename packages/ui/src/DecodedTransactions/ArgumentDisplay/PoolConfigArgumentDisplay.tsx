import { DecodedArg } from '@buildeross/types'
import { decodePoolConfig } from '@buildeross/utils/coining'
import { Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { formatUnits } from 'viem'

import { BaseArgumentDisplay } from './BaseArgumentDisplay'

interface PoolConfigArgumentDisplayProps {
  arg: DecodedArg
}

export const PoolConfigArgumentDisplay: React.FC<PoolConfigArgumentDisplayProps> = ({
  arg,
}) => {
  const decodedConfig = React.useMemo(() => {
    if (!arg.value || typeof arg.value !== 'string' || !arg.value.startsWith('0x')) {
      return null
    }

    try {
      return decodePoolConfig(arg.value as `0x${string}`)
    } catch (e) {
      console.warn('Failed to decode pool config', e)
      return null
    }
  }, [arg.value])

  if (!decodedConfig) {
    return <BaseArgumentDisplay name={arg.name} value={arg.value} />
  }

  const {
    version,
    currency,
    tickLower,
    tickUpper,
    numDiscoveryPositions,
    maxDiscoverySupplyShare,
  } = decodedConfig

  return (
    <>
      <Flex wrap="wrap" align="flex-start">
        <Text pr="x1" style={{ flexShrink: 0 }}>
          {arg.name}:
        </Text>
        <Text>{'{'}</Text>
      </Flex>
      <Stack pl="x4" gap="x1">
        <BaseArgumentDisplay name="version" value={String(version)} />
        <BaseArgumentDisplay name="currency" value={currency} />

        {/* Display tickLower array */}
        <Flex wrap="wrap" align="flex-start">
          <Text pr="x1" style={{ flexShrink: 0 }}>
            tickLower:
          </Text>
          <Text>[{tickLower.join(', ')}]</Text>
        </Flex>

        {/* Display tickUpper array */}
        <Flex wrap="wrap" align="flex-start">
          <Text pr="x1" style={{ flexShrink: 0 }}>
            tickUpper:
          </Text>
          <Text>[{tickUpper.join(', ')}]</Text>
        </Flex>

        {/* Display numDiscoveryPositions array */}
        <Flex wrap="wrap" align="flex-start">
          <Text pr="x1" style={{ flexShrink: 0 }}>
            numDiscoveryPositions:
          </Text>
          <Text>[{numDiscoveryPositions.join(', ')}]</Text>
        </Flex>

        {/* Display maxDiscoverySupplyShare array with percentage formatting */}
        <Flex wrap="wrap" align="flex-start">
          <Text pr="x1" style={{ flexShrink: 0 }}>
            maxDiscoverySupplyShare:
          </Text>
          <Text>
            [
            {maxDiscoverySupplyShare
              .map((share, i) => {
                const percentage = formatUnits(share, 18)
                const percentageNum = (parseFloat(percentage) * 100).toFixed(2)
                return `${percentageNum}%${i < maxDiscoverySupplyShare.length - 1 ? ', ' : ''}`
              })
              .join('')}
            ]
          </Text>
        </Flex>
      </Stack>
      <Text>{'}'}</Text>
    </>
  )
}
