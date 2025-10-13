import { Duration } from '@buildeross/types'

import { toSeconds } from './helpers'

export const calculateMaxAllocation = (
  allocation: string | number,
  end: string | number,
  auctionDuration: Duration
) => {
  const auctionDurationInSeconds = toSeconds(auctionDuration)
  if (!Number.isFinite(auctionDurationInSeconds) || auctionDurationInSeconds <= 0) {
    return 0
  }
  const endMs = new Date(end).getTime()
  const nowMs = Date.now()
  const diffInSeconds = Math.max(0, Math.floor((endMs - nowMs) / 1000))
  const frequency = Number(allocation)
  if (!Number.isFinite(frequency) || frequency <= 0) return 0
  const numberOfAuctionsTilEndDate = Math.floor(diffInSeconds / auctionDurationInSeconds)
  return Math.floor(numberOfAuctionsTilEndDate * (frequency / 100))
}
