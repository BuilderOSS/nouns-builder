import { gateway } from '@ai-sdk/gateway'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import type {
  CHAIN_ID,
  DaoContractAddresses,
  DecodedArgs,
  SerializedNftMetadata,
  TokenMetadata,
} from '@buildeross/types'
import type { DecodedEscrowData } from '@buildeross/utils/escrow'
import { formatBpsValue, formatTokenValue } from '@buildeross/utils/formatArgs'
import { walletSnippet } from '@buildeross/utils/helpers'
import * as Sentry from '@sentry/nextjs'
import { generateText } from 'ai'
import { NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { keccak256, toHex } from 'viem'

type RequestBody = {
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  transaction: { functionName: string; args: DecodedArgs }
  target: string
  tokenMetadata?: TokenMetadata
  nftMetadata?: SerializedNftMetadata
  escrowData?: DecodedEscrowData
}

const safeStringify = (v: unknown) =>
  JSON.stringify(v, (_k, val) => (typeof val === 'bigint' ? val.toString() : val))

const getCacheKey = (data: RequestBody, model: string) => {
  const hash = keccak256(toHex(`${safeStringify(data)}:${model}`))
  return `ai:txSummary:${hash}`
}

/**
 * Recursively traverses transaction arguments and formats
 * token-related fields or BPS percentage fields.
 */
export const formatAmounts = ({
  transaction,
  tokenMetadata,
  nftMetadata,
}: RequestBody): string => {
  const isNFT = !!nftMetadata
  const keywords = isNFT ? ['price'] : ['amount', 'value', 'price']
  const formattedEntries: string[] = []

  const traverse = (obj: any, path: string[] = []) => {
    if (!obj || typeof obj !== 'object') return

    for (const [key, val] of Object.entries(obj)) {
      const currentPath = [...path, key]
      const lowerKey = key.toLowerCase()

      const matchesTokenKey = keywords.some((k) => lowerKey.includes(k))
      const matchesBpsKey = key.endsWith('BPS') && key !== 'BPS'

      if (val !== undefined && val !== null) {
        try {
          if (matchesBpsKey) {
            const formatted = formatBpsValue(val)
            formattedEntries.push(`${currentPath.join('.')}: ${formatted}`)
          } else if (matchesTokenKey) {
            const formatted = formatTokenValue(val, tokenMetadata)
            const finalFormatted = Array.isArray(formatted)
              ? formatted.join(', ')
              : formatted
            formattedEntries.push(`${currentPath.join('.')}: ${finalFormatted}`)
          }
        } catch {
          formattedEntries.push(`${currentPath.join('.')}: ${val} (raw)`)
        }
      }

      if (typeof val === 'object') {
        traverse(val, currentPath)
      }
    }
  }

  traverse(transaction.args)

  return formattedEntries.length > 0
    ? `\n(For internal reference only — do not copy these values verbatim)\n${formattedEntries
        .map((entry) => `- ${entry}`)
        .join('\n')}\n`
    : ''
}

const formatArgs = (args: DecodedArgs) => {
  const MAX_ARGS_CHARS = 4000
  try {
    const json = JSON.stringify(
      args,
      (_k, v) => (typeof v === 'bigint' ? v.toString() : v),
      2
    )
    return json.length > MAX_ARGS_CHARS
      ? json.slice(0, MAX_ARGS_CHARS) + '\n… [truncated]'
      : json
  } catch {
    return '[omitted: failed to serialize args]'
  }
}

const generatePrompt = (data: RequestBody): string => {
  const {
    chainId,
    addresses,
    transaction,
    target,
    tokenMetadata,
    nftMetadata,
    escrowData,
  } = data

  const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)!

  const safeFunctionName = transaction.functionName.replace(/[^a-zA-Z0-9]/g, '')
  const contractType =
    target === addresses.token
      ? '- DAO token contract'
      : target === addresses.governor
        ? '- DAO governor contract'
        : target === addresses.treasury
          ? '- DAO treasury contract'
          : target === addresses.metadata
            ? '- DAO metadata contract'
            : target === addresses.auction
              ? '- DAO auction contract'
              : ''

  return `You are an expert blockchain analyst who explains smart contract transactions in clear, plain English for a general audience.
Write 1-2 short, plain-English sentence describing what this transaction does.

---

Writing Rules:
- Start with a capitalized verb in present tense (e.g., Transfers, Approves, Mints, Deposits).
- Write 1-2 sentences and end it with a period.
- Use correct singular/plural forms (e.g., "1 NFT" vs "2 NFTs").
- Use natural amount formatting (omit extra zeros).
- Be clear, simple, and factual — avoid technical jargon, markdown, or speculation.
- If token symbol or amount is missing, use general words like "tokens" or "assets".
- Only use relevant argument data to describe the transaction’s action.

---

DAO Contracts and Roles:
Token (${walletSnippet(addresses.token)}) — Governance NFTs  
Governor (${walletSnippet(addresses.governor)}) — Proposal management and transaction scheduling
Treasury (${walletSnippet(addresses.treasury)}) — Treasury and transaction execution
Metadata (${walletSnippet(addresses.metadata)}) — Artwork generation and rendering
Auction (${walletSnippet(addresses.auction)}) — Auction operations

---

Output Examples (for style and brevity; not related to this transaction):

Example 1 — Minting Governance NFTs  
mintBatchTo (DAO token contract); amount = 2; recipient = 0x2feb...AEd6a  
Mints 2 governance NFTs to the address 0x2feb...AEd6a.

Example 1a — Singular NFT Mint  
mintTo (DAO token contract); amount = 1; recipient = 0x1111...1111  
Mints 1 governance NFT to the address 0x1111...1111.

Example 2 — Treasury Token Transfer  
transfer (DAO treasury contract); to = 0xE5f6...8bEb; value = 780 USDC  
Transfers 780 USDC from the DAO's treasury to the address 0xE5f6...8bEb.

Example 3 — Approving Token Spend  
approve (USDC token contract); spender = 0xA0b8...0ce3; value = 1,000 DAI  
Approves address 0xA0b8...0ce3 to spend up to 1,000 DAI tokens.

Example 4 — Unclear Function  
executeProposal (governor contract); proposalId = 42  
Calls the executeProposal function on the governor contract.

---

Transaction Overview:
Function: ${transaction.functionName} | Network: ${chain.name} (ID: ${chain.id})  
Target: ${target} ${contractType}

Below are the transaction arguments — use only the relevant information to describe the action:
${formatArgs(transaction.args)}

${formatAmounts(data)}

${
  tokenMetadata
    ? `Token Information:
- Symbol: ${tokenMetadata.symbol}
- Name: ${tokenMetadata.name}
- Decimals: ${tokenMetadata.decimals}
`
    : ''
}${
    nftMetadata
      ? `NFT Information:
- Name: ${nftMetadata.name || 'Unknown'}
- Type: ${nftMetadata.tokenType}
`
      : ''
  }${
    escrowData
      ? `Escrow Information:
- Client: ${escrowData.clientAddress || 'N/A'}
- Provider: ${escrowData.providerAddress || 'N/A'}
- Token: ${escrowData.tokenAddress || 'N/A'}
- Termination Time: ${
          escrowData.terminationTime
            ? new Date(Number(escrowData.terminationTime) * 1000).toLocaleString()
            : 'N/A'
        }
`
      : ''
  }

---

Fallback Rule (only if purpose cannot be determined):
If you cannot confidently infer the action from the name, arguments, or DAO context:
Calls the ${safeFunctionName} function on the target contract.

---

Final Instruction:
Respond with 1-2 concise sentences describing this transaction, and nothing else.`
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const requestData: RequestBody = req.body

    if (!requestData.chainId || !requestData.addresses) {
      return res.status(400).json({ error: 'chainId and addresses are required' })
    }

    if (!PUBLIC_ALL_CHAINS.some((c) => c.id === requestData.chainId))
      return res.status(400).json({ error: 'chainId not found' })

    if (!requestData.addresses || Object.values(requestData.addresses).length < 5)
      return res.status(400).json({ error: 'addresses not found' })

    if (!requestData.transaction || !requestData.target) {
      return res.status(400).json({ error: 'transaction and target are required' })
    }

    if (!requestData.transaction.functionName || !requestData.transaction.args) {
      return res
        .status(400)
        .json({ error: 'transaction must have functionName and args' })
    }

    const { maxAge, swr } = CACHE_TIMES.AI_TRANSACTION_SUMMARY

    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )

    // Generate prompt on backend
    const prompt = generatePrompt(requestData)
    const model = process.env.AI_MODEL || 'xai/grok-3'

    const redisConnection = getRedisConnection()
    const cacheKey = getCacheKey(requestData, model)

    // Check cache first
    let cachedText = await redisConnection?.get(cacheKey)

    if (cachedText) {
      return res.status(200).json({ text: cachedText })
    }

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

export default withRateLimit({
  maxRequests: 30,
  keyPrefix: 'ai:txSummary',
})(handler)
