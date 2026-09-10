import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { isAddress } from 'viem'

import { SDK } from '../client'
import type { DaosForDashboardViaProfileQuery } from '../sdk.generated'

type ProfileData = NonNullable<DaosForDashboardViaProfileQuery['profile']>
type DaoFromOwnerDaos = ProfileData['ownerDaos'][number]['dao']
type DaoFromVoterDaos = ProfileData['voterDaos'][number]['dao']

export type DashboardDao = (DaoFromOwnerDaos | DaoFromVoterDaos) & {
  chainId: CHAIN_ID
}

export const dashboardRequest = async (
  memberAddress: string
): Promise<DashboardDao[]> => {
  try {
    if (!memberAddress) throw new Error('No user address provided')

    if (!isAddress(memberAddress)) throw new Error('Invalid user address')

    if (memberAddress.toLowerCase() === '0x0000000000000000000000000000000000000000')
      throw new Error('Zero address not allowed')

    const results = await Promise.allSettled(
      PUBLIC_DEFAULT_CHAINS.map((chain) =>
        SDK.connect(chain.id)
          .daosForDashboardViaProfile({
            user: memberAddress.toLowerCase(),
            firstOwner: 50,
            firstVoter: 50,
          })
          .then((x) => ({ ...x, chainId: chain.id }))
      )
    )

    const data = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)

    // If all requests failed, throw an error instead of returning empty results
    if (data.length === 0 && results.length > 0) {
      const rejectedReasons = results
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason)

      const firstError = rejectedReasons[0]
      throw new Error(
        firstError?.message || 'All dashboard queries failed across default chains'
      )
    }

    // Combine ownerDaos and voterDaos, deduplicate by tokenAddress
    const daoMap = new Map<string, DashboardDao>()

    for (const chainData of data) {
      if (!chainData.profile) continue // User has no activity on this chain

      // Add DAOs where user is an owner
      for (const ownerDao of chainData.profile.ownerDaos) {
        const key = `${chainData.chainId}:${ownerDao.dao.tokenAddress}`
        daoMap.set(key, {
          ...ownerDao.dao,
          chainId: chainData.chainId,
        })
      }

      // Add DAOs where user is a voter (skip if already added as owner)
      for (const voterDao of chainData.profile.voterDaos) {
        const key = `${chainData.chainId}:${voterDao.dao.tokenAddress}`
        if (!daoMap.has(key)) {
          daoMap.set(key, {
            ...voterDao.dao,
            chainId: chainData.chainId,
          })
        }
      }
    }

    return Array.from(daoMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  } catch (e: any) {
    console.error(e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    throw new Error(
      e?.message
        ? `Goldsky Request Error: ${e.message}`
        : 'Error fetching dashboard data from Goldsky subgraph.'
    )
  }
}
