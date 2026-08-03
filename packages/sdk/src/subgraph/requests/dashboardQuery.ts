import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { isAddress } from 'viem'

import { SDK } from '../client'
import type { DaosForDashboardQuery } from '../sdk.generated'

export type DashboardDao = DaosForDashboardQuery['daos'][number] & {
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
          .daosForDashboard({
            user: memberAddress.toLowerCase(),
            first: 30,
          })
          .then((x) => ({ ...x, chainId: chain.id }))
      )
    )

    const data = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)

    return data
      .map((queries) =>
        queries.daos.map((dao) => ({
          ...dao,
          chainId: queries.chainId,
        }))
      )
      .flat()
      .sort((a, b) => a.name.localeCompare(b.name))
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
