import { UNISWAP_V4_QUOTER_ADDRESS } from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import { encodeAbiParameters, keccak256, PublicClient } from 'viem'

import { uniswapV4QuoterAbi } from './abis/uniswapV4Quoter'
import { SwapError, SwapErrorCode } from './errors'
import { PoolKey, SwapPath } from './types'
import { normalizeForPoolKey } from './utils/normalizeAddresses'

/**
 * Compute the hash of a PoolKey struct
 * This matches Solidity: keccak256(abi.encode(poolKey))
 */
function computePoolKeyHash(poolKey: PoolKey): string {
  const encoded = encodeAbiParameters(
    [
      { name: 'currency0', type: 'address' },
      { name: 'currency1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickSpacing', type: 'int24' },
      { name: 'hooks', type: 'address' },
    ],
    [
      poolKey.currency0,
      poolKey.currency1,
      poolKey.fee,
      poolKey.tickSpacing,
      poolKey.hooks,
    ]
  )
  return keccak256(encoded)
}

/**
 * Get a quote from Uniswap V4 Quoter contract
 * @param publicClient - Viem public client
 * @param chainId - Chain ID
 * @param path - Swap path with pool information
 * @param amountIn - Amount to swap
 * @returns Quote with amountOut and minAmountOut (with slippage)
 */
export async function getQuoteFromUniswap({
  publicClient,
  chainId,
  path,
  amountIn,
  slippage = 0.01,
}: {
  publicClient: PublicClient
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
  path: SwapPath
  amountIn: bigint
  slippage?: number
}): Promise<{ amountOut: bigint; minAmountOut: bigint }> {
  const quoterAddress = UNISWAP_V4_QUOTER_ADDRESS[chainId]

  if (!quoterAddress) {
    throw new SwapError(
      SwapErrorCode.QUOTER_NOT_DEPLOYED,
      `Quoter not deployed on chain ${chainId}`
    )
  }

  // For multi-hop swaps, we need to quote each hop sequentially
  let currentAmountIn = amountIn

  for (let i = 0; i < path.hops.length; i++) {
    const hop = path.hops[i]

    // Validate required pool parameters
    if (!hop.fee || !hop.tickSpacing || !hop.hooks) {
      throw new SwapError(
        SwapErrorCode.POOL_CONFIG_ERROR,
        `Missing required pool parameters for hop ${i}: fee, tickSpacing, or hooks`
      )
    }

    // Normalize addresses: pools use WETH, but hops may have NATIVE_TOKEN_ADDRESS
    const normalizedTokenIn = normalizeForPoolKey(hop.tokenIn, chainId)
    const normalizedTokenOut = normalizeForPoolKey(hop.tokenOut, chainId)

    // Build PoolKey with normalized addresses
    const poolKey: PoolKey = {
      currency0:
        normalizedTokenIn < normalizedTokenOut ? normalizedTokenIn : normalizedTokenOut,
      currency1:
        normalizedTokenIn < normalizedTokenOut ? normalizedTokenOut : normalizedTokenIn,
      fee: Number(hop.fee), // Convert bigint to number
      tickSpacing: hop.tickSpacing,
      hooks: hop.hooks,
    }

    // Validate PoolKey by comparing hash with poolId
    const computedHash = computePoolKeyHash(poolKey)
    const expectedHash = hop.poolId.startsWith('0x') ? hop.poolId : `0x${hop.poolId}`

    if (computedHash.toLowerCase() !== expectedHash.toLowerCase()) {
      console.error(
        `PoolKey hash mismatch for hop ${i}:`,
        '\nComputed:',
        computedHash,
        '\nExpected:',
        expectedHash,
        '\nPoolKey:',
        poolKey,
        '\nOriginal hop tokenIn:',
        hop.tokenIn,
        '\nOriginal hop tokenOut:',
        hop.tokenOut,
        '\nNormalized tokenIn:',
        normalizedTokenIn,
        '\nNormalized tokenOut:',
        normalizedTokenOut
      )
      throw new SwapError(
        SwapErrorCode.POOL_CONFIG_ERROR,
        `PoolKey validation failed for hop ${i}: hash mismatch (computed: ${computedHash}, expected: ${expectedHash})`
      )
    }

    // Determine if this is a zeroForOne swap (using normalized addresses)
    const zeroForOne = normalizedTokenIn === poolKey.currency0

    try {
      // Build the QuoteExactSingleParams structure
      const params = {
        poolKey,
        zeroForOne,
        exactAmount: currentAmountIn,
        hookData: '0x' as const,
      }

      // Call quoteExactInputSingle
      const result = (await publicClient.simulateContract({
        address: quoterAddress,
        abi: uniswapV4QuoterAbi,
        functionName: 'quoteExactInputSingle',
        args: [params],
      })) as any

      const amountOut = result.result[0] as bigint

      if (!amountOut || amountOut <= 0n) {
        throw new SwapError(
          SwapErrorCode.INSUFFICIENT_LIQUIDITY,
          'Quote returned zero or negative output - insufficient liquidity in pool'
        )
      }

      // Use this output as input for next hop
      currentAmountIn = amountOut
    } catch (error: any) {
      // Re-throw SwapErrors as-is
      if (error instanceof SwapError) {
        throw error
      }

      console.error(`Quote failed for hop ${i}:`, error)

      const errorMessage = error.message?.toLowerCase() || ''
      const errorString = String(error).toLowerCase()

      // Check for network-related errors
      if (
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('network') ||
        errorMessage.includes('timeout')
      ) {
        throw new SwapError(
          SwapErrorCode.NETWORK_ERROR,
          `Network error while fetching quote: ${error.message}`,
          error
        )
      }

      // Check for pool limit / liquidity errors
      // These can manifest as reverts, "TickMath", "SPL" (sqrt price limit), or liquidity errors
      if (
        errorMessage.includes('tickmath') ||
        errorMessage.includes('spl') ||
        errorMessage.includes('sqrt price limit') ||
        errorMessage.includes('price limit') ||
        errorString.includes('tickmath') ||
        errorString.includes('spl')
      ) {
        throw new SwapError(
          SwapErrorCode.POOL_LIMIT_EXCEEDED,
          'Amount exceeds pool limit. Please try a smaller amount.',
          error
        )
      }

      // Generic insufficient liquidity
      if (
        errorMessage.includes('insufficient liquidity') ||
        errorMessage.includes('notEnoughLiquidity') ||
        errorMessage.includes('liquidity')
      ) {
        throw new SwapError(
          SwapErrorCode.INSUFFICIENT_LIQUIDITY,
          'Not enough liquidity in the pool for this trade size. Try a smaller amount.',
          error
        )
      }

      // Wrap unknown errors
      throw new SwapError(
        SwapErrorCode.UNKNOWN_ERROR,
        `Failed to get quote: ${error.message || 'Unknown error'}`,
        error
      )
    }
  }

  // Final amount out
  const amountOut = currentAmountIn

  // Calculate minimum amount out with slippage
  const slippageBps = BigInt(Math.floor(slippage * 10000))
  const minAmountOut = (amountOut * (10000n - slippageBps)) / 10000n

  return {
    amountOut,
    minAmountOut,
  }
}
