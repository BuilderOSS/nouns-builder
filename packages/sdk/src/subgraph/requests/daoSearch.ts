import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import { Dao_Filter } from '../sdk.generated'
import { type ExploreDaoWithChainId } from './exploreQueries'

export type SearchDaosResponse = {
  daos: ExploreDaoWithChainId[]
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

    const data = await SDK.connect(chainId).exploreDaosSearch({
      text,
      skip,
      first,
      where,
    })

    return {
      daos: data.daoSearch.map((dao) => ({
        dao: {
          name: dao.name,
          contractImage: dao.contractImage,
          tokenAddress: dao.tokenAddress,
        },
        chainId,
        ...dao.currentAuction,
      })) as Array<ExploreDaoWithChainId>,
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
