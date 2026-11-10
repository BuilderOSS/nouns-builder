import { CHAIN_ID } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { daosAuctionStatusRequest, liveAuctionsRequest } from './liveAuctions'

const sdkMock = vi.hoisted(() => ({
  liveAuctions: vi.fn(),
  daosCurrentAuction: vi.fn(),
}))

vi.mock('../client', () => ({
  SDK: {
    connect: () => sdkMock,
  },
}))

const createAuction = (dao: string, tokenId: number, overrides = {}) => ({
  id: `${dao}:${tokenId}`,
  startTime: '1000',
  endTime: '2000',
  extended: false,
  settled: false,
  bidCount: 2,
  highestBid: { amount: '500000000000000000', bidder: '0xABC' },
  token: { tokenId: String(tokenId), name: `Token #${tokenId}`, image: 'ipfs://img' },
  dao: { id: dao, auctionAddress: '0xAUCTION' },
  ...overrides,
})

describe('liveAuctionsRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keys unsettled auctions by DAO and normalises values', async () => {
    sdkMock.liveAuctions.mockResolvedValueOnce({
      auctions: [
        createAuction('0xdao1', 7),
        createAuction('0xdao2', 3, { highestBid: null }),
      ],
      _meta: { block: { number: 123 } },
    })

    const result = await liveAuctionsRequest(CHAIN_ID.BASE)

    expect(sdkMock.liveAuctions).toHaveBeenCalledTimes(1)
    expect(result.syncedBlock).toBe(123)
    expect(result.auctions['0xdao1']).toEqual({
      id: '0xdao1:7',
      daoId: '0xdao1',
      auctionAddress: '0xauction',
      tokenId: '7',
      startTime: 1000,
      endTime: 2000,
      extended: false,
      settled: false,
      bidCount: 2,
      highestBid: { amount: '500000000000000000', bidder: '0xabc' },
      token: { name: 'Token #7', image: 'ipfs://img' },
    })
    expect(result.auctions['0xdao2'].highestBid).toBeNull()
  })

  it('pages until a short page is returned', async () => {
    const fullPage = Array.from({ length: 1000 }, (_, i) => createAuction(`0xdao${i}`, 1))
    sdkMock.liveAuctions
      .mockResolvedValueOnce({ auctions: fullPage, _meta: { block: { number: 50 } } })
      .mockResolvedValueOnce({
        auctions: [createAuction('0xlast', 1)],
        _meta: { block: { number: 51 } },
      })

    const result = await liveAuctionsRequest(CHAIN_ID.BASE)

    expect(sdkMock.liveAuctions).toHaveBeenNthCalledWith(2, { first: 1000, skip: 1000 })
    expect(Object.keys(result.auctions)).toHaveLength(1001)
    expect(result.syncedBlock).toBe(50)
  })

  it('propagates subgraph errors', async () => {
    sdkMock.liveAuctions.mockRejectedValueOnce(new Error('rate limited'))
    await expect(liveAuctionsRequest(CHAIN_ID.BASE)).rejects.toThrow('rate limited')
  })
})

describe('daosAuctionStatusRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches current auctions for a batch of DAOs in one request', async () => {
    sdkMock.daosCurrentAuction.mockResolvedValueOnce({
      daos: [
        { id: '0xdao1', currentAuction: createAuction('0xdao1', 9, { settled: true }) },
        { id: '0xdao2', currentAuction: null },
      ],
      _meta: { block: { number: 77 } },
    })

    const result = await daosAuctionStatusRequest(CHAIN_ID.BASE, [
      '0xDAO1',
      '0xdao2',
      '0xunknown',
    ])

    expect(sdkMock.daosCurrentAuction).toHaveBeenCalledTimes(1)
    expect(sdkMock.daosCurrentAuction).toHaveBeenCalledWith({
      ids: ['0xdao1', '0xdao2', '0xunknown'],
      first: 3,
    })
    expect(result.syncedBlock).toBe(77)
    expect(result.auctions['0xdao1']?.settled).toBe(true)
    expect(result.auctions['0xdao2']).toBeNull()
    expect(result.auctions['0xunknown']).toBeNull()
  })
})
