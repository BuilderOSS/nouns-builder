import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useNftMetadata } from '@buildeross/hooks/useNftMetadata'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { useTransactionSummary } from '@buildeross/hooks/useTransactionSummary'
import { CHAIN_ID, DaoContractAddresses, DecodedTransactionData } from '@buildeross/types'
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
  parseStreamDataConfigTimestamps,
  type StreamConfig,
} from '@buildeross/utils/sablier'
import { atoms, Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'

import { ArgumentDisplay } from '../ArgumentDisplay'

const DISABLE_AI_SUMMARY = process.env.NEXT_PUBLIC_DISABLE_AI_SUMMARY === 'true'

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return JSON.stringify(error)
}

export const DecodedDisplay: React.FC<{
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  transaction: DecodedTransactionData
  target: string
  value: string
}> = ({ chainId, addresses, transaction, target, value }) => {
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
    const decoder =
      target.toLowerCase() === getEscrowBundlerLegacy(chainId).toLowerCase()
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
      transaction.functionName !== 'createWithTimestampsLL'
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

      const isDurationsMode = transaction.functionName === 'createWithDurationsLL'
      const parser: (_data: any) => StreamConfig = isDurationsMode
        ? parseStreamDataConfigDurations
        : parseStreamDataConfigTimestamps

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
    isLoadingMetadata,
  ])

  const {
    summary: aiSummary,
    error: errorSummary,
    isLoading: isGeneratingSummary,
    mutate: regenerateSummary,
  } = useTransactionSummary(transactionData)

  return (
    <Stack style={{ maxWidth: 900, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      <Stack gap={'x1'}>
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

        <Flex pl={'x2'} align="center" gap="x0">
          {`.${transaction.functionName}`}
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

        {!isLoadingMetadata &&
          !DISABLE_AI_SUMMARY &&
          !errorSummary &&
          !isGeneratingSummary && (
            <Box
              px="x4"
              pt="x3"
              pb="x4"
              backgroundColor="background2"
              borderRadius="curved"
              border="1px solid"
              borderColor="border"
              mt="x4"
            >
              <Flex gap="x4" align="center" mb="x2" style={{ height: '32px' }}>
                <Text fontWeight="heading" color="accent">
                  🤖 AI Summary
                </Text>
                {!isGeneratingSummary && !aiSummary && errorSummary && (
                  <Button
                    onClick={() => regenerateSummary()}
                    variant="outline"
                    size="sm"
                    px="x2"
                    style={{ height: '32px' }}
                  >
                    Regenerate
                  </Button>
                )}
              </Flex>
              {isGeneratingSummary && (
                <Text style={{ whiteSpace: 'pre-wrap' }}>Generating summary...</Text>
              )}
              {!isGeneratingSummary && aiSummary && (
                <Text style={{ whiteSpace: 'pre-wrap' }}>{aiSummary}</Text>
              )}
              {!isGeneratingSummary && !aiSummary && errorSummary && (
                <Text color="negative" style={{ whiteSpace: 'pre-wrap' }}>
                  Error generating summary: {getErrorMessage(errorSummary)}
                </Text>
              )}
            </Box>
          )}
      </Stack>
    </Stack>
  )
}
