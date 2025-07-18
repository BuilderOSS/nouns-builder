import { SDK } from '../client'
import { CHAIN_ID } from '@buildeross/types'
import { Address } from 'viem'

export const averageWinningBid = async (chainId: CHAIN_ID, tokenAddress: Address) => {
  const history = await SDK.connect(chainId).auctionHistory({
    daoId: tokenAddress.toLowerCase(),
    startTime: 0,
    first: 5,
  })

  const nonZeroAuctions = history.dao?.auctions.filter(
    (x) => x.winningBid?.amount && BigInt(x.winningBid?.amount) > 0n,
  )

  if (!nonZeroAuctions?.length) return BigInt(0)

  const auctionSum =
    nonZeroAuctions
      .map((x) => BigInt(x.winningBid?.amount || 0))
      .reduce((acc, bid) => {
        return acc + bid
      }) || 0n

  return auctionSum / BigInt(nonZeroAuctions.length)
}
