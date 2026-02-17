import { executeSwap, SwapPath } from '@buildeross/swap'
import { CHAIN_ID } from '@buildeross/types'
import { useState } from 'react'
import { PublicClient, WalletClient } from 'viem'

interface UseExecuteSwapParams {
  walletClient?: WalletClient
  publicClient?: PublicClient
}

interface ExecuteSwapParams {
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
  path: SwapPath
  amountIn: bigint
  amountOut: bigint
  slippage?: number
}

interface UseExecuteSwapReturn {
  execute: (params: ExecuteSwapParams) => Promise<`0x${string}`>
  isExecuting: boolean
  error: Error | null
  txHash: `0x${string}` | null
}

/** Convert slippage (0..1) to bps (0..10_000) safely */
export function slippageToBps(slippage?: number): bigint {
  if (slippage == null) return 100n // default 1%
  if (!Number.isFinite(slippage) || slippage < 0 || slippage > 1) {
    throw new Error(`Invalid slippage: ${slippage}`)
  }
  // round up to be slightly more conservative
  return BigInt(Math.ceil(slippage * 10_000))
}

/** Compute minAmountOut from raw bigint quote output */
export function applySlippageBps(amountOut: bigint, slippageBps: bigint): bigint {
  if (amountOut < 0n) throw new Error('amountOut < 0')
  if (slippageBps < 0n || slippageBps > 10_000n)
    throw new Error('slippageBps out of range')
  return (amountOut * (10_000n - slippageBps)) / 10_000n
}

/**
 * Hook to execute a swap transaction directly via Uniswap V4 Universal Router
 */
export function useExecuteSwap({
  walletClient,
  publicClient,
}: UseExecuteSwapParams): UseExecuteSwapReturn {
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  const execute = async ({
    chainId,
    path,
    amountIn,
    amountOut,
    slippage = 0.01,
  }: ExecuteSwapParams): Promise<`0x${string}`> => {
    if (!walletClient) {
      throw new Error('Wallet client not connected')
    }
    if (!publicClient) {
      throw new Error('Public client not available')
    }

    setIsExecuting(true)
    setError(null)
    setTxHash(null)

    try {
      // Calculate minimum amount out from slippage
      const slippageBps = slippageToBps(slippage) // slippage is 0..1
      const minAmountOut = applySlippageBps(amountOut, slippageBps)

      const { hash } = await executeSwap({
        chainId,
        path,
        amountIn,
        minAmountOut,
        walletClient,
        publicClient,
        validateTransaction: true,
      })

      setTxHash(hash)
      setIsExecuting(false)
      return hash
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to execute swap')
      setError(error)
      setIsExecuting(false)
      throw error
    }
  }

  return { execute, isExecuting, error, txHash }
}
