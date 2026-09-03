import { PUBLIC_SUBGRAPH_URL } from '@buildeross/constants'
import type { CHAIN_ID } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { profileDashboardQuery } from './profileDashboardQuery'

const sdkMock = vi.hoisted(() => ({
  profileDashboardTokensPage: vi.fn(),
  profileDashboardCountsPage: vi.fn(),
  profileDashboardAuctionSettlementsPage: vi.fn(),
  profileDashboardAuctionSettlementsAtTimestamp: vi.fn(),
}))

vi.mock('../client', () => ({
  SDK: {
    connect: () => sdkMock,
  },
}))

const chainId = [...PUBLIC_SUBGRAPH_URL.keys()][0] as CHAIN_ID
const address = '0x0000000000000000000000000000000000000001'

const settlement = (id: string, timestamp: string) => ({
  id,
  timestamp,
  blockNumber: '1',
  transactionHash: '0x01',
  actor: address,
  winner: address,
  amount: '1',
  dao: {
    tokenAddress: address,
    auctionAddress: address,
    governorAddress: address,
    metadataAddress: address,
    treasuryAddress: address,
    name: 'Test DAO',
    symbol: 'TEST',
    contractImage: '',
  },
  auction: { id, token: { tokenId: id, name: id, image: '' } },
})

