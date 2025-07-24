import { CHAIN_ID } from '@buildeross/types'
import * as Sentry from '@sentry/nextjs'
import { formatEther } from 'viem'

import { SDK } from '../client'
import { AuctionBidFragment } from '../sdk.generated'

export const getBids = async (chainId: CHAIN_ID, collection: string, tokenId: string) => {
  try {
    return SDK.connect(chainId)
      .auctionBids({ id: `${collection.toLowerCase()}:${tokenId}` })
      .then((x) =>
        x.auction?.bids?.map((bid: AuctionBidFragment) => ({
          ...bid,
          amount: formatEther(bid.amount),
        })),
      )
  } catch (error) {
    console.error(error)
    Sentry.captureException(error)
    await Sentry.flush(2000)
    return undefined
  }
}
