import type { AuctionStatus } from '@buildeross/sdk/subgraph'

import {
  AUCTION_STATUS_IDLE_INTERVAL,
  AUCTION_STATUS_LIVE_INTERVAL,
  getAuctionStatusRefreshInterval,
  isAuctionStatusLive,
} from './useAuctionStatus'

const now = 10_000

const status = (overrides: Partial<AuctionStatus> = {}): AuctionStatus => ({
  id: '0xdao:1',
  daoId: '0xdao',
  auctionAddress: '0xauction',
  tokenId: '1',
  startTime: now - 100,
  endTime: now + 100,
  extended: false,
  settled: false,
  bidCount: 0,
  highestBid: null,
  token: { name: 'Token #1', image: null },
  ...overrides,
})

describe('isAuctionStatusLive', () => {
  it('is live before the end time', () => {
    expect(isAuctionStatusLive(status(), now)).toBe(true)
  })

  it('stays live briefly after the end time while awaiting settlement', () => {
    expect(isAuctionStatusLive(status({ endTime: now - 30 }), now)).toBe(true)
    expect(isAuctionStatusLive(status({ endTime: now - 120 }), now)).toBe(false)
  })

  it('is not live once settled or missing', () => {
    expect(isAuctionStatusLive(status({ settled: true }), now)).toBe(false)
    expect(isAuctionStatusLive(null, now)).toBe(false)
  })
})

describe('getAuctionStatusRefreshInterval', () => {
  it('polls fast before the first response', () => {
    expect(getAuctionStatusRefreshInterval(undefined, now)).toBe(
      AUCTION_STATUS_LIVE_INTERVAL
    )
  })

  it('polls fast when any auction is live', () => {
    const data = {
      syncedBlock: 1,
      stale: false,
      auctions: { '0xa': status({ settled: true }), '0xb': status() },
    }
    expect(getAuctionStatusRefreshInterval(data, now)).toBe(AUCTION_STATUS_LIVE_INTERVAL)
  })

  it('polls slowly when nothing is live', () => {
    const data = {
      syncedBlock: 1,
      stale: false,
      auctions: { '0xa': status({ settled: true }), '0xb': null },
    }
    expect(getAuctionStatusRefreshInterval(data, now)).toBe(AUCTION_STATUS_IDLE_INTERVAL)
  })
})
