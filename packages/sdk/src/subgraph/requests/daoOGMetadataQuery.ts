import { AddressType, CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'

export interface DaoOGMetadataResponse {
  name: string
  description: string
  contractImage: string
  totalSupply: number
  ownerCount: number
  proposalCount: number
  tokenAddress: string
  metadataAddress: string
  auctionAddress: string
  treasuryAddress: string
  governorAddress: string
}

export const daoOGMetadataRequest = async (
  chainId: CHAIN_ID,
  tokenAddress: AddressType
): Promise<DaoOGMetadataResponse | null> => {
  try {
    const data = await SDK.connect(chainId).daoOGMetadata({
      tokenAddress: tokenAddress.toLowerCase(),
    })

    if (!data.dao) return null

    return data.dao
  } catch (e: any) {
    console.error('Error fetching DAO OG metadata:', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return null
  }
}
