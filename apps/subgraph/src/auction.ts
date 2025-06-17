import { Auction, AuctionBid, AuctionConfig, DAO } from '../generated/schema'
import {
  AuctionBid as AuctionBidEvent,
  AuctionCreated as AuctionCreatedEvent,
  AuctionSettled as AuctionSettledEvent,
  DurationUpdated as DurationUpdatedEvent,
  MinBidIncrementPercentageUpdated as MinBidIncrementPercentageUpdatedEvent,
  ReservePriceUpdated as ReservePriceUpdatedEvent,
  TimeBufferUpdated as TimeBufferUpdatedEvent,
} from '../generated/templates/Auction/Auction'
import { dataSource } from '@graphprotocol/graph-ts'

export function handleAuctionCreated(event: AuctionCreatedEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auction = new Auction(`${tokenAddress}:${event.params.tokenId.toString()}`)

  auction.dao = tokenAddress
  auction.startTime = event.params.startTime
  auction.endTime = event.params.endTime
  auction.extended = false
  auction.settled = false
  auction.bidCount = 0
  auction.token = `${tokenAddress}:${event.params.tokenId.toString()}`
  auction.save()

  let dao = DAO.load(tokenAddress)!
  dao.currentAuction = auction.id
  dao.save()
}

export function handleAuctionSettled(event: AuctionSettledEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auction = Auction.load(`${tokenAddress}:${event.params.tokenId.toString()}`)!

  auction.settled = true
  auction.winningBid = auction.highestBid
  auction.save()

  let dao = DAO.load(tokenAddress)!
  dao.currentAuction = null
  if (auction.highestBid) {
    let bid = AuctionBid.load(auction.highestBid!)!
    dao.totalAuctionSales = dao.totalAuctionSales.plus(bid.amount)
  }
  dao.save()
}

export function handleAuctionBid(event: AuctionBidEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')

  let bid = new AuctionBid(
    `${event.transaction.hash.toHexString()}:${event.logIndex.toString()}`
  )

  bid.transactionHash = event.transaction.hash
  bid.amount = event.params.amount
  bid.bidder = event.params.bidder
  bid.auction = `${tokenAddress}:${event.params.tokenId.toString()}`
  bid.bidTime = event.block.timestamp
  bid.save()

  let auction = Auction.load(`${tokenAddress}:${event.params.tokenId.toString()}`)!
  if (auction.bidCount === 0) auction.firstBidTime = event.block.timestamp
  auction.bidCount = auction.bidCount + 1
  auction.highestBid = bid.id
  auction.extended = event.params.extended
  auction.endTime = event.params.endTime
  auction.save()
}

export function handleDurationUpdated(event: DurationUpdatedEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auctionConfig = AuctionConfig.load(tokenAddress)!

  auctionConfig.duration = event.params.duration
  auctionConfig.save()
}

export function handleReservePriceUpdated(event: ReservePriceUpdatedEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auctionConfig = AuctionConfig.load(tokenAddress)!

  auctionConfig.reservePrice = event.params.reservePrice
  auctionConfig.save()
}

export function handleTimeBufferUpdated(event: TimeBufferUpdatedEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auctionConfig = AuctionConfig.load(tokenAddress)!

  auctionConfig.timeBuffer = event.params.timeBuffer
  auctionConfig.save()
}

export function handleMinBidIncrementPercentageUpdated(
  event: MinBidIncrementPercentageUpdatedEvent
): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auctionConfig = AuctionConfig.load(tokenAddress)!

  auctionConfig.minimumBidIncrement = event.params.minBidIncrementPercentage
  auctionConfig.save()
}
