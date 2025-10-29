import { dataSource } from '@graphprotocol/graph-ts'

import { 
  Auction, 
  AuctionBid, 
  AuctionConfig, 
  DAO,
  AuctionCreatedEvent as AuctionCreatedFeedEvent,
  AuctionBidPlacedEvent as AuctionBidPlacedFeedEvent,
  AuctionSettledEvent as AuctionSettledFeedEvent
} from '../generated/schema'
import {
  AuctionBid as AuctionBidEvent,
  AuctionCreated as AuctionCreatedEvent,
  AuctionSettled as AuctionSettledEvent,
  DurationUpdated as DurationUpdatedEvent,
  MinBidIncrementPercentageUpdated as MinBidIncrementPercentageUpdatedEvent,
  ReservePriceUpdated as ReservePriceUpdatedEvent,
  TimeBufferUpdated as TimeBufferUpdatedEvent,
} from '../generated/templates/Auction/Auction'

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

  let dao = DAO.load(tokenAddress)
  if (dao == null) return

  dao.currentAuction = auction.id
  dao.save()
  
  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let feedEvent = new AuctionCreatedFeedEvent(feedEventId)
  feedEvent.type = "AUCTION_CREATED"
  feedEvent.dao = auction.dao
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = event.transaction.from
  feedEvent.auction = auction.id
  feedEvent.save()
}

export function handleAuctionSettled(event: AuctionSettledEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auction = Auction.load(`${tokenAddress}:${event.params.tokenId.toString()}`)
  if (auction == null) return

  auction.settled = true
  auction.winningBid = auction.highestBid
  auction.save()

  let dao = DAO.load(tokenAddress)
  if (dao == null) return

  dao.currentAuction = null
  if (auction.highestBid) {
    let bid = AuctionBid.load(auction.highestBid!)
    if (bid) {
      dao.totalAuctionSales = dao.totalAuctionSales.plus(bid.amount)
    }
  }
  dao.save()
  
  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let feedEvent = new AuctionSettledFeedEvent(feedEventId)
  feedEvent.type = "AUCTION_SETTLED"
  feedEvent.dao = auction.dao
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = event.transaction.from
  feedEvent.auction = auction.id
  feedEvent.winner = auction.winningBid ? AuctionBid.load(auction.winningBid!)!.bidder : event.transaction.from
  feedEvent.amount = auction.winningBid ? AuctionBid.load(auction.winningBid!)!.amount : event.params.amount
  feedEvent.save()
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

  let auction = Auction.load(`${tokenAddress}:${event.params.tokenId.toString()}`)
  if (auction == null) return

  if (auction.bidCount == 0) auction.firstBidTime = event.block.timestamp
  auction.bidCount = auction.bidCount + 1
  auction.highestBid = bid.id
  auction.extended = event.params.extended
  auction.endTime = event.params.endTime
  auction.save()
  
  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let feedEvent = new AuctionBidPlacedFeedEvent(feedEventId)
  feedEvent.type = "AUCTION_BID_PLACED"
  feedEvent.dao = auction.dao
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = bid.bidder
  feedEvent.auction = bid.auction
  feedEvent.bid = bid.id
  feedEvent.save()
}

export function handleDurationUpdated(event: DurationUpdatedEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auctionConfig = AuctionConfig.load(tokenAddress)
  if (auctionConfig == null) return

  auctionConfig.duration = event.params.duration
  auctionConfig.save()
}

export function handleReservePriceUpdated(event: ReservePriceUpdatedEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auctionConfig = AuctionConfig.load(tokenAddress)
  if (auctionConfig == null) return

  auctionConfig.reservePrice = event.params.reservePrice
  auctionConfig.save()
}

export function handleTimeBufferUpdated(event: TimeBufferUpdatedEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auctionConfig = AuctionConfig.load(tokenAddress)
  if (auctionConfig == null) return

  auctionConfig.timeBuffer = event.params.timeBuffer
  auctionConfig.save()
}

export function handleMinBidIncrementPercentageUpdated(
  event: MinBidIncrementPercentageUpdatedEvent
): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auctionConfig = AuctionConfig.load(tokenAddress)
  if (auctionConfig == null) return

  auctionConfig.minimumBidIncrement = event.params.minBidIncrementPercentage
  auctionConfig.save()
}
