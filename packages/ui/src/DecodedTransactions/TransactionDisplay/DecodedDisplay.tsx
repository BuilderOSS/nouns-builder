import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useNftMetadata } from '@buildeross/hooks/useNftMetadata'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { useTransactionSummary } from '@buildeross/hooks/useTransactionSummary'
import {
  CHAIN_ID,
  DaoContractAddresses,
  DecodedTransactionData,
  ProposalDescriptionMetadataV1,
  ProposalTransactionBundleContext,
  SimulationOutput,
} from '@buildeross/types'
import {
  decodeEscrowData,
  decodeEscrowDataLegacy,
  getEscrowBundlerLegacy,
} from '@buildeross/utils/escrow'
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import {
  getSablierContracts,
  parseStreamDataConfigDurations,
  parseStreamDataConfigDurationsLD,
  parseStreamDataConfigTimestamps,
  parseStreamDataConfigTimestampsLD,
  type StreamConfig,
} from '@buildeross/utils/sablier'
import { atoms, Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'

import { ArgumentDisplay } from '../ArgumentDisplay'

const DISABLE_AI_SUMMARY = process.env.NEXT_PUBLIC_DISABLE_AI_SUMMARY === 'true'

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return JSON.stringify(error)
}

const getParserFromFunctionName = (
  functionName: string
): ((_data: any) => StreamConfig) | null => {
  if (functionName === 'createWithDurationsLL') return parseStreamDataConfigDurations
  if (functionName === 'createWithTimestampsLL') return parseStreamDataConfigTimestamps
  if (functionName === 'createWithDurationsLD') return parseStreamDataConfigDurationsLD
  if (functionName === 'createWithTimestampsLD') return parseStreamDataConfigTimestampsLD
  return null
}

