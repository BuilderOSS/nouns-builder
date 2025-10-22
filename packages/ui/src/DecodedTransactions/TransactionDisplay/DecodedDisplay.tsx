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
import { formatUnits } from 'viem'

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
  const isLoadingMetadata = (tokenAddress && isTokenLoading) || (nftInfo && isNftLoading)

  // Generate AI prompt for transaction summary (only when not loading)
  const generateAIPrompt = React.useCallback(() => {
    if (isLoadingMetadata) return null

    // Format token amounts for better AI understanding
    const formatTokenAmounts = () => {
      if (!tokenMetadata) return ''

      const amountKeys = [
        '_milestoneAmounts',
        '_amount',
        '_value',
        'amount',
        'value',
        '_fundAmount',
      ]
      const formattedAmounts: string[] = []

      for (const key of amountKeys) {
        const arg = transaction.args[key]
        if (arg && arg.value) {
          try {
            if (key === '_milestoneAmounts' && typeof arg.value === 'string') {
              // Handle comma-separated milestone amounts
              const amounts = arg.value.split(',').map((amt) => {
                const formatted = formatUnits(BigInt(amt.trim()), tokenMetadata.decimals)
                return `${formatted} ${tokenMetadata.symbol}`
              })
              formattedAmounts.push(`${key}: ${amounts.join(', ')}`)
            } else {
              const formatted = formatUnits(
                BigInt(arg.value.toString()),
                tokenMetadata.decimals
              )
              formattedAmounts.push(`${key}: ${formatted} ${tokenMetadata.symbol}`)
            }
          } catch {
            formattedAmounts.push(`${key}: ${arg.value} (raw)`)
          }
        }
      }

      return formattedAmounts.length > 0
        ? `\n### Formatted Amounts\n${formattedAmounts.map((amt) => `- ${amt}`).join('\n')}\n`
        : ''
    }

    return `You are an expert blockchain analyst who specializes in explaining complex smart contract activity in simple, conversational English.
Your goal is to describe what this transaction does so that a non-technical person could understand it.

Focus primarily on:
1. The purpose of the transaction (what action it performs)
2. Who the participants are (sender, receiver, or contract)
3. The assets involved (token/NFT type and amount)

Context for common transaction types:
- If the transaction looks like a token "approve" call, explain that it allows another address to spend tokens.
- If it looks like a transfer or escrow deposit, describe the asset movement and purpose.
- If it involves NFTs, mention ownership transfer.
- All transfers are from the DAO's treasury, not from individual users.

---

### Transaction Overview
- Function: ${transaction.functionName}
- Target Contract: ${target}
- Chain ID: ${chainId}

### Arguments
${JSON.stringify(transaction.args, null, 2)}

${
  tokenMetadata
    ? `### Token Information
- Symbol: ${tokenMetadata.symbol}
- Name: ${tokenMetadata.name}
- Decimals: ${tokenMetadata.decimals}
`
    : ''
}

${
  nftMetadata
    ? `### NFT Information
- Name: ${nftMetadata.name || 'Unknown'}
- Type: ${nftMetadata.tokenType}
`
    : ''
}

${
  escrowData
    ? `### Escrow Information
- Client: ${escrowData.clientAddress || 'N/A'}
- Provider: ${escrowData.providerAddress || 'N/A'}
- Token: ${escrowData.tokenAddress || 'N/A'}
- Termination Time: ${escrowData.terminationTime ? new Date(Number(escrowData.terminationTime) * 1000).toLocaleString() : 'N/A'}
`
    : ''
}${formatTokenAmounts()}
---

### Instructions
Write a single, concise sentence describing what this transaction does in plain English.

Respond ONLY with one short sentence — no headers, labels, or lists.

Example of desired output:
"Approves the escrow contract to spend up to 1,000 DAI tokens."

Make the tone simple, informative, and human-readable. Avoid jargon like "function selector" or "ABI encoding."`
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

  // Generate AI summary when metadata is loaded
  React.useEffect(() => {
    if (isLoadingMetadata || aiSummary || isGeneratingSummary) return
    const prompt = generateAIPrompt()
    if (!prompt) return

    const generateSummary = async () => {
      setIsGeneratingSummary(true)

      try {
        const response = await fetch('/api/ai/generateText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        })

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`)
        }

        const data = await response.json()
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
      } finally {
        setIsGeneratingSummary(false)
      }
    }

    generateSummary()
  }, [isLoadingMetadata, aiSummary, isGeneratingSummary, generateAIPrompt])

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
