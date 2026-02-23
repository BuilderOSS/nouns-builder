import { CHAIN_ID } from '@buildeross/types'
import { isAddress } from 'viem'

import { SDK } from '../client'
import type { ZoraDropFragment } from '../sdk.generated'

export type DaoZoraDropsResponse = ZoraDropFragment[]

export const daoZoraDropsRequest = async (
  daoAddress: string,
  chainId: CHAIN_ID,
  first: number = 10
): Promise<DaoZoraDropsResponse> => {
  if (!daoAddress) throw new Error('No DAO address provided')
  if (!isAddress(daoAddress)) throw new Error('Invalid DAO address')

  try {
    const data = await SDK.connect(chainId).daoZoraDrops({
      daoId: daoAddress.toLowerCase(),
      first,
    })

    return data.dao?.zoraDrops || []
  } catch (e: any) {
    console.error('Error fetching DAO ZoraDrops:', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return []
  }
}

export const zoraDropRequest = async (
  dropAddress: string,
  chainId: CHAIN_ID
): Promise<ZoraDropFragment | null> => {
  if (!dropAddress) throw new Error('No drop address provided')
  if (!isAddress(dropAddress)) throw new Error('Invalid drop address')

  try {
    const data = await SDK.connect(chainId).zoraDrop({
      dropAddress: dropAddress.toLowerCase(),
    })

    return data.zoraDrop || null
  } catch (e: any) {
    console.error('Error fetching ZoraDrop:', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return null
  }
}
