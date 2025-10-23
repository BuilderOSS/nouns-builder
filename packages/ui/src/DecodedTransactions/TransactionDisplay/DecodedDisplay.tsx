import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useNftMetadata } from '@buildeross/hooks/useNftMetadata'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { useTransactionSummary } from '@buildeross/hooks/useTransactionSummary'
import { CHAIN_ID, DaoContractAddresses, DecodedTransactionData } from '@buildeross/types'
import {
  decodeEscrowData,
  decodeEscrowDataV1,
  getEscrowBundlerV1,
} from '@buildeross/utils/escrow'
import { walletSnippet } from '@buildeross/utils/helpers'
import { atoms, Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { ArgumentDisplay } from '../ArgumentDisplay'

const DISABLE_AI_SUMMARY = process.env.NEXT_PUBLIC_DISABLE_AI_SUMMARY === 'true'

export const DecodedDisplay: React.FC<{
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  transaction: DecodedTransactionData
  target: string
}> = ({ chainId, addresses, transaction, target }) => {
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
      target.toLowerCase() === getEscrowBundlerV1(chainId).toLowerCase()
        ? decodeEscrowDataV1
        : decodeEscrowData

    try {
      return decoder(raw as `0x${string}`)
    } catch (e) {
      console.warn('Failed to decode escrow data', e)
      return null
    }
  }, [transaction.args, target, chainId])

  // Determine single token address for ERC20 operations
  const tokenAddress = React.useMemo(() => {
    // For ERC20 transfer/approve, use target
    if (
      transaction.functionName === 'transfer' ||
      transaction.functionName === 'approve' ||
      transaction.functionName === 'increaseAllowance' ||
      transaction.functionName === 'decreaseAllowance'
    ) {
      return target
    }

    // For escrow operations, get token from escrow data
    return escrowData?.tokenAddress || null
  }, [transaction.functionName, target, escrowData])

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
    tokenAddress as `0x${string}` | undefined
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
    }
  }, [
    transaction,
    target,
    chainId,
    addresses,
    tokenMetadata,
    nftMetadata,
    escrowData,
    isLoadingMetadata,
  ])

  const {
    summary: aiSummary,
    error: errorSummary,
    isLoading: isGeneratingSummary,
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

        <Flex pl={'x2'}>
          {`.${transaction.functionName}(`}
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
              />
            )
          })}
        </Stack>

        {sortedArgs.length > 0 ? `)` : null}

        {!isLoadingMetadata && !DISABLE_AI_SUMMARY && (
          <Box
            p="x4"
            backgroundColor="background2"
            borderRadius="curved"
            border="1px solid"
            borderColor="border"
            mt="x4"
          >
            <Text fontWeight="heading" mb="x2" color="accent">
              🤖 AI Summary
            </Text>
            {isGeneratingSummary && (
              <Text style={{ whiteSpace: 'pre-wrap' }}>Generating summary...</Text>
            )}
            {!isGeneratingSummary && aiSummary && (
              <Text style={{ whiteSpace: 'pre-wrap' }}>{aiSummary}</Text>
            )}
            {!isGeneratingSummary && !aiSummary && errorSummary && (
              <Text color="negative" style={{ whiteSpace: 'pre-wrap' }}>
                Error generating summary: {errorSummary.message || errorSummary}
              </Text>
            )}
          </Box>
        )}
      </Stack>
    </Stack>
  )
}
