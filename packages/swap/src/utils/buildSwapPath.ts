import { UNISWAP_V4_POOL_MANAGER_ADDRESS } from '@buildeross/constants/addresses'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Address, encodeAbiParameters, keccak256, PublicClient } from 'viem'

import { uniswapV4PoolManagerAbi } from '../abis/uniswapV4PoolManager'
import { SwapError, SwapErrorCode } from '../errors'
import { PoolKey, SwapPath } from '../types'
import { normalizeForPoolKey, sortCurrenciesForPoolKey } from './normalizeAddresses'

/**
 * Common fee tiers in Uniswap V4 (in basis points, i.e., 1/10000)
 * 0.01% = 100
 * 0.05% = 500
 * 0.30% = 3000
 * 1.00% = 10000
 */
const COMMON_FEE_TIERS = [100, 500, 3000, 10000] as const

/**
 * Common tick spacings for different fee tiers
 * Lower fee = tighter tick spacing
 */
const FEE_TIER_TO_TICK_SPACING: Record<number, number> = {
  100: 1, // 0.01% -> 1 tick
  500: 10, // 0.05% -> 10 ticks
  3000: 60, // 0.30% -> 60 ticks
  10000: 200, // 1.00% -> 200 ticks
}

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
 * Check if a pool exists on-chain by querying PoolManager
 * Returns the liquidity if pool exists, null if pool doesn't exist
 * Throws error for RPC/ABI/deployment failures
 */
async function checkPoolExists(
  publicClient: PublicClient,
  chainId: CHAIN_ID,
  poolKey: PoolKey
): Promise<bigint | null> {
  const poolManagerAddress = UNISWAP_V4_POOL_MANAGER_ADDRESS[chainId]
  if (!poolManagerAddress) {
    throw new SwapError(
      SwapErrorCode.POOL_CONFIG_ERROR,
      `Pool Manager not deployed on chain ${chainId}`
    )
  }

  try {
    // Call getLiquidity to check if pool exists
    // This will return liquidity amount if pool exists, revert if it doesn't
    const poolId = computePoolKeyHash(poolKey)

    const liquidity = await publicClient.readContract({
      address: poolManagerAddress,
      abi: uniswapV4PoolManagerAbi,
      functionName: 'getLiquidity',
      args: [poolId as Address],
    })

    return liquidity as bigint
  } catch (error) {
    // Check if this is a contract revert (pool doesn't exist) vs RPC/network error
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Contract reverts typically contain "revert" or "execution reverted" in the message
    // These indicate the pool doesn't exist (null result)
    if (errorMessage.toLowerCase().includes('revert')) {
      return null
    }

    // For other errors (RPC failures, ABI issues, network errors), propagate them
    throw new SwapError(
      SwapErrorCode.UNKNOWN_ERROR,
      `Failed to check pool existence: ${errorMessage}`,
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Find the best available pool for a token pair
 * Tries common fee tiers from lowest to highest to find a pool with liquidity
 */
async function findBestPool(
  publicClient: PublicClient,
  chainId: CHAIN_ID,
  tokenIn: Address,
  tokenOut: Address
): Promise<{ poolKey: PoolKey; liquidity: bigint; poolId: string } | null> {
  // Sort currencies for PoolKey (currency0 < currency1)
  // Note: sortCurrenciesForPoolKey handles normalization (ETH -> WETH)
  const [currency0, currency1] = sortCurrenciesForPoolKey(tokenIn, tokenOut, chainId)

  // Zero address means no hooks
  const noHooks = '0x0000000000000000000000000000000000000000' as Address

  // Try each fee tier
  let lastError: Error | undefined
  for (const fee of COMMON_FEE_TIERS) {
    const tickSpacing = FEE_TIER_TO_TICK_SPACING[fee] ?? 60

    const poolKey: PoolKey = {
      currency0,
      currency1,
      fee,
      tickSpacing,
      hooks: noHooks,
    }

    try {
      const liquidity = await checkPoolExists(publicClient, chainId, poolKey)

      // Found a pool with liquidity
      if (liquidity !== null && liquidity > 0n) {
        const poolId = computePoolKeyHash(poolKey)
        return { poolKey, liquidity, poolId }
      }
      // liquidity === null means pool doesn't exist, continue to next fee tier
    } catch (error) {
      // RPC/ABI failure - save error but continue trying other fee tiers
      lastError = error instanceof Error ? error : new Error(String(error))
      continue
    }
  }

  // If we had RPC/ABI errors and found no pools, throw the last error
  if (lastError) {
    throw lastError
  }

  // No pools found (all returned null)
  return null
}

/**
 * Build a swap path between two tokens
 * Currently supports single-hop (direct) swaps only
 * Future: Add multi-hop routing through WETH/common tokens
 *
 * @param publicClient - Viem public client
 * @param chainId - Chain ID (must be Base or Base Sepolia)
 * @param tokenIn - Input token address (can be NATIVE_TOKEN_ADDRESS for ETH)
 * @param tokenOut - Output token address (can be NATIVE_TOKEN_ADDRESS for ETH)
 * @returns SwapPath with pool information, or null if no path found
 */
export async function buildSwapPath({
  publicClient,
  chainId,
  tokenIn,
  tokenOut,
}: {
  publicClient: PublicClient
  chainId: CHAIN_ID
  tokenIn: AddressType
  tokenOut: AddressType
}): Promise<SwapPath | null> {
  // Validate chain has Uniswap V4 deployment
  if (!isUniswapV4Supported(chainId)) {
    throw new SwapError(
      SwapErrorCode.POOL_CONFIG_ERROR,
      `Uniswap V4 is not deployed on chain ${chainId}. Supported chains: Ethereum, Sepolia, Optimism, Optimism Sepolia, Base, Base Sepolia.`
    )
  }

  // Can't swap token to itself
  const normalizedIn = normalizeForPoolKey(tokenIn, chainId)
  const normalizedOut = normalizeForPoolKey(tokenOut, chainId)
  if (normalizedIn.toLowerCase() === normalizedOut.toLowerCase()) {
    throw new SwapError(SwapErrorCode.POOL_CONFIG_ERROR, 'Cannot swap a token for itself')
  }

  try {
    // Try to find a direct pool
    const pool = await findBestPool(
      publicClient,
      chainId,
      tokenIn as Address,
      tokenOut as Address
    )

    if (!pool) {
      // No direct pool found
      // Future: Try multi-hop routing through WETH or USDC
      return null
    }

    // Build single-hop swap path
    const swapPath: SwapPath = {
      hops: [
        {
          tokenIn: tokenIn as Address,
          tokenOut: tokenOut as Address,
          poolId: pool.poolId,
          fee: BigInt(pool.poolKey.fee),
          hooks: pool.poolKey.hooks,
          tickSpacing: pool.poolKey.tickSpacing,
        },
      ],
      isOptimal: true, // Direct swap is optimal
      estimatedGas: undefined, // Will be calculated during quote
    }

    return swapPath
  } catch (error) {
    if (error instanceof SwapError) {
      throw error
    }
    throw new SwapError(
      SwapErrorCode.UNKNOWN_ERROR,
      `Failed to build swap path: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Check if Uniswap V4 is supported on the given chain
 */
export function isUniswapV4Supported(chainId: CHAIN_ID): boolean {
  return !!UNISWAP_V4_POOL_MANAGER_ADDRESS[chainId]
}
