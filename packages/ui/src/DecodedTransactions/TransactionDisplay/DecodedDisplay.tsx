import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useNftMetadata } from '@buildeross/hooks/useNftMetadata'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { CHAIN_ID, DecodedTransactionData } from '@buildeross/types'
import {
  decodeEscrowData,
  decodeEscrowDataV1,
  getEscrowBundlerV1,
} from '@buildeross/utils/escrow'
import { walletSnippet } from '@buildeross/utils/helpers'
import { atoms, Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { ArgumentDisplay } from '../ArgumentDisplay'

export const DecodedDisplay: React.FC<{
  chainId: CHAIN_ID
  transaction: DecodedTransactionData
  target: string
}> = ({ chainId, transaction, target }) => {
  const sortedArgs = React.useMemo(() => {
    const keys = Object.keys(transaction.args)
    const inOrder = (transaction.argOrder as string[]).filter((k) => keys.includes(k))
    const rest = keys.filter((k) => !inOrder.includes(k)).sort()
    return [...inOrder, ...rest]
  }, [transaction.args, transaction.argOrder])

  // Prepare escrow data once
  const escrowData = React.useMemo(() => {
    const arg = transaction.args['_escrowData']
    if (!arg) return null
    const decoder =
      target.toLowerCase() === getEscrowBundlerV1(chainId).toLowerCase()
        ? decodeEscrowDataV1
        : decodeEscrowData
    return decoder(arg.value as `0x${string}`)
  }, [transaction.args, target, chainId])

  // Determine single token address for ERC20 operations
  const tokenAddress = React.useMemo(() => {
    // For ERC20 transfer/approve, use target
    if (
      transaction.functionName === 'transfer' ||
      transaction.functionName === 'approve'
    ) {
      return target
    }

    // For escrow operations, get token from escrow data
    return escrowData?.tokenAddress || null
  }, [transaction.functionName, target, escrowData])

  // Determine single NFT contract and token ID
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
  const getTransactionData = React.useCallback(() => {
    if (isLoadingMetadata) return null

    return {
      chainId,
      transaction,
      target,
      tokenMetadata: tokenMetadata || undefined,
      nftMetadata: nftMetadata || undefined,
      escrowData: escrowData || undefined,
    }
  }, [
    transaction,
    target,
    chainId,
    tokenMetadata,
    nftMetadata,
    escrowData,
    isLoadingMetadata,
  ])

  // AI Summary state
  const [aiSummary, setAiSummary] = React.useState<string | null>(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false)
  const [errorSummary, setErrorSummary] = React.useState<string | null>(null)

  // Generate AI summary when metadata is loaded
  React.useEffect(() => {
    if (isLoadingMetadata || aiSummary || isGeneratingSummary || errorSummary) return
    const transactionData = getTransactionData()
    if (!transactionData) return

    const abortController = new AbortController()
    const TIMEOUT_MS = 30000 // 30 seconds
    const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT_MS)
    let mounted = true

    const generateSummary = async () => {
      setIsGeneratingSummary(true)
      setErrorSummary(null)

      try {
        const response = await fetch('/api/ai/generateTxSummary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`)
        }

        const data = await response.json()
        if (!mounted || abortController.signal.aborted) return
        if (data && typeof data === 'string') {
          setAiSummary(data)
        } else if (data && data.text && typeof data.text === 'string') {
          setAiSummary(data.text)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (error) {
        console.error(
          `Failed to generate summary: ${error instanceof Error ? error.message : error}`
        )
        setErrorSummary(
          error instanceof Error ? error.message : (error?.toString() ?? 'Unknown error')
        )
        if (error instanceof Error && error.name === 'AbortError') {
          return // Request was cancelled, this is expected
        }
      } finally {
        if (mounted) setIsGeneratingSummary(false)
        setIsGeneratingSummary(false)
        clearTimeout(timeoutId)
      }
    }

    generateSummary()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      abortController.abort()
    }
  }, [isLoadingMetadata, aiSummary, isGeneratingSummary, getTransactionData])

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

        {/* AI Summary Section - only show if successful */}
        {aiSummary && (
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
            <Text style={{ whiteSpace: 'pre-wrap' }}>{aiSummary}</Text>
          </Box>
        )}
      </Stack>
    </Stack>
  )
}
