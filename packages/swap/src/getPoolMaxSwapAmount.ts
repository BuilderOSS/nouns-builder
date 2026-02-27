import { UNISWAP_V4_QUOTER_ADDRESS } from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import { Address, PublicClient } from 'viem'

import { SwapError, SwapErrorCode } from './errors'
import { testSwapAmount } from './testSwapAmount'
import { PoolKey, PoolMaxSwapAmountResult, SwapPathHop } from './types'
import { normalizeForPoolKey } from './utils/normalizeAddresses'

const TEN_MILLION = 10n ** 25n // 10M tokens with 18 decimals
const HALF_TOKEN = 5n * 10n ** 17n // 0.5 tokens with 18 decimals

/**
 * Binary search to find the maximum swap amount that doesn't fail
 *
 * NOTE: This implementation assumes all tokens have 18 decimals
 *
 * @param publicClient - Viem public client
 * @param quoterAddress - Quoter contract address
 * @param poolKey - Pool key
 * @param zeroForOne - Swap direction
 * @param maxBound - Upper bound to search (user's balance)
 * @param isZoraCoin - Whether this is a Zora coin (helps optimize search)
 * @param precision - Minimum precision (stop when range is smaller than this), default 0.5 tokens
 * @returns Maximum amount that can be swapped
 */
async function binarySearchMaxAmount(
  publicClient: PublicClient,
  quoterAddress: Address,
  poolKey: PoolKey,
  zeroForOne: boolean,
  maxBound: bigint,
  isZoraCoin: boolean = false,
  precision: bigint = HALF_TOKEN
): Promise<bigint> {
  if (maxBound <= 0n) return 0n

  const fullBalanceWorks = await testSwapAmount(
    publicClient,
    quoterAddress,
    poolKey,
    zeroForOne,
    maxBound
  )

  if (fullBalanceWorks) {
    return maxBound
  }

  const quantizeDown = (x: bigint) => (x / precision) * precision

  // -----------------------------
  // Zora heuristic
  // -----------------------------
  if (isZoraCoin && maxBound > TEN_MILLION) {
    const estimate = quantizeDown(maxBound - TEN_MILLION)

    const estimateIsValid = await testSwapAmount(
      publicClient,
      quoterAddress,
      poolKey,
      zeroForOne,
      maxBound
    )

    if (estimateIsValid) {
      return estimate
    }
    maxBound = estimate
  }

  // --------------------------------------------
  // We now maintain invariant:
  //   low  = known valid (or 0)
  //   high = known invalid
  // --------------------------------------------
  let low = 0n
  let high = maxBound
  let bestValid = 0n

  // --------------------------------------------
  // Ensure minimal probe works
  // Iteratively reduce precision if initial minProbe fails
  // --------------------------------------------
  let currentPrecision = precision
  let minProbe = maxBound < currentPrecision ? maxBound : currentPrecision

  if (minProbe === 0n) return 0n

  let minWorks = await testSwapAmount(
    publicClient,
    quoterAddress,
    poolKey,
    zeroForOne,
    minProbe
  )

  // If the initial minProbe fails, iteratively reduce precision and retry
  while (!minWorks && currentPrecision > 0n) {
    // Halve the precision
    currentPrecision = currentPrecision / 2n

    if (currentPrecision === 0n) {
      // No valid swap amount found even at smallest granularity
      return 0n
    }

    minProbe = maxBound < currentPrecision ? maxBound : currentPrecision

    minWorks = await testSwapAmount(
      publicClient,
      quoterAddress,
      poolKey,
      zeroForOne,
      minProbe
    )
  }

  if (!minWorks) return 0n

  // Update precision for the binary search to use the working granularity
  precision = currentPrecision

  // Only update low if minProbe is greater than existing low
  if (minProbe > low) {
    low = minProbe
  }
  // Only update bestValid if minProbe is greater than existing bestValid
  if (minProbe > bestValid) {
    bestValid = minProbe
  }

  // --------------------------------------------
  // Discrete binary search on precision grid
  // --------------------------------------------
  for (let i = 0; i < 30; i++) {
    if (high <= low) break

    let mid = quantizeDown((low + high) / 2n)

    if (mid <= low) {
      mid = low + precision
      if (mid >= high) break
    }

    const ok = await testSwapAmount(publicClient, quoterAddress, poolKey, zeroForOne, mid)

    if (ok) {
      // Use max to ensure we never lose a higher known-valid amount
      bestValid = mid > bestValid ? mid : bestValid
      low = mid
    } else {
      // Keep high invalid by setting it to mid (which we just confirmed is invalid)
      high = mid
    }

    if (high - low < precision) break
  }

  return bestValid
}

