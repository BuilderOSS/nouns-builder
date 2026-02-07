import { CHAIN_ID } from '@buildeross/types'
import { isAddress } from 'viem'

import { SDK } from '../client'
import type { ClankerTokenFragment } from '../sdk.generated'

export type DaoClankerTokensResponse = ClankerTokenFragment[]

export const daoClankerTokensRequest = async (
  daoAddress: string,
  chainId: CHAIN_ID,
  first: number = 10
): Promise<DaoClankerTokensResponse> => {
  if (!daoAddress) throw new Error('No DAO address provided')
  if (!isAddress(daoAddress)) throw new Error('Invalid DAO address')

  try {
    const data = await SDK.connect(chainId).daoClankerTokens({
      daoId: daoAddress.toLowerCase(),
      first,
    })

    return data.dao?.clankerTokens || []
  } catch (e: any) {
    console.error('Error fetching DAO ClankerTokens:', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return []
  }
}

export const clankerTokenRequest = async (
  tokenAddress: string,
  chainId: CHAIN_ID
): Promise<ClankerTokenFragment | null> => {
  if (!tokenAddress) throw new Error('No token address provided')
  if (!isAddress(tokenAddress)) throw new Error('Invalid token address')

  try {
    const data = await SDK.connect(chainId).clankerToken({
      tokenAddress: tokenAddress.toLowerCase(),
    })

    return data.clankerToken || null
  } catch (e: any) {
    console.error('Error fetching ClankerToken:', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return null
  }
}
