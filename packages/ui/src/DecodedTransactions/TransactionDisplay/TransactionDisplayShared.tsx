import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { CHAIN_ID, SimulationOutput } from '@buildeross/types'
import { walletSnippet } from '@buildeross/utils/helpers'
import { atoms, Box, Button, Flex, Icon, Spinner, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'

const transactionPanelClassName = atoms({
  borderColor: 'border',
  borderStyle: 'solid',
  borderWidth: 'normal',
  borderRadius: 'curved',
  backgroundColor: 'background1',
})

const CallValue: React.FC<{ value: string }> = ({ value }) => {
  if (value === '0') return null

  return (
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
        {`${formatEther(BigInt(value))} ETH }`}
      </Text>
    </Flex>
  )
}

export const TransactionDisplayShell: React.FC<{
  chainId: CHAIN_ID
  target: `0x${string}`
  index: number
  children: React.ReactNode
}> = ({ chainId, target, index, children }) => {
  return (
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
        {children}
      </Stack>
    </Flex>
  )
}

export const RawCalldataDisplay: React.FC<{
  calldata: string
  value: string
}> = ({ calldata, value }) => {
  return (
    <TransactionPanel>
      <Flex align="center" gap="x1" wrap="wrap">
        <Text fontWeight="heading" color="text3">
          Raw calldata
        </Text>
        <CallValue value={value} />
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
    </TransactionPanel>
  )
}

export const SimulationWarning: React.FC<{
  simulation?: SimulationOutput
}> = ({ simulation }) => {
  if (!simulation || simulation.status !== false) return null

  return (
    <Flex color="warning" px="x3" pb="x2" gap="x2" wrap="wrap" align="center" w="100%">
      <Text fontWeight="label">Simulation indicates this call may fail.</Text>
      {!!simulation.url && (
        <Text flexShrink={0}>
          <a href={simulation.url} target="_blank" rel="noreferrer">
            View simulation details
          </a>
        </Text>
      )}
    </Flex>
  )
}

export const CallValueInline: React.FC<{ value: string }> = ({ value }) => {
  return <CallValue value={value} />
}

export const TransactionPanel: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <Stack mt="x1" gap="x1" p="x2" w="100%" className={transactionPanelClassName}>
      {children}
    </Stack>
  )
}

export const DisplayModeToggle: React.FC<{
  mode: 'toggle' | 'decoding' | 'rawOnly'
  showRawCalldata?: boolean
  onToggle?: () => void
}> = ({ mode, showRawCalldata = false, onToggle }) => {
  const isToggle = mode === 'toggle'
  const isDecoding = mode === 'decoding'

  return (
    <Flex justify="flex-end" position="absolute" right="x1" top="x1">
      <Button
        type="button"
        variant="secondary"
        size="xs"
        px="x2"
        onClick={isToggle ? onToggle : undefined}
        disabled={!isToggle}
        aria-pressed={isToggle ? showRawCalldata : undefined}
        title={
          isToggle
            ? showRawCalldata
              ? 'Switch to decoded view'
              : 'Switch to raw calldata view'
            : isDecoding
              ? 'Decoding calldata'
              : 'Raw only'
        }
        aria-label={
          isToggle
            ? showRawCalldata
              ? 'Switch to decoded view'
              : 'Switch to raw calldata view'
            : isDecoding
              ? 'Decoding calldata'
              : 'Raw only'
        }
      >
        <Flex align="center" gap="x1">
          {isToggle && <Icon id="swap" style={{ width: 20, height: 20 }} mb="x1" />}
          {isDecoding && <Spinner size="sm" />}
          <Text as="span" fontSize="14">
            {isToggle
              ? showRawCalldata
                ? 'Decoded'
                : 'Raw'
              : isDecoding
                ? 'Decoding...'
                : 'Raw only'}
          </Text>
        </Flex>
      </Button>
    </Flex>
  )
}

export const DecodedCallDisplay: React.FC<{
  functionName: string
  value: string
  sortedArgs: string[]
  isSendWithValue: boolean
  renderArg: (argKey: string, index: number) => React.ReactNode
}> = ({ functionName, value, sortedArgs, isSendWithValue, renderArg }) => {
  return (
    <TransactionPanel>
      <Flex align="center" gap="x1" wrap="wrap">
        <Text fontWeight="heading" color="text1">
          {`.${functionName}`}
        </Text>
        <Flex align="center" gap="x0">
          <CallValueInline value={value} />
          {sortedArgs.length === 0 || isSendWithValue ? `()` : null}
        </Flex>
      </Flex>

      {!isSendWithValue && (
        <>
          {sortedArgs.length > 0 ? `(` : null}

          <Stack pl={'x4'} gap={'x1'}>
            {sortedArgs.map((argKey, index) => renderArg(argKey, index))}
          </Stack>

          {sortedArgs.length > 0 ? `)` : null}
        </>
      )}
    </TransactionPanel>
  )
}