export const DecodedDisplay: React.FC<{
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  proposalMetadata?: ProposalDescriptionMetadataV1
  bundleContext?: ProposalTransactionBundleContext
  simulation?: SimulationOutput
  transaction: DecodedTransactionData
  target: `0x${string}`
  value: string
  index: number
}> = ({
  chainId,
  addresses,
  proposalMetadata,
  bundleContext,
  simulation,
  transaction,
  target,
  value,
  index,
}) => {
  const [showRawCalldata, setShowRawCalldata] = React.useState(false)

  const sortedArgs = React.useMemo(() => {
    const keys = Object.keys(transaction.args)
    const inOrder = (transaction.argOrder as string[]).filter((k) => keys.includes(k))
    const rest = keys.filter((k) => !inOrder.includes(k)).sort()
    return [...inOrder, ...rest]
  }, [transaction.args, transaction.argOrder])

  // Prepare escrow data once
  const escrowData = React.useMemo(() => {
    const arg = transaction.args['_escrowData']
    const raw = arg?.value
    if (!raw || typeof raw !== 'string' || !raw.startsWith('0x')) return null

    // Store legacy bundler address first to check for null/undefined
    const legacy = getEscrowBundlerLegacy(chainId)

    // Safe comparison: only use legacy decoder if legacy is truthy and matches target
    const decoder =
      legacy && target.toLowerCase() === legacy.toLowerCase()
        ? decodeEscrowDataLegacy
        : decodeEscrowData

    try {
      return decoder(raw as `0x${string}`)
    } catch (e) {
      console.warn('Failed to decode escrow data', e)
      return null
    }
  }, [transaction.args, target, chainId])

  // Prepare stream data once
  const streamData = React.useMemo(() => {
    const sablierContracts = getSablierContracts(chainId)
    const isSablierTarget =
      (sablierContracts.batchLockup &&
        target.toLowerCase() === sablierContracts.batchLockup.toLowerCase()) ||
      (sablierContracts.lockup &&
        target.toLowerCase() === sablierContracts.lockup.toLowerCase())

    if (!isSablierTarget) return undefined

    // Check if this is a createWithDurationsLL or createWithTimestampsLL function
    if (
      transaction.functionName !== 'createWithDurationsLL' &&
      transaction.functionName !== 'createWithTimestampsLL' &&
      transaction.functionName !== 'createWithDurationsLD' &&
      transaction.functionName !== 'createWithTimestampsLD'
    ) {
      return undefined
    }

    if (!transaction.args) return undefined

    // Extract calldata - we need to reconstruct it from the transaction
    // The transaction already has decoded args, but we need the raw calldata
    // Since we don't have direct access to calldata here, we'll extract from args
    try {
      // Get lockup, token, and batch from args
      const lockupArg = transaction.args['lockup'] || transaction.args['_lockup']
      const tokenArg = transaction.args['token'] || transaction.args['_token']
      const batchArg = transaction.args['batch'] || transaction.args['_batch']

      if (!lockupArg || !tokenArg || !batchArg) return undefined

      const isDurationsMode =
        transaction.functionName === 'createWithDurationsLL' ||
        transaction.functionName === 'createWithDurationsLD'

      const parser = getParserFromFunctionName(transaction.functionName)

      if (!parser) return undefined

      const streams = (Array.isArray(batchArg.value) ? batchArg.value : []).map(parser)

      return {
        lockupAddress: lockupArg.value as `0x${string}`,
        tokenAddress: tokenArg.value as `0x${string}`,
        streams,
        isDurationsMode,
      }
    } catch (e) {
      console.warn('Failed to extract stream data', e)
      return undefined
    }
  }, [transaction.args, transaction.functionName, target, chainId])

  // Determine single token address for ERC20 operations
  const tokenAddress: `0x${string}` | undefined = React.useMemo(() => {
    // For ERC20 transfer/approve, use target
    if (
      transaction.functionName === 'transfer' ||
      transaction.functionName === 'approve' ||
      transaction.functionName === 'increaseAllowance' ||
      transaction.functionName === 'decreaseAllowance'
    ) {
      return target as `0x${string}`
    }

    // For stream operations, get token from stream data
    if (streamData?.tokenAddress) {
      return streamData.tokenAddress
    }

    // For escrow operations, get token from escrow data
    if (escrowData?.tokenAddress) {
      return escrowData.tokenAddress
    }
    return undefined
  }, [transaction.functionName, target, escrowData, streamData])

  // Determine single NFT contract and token ID
  // TODO: add erc1155 support later
  const nftInfo = React.useMemo(() => {
    if (transaction.functionName !== 'safeTransferFrom') return null

    for (const argKey of sortedArgs) {
      const arg = transaction.args[argKey]
      if (
        arg.name === 'tokenId' ||
        arg.name === 'id' ||
        arg.name === '_tokenId' ||
        arg.name === '_id'
      ) {
        return { contract: target, tokenId: arg.value as string }
      }
    }

    return null
  }, [transaction.args, transaction.functionName, target, sortedArgs])

  // Fetch token metadata only if we have a token address
  const { tokenMetadata, isLoading: isTokenLoading } = useTokenMetadataSingle(
    chainId,
    tokenAddress
  )

  // Fetch NFT metadata only if we have NFT info
  const { metadata: nftMetadata, isLoading: isNftLoading } = useNftMetadata(
    chainId,
    nftInfo?.contract as `0x${string}` | undefined,
    nftInfo?.tokenId
  )

  // Determine if we're still loading metadata
  const isLoadingMetadata = Boolean(
    (!!tokenAddress && isTokenLoading) || (!!nftInfo && isNftLoading)
  )

  // Prepare transaction data for AI summary (only when not loading)
  const transactionData = React.useMemo(() => {
    if (isLoadingMetadata || DISABLE_AI_SUMMARY) return null

    return {
      chainId,
      addresses,
      transaction: { args: transaction.args, functionName: transaction.functionName },
      target: target as `0x${string}`,
      tokenMetadata: tokenMetadata || undefined,
      nftMetadata: nftMetadata || undefined,
      escrowData: escrowData || undefined,
      streamData: streamData || undefined,
      proposalMetadata,
      bundleContext,
    }
  }, [
    transaction,
    target,
    chainId,
    addresses,
    tokenMetadata,
    nftMetadata,
    escrowData,
    streamData,
    proposalMetadata,
    bundleContext,
    isLoadingMetadata,
  ])

  const {
    summary: aiSummary,
    error: errorSummary,
    isLoading: isGeneratingSummary,
    mutate: regenerateSummary,
  } = useTransactionSummary(transactionData)

  return (
    <Stack style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      <Flex direction="row" gap="x0">
        <Text
          as="span"
          fontWeight="heading"
          py="x3"
          pl="x3"
          style={{ flexShrink: 0, minWidth: 24, maxWidth: 40 }}
        >
          {index + 1}.
        </Text>
        <Stack style={{ maxWidth: 900 }} gap={'x1'} px={'x3'} py={'x3'}>
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
          <Flex align="center" gap="x0">
            {`.${transaction.functionName}`}
            <button
              type="button"
              onClick={() => setShowRawCalldata((state) => !state)}
              title={showRawCalldata ? 'Hide raw calldata' : 'Show raw calldata'}
              aria-label={showRawCalldata ? 'Hide raw calldata' : 'Show raw calldata'}
              style={{
                marginLeft: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 6,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon id="swap" style={{ width: 16, height: 16 }} />
            </button>
            {value !== '0' && transaction.functionName !== 'send' && (
              <Flex align="center" gap="x1">
                <Text color="accent">{`{ value:`}</Text>
                <img
                  src="/chains/ethereum.svg"
                  alt="ETH"
                  loading="lazy"
                  decoding="async"
                  width="16px"
                  height="16px"
                  style={{ maxWidth: '16px', maxHeight: '16px', objectFit: 'contain' }}
                />
                <Text color="accent">{`${formatCryptoVal(formatEther(BigInt(value)))} ETH }`}</Text>
              </Flex>
            )}
            {`(`}
            {sortedArgs.length === 0 ? `)` : null}
          </Flex>

          <Stack pl={'x4'} gap={'x1'}>
            {sortedArgs.map((argKey, i) => {
              const arg = transaction.args[argKey]

              return (
                <ArgumentDisplay
                  chainId={chainId}
                  key={`${argKey}-${arg.name}-${i}`}
                  arg={arg}
                  target={target}
                  functionName={transaction.functionName}
                  tokenMetadata={tokenMetadata}
                  nftMetadata={nftMetadata}
                  escrowData={escrowData}
                  streamData={streamData}
                />
              )
            })}
          </Stack>

          {sortedArgs.length > 0 ? `)` : null}

          {showRawCalldata && (
            <Stack
              mt="x2"
              gap="x1"
              p="x2"
              backgroundColor="background2"
              borderRadius="curved"
            >
              <Text fontWeight="heading" color="text3">
                Raw calldata
              </Text>
              <Text
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  overflowWrap: 'anywhere',
                  fontFamily: 'monospace',
                }}
              >
                {transaction.encodedData || 'Unavailable'}
              </Text>
            </Stack>
          )}
        </Stack>
      </Flex>

      {simulation && simulation.status === false && (
        <Box color="text3" px="x3" pb="x2">
          <Text>Simulation indicates this call may fail.</Text>
          {!!simulation.url && (
            <Text>
              <a href={simulation.url} target="_blank" rel="noreferrer">
                View simulation details
              </a>
            </Text>
          )}
        </Box>
      )}

      {!isLoadingMetadata &&
        !DISABLE_AI_SUMMARY &&
        !errorSummary /* TODO: remove this condition and display error summary instead when AI summaries are more reliable */ &&
        !isGeneratingSummary && (
          <Box
            px="x3"
            py="x2"
            backgroundColor="background2"
            borderBottomRadius="curved"
            border="1px solid"
            borderColor="border"
          >
            <Text
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              <Text as="span" fontWeight="heading" color="accent">
                🤖 AI Summary:{' '}
              </Text>
              {!isGeneratingSummary && !aiSummary && errorSummary && (
                <Button
                  onClick={() => regenerateSummary()}
                  variant="outline"
                  size="sm"
                  px="x2"
                >
                  Regenerate
                </Button>
              )}
              {isGeneratingSummary && <Text as="span">Generating summary...</Text>}
              {!isGeneratingSummary && aiSummary && <Text as="span">{aiSummary}</Text>}
              {!isGeneratingSummary && !aiSummary && errorSummary && (
                <Text color="negative" as="span">
                  Error generating summary: {getErrorMessage(errorSummary)}
                </Text>
              )}
            </Text>
          </Box>
        )}
    </Stack>
  )
}
