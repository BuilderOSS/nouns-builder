import {
  Address,
  BigInt,
  Bytes,
  DataSourceContext,
  ethereum,
} from '@graphprotocol/graph-ts'
import {
  assert,
  clearStore,
  dataSourceMock,
  describe,
  newTypedMockEvent,
  test,
} from 'matchstick-as'

import {
  Auction,
  AuctionBid as AuctionBidEntity,
  AuctionConfig,
  DAO,
} from '../generated/schema'
import { AuctionBid as AuctionBidEvent } from '../generated/templates/Auction/Auction'
import { handleAuctionBid } from '../src/auction'
import { parseAuctionBidComment } from '../src/utils/parseAuctionBidComment'

const TOKEN_ADDRESS = '0x00000000000000000000000000000000000000aa'
const AUCTION_ADDRESS = '0x00000000000000000000000000000000000000bb'
const BIDDER_ADDRESS = '0x00000000000000000000000000000000000000cc'

const CREATE_BID_SELECTOR = '659dd2b4'
const CREATE_BID_WITH_REFERRAL_SELECTOR = 'c0d5bb8b'
const TOKEN_ID_WORD = '0000000000000000000000000000000000000000000000000000000000000001'
const REFERRAL_WORD = '00000000000000000000000000000000000000000000000000000000000000dd'

function setupDataSourceContext(): void {
  const context = new DataSourceContext()
  context.setString('tokenAddress', TOKEN_ADDRESS)
  dataSourceMock.setAddressAndContext(AUCTION_ADDRESS, context)
}

function seedDaoAndAuction(): void {
  const auctionConfig = new AuctionConfig(TOKEN_ADDRESS)
  auctionConfig.duration = BigInt.fromI32(1)
  auctionConfig.reservePrice = BigInt.fromI32(1)
  auctionConfig.timeBuffer = BigInt.fromI32(1)
  auctionConfig.minimumBidIncrement = BigInt.fromI32(1)
  auctionConfig.save()

  const dao = new DAO(TOKEN_ADDRESS)
  dao.name = 'Test DAO'
  dao.symbol = 'TEST'
  dao.totalSupply = 0
  dao.description = 'test'
  dao.contractImage = 'ipfs://test'
  dao.projectURI = 'https://example.com'
  dao.tokenAddress = Address.fromString(TOKEN_ADDRESS)
  dao.metadataAddress = Address.fromString(TOKEN_ADDRESS)
  dao.auctionAddress = Address.fromString(AUCTION_ADDRESS)
  dao.treasuryAddress = Address.fromString(TOKEN_ADDRESS)
  dao.governorAddress = Address.fromString(TOKEN_ADDRESS)
  dao.ownerCount = 0
  dao.voterCount = 0
  dao.tokensCount = 0
  dao.proposalCount = 0
  dao.totalAuctionSales = BigInt.fromI32(0)
  dao.auctionConfig = auctionConfig.id
  dao.save()

  const auction = new Auction(TOKEN_ADDRESS + ':1')
  auction.dao = TOKEN_ADDRESS
  auction.startTime = BigInt.fromI32(1)
  auction.endTime = BigInt.fromI32(2)
  auction.extended = false
  auction.settled = false
  auction.bidCount = 0
  auction.token = TOKEN_ADDRESS + ':1'
  auction.save()
}

function createAuctionBidEvent(inputHex: string): AuctionBidEvent {
  const event = newTypedMockEvent<AuctionBidEvent>()
  event.parameters = [
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))
    ),
    new ethereum.EventParam(
      'bidder',
      ethereum.Value.fromAddress(Address.fromString(BIDDER_ADDRESS))
    ),
    new ethereum.EventParam(
      'amount',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10))
    ),
    new ethereum.EventParam('extended', ethereum.Value.fromBoolean(false)),
    new ethereum.EventParam(
      'endTime',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2))
    ),
  ]

  event.transaction.input = Bytes.fromHexString(inputHex)
  return event
}

describe('Auction bid comment parsing', () => {
  test('parses comment from createBid calldata', () => {
    const input = Bytes.fromHexString(
      '0x' + CREATE_BID_SELECTOR + TOKEN_ID_WORD + '68656c6c6f20776f726c64'
    )
    const parsed = parseAuctionBidComment(input)
    assert.stringEquals(parsed ? parsed : '', 'hello world')
  })

  test('parses comment from createBidWithReferral calldata', () => {
    const input = Bytes.fromHexString(
      '0x' +
        CREATE_BID_WITH_REFERRAL_SELECTOR +
        TOKEN_ID_WORD +
        REFERRAL_WORD +
        '66726f6d20726566657272616c'
    )
    const parsed = parseAuctionBidComment(input)
    assert.stringEquals(parsed ? parsed : '', 'from referral')
  })

  test('returns null for unsupported selector and short calldata', () => {
    const unsupported = Bytes.fromHexString('0xdeadbeef' + TOKEN_ID_WORD + '6869')
    const short = Bytes.fromHexString('0x1234')

    assert.assertTrue(parseAuctionBidComment(unsupported) == null)
    assert.assertTrue(parseAuctionBidComment(short) == null)
  })

  test('indexes parsed bid comment in AuctionBid entity', () => {
    clearStore()
    setupDataSourceContext()
    seedDaoAndAuction()

    const event = createAuctionBidEvent(
      '0x' + CREATE_BID_SELECTOR + TOKEN_ID_WORD + '636f6d6d656e742066726f6d20626964'
    )

    handleAuctionBid(event)

    const bidId = event.transaction.hash.toHexString() + ':' + event.logIndex.toString()
    assert.fieldEquals('AuctionBid', bidId, 'comment', 'comment from bid')
  })

  test('stores null comment when calldata has no trailing bytes', () => {
    clearStore()
    setupDataSourceContext()
    seedDaoAndAuction()

    const event = createAuctionBidEvent('0x' + CREATE_BID_SELECTOR + TOKEN_ID_WORD)
    handleAuctionBid(event)

    const bidId = event.transaction.hash.toHexString() + ':' + event.logIndex.toString()
    const bid = AuctionBidEntity.load(bidId)
    assert.assertTrue(bid != null, 'Bid should be present after bid')
    assert.fieldEquals('AuctionBid', bidId, 'amount', '10')
    assert.assertTrue(bid!.comment == null, 'Comment should be null when omitted')
  })
})