describe('profileDashboardQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('paginates each collection with its own ID cursor', async () => {
    sdkMock.profileDashboardTokensPage.mockImplementation(({ cursor }) => {
      const start = cursor ? 250 : 0
      const length = cursor ? 1 : 250
      return Promise.resolve({
        tokens: Array.from({ length }, (_, index) => ({
          id: `token-${start + index}`,
          tokenId: `${start + index}`,
          tokenContract: address,
          name: '',
          image: '',
          mintedAt: '1',
          dao: { tokenAddress: address, name: '', symbol: '', contractImage: '' },
        })),
      })
    })
    sdkMock.profileDashboardCountsPage.mockResolvedValue({
      tokens: [],
      daotokenOwners: [{ id: 'owner-1', daoTokenCount: 2 }],
      proposalVotedEvents: [{ id: 'vote-1' }],
      proposalCreatedEvents: [{ id: 'proposal-1' }],
      auctionBidPlacedEvents: [{ id: 'bid-1' }],
    })
    sdkMock.profileDashboardAuctionSettlementsPage.mockResolvedValue({
      auctionSettledEvents: [],
    })

    const result = await profileDashboardQuery(chainId, address)

    expect(result.tokens).toHaveLength(251)
    expect(result.counts).toEqual({
      tokenHoldings: 251,
      proposalVotes: 1,
      proposalsSubmitted: 1,
      bidsPlaced: 1,
    })
    expect(sdkMock.profileDashboardCountsPage).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 }),
      undefined,
      undefined
    )
    expect(result.isComplete).toBe(true)
  })

  it('exhausts equal-timestamp settlements by ID and returns deterministic wins', async () => {
    const boundary = Array.from({ length: 251 }, (_, index) =>
      settlement(`settlement-${String(index).padStart(3, '0')}`, '100')
    )
    sdkMock.profileDashboardAuctionSettlementsAtTimestamp.mockImplementation(
      ({ cursor }) =>
        Promise.resolve({
          auctionSettledEvents: cursor ? boundary.slice(250) : boundary.slice(0, 250),
        })
    )
    sdkMock.profileDashboardAuctionSettlementsPage.mockImplementation(
      ({ beforeTimestamp }) =>
        Promise.resolve({
          auctionSettledEvents: beforeTimestamp === '100' ? [] : boundary.slice(0, 250),
        })
    )
    sdkMock.profileDashboardTokensPage.mockResolvedValue({ tokens: [] })
    sdkMock.profileDashboardCountsPage.mockResolvedValue({
      tokens: [],
      daotokenOwners: [],
      proposalVotedEvents: [],
      proposalCreatedEvents: [],
      auctionBidPlacedEvents: [],
    })

    const result = await profileDashboardQuery(chainId, address)

    expect(result.auctionWins).toHaveLength(251)
    expect(result.auctionWins[0].id).toBe('settlement-000')
    expect(result.auctionWins[250].id).toBe('settlement-250')
    const boundaryRequests =
      sdkMock.profileDashboardAuctionSettlementsAtTimestamp.mock.calls.filter(
        ([variables]) => variables.cursor !== undefined
      )
    expect(boundaryRequests[1][0].cursor).toBe('settlement-249')
    expect(result.isComplete).toBe(true)
  })

  it('combines count collections and skips full token metadata in summary mode', async () => {
    sdkMock.profileDashboardCountsPage.mockResolvedValue({
      tokens: [{ id: 'token-1' }, { id: 'token-2' }, { id: 'token-3' }],
      daotokenOwners: [],
      proposalVotedEvents: [{ id: 'vote-1' }],
      proposalCreatedEvents: [{ id: 'proposal-1' }],
      auctionBidPlacedEvents: [{ id: 'bid-1' }],
    })
    sdkMock.profileDashboardAuctionSettlementsPage.mockResolvedValue({
      auctionSettledEvents: [],
    })

    const result = await profileDashboardQuery(chainId, address, { mode: 'summary' })

    expect(result.tokens).toEqual([])
    expect(result.counts).toEqual({
      tokenHoldings: 3,
      proposalVotes: 1,
      proposalsSubmitted: 1,
      bidsPlaced: 1,
    })
    expect(sdkMock.profileDashboardTokensPage).not.toHaveBeenCalled()
  })

  it('falls back to dao owner token counts when token IDs are unavailable', async () => {
    sdkMock.profileDashboardCountsPage.mockResolvedValue({
      tokens: [],
      daotokenOwners: [
        { id: 'owner-1', daoTokenCount: 2 },
        { id: 'owner-2', daoTokenCount: 3 },
      ],
      proposalVotedEvents: [],
      proposalCreatedEvents: [],
      auctionBidPlacedEvents: [],
    })
    sdkMock.profileDashboardAuctionSettlementsPage.mockResolvedValue({
      auctionSettledEvents: [],
    })

    const result = await profileDashboardQuery(chainId, address, { mode: 'summary' })

    expect(result.tokens).toEqual([])
    expect(result.counts.tokenHoldings).toBe(5)
  })

  it('only fetches token pages in tokens mode', async () => {
    sdkMock.profileDashboardTokensPage.mockResolvedValue({
      tokens: [
        {
          id: 'token-1',
          tokenId: '1',
          tokenContract: address,
          name: 'Token 1',
          image: '',
          mintedAt: '1',
          dao: { tokenAddress: address, name: 'DAO', symbol: 'DAO', contractImage: '' },
        },
      ],
    })

    const result = await profileDashboardQuery(chainId, address, { mode: 'tokens' })

    expect(result.tokens).toHaveLength(1)
    expect(result.auctionWins).toEqual([])
    expect(result.counts).toEqual({
      tokenHoldings: 1,
      proposalVotes: 0,
      proposalsSubmitted: 0,
      bidsPlaced: 0,
    })
    expect(sdkMock.profileDashboardCountsPage).not.toHaveBeenCalled()
  })

  it('passes abort signals through paginated requests', async () => {
    const controller = new AbortController()
    sdkMock.profileDashboardCountsPage.mockResolvedValue({
      tokens: [],
      daotokenOwners: [],
      proposalVotedEvents: [],
      proposalCreatedEvents: [],
      auctionBidPlacedEvents: [],
    })
    sdkMock.profileDashboardAuctionSettlementsPage.mockResolvedValue({
      auctionSettledEvents: [],
    })

    await profileDashboardQuery(chainId, address, {
      mode: 'summary',
      signal: controller.signal,
    })

    expect(
      sdkMock.profileDashboardCountsPage.mock.calls.every(
        (call) => call[2] === controller.signal
      )
    ).toBe(true)
  })
})
