import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import { Dao_Filter } from '../sdk.generated'
import { MIN_BID_AMOUNT } from './exploreQueries'

export type DaoSearchResult = {
  chainId: CHAIN_ID
  endTime?: any
  dao: {
    name: string
    symbol: string
    description: string
    projectURI: string
    tokenAddress: any
  }
  highestBid?: { amount: any; bidder: any } | null
  token?: { name: string; image?: string | null; tokenId: any }
}
export type SearchDaosResponse = {
  daos: DaoSearchResult[]
  hasNextPage: boolean
}

export const searchDaosRequest = async (
  chainId: CHAIN_ID,
  text: string,
  limit: number,
  skip: number
): Promise<SearchDaosResponse | undefined> => {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Limit must be an integer between 1 and 100')
  }
  if (!Number.isInteger(skip) || skip < 0) {
    throw new Error('Skip must be a non-negative integer')
  }
  try {
    const queryText = text?.trim() ?? ''
    if (!queryText) {
      return { daos: [], hasNextPage: false }
    }
    let where: Dao_Filter | undefined = undefined

    // Filter DAOs with at least one token minted
    where = { totalSupply_gt: 0 }

    // Additionally filter spam DAOs from L2
    if (
      chainId === CHAIN_ID.BASE ||
      chainId === CHAIN_ID.ZORA ||
      chainId === CHAIN_ID.OPTIMISM
    ) {
      where = { totalSupply_gt: 0, totalAuctionSales_gt: MIN_BID_AMOUNT.toString() }
    }

    const fetchLimit = limit + 1

    const data = await SDK.connect(chainId).exploreDaosSearch({
      text: queryText,
      skip,
      first: fetchLimit,
      where,
    })

    const hasNextPage = data.daoSearch.length > limit
    const limitedData = hasNextPage ? data.daoSearch.slice(0, limit) : data.daoSearch

    return {
      daos: limitedData.map((dao) => {
        // Get the latest token (highest tokenId)
        const latestToken = dao.tokens[0]

        return {
          dao: {
            name: dao.name,
            symbol: dao.symbol,
            description: dao.description,
            projectURI: dao.projectURI,
            tokenAddress: dao.tokenAddress,
          },
          chainId,
          // Spread token and auction data if it exists
          ...(latestToken && {
            token: {
              name: latestToken.name,
              image: latestToken.image,
              tokenId: latestToken.tokenId,
            },
            // Include auction data if auction exists (regardless of settled status)
            ...(latestToken.auction && {
              endTime: latestToken.auction.endTime,
              highestBid: latestToken.auction.highestBid,
            }),
          }),
        }
      }) as Array<DaoSearchResult>,
      hasNextPage,
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
