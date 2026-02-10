import { CHAIN_ID } from '@buildeross/types'
import { isAddress } from 'viem'

import { SDK } from '../client'
import type { ClankerTokenFragment } from '../sdk.generated'

export type DaoClankerTokensResponse = ClankerTokenFragment[]

export type DaosWithClankerTokensResponse = Record<string, boolean>

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

export const daosWithClankerTokensRequest = async (
  daoAddresses: string[],
  chainId: CHAIN_ID
): Promise<DaosWithClankerTokensResponse> => {
  if (!daoAddresses || daoAddresses.length === 0) {
    return {}
  }

  // Validate all addresses
  const invalidAddress = daoAddresses.find((addr) => !isAddress(addr))
  if (invalidAddress) {
    throw new Error(`Invalid DAO address: ${invalidAddress}`)
  }

  try {
    const daoIds = daoAddresses.map((addr) => addr.toLowerCase())
    const data = await SDK.connect(chainId).daosWithClankerTokens({
      daoIds,
    })

    // Create a map of DAO address to whether it has clanker tokens
    const result: DaosWithClankerTokensResponse = {}

    // Initialize all DAOs to false
    daoIds.forEach((id) => {
      result[id] = false
    })

    // Mark DAOs that have clanker tokens as true
    data.daos.forEach((dao) => {
      if (dao.clankerTokens && dao.clankerTokens.length > 0) {
        result[dao.id.toLowerCase()] = true
      }
    })

    return result
  } catch (e: any) {
    console.error('Error fetching DAOs with ClankerTokens:', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return {}
  }
}
