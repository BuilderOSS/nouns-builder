import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import { Auction_OrderBy, OrderDirection } from '../sdk.generated'

export const auctionHistoryRequest = async (
  chainId: CHAIN_ID,
  collectionAddress: string,
  startTime: number,
) => {
  try {
    const data = await SDK.connect(chainId).auctionHistory({
      startTime,
      daoId: collectionAddress,
      orderDirection: OrderDirection.Asc,
      orderBy: Auction_OrderBy.EndTime,
      first: 1000,
    })

    return data
  } catch (error) {
    console.error(error)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(error)
      await sentry.flush(2000)
    } catch (_) {}
  }
}
