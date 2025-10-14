import { formatEther } from 'viem'

const DEFAULT_MIN_BID_AMOUNT = 0.0001

export const useMinBidIncrement = ({
  highestBid,
  reservePrice,
  minBidIncrement,
}: {
  highestBid?: bigint
  reservePrice?: bigint
  minBidIncrement?: bigint
}) => {
  if (
    reservePrice === undefined ||
    minBidIncrement === undefined ||
    // force default min bid amount given reserve price of 0 and no current bids
    (reservePrice === BigInt(0) && highestBid === BigInt(0))
  ) {
    return {
      minBidAmount: DEFAULT_MIN_BID_AMOUNT,
    }
  }

  if (!highestBid || highestBid === BigInt(0)) {
    return {
      minBidAmount: Number(formatEther(reservePrice)),
    }
  }

  const minBidRawAmount = (highestBid * minBidIncrement) / BigInt(100) + highestBid
  const minBidFormattedAmount = Number(formatEther(minBidRawAmount))

  return {
    minBidAmount: minBidFormattedAmount,
  }
}
