import { PUBLIC_SUBGRAPH_URL } from '@buildeross/constants'
import type { CHAIN_ID } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { profileDashboardQuery } from './profileDashboardQuery'

const sdkMock = vi.hoisted(() => ({
  profileDashboardTokensPage: vi.fn(),
  profileDashboardTokensPageViaProfile: vi.fn(),
  profile: vi.fn(),
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
    sdkMock.profileDashboardTokensPageViaProfile.mockImplementation(({ cursor }) => {
      const start = cursor ? 250 : 0
      const length = cursor ? 1 : 250
      return Promise.resolve({
        profile: {
          tokens: Array.from({ length }, (_, index) => ({
            id: `token-${start + index}`,
            tokenId: `${start + index}`,
            tokenContract: address,
            name: '',
            image: '',
            mintedAt: '1',
            dao: { tokenAddress: address, name: '', symbol: '', contractImage: '' },
          })),
        },
      })
    })
    sdkMock.profile.mockResolvedValue({
      profile: {
        tokenCount: 251,
        proposalVotesCount: 1,
        proposalsSubmittedCount: 1,
        bidsPlacedCount: 1,
      },
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
    expect(sdkMock.profile).toHaveBeenCalledWith(
      expect.objectContaining({ address }),
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
    sdkMock.profileDashboardTokensPageViaProfile.mockResolvedValue({
      profile: { tokens: [] },
    })
    sdkMock.profile.mockResolvedValue({
      profile: {
        tokenCount: 0,
        proposalVotesCount: 0,
        proposalsSubmittedCount: 0,
        bidsPlacedCount: 0,
      },
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
    sdkMock.profile.mockResolvedValue({
      profile: {
        tokenCount: 3,
        proposalVotesCount: 1,
        proposalsSubmittedCount: 1,
        bidsPlacedCount: 1,
      },
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
    expect(sdkMock.profileDashboardTokensPageViaProfile).not.toHaveBeenCalled()
  })

  it('handles user with no activity (null profile)', async () => {
    // Test null profile case - user has no activity
    sdkMock.profile.mockResolvedValue({ profile: null })
    sdkMock.profileDashboardAuctionSettlementsPage.mockResolvedValue({
      auctionSettledEvents: [],
    })

    const result = await profileDashboardQuery(chainId, address, { mode: 'summary' })

    expect(result.tokens).toEqual([])
    expect(result.counts).toEqual({
      tokenHoldings: 0,
      proposalVotes: 0,
      proposalsSubmitted: 0,
      bidsPlaced: 0,
    })
  })

  it('only fetches token pages in tokens mode', async () => {
    sdkMock.profileDashboardTokensPageViaProfile.mockResolvedValue({
      profile: {
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
      },
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
    expect(sdkMock.profile).not.toHaveBeenCalled()
  })

  it('passes abort signals through paginated requests', async () => {
    const controller = new AbortController()
    sdkMock.profile.mockResolvedValue({
      profile: {
        tokenCount: 0,
        proposalVotesCount: 0,
        proposalsSubmittedCount: 0,
        bidsPlacedCount: 0,
      },
    })
    sdkMock.profileDashboardAuctionSettlementsPage.mockResolvedValue({
      auctionSettledEvents: [],
    })

    await profileDashboardQuery(chainId, address, {
      mode: 'summary',
      signal: controller.signal,
    })

    expect(
      sdkMock.profile.mock.calls.every((call) => call[2] === controller.signal)
    ).toBe(true)
  })
})
