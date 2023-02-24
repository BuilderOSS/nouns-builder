import { toSeconds } from 'src/utils/helpers'
import { allocationProps, AuctionDuration, auctionSettingsProps } from 'src/modules/create';

export const formatAuctionDuration = (duration: AuctionDuration): string => {
  const days = `${duration.days || '0'} ${Number(duration.days) === 1 ? 'day' : 'days'}`
  const hours = `${duration.hours || '0'} ${
    Number(duration.hours) === 1 ? 'hour' : 'hours'
  }`
  const minutes = `${duration.minutes || '0'} ${
    Number(duration.minutes) === 1 ? 'minute' : 'minutes'
  }`

  return `${days}, ${hours} & ${minutes}`
}

export const calculateMaxAllocation = (
  allocation: string | number,
  end: string | number,
  auctionDuration: auctionSettingsProps['auctionDuration']
) => {
  const auctionDurationInSeconds = toSeconds(auctionDuration)
  const endDate = new Date(end).getTime()
  const now = new Date().getTime()
  const diffInSeconds = Math.abs((endDate - now) / 1000)
  const frequency = Number(allocation)
  const numberOfAuctionsTilEndDate = diffInSeconds / auctionDurationInSeconds

  return Math.floor(numberOfAuctionsTilEndDate * (frequency / 100))
}

export const formatFounderAllocation = ({
  founderAddress,
  allocation,
  endDate,
}: allocationProps): string => {
  return `${founderAddress} will receive ${allocation}% of Tokens, until ${endDate}.`
}