/**
 * Get the maximum swap amount for a single pool using binary search
 * Uses the quoter contract to test different amounts and find the maximum
 *
 * @param publicClient - Viem public client
 * @param chainId - Chain ID
 * @param hop - Swap path hop with token addresses and pool info
 * @param userBalance - User balance to use as upper bound for the search
 * @param isZoraCoin - Optional flag to indicate this is a Zora coin (enables optimization for large balances)
 * @returns Maximum amount in that can be swapped
 */
export async function getPoolMaxSwapAmount({
  publicClient,
  chainId,
  hop,
  userBalance,
  isZoraCoin = false,
}: {
  publicClient: PublicClient
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
  hop: SwapPathHop
  userBalance: bigint
  isZoraCoin?: boolean
}): Promise<PoolMaxSwapAmountResult> {
  const quoterAddress = UNISWAP_V4_QUOTER_ADDRESS[chainId]

  if (!quoterAddress) {
    throw new SwapError(
      SwapErrorCode.QUOTER_NOT_DEPLOYED,
      `Quoter not deployed on chain ${chainId}`
    )
  }

  // Validate required pool parameters
  if (!hop.fee || !hop.tickSpacing || !hop.hooks) {
    throw new SwapError(
      SwapErrorCode.POOL_CONFIG_ERROR,
      'Missing required pool parameters: fee, tickSpacing, or hooks'
    )
  }

  // Normalize addresses: pools use WETH, but hops may have NATIVE_TOKEN_ADDRESS
  const normalizedTokenIn = normalizeForPoolKey(hop.tokenIn, chainId)
  const normalizedTokenOut = normalizeForPoolKey(hop.tokenOut, chainId)

  // Build PoolKey with normalized and ordered addresses
  const poolKey: PoolKey = {
    currency0:
      normalizedTokenIn < normalizedTokenOut ? normalizedTokenIn : normalizedTokenOut,
    currency1:
      normalizedTokenIn < normalizedTokenOut ? normalizedTokenOut : normalizedTokenIn,
    fee: Number(hop.fee),
    tickSpacing: hop.tickSpacing,
    hooks: hop.hooks,
  }

  // Determine if this is a zeroForOne swap (using normalized addresses)
  const zeroForOne = normalizedTokenIn === poolKey.currency0

  // Calculate pool ID for reference
  try {
    // Binary search to find max amount
    const maxAmountIn = await binarySearchMaxAmount(
      publicClient,
      quoterAddress,
      poolKey,
      zeroForOne,
      userBalance,
      isZoraCoin
    )

    return {
      maxAmountIn,
      sqrtPriceX96: 0n, // Not available with this approach
      tick: 0, // Not available with this approach
      liquidity: 0n, // Not available with this approach
    }
  } catch (error: any) {
    // Re-throw SwapErrors as-is
    if (error instanceof SwapError) {
      throw error
    }

    console.error('Failed to get pool max swap amount:', error)

    // Check for network-related errors
    if (
      error.message?.includes('fetch failed') ||
      error.message?.includes('network') ||
      error.message?.includes('timeout')
    ) {
      throw new SwapError(
        SwapErrorCode.NETWORK_ERROR,
        `Network error while finding max swap amount: ${error.message}`,
        error
      )
    }

    // Wrap unknown errors
    throw new SwapError(
      SwapErrorCode.UNKNOWN_ERROR,
      `Failed to find max swap amount: ${error.message || 'Unknown error'}`,
      error
    )
  }
}
