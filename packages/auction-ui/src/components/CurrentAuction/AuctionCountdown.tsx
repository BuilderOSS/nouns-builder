import { Countdown } from '@buildeross/ui/Countdown'

import { AuctionDetail } from '../AuctionDetail'

export const AuctionCountdown = ({
  endTime,
  onEnd,
}: {
  endTime: number
  onEnd: () => void
}) => {
  return (
    <AuctionDetail title="Auction ends in">
      <Countdown end={endTime} onEnd={onEnd} />
    </AuctionDetail>
  )
}
