import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { CHAIN_ID, SimulationOutput } from '@buildeross/types'
import { walletSnippet } from '@buildeross/utils/helpers'
import { atoms, Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'

export const NonDecodedDisplay: React.FC<{
  target: `0x${string}`
  simulation?: SimulationOutput
  chainId: CHAIN_ID
  calldata: string
  value: string
  index: number
}> = ({ target, chainId, calldata, value, simulation, index }) => {
  const isFailedSimulation = simulation && simulation.status === false
  return (
    <Stack style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} w="100%">
      <Flex direction="row" gap="x0" w="100%">
        <Text
          as="span"
          fontWeight="heading"
          py="x3"
          pl="x3"
          style={{ flexShrink: 0, minWidth: 24, maxWidth: 40 }}
        >
          {index + 1}.
        </Text>
        <Stack gap={'x1'} px={'x3'} py={'x3'} w="100%">
          <Box
            color={'secondary'}
            fontWeight={'heading'}
            className={atoms({ textDecoration: 'underline' })}
          >
            <a
              href={`${ETHERSCAN_BASE_URL[chainId]}/address/${target}`}
              target="_blank"
              rel="noreferrer"
            >
              <Text display={{ '@initial': 'flex', '@768': 'none' }}>
                {walletSnippet(target)}
              </Text>
              <Text display={{ '@initial': 'none', '@768': 'flex' }}>{target}</Text>
            </a>
          </Box>
          <Stack
            mt="x1"
            gap="x1"
            p="x2"
            w="100%"
            className={atoms({
              borderColor: 'border',
              borderStyle: 'solid',
              borderWidth: 'normal',
              borderRadius: 'curved',
              backgroundColor: 'background1',
            })}
          >
            <Flex align="center" gap="x1" wrap="wrap">
              <Text fontWeight="heading" color="text3">
                Raw calldata
              </Text>
              {value !== '0' && (
                <Flex align="center" gap="x1" flexShrink={0}>
                  <Text color="accent" as="span">{`{ value: `}</Text>
                  <img
                    src="/chains/ethereum.svg"
                    alt="ETH"
                    loading="lazy"
                    decoding="async"
                    width="16px"
                    height="16px"
                    style={{
                      maxWidth: '16px',
                      maxHeight: '16px',
                      objectFit: 'contain',
                      display: 'inline-block',
                    }}
                  />
                  <Text color="accent" as="span">
                    {formatEther(BigInt(value))} ETH{' }'}
                  </Text>
                </Flex>
              )}
            </Flex>
            <Text
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                overflowWrap: 'anywhere',
                fontFamily: 'monospace',
              }}
            >
              {calldata}
            </Text>
          </Stack>
        </Stack>
      </Flex>
      {isFailedSimulation && (
        <Flex
          color="warning"
          px="x3"
          pb="x2"
          gap="x2"
          wrap="wrap"
          align="center"
          w="100%"
        >
          <Text fontWeight="label">Simulation indicates this call may fail.</Text>
          {!!simulation.url && (
            <Text flexShrink={0}>
              <a href={simulation.url} target="_blank" rel="noreferrer">
                View simulation details
              </a>
            </Text>
          )}
        </Flex>
      )}
    </Stack>
  )
}
