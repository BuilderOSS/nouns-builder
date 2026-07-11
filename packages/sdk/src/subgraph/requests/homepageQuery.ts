import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import { Auction_Filter } from '../sdk.generated'

type AuctionDao = {
  name: string
  auctionAddress: string
  tokenAddress: string
}

export const highestBidsRequest = async (
  chainId: CHAIN_ID
): Promise<{
  data: AuctionDao[]
  statusCode: number
}> => {
  let daos: AuctionDao[] = []
  let statusCode = null

  try {
    const now = Math.floor(Date.now() / 1000)
    const maxEnd = now + 60 * 60 * 24 * 30 // 30 days from now

    const where: Auction_Filter = {
      settled: false,
      endTime_gt: now,
      endTime_lt: maxEnd, // Prevents auctions with bugged timestamps
    }

    // filter spam daos from L2
    if (
      chainId === CHAIN_ID.BASE ||
      chainId === CHAIN_ID.ZORA ||
      chainId === CHAIN_ID.OPTIMISM
    ) {
      const first = 30
      const activeDaos = await SDK.connect(chainId).activeDaos({
        first,
        where: { totalAuctionSales_gt: '1000000000000000' },
      })

      // If we have less than one explore page of active daos, we apply the filter
      if (activeDaos.daos.length !== first)
        where.dao_in = activeDaos.daos.map((x) => x.id)
    }

    const data = await SDK.connect(chainId).activeAuctions({
      first: 3,
      where,
    })
    daos = data?.auctions.map((auction) => auction.dao)
  } catch (e: any) {
    console.error(e)
    daos = []
    statusCode = e.response.status
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
  }

  return { data: daos, statusCode }
}
