import { TokenMetadata } from '@buildeross/hooks/useTokenMetadata'
import { DecodedArg } from '@buildeross/types'
import { formatCryptoVal } from '@buildeross/utils'
import {
  formatStreamDuration,
  type StreamConfig,
} from '@buildeross/utils/sablier/streams'
import { Flex, Stack, Text } from '@buildeross/zord'
import { useCallback } from 'react'
import { formatUnits } from 'viem'

import { BaseArgumentDisplay } from './BaseArgumentDisplay'

export interface DecodedStreamBatch {
  lockupAddress: string
  tokenAddress: string
  streams: StreamConfig[]
  isDurationsMode: boolean
}

interface StreamArgumentDisplayProps {
  arg: DecodedArg
  tokenMetadata?: TokenMetadata | null
  streamData?: DecodedStreamBatch | null // For potential future use
}

export const StreamArgumentDisplay: React.FC<StreamArgumentDisplayProps> = ({
  arg,
  tokenMetadata,
}) => {
  const formatAmount = useCallback(
    (amount: bigint) => {
      if (!tokenMetadata) return amount.toString()
      return `${formatCryptoVal(formatUnits(amount, tokenMetadata.decimals))} ${tokenMetadata.symbol}`
    },
    [tokenMetadata]
  )

  // Handle lockup contract address
  if (arg.name === 'lockup' || arg.name === '_lockup') {
    return <BaseArgumentDisplay name={arg.name} value={arg.value} />
  }

  // Handle token contract address
  if (arg.name === 'token' || arg.name === '_token') {
    return <BaseArgumentDisplay name={arg.name} value={arg.value} />
  }

  // Handle batch array of streams
  if (arg.name === 'batch' || arg.name === '_batch') {
    if (!Array.isArray(arg.value)) {
      return <BaseArgumentDisplay name={arg.name} value={arg.value} />
    }

    const streams = arg.value

    return (
      <>
        <Flex wrap="wrap" align="flex-start">
          <Text pr="x1" style={{ flexShrink: 0 }}>
            {arg.name}:
          </Text>
          <Text>[</Text>
        </Flex>
        <Stack pl="x4" gap="x3">
          {streams.map((stream: any, index: number) => (
            <Stack key={`stream-${index}`} gap="x1">
              <Text fontWeight="heading">Stream #{index + 1}</Text>
              <Stack pl="x2" gap="x1">
                {stream.recipient && <Flex>recipient: {stream.recipient}</Flex>}
                {stream.sender && <Flex>sender: {stream.sender}</Flex>}

                {stream.depositAmount && (
                  <Flex align="center" gap="x1">
                    <Text>depositAmount:</Text>
                    {tokenMetadata?.logo && (
                      <img
                        src={tokenMetadata.logo}
                        alt={tokenMetadata.symbol}
                        loading="lazy"
                        decoding="async"
                        width="16px"
                        height="16px"
                        style={{
                          maxWidth: '16px',
                          maxHeight: '16px',
                          objectFit: 'contain',
                        }}
                      />
                    )}
                    <Text>{formatAmount(BigInt(stream.depositAmount))}</Text>
                  </Flex>
                )}

                {stream.durations && (
                  <>
                    <Flex>duration: {formatStreamDuration(stream.durations.total)}</Flex>
                    {stream.durations.cliff > 0 && (
                      <Flex>cliff: {formatStreamDuration(stream.durations.cliff)}</Flex>
                    )}
                  </>
                )}

                {stream.timestamps && (
                  <>
                    <Flex>
                      start: {new Date(stream.timestamps.start * 1000).toLocaleString()}
                    </Flex>
                    <Flex>
                      end: {new Date(stream.timestamps.end * 1000).toLocaleString()}
                    </Flex>
                  </>
                )}

                {stream.cliffTime !== undefined && stream.cliffTime > 0 && (
                  <Flex>cliff: {new Date(stream.cliffTime * 1000).toLocaleString()}</Flex>
                )}

                {stream.cancelable !== undefined && (
                  <Flex>cancelable: {stream.cancelable ? 'true' : 'false'}</Flex>
                )}
                {stream.transferable !== undefined && (
                  <Flex>transferable: {stream.transferable ? 'true' : 'false'}</Flex>
                )}
                {stream.shape !== undefined && <Flex>shape: {stream.shape}</Flex>}
              </Stack>
            </Stack>
          ))}
        </Stack>
        <Text>]</Text>
      </>
    )
  }

  // Fallback
  return <BaseArgumentDisplay name={arg.name} value={arg.value} />
}
