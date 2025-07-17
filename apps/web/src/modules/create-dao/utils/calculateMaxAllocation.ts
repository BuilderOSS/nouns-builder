import { Duration } from '@buildeross/types'

import { toSeconds } from 'src/utils/helpers'

export const calculateMaxAllocation = (
  allocation: string | number,
  end: string | number,
  auctionDuration: Duration
) => {
  const auctionDurationInSeconds = toSeconds(auctionDuration)
  const endDate = new Date(end).getTime()
  const now = new Date().getTime()
  const diffInSeconds = Math.abs((endDate - now) / 1000)
  const frequency = Number(allocation)
  const numberOfAuctionsTilEndDate = diffInSeconds / auctionDurationInSeconds

  return Math.floor(numberOfAuctionsTilEndDate * (frequency / 100))
}
