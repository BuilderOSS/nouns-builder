import { gateway } from '@ai-sdk/gateway'
import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { CHAIN_ID, DaoContractAddresses } from '@buildeross/types'
import { walletSnippet } from '@buildeross/utils/helpers'
import * as Sentry from '@sentry/nextjs'
import { generateText } from 'ai'
import { NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'
import { withRateLimit } from 'src/utils/api/rateLimit'
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
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
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

  // Format numeric token amounts for model reference (reference only)
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
      if (arg && arg.value !== undefined && arg.value !== null) {
        try {
          if (key === '_milestoneAmounts' && typeof arg.value === 'string') {
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
      ? `\n(For internal reference only — do not copy these values verbatim)\n${formattedAmounts
          .map((amt) => `- ${amt}`)
          .join('\n')}\n`
      : ''
  }

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
Write one short, plain-English sentence describing what this transaction does.

---

Writing Rules:
- Start with a capitalized verb in present tense (e.g., Transfers, Approves, Mints, Deposits).
- Write exactly one sentence and end it with a period.
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
${JSON.stringify(transaction.args, null, 2)}

${formatTokenAmounts()}

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
Calls the ${safeFunctionName} function on thpe}.

---

Final Instruction:
Respond with one concise sentence describing this transaction, and nothing else.`
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

export default withRateLimit({
  keyPrefix: 'ai:txSummary',
})(handler)
