import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import { Dao_Filter } from '../sdk.generated'
import { type ExploreDaoWithChainId } from './exploreQueries'

export type SearchDaosResponse = {
  daos: ExploreDaoWithChainId[]
  hasNextPage: boolean
}

export const searchDaosRequest = async (
  chainId: CHAIN_ID,
  text: string,
  first: number,
  skip: number
): Promise<SearchDaosResponse | undefined> => {
  try {
    let where: Dao_Filter | undefined = undefined

    // filter spam daos from L2
    if (
      chainId === CHAIN_ID.BASE ||
      chainId === CHAIN_ID.ZORA ||
      chainId === CHAIN_ID.OPTIMISM
    ) {
      where = { totalAuctionSales_gt: '1000000000000000' }
    }

    const fetchLimit = first + 1

    const data = await SDK.connect(chainId).exploreDaosSearch({
      text,
      skip,
      first: fetchLimit,
      where,
    })

    const hasNextPage = data.daoSearch.length > first
    const limitedData = hasNextPage ? data.daoSearch.slice(0, first) : data.daoSearch

    return {
      daos: limitedData.map((dao) => ({
        dao: {
          name: dao.name,
          contractImage: dao.contractImage,
          tokenAddress: dao.tokenAddress,
        },
        chainId,
        ...dao.currentAuction,
      })) as Array<ExploreDaoWithChainId>,
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
