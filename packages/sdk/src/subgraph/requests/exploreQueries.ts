import { CHAIN_ID } from '@buildeross/types'
import { parseEther } from 'viem'

import { SDK } from '../client'
import {
  Auction_Filter,
  Auction_OrderBy,
  ExploreDaoFragment,
  OrderDirection,
} from '../sdk.generated'
import { myDaosRequest, MyDaosResponse } from './daoQuery'

export type ExploreDaoWithChainId = ExploreDaoFragment & { chainId: CHAIN_ID }

export interface ExploreDaosResponse {
  daos: ExploreDaoWithChainId[]
  hasNextPage: boolean
}

export const MIN_BID_AMOUNT = parseEther('0.001')

export const exploreMyDaosRequest = async (
  memberAddress: string
): Promise<ExploreDaosResponse | undefined> => {
  try {
    const userDaos: MyDaosResponse = await myDaosRequest(memberAddress)

    const daoChains = new Set(userDaos.map((x) => x.chainId))

    const data = await Promise.all(
      Array.from(daoChains).map(async (chainId) => {
        const daosByChain = userDaos
          .filter((x) => x.chainId === chainId)
          .map((x) => x.collectionAddress)
        const res = await SDK.connect(chainId).findAuctionsForDaos({ daos: daosByChain })
        return res.auctions.map((x) => ({ ...x, chainId }))
      })
    )

    const auctions = data.flat().sort((a, b) => a.dao.name.localeCompare(b.dao.name))
    return { daos: auctions, hasNextPage: false }
  } catch (error) {
    console.error(error)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(error)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return undefined
  }
}

export const exploreDaosRequest = async (
  chainId: CHAIN_ID,
  limit: number,
  skip: number,
  orderBy: Auction_OrderBy = Auction_OrderBy.StartTime
): Promise<ExploreDaosResponse | undefined> => {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Limit must be an integer between 1 and 100')
  }
  if (!Number.isInteger(skip) || skip < 0) {
    throw new Error('Skip must be a non-negative integer')
  }
  try {
    const orderDirection =
      orderBy === Auction_OrderBy.EndTime ? OrderDirection.Asc : OrderDirection.Desc

    const where: Auction_Filter = {
      settled: false,
    }

    const fetchLimit = limit + 1

    // filter spam daos from L2
    if (
      chainId === CHAIN_ID.BASE ||
      chainId === CHAIN_ID.ZORA ||
      chainId === CHAIN_ID.OPTIMISM
    ) {
      const activeDaos = await SDK.connect(chainId).activeDaos({
        first: fetchLimit,
        where: { totalAuctionSales_gt: MIN_BID_AMOUNT.toString() },
      })

      // If we have less than one explore page of active daos, we apply the filter
      if (activeDaos.daos.length < fetchLimit) {
        where.dao_in = activeDaos.daos.map((x) => x.id)
      }
    }

    if (orderBy === Auction_OrderBy.HighestBidAmount) where.bidCount_gt = 0
    if (orderBy === Auction_OrderBy.EndTime)
      where.endTime_gt = Math.floor(Date.now() / 1000)

    const data = await SDK.connect(chainId).findAuctions({
      orderBy,
      orderDirection,
      where,
      skip,
      first: fetchLimit,
    })

    if (!data.auctions) return undefined

    const hasNextPage = data.auctions.length > limit
    const limitedAuctions = hasNextPage ? data.auctions.slice(0, limit) : data.auctions
    return {
      daos: limitedAuctions.map((x) => ({ ...x, chainId })),
      hasNextPage: hasNextPage,
    }
  } catch (error) {
    console.error(error)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(error)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return undefined
  }
}
