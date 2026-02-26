import type { Address, PublicClient } from 'viem'

import { uniswapV4QuoterAbi } from './abis/uniswapV4Quoter'
import { PoolKey } from './types'

type RetryOpts = {
  retries?: number
  baseDelayMs?: number
  maxDelayMs?: number
}

/** Sleep helper */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Best-effort classification of transient RPC errors worth retrying.
 * This is intentionally broad because different RPC providers surface different messages/codes.
 */
function isTransientRpcError(err: any): boolean {
  const msg = String(err?.shortMessage || err?.message || err || '').toLowerCase()

  // Common transient/network/provider messages
  if (
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('fetch failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('network error') ||
    msg.includes('socket hang up') ||
    msg.includes('econnreset') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    msg.includes('gateway') || // 502/503
    msg.includes('service unavailable') ||
    msg.includes('temporarily unavailable') ||
    msg.includes('header not found') // some flaky gzip/proxy errors
  ) {
    return true
  }

  // Rate limiting / throttling - only match specific transient phrases
  if (
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('429') ||
    msg.includes('throttle') ||
    msg.includes('rate limit exceeded') ||
    msg.includes('capacity exceeded') ||
    msg.includes('quota exceeded')
  ) {
    return true
  }

  // Some providers surface numeric codes
  const code = err?.code
  if (code === -32005 /* Infura-like rate limit */) return true

  return false
}

/**
 * Replacement testSwapAmount with retries.
 * Returns true if quoter returns a positive amountOut, false otherwise.
 */
export async function testSwapAmount(
  publicClient: PublicClient,
  quoterAddress: Address,
  poolKey: PoolKey,
  zeroForOne: boolean,
  amount: bigint,
  opts: RetryOpts = {}
): Promise<boolean> {
  const { retries = 2, baseDelayMs = 150, maxDelayMs = 1200 } = opts

  if (amount <= 0n) return false

  const params = {
    poolKey,
    zeroForOne,
    exactAmount: amount,
    hookData: '0x' as const,
  }

  let attempt = 0

  while (attempt <= retries) {
    try {
      const sim = await publicClient.simulateContract({
        address: quoterAddress,
        abi: uniswapV4QuoterAbi,
        functionName: 'quoteExactInputSingle',
        args: [params],
      })

      const amountOut = (sim.result as any)?.[0] as bigint | undefined
      return typeof amountOut === 'bigint' && amountOut > 0n
    } catch (err: any) {
      //  Retry transient RPC errors
      if (isTransientRpcError(err) && attempt < retries) {
        const delay = Math.min(
          maxDelayMs,
          baseDelayMs * 2 ** attempt + Math.floor(Math.random() * 50)
        )
        attempt++
        await sleep(delay) // eslint-disable-line no-await-in-loop
        continue
      }

      //  Unknown error → treat as invalid (safe default)
      return false
    }
  }

  return false
}
