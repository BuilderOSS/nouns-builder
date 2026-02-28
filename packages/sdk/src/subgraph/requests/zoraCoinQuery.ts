import { CHAIN_ID } from '@buildeross/types'
import { isAddress } from 'viem'

import { SDK } from '../client'
import type { ZoraCoinFragment } from '../sdk.generated'

export type DaoZoraCoinsResponse = ZoraCoinFragment[]

export const daoZoraCoinsRequest = async (
  daoAddress: string,
  chainId: CHAIN_ID,
  first: number = 100
): Promise<DaoZoraCoinsResponse> => {
  if (!daoAddress) throw new Error('No DAO address provided')
  if (!isAddress(daoAddress)) throw new Error('Invalid DAO address')

  try {
    const data = await SDK.connect(chainId).daoZoraCoins({
      daoId: daoAddress.toLowerCase(),
      first,
    })

    return data.dao?.zoraCoins || []
  } catch (e: any) {
    console.error('Error fetching DAO ZoraCoins:', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return []
  }
}

export const zoraCoinRequest = async (
  coinAddress: string,
  chainId: CHAIN_ID
): Promise<ZoraCoinFragment | null> => {
  if (!coinAddress) throw new Error('No coin address provided')
  if (!isAddress(coinAddress)) throw new Error('Invalid coin address')

  try {
    const data = await SDK.connect(chainId).zoraCoin({
      coinAddress: coinAddress.toLowerCase(),
    })

    return data.zoraCoin || null
  } catch (e: any) {
    console.error('Error fetching ZoraCoin:', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return null
  }
}
