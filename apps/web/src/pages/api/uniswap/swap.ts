import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { Address, parseUnits } from 'viem'

import { withCors } from '../../../utils/api/cors'
import { withRateLimit } from '../../../utils/api/rateLimit'

const UNISWAP_TRADING_API_BASE_URL = 'https://trade-api.gateway.uniswap.org/v1'
const UNISWAP_API_KEY = process.env.UNISWAP_API_KEY

// Chains supported by Uniswap Trading API
const SUPPORTED_CHAIN_IDS = [
  CHAIN_ID.ETHEREUM,
  CHAIN_ID.SEPOLIA,
  CHAIN_ID.OPTIMISM,
  CHAIN_ID.BASE,
  CHAIN_ID.BASE_SEPOLIA,
]

interface SwapRequest {
  chainId: number
  tokenIn: Address
  tokenOut: Address
  amount: string // Human-readable amount (e.g., "0.001")
  inputTokenDecimals: number // Decimals of input token for wei conversion
  outputTokenDecimals: number // Decimals of output token for wei conversion
  type: 'exactIn' | 'exactOut'
  slippageTolerance?: string
  sender: Address
  recipient?: Address
  deadline?: number
}

interface SwapResponse {
  routing: string
  quote: {
    amount: string // Input amount in wei
    quote: string // Expected output amount in wei
    minimumAmountOut: string // Minimum output with slippage in wei
    quoteGasAdjusted: string
    gasUseEstimate: string
    gasUseEstimateQuote: string
    gasUseEstimateUSD: string
    gasPriceWei: string
    priceImpact: string
    routeString: string
  }
  quoteId: string
  gasFee: string
  permitData?: {
    domain: any
    types: any
    values: any
  }
  transaction: {
    to: Address
    from: Address
    data: string
    value: string
    gasLimit?: string
    gasPrice?: string
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
    chainId: number
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  if (!UNISWAP_API_KEY) {
    return res.status(500).json({ error: 'Uniswap API key not configured' })
  }

  const {
    chainId,
    tokenIn,
    tokenOut,
    amount,
    inputTokenDecimals = 18,
    outputTokenDecimals = 18,
    type = 'exactIn',
    slippageTolerance,
    sender,
    recipient,
    deadline,
  } = req.body as SwapRequest

  // Validate required parameters
  if (!chainId || !tokenIn || !tokenOut || !amount || !sender) {
    return res.status(400).json({
      error: 'Missing required parameters: chainId, tokenIn, tokenOut, amount, sender',
    })
  }

  // Validate chain ID
  const chainIdNum = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId

  if (!SUPPORTED_CHAIN_IDS.includes(chainIdNum)) {
    return res.status(400).json({
      error:
        'Unsupported chain. Supported chains: Ethereum, Sepolia, Optimism, Optimism Sepolia, Base, Base Sepolia.',
    })
  }

  try {
    // Normalize native ETH address: Uniswap API expects 0x0000...0000, not 0xEeee...eeee
    const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    const normalizeAddress = (addr: Address): Address => {
      return addr.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
        ? ('0x0000000000000000000000000000000000000000' as Address)
        : addr
    }

    const normalizedTokenIn = normalizeAddress(tokenIn)
    const normalizedTokenOut = normalizeAddress(tokenOut)

    // Convert human-readable amount to wei (smallest unit)
    // For exactIn: amount is in input token units, use inputTokenDecimals
    // For exactOut: amount is in output token units, use outputTokenDecimals
    let amountInWei: string
    try {
      const decimalsToUse = type === 'exactIn' ? inputTokenDecimals : outputTokenDecimals
      amountInWei = parseUnits(amount, decimalsToUse).toString()
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid amount format',
        details: 'Amount must be a valid decimal number',
      })
    }

    // Step 1: Get quote from Uniswap Trading API
    const quoteRequestBody = {
      tokenIn: normalizedTokenIn,
      tokenInChainId: chainIdNum,
      tokenOut: normalizedTokenOut,
      tokenOutChainId: chainIdNum,
      amount: amountInWei, // Use wei amount for API
      type: type === 'exactIn' ? 'EXACT_INPUT' : 'EXACT_OUTPUT', // Convert to uppercase format
      slippageTolerance: parseFloat(slippageTolerance || '0.5'), // Must be a number
      swapper: sender,
    }

    const quoteResponse = await fetch(`${UNISWAP_TRADING_API_BASE_URL}/quote`, {
      method: 'POST',
      headers: {
        'x-api-key': UNISWAP_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteRequestBody),
    })

    if (!quoteResponse.ok) {
      const errorText = await quoteResponse.text()
      console.error('Uniswap quote API error:', quoteResponse.status, errorText)

      if (quoteResponse.status === 400) {
        return res.status(400).json({
          error: 'Invalid quote parameters',
          details: errorText,
        })
      } else if (quoteResponse.status === 404) {
        return res.status(404).json({
          error: 'No route found for this token pair',
          details:
            'There may be insufficient liquidity or no pools available for this swap.',
        })
      } else {
        return res.status(quoteResponse.status).json({
          error: 'Uniswap quote API request failed',
          status: quoteResponse.status,
          details: errorText,
        })
      }
    }

    const quoteData = await quoteResponse.json()

    // Step 2: Get swap transaction using the quote
    const swapRequestBody = {
      quote: quoteData.quote,
      slippageTolerance: parseFloat(slippageTolerance || '0.5'),
      recipient: recipient || sender,
      deadline: deadline || Math.floor(Date.now() / 1000) + 60 * 20, // Default 20 minutes
      enableUniversalRouter: true,
    }

    const swapResponse = await fetch(`${UNISWAP_TRADING_API_BASE_URL}/swap`, {
      method: 'POST',
      headers: {
        'x-api-key': UNISWAP_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(swapRequestBody),
    })

    if (!swapResponse.ok) {
      const errorText = await swapResponse.text()
      console.error('Uniswap swap API error:', swapResponse.status, errorText)

      if (swapResponse.status === 400) {
        return res.status(400).json({
          error: 'Invalid swap parameters',
          details: errorText,
        })
      } else {
        return res.status(swapResponse.status).json({
          error: 'Uniswap swap API request failed',
          status: swapResponse.status,
          details: errorText,
        })
      }
    }

    const swapData = await swapResponse.json()

    // Combine quote and swap data for the response
    const combinedData: SwapResponse = {
      routing: quoteData.routing,
      quote: {
        amount: quoteData.quote.input.amount,
        quote: quoteData.quote.output.amount,
        minimumAmountOut: quoteData.quote.output.minimumAmount,
        quoteGasAdjusted: quoteData.quote.output.amount, // Approximate
        gasUseEstimate: quoteData.quote.gasUseEstimate,
        gasUseEstimateQuote: quoteData.quote.gasFeeQuote,
        gasUseEstimateUSD: quoteData.quote.gasFeeUSD,
        gasPriceWei: quoteData.quote.maxFeePerGas,
        priceImpact: quoteData.quote.priceImpact?.toString() || '0',
        routeString: quoteData.quote.routeString,
      },
      quoteId: quoteData.quote.quoteId,
      gasFee: quoteData.quote.gasFee,
      permitData: quoteData.permitData,
      transaction: swapData.swap,
    }

    // Return the combined swap data with transaction calldata
    return res.status(200).json({
      success: true,
      data: combinedData,
    })
  } catch (error) {
    console.error('Uniswap swap API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default withCors({
  allowedMethods: ['POST'],
})(
  withRateLimit({
    keyPrefix: 'uniswap:swap',
    maxRequests: 20, // 20 requests per minute (lower for transaction creation)
  })(handler)
)
