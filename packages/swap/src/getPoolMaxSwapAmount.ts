import { UNISWAP_V4_QUOTER_ADDRESS } from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import { Address, PublicClient } from 'viem'

import { SwapError, SwapErrorCode } from './errors'
import { testSwapAmount } from './testSwapAmount'
import { PoolKey, PoolMaxSwapAmountResult } from './types'

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

  // --------------------------------------------
  // We now maintain invariant:
  //   low  = known valid (or 0)
  //   high = known invalid
  // --------------------------------------------

  let low = 0n
  let high = maxBound // already known invalid
  let bestValid = 0n

  const quantizeDown = (x: bigint) => (x / precision) * precision

  // -----------------------------
  // Zora heuristic (hardened)
  // -----------------------------
  if (isZoraCoin && maxBound > TEN_MILLION) {
    const rawEstimate = (maxBound - TEN_MILLION) * 2n
    const clamped = rawEstimate > maxBound ? maxBound : rawEstimate
    const estimate = quantizeDown(clamped)

    if (estimate > 0n && estimate < maxBound) {
      const ok = await testSwapAmount(
        publicClient,
        quoterAddress,
        poolKey,
        zeroForOne,
        estimate
      )

      if (ok) {
        low = estimate
        bestValid = estimate
      } else {
        high = estimate
      }
    }
  }

  // --------------------------------------------
  // Quantize bounds to precision grid
  // --------------------------------------------
  low = quantizeDown(low)
  const quantHigh = quantizeDown(high)
  high = quantHigh

  // --------------------------------------------
  // Ensure `high` is actually invalid after quantization
  // (quantizing down can accidentally make it valid)
  // --------------------------------------------
  if (high !== maxBound && high > 0n) {
    let highIsValid = await testSwapAmount(
      publicClient,
      quoterAddress,
      poolKey,
      zeroForOne,
      high
    )

    while (highIsValid) {
      // Update bestValid with the current valid high before incrementing
      bestValid = high

      const next = high + precision
      if (next > maxBound) {
        // Safety fallback: return the last valid high
        return high
      }

      high = next

      highIsValid = await testSwapAmount(
        publicClient,
        quoterAddress,
        poolKey,
        zeroForOne,
        high
      )
    }
  }

  // --------------------------------------------
  // Ensure minimal probe works
  // --------------------------------------------
  const minProbe = userBalanceLessThanPrecision(maxBound, precision)
    ? maxBound
    : precision

  if (minProbe === 0n) return 0n

  const minWorks = await testSwapAmount(
    publicClient,
    quoterAddress,
    poolKey,
    zeroForOne,
    minProbe
  )

  if (!minWorks) return 0n

  low = minProbe
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
      bestValid = mid
      low = mid
    } else {
      // step down safely
      high = mid > precision ? mid - precision : 0n
    }

    if (high - low < precision) break
  }

  return bestValid
}

// helper
function userBalanceLessThanPrecision(balance: bigint, precision: bigint): boolean {
  return balance < precision
}

/**
 * Get the maximum swap amount for a single pool using binary search
 * Uses the quoter contract to test different amounts and find the maximum
 *
 * @param publicClient - Viem public client
 * @param chainId - Chain ID
 * @param poolKey - Pool key with currency0, currency1, fee, tickSpacing, hooks
 * @param zeroForOne - Swap direction (true = currency0 -> currency1, false = currency1 -> currency0)
 * @param userBalance - User balance to use as upper bound for the search
 * @param isZoraCoin - Optional flag to indicate this is a Zora coin (enables optimization for large balances)
 * @returns Maximum amount in that can be swapped
 */
export async function getPoolMaxSwapAmount({
  publicClient,
  chainId,
  poolKey,
  zeroForOne,
  userBalance,
  isZoraCoin = false,
}: {
  publicClient: PublicClient
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
  poolKey: PoolKey
  zeroForOne: boolean
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
