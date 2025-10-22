import { gateway } from '@ai-sdk/gateway'
import * as Sentry from '@sentry/nextjs'
import { generateText } from 'ai'
import { NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'
import { formatUnits, keccak256, toHex } from 'viem'

interface TransactionData {
  functionName: string
  args: Record<string, { name: string; value: any }>
  argOrder?: string[]
}

interface TokenMetadata {
  symbol: string
  name: string
  decimals: number
}

interface NftMetadata {
  name?: string
  tokenType: string
}

interface EscrowData {
  clientAddress?: string
  providerAddress?: string
  tokenAddress?: string
  terminationTime?: string
}

interface RequestBody {
  chainId: number
  transaction: TransactionData
  target: string
  tokenMetadata?: TokenMetadata
  nftMetadata?: NftMetadata
  escrowData?: EscrowData
}

const getCacheKey = (data: RequestBody, model: string) => {
  const hash = keccak256(toHex(`${JSON.stringify(data)}:${model}`))
  return `ai:txSummary:${hash}`
}

const generatePrompt = (data: RequestBody): string => {
  const { chainId, transaction, target, tokenMetadata, nftMetadata, escrowData } = data

  // Format token amounts for better AI understanding
  const formatTokenAmounts = (): string => {
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
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const requestData: RequestBody = req.body

    // Validate required fields
    if (!requestData.chainId || !requestData.transaction || !requestData.target) {
      return res
        .status(400)
        .json({ error: 'chainId, transaction, and target are required' })
    }

    if (!requestData.transaction.functionName || !requestData.transaction.args) {
      return res
        .status(400)
        .json({ error: 'transaction must have functionName and args' })
    }

    const model = process.env.AI_MODEL || 'xai/grok-3'
    const redisConnection = getRedisConnection()
    const cacheKey = getCacheKey(requestData, model)

    // Check cache first
    let cachedText = await redisConnection?.get(cacheKey)

    if (cachedText) {
      return res.status(200).json({ text: cachedText })
    }

    // Generate prompt on backend
    const prompt = generatePrompt(requestData)

    // Generate new text if not in cache
    const result = await generateText({
      model: gateway(model),
      prompt,
      abortSignal: AbortSignal.timeout(30000),
    })

    // Cache the generated text for 30 days
    await redisConnection?.setex(cacheKey, 60 * 60 * 24 * 30, result.text)

    res.status(200).json({ text: result.text })
  } catch (error) {
    console.error(error)

    Sentry.captureException(error)
    await Sentry.flush(2000)

    return res.status(500).json({ error: 'transaction summary generation failed' })
  }
}
