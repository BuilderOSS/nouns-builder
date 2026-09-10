import { Address, dataSource } from '@graphprotocol/graph-ts'

import {
  Auction,
  AuctionBid,
  AuctionBidPlacedEvent as AuctionBidPlacedFeedEvent,
  AuctionConfig,
  AuctionCreatedEvent as AuctionCreatedFeedEvent,
  AuctionSettledEvent as AuctionSettledFeedEvent,
  DAO,
  DAOVoter,
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
import { parseAuctionBidComment } from './utils/parseAuctionBidComment'
import { getOrCreateProfile, touchProfile } from './utils/profile'

export function handleAuctionCreated(event: AuctionCreatedEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auction = new Auction(`${tokenAddress}:${event.params.tokenId.toString()}`)

  auction.dao = tokenAddress
  auction.startTime = event.params.startTime
  auction.endTime = event.params.endTime
  auction.extended = false
  auction.settled = false
  auction.createdTransactionHash = event.transaction.hash
  auction.bidCount = 0
  auction.token = `${tokenAddress}:${event.params.tokenId.toString()}`
  auction.save()

  let dao = DAO.load(tokenAddress)
  if (dao == null) return

  dao.currentAuction = auction.id
  dao.save()

  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let feedEvent = new AuctionCreatedFeedEvent(feedEventId)
  feedEvent.type = 'AUCTION_CREATED'
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
  auction.settledAt = event.block.timestamp
  auction.settledTransactionHash = event.transaction.hash
  auction.winningBid = auction.highestBid
  auction.save()

  let dao = DAO.load(tokenAddress)
  if (dao == null) return

  let winningBidEntity = auction.winningBid ? AuctionBid.load(auction.winningBid!) : null
  let winnerAddress = winningBidEntity
    ? Address.fromBytes(winningBidEntity.bidder)
    : event.transaction.from
  let winnerBytes = winningBidEntity ? winningBidEntity.bidder : event.transaction.from
  let winnerProfile = getOrCreateProfile(winnerAddress, event.block.timestamp)

  dao.currentAuction = null
  if (auction.highestBid) {
    let bid = AuctionBid.load(auction.highestBid!)
    if (bid) {
      dao.totalAuctionSales = dao.totalAuctionSales.plus(bid.amount)
    }
  }
  dao.save()

  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let feedEvent = new AuctionSettledFeedEvent(feedEventId)
  feedEvent.type = 'AUCTION_SETTLED'
  feedEvent.dao = auction.dao
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = event.transaction.from
  feedEvent.auction = auction.id

  feedEvent.winner = winnerBytes

  feedEvent.amount = winningBidEntity ? winningBidEntity.amount : event.params.amount
  feedEvent.save()

  // Update profile counts and timestamps
  touchProfile(winnerProfile, event.block.timestamp)
  winnerProfile.auctionWinsCount = winnerProfile.auctionWinsCount + 1
  winnerProfile.save()

  // Update DAO-specific voter activity
  let winnerVoterId = `${tokenAddress}:${winnerAddress.toHexString()}`
  let winnerVoter = DAOVoter.load(winnerVoterId)
  if (winnerVoter) {
    winnerVoter.lastActiveAt = event.block.timestamp
    winnerVoter.save()
  }
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
  bid.comment = parseAuctionBidComment(event.transaction.input)
  bid.auction = `${tokenAddress}:${event.params.tokenId.toString()}`
  bid.bidTime = event.block.timestamp
  bid.save()

  let auction = Auction.load(`${tokenAddress}:${event.params.tokenId.toString()}`)
  if (auction == null) return

  let bidderProfile = getOrCreateProfile(event.params.bidder, event.block.timestamp)

  if (auction.bidCount == 0) auction.firstBidTime = event.block.timestamp
  auction.bidCount = auction.bidCount + 1
  auction.highestBid = bid.id
  auction.extended = event.params.extended
  auction.endTime = event.params.endTime
  auction.save()

  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let feedEvent = new AuctionBidPlacedFeedEvent(feedEventId)
  feedEvent.type = 'AUCTION_BID_PLACED'
  feedEvent.dao = auction.dao
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = bid.bidder
  feedEvent.auction = bid.auction
  feedEvent.bid = bid.id
  feedEvent.save()

  // Update profile counts and timestamps
  touchProfile(bidderProfile, event.block.timestamp)
  bidderProfile.bidsPlacedCount = bidderProfile.bidsPlacedCount + 1
  bidderProfile.save()

  // Update DAO-specific voter activity
  let bidderVoterId = `${tokenAddress}:${event.params.bidder.toHexString()}`
  let bidderVoter = DAOVoter.load(bidderVoterId)
  if (bidderVoter) {
    bidderVoter.lastActiveAt = event.block.timestamp
    bidderVoter.save()
  }
}

export function handleDurationUpdated(event: DurationUpdatedEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auctionConfig = AuctionConfig.load(tokenAddress)
  if (auctionConfig == null) return

  auctionConfig.duration = event.params.duration
  auctionConfig.lastUpdatedAt = event.block.timestamp
  auctionConfig.lastUpdatedTransactionHash = event.transaction.hash
  auctionConfig.save()
}

export function handleReservePriceUpdated(event: ReservePriceUpdatedEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auctionConfig = AuctionConfig.load(tokenAddress)
  if (auctionConfig == null) return

  auctionConfig.reservePrice = event.params.reservePrice
  auctionConfig.lastUpdatedAt = event.block.timestamp
  auctionConfig.lastUpdatedTransactionHash = event.transaction.hash
  auctionConfig.save()
}

export function handleTimeBufferUpdated(event: TimeBufferUpdatedEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let auctionConfig = AuctionConfig.load(tokenAddress)
  if (auctionConfig == null) return

  auctionConfig.timeBuffer = event.params.timeBuffer
  auctionConfig.lastUpdatedAt = event.block.timestamp
  auctionConfig.lastUpdatedTransactionHash = event.transaction.hash
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
  auctionConfig.lastUpdatedAt = event.block.timestamp
  auctionConfig.lastUpdatedTransactionHash = event.transaction.hash
  auctionConfig.save()
}
