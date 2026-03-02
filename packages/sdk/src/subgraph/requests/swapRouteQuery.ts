import { CHAIN_ID } from '@buildeross/types'
import { isAddress } from 'viem'

import { SDK } from '../client'
import type { SwapRouteFragment } from '../sdk.generated'

export const swapRouteRequest = async (
  coinAddress: string,
  chainId: CHAIN_ID
): Promise<SwapRouteFragment | null> => {
  if (!coinAddress) throw new Error('No coin address provided')
  if (!isAddress(coinAddress)) throw new Error('Invalid coin address')

  try {
    const data = await SDK.connect(chainId).swapRoute({
      coinAddress: coinAddress.toLowerCase(),
    })

    return data.swapRoute || null
  } catch (e: any) {
    console.error('Error fetching swap route:', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return null
  }
}
