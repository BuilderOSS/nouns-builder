import { UNISWAP_V4_QUOTER_ADDRESS } from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import { Address, encodeAbiParameters, keccak256, PublicClient } from 'viem'

import { uniswapV4QuoterAbi } from './abis/uniswapV4Quoter'
import { SwapPath } from './types'

export interface PoolKey {
  currency0: Address
  currency1: Address
  fee: number
  tickSpacing: number
  hooks: Address
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
    throw new Error(`Quoter not deployed on chain ${chainId}`)
  }

  // For multi-hop swaps, we need to quote each hop sequentially
  let currentAmountIn = amountIn

  for (let i = 0; i < path.hops.length; i++) {
    const hop = path.hops[i]

    // Validate required pool parameters
    if (!hop.fee || !hop.tickSpacing || !hop.hooks) {
      throw new Error(
        `Missing required pool parameters for hop ${i}: fee, tickSpacing, or hooks`
      )
    }

    // Build PoolKey
    const poolKey: PoolKey = {
      currency0: hop.tokenIn < hop.tokenOut ? hop.tokenIn : hop.tokenOut,
      currency1: hop.tokenIn < hop.tokenOut ? hop.tokenOut : hop.tokenIn,
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
        poolKey
      )
      throw new Error(
        `PoolKey validation failed for hop ${i}: hash mismatch (computed: ${computedHash}, expected: ${expectedHash})`
      )
    }

    // Determine if this is a zeroForOne swap
    const zeroForOne = hop.tokenIn === poolKey.currency0

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
        throw new Error('Quote returned zero or negative output')
      }

      // Use this output as input for next hop
      currentAmountIn = amountOut
    } catch (error: any) {
      console.error(`Quote failed for hop ${i}:`, error)
      throw new Error(`Failed to get quote: ${error.message || 'Unknown error'}`)
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
