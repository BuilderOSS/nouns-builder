import { PUBLIC_SUBGRAPH_URL } from '@buildeross/constants'
import type { CHAIN_ID } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { profileDashboardQuery } from './profileDashboardQuery'

const request = vi.hoisted(() => vi.fn())

vi.mock('graphql-request', () => ({
  GraphQLClient: class {
    request(
      input:
        | string
        | {
            document: string
            variables: Record<string, unknown>
            signal?: AbortSignal
          },
      variables: Record<string, unknown>
    ) {
      return typeof input === 'string'
        ? request(input, variables)
        : request(input.document, input.variables, input.signal)
    }
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
  beforeEach(() => request.mockReset())

  it('paginates each collection with its own ID cursor', async () => {
    request.mockImplementation((query = '', variables: Record<string, unknown> = {}) => {
      if (query.includes('profileDashboardTokensPage')) {
        const start = variables.cursor ? 250 : 0
        const length = variables.cursor ? 1 : 250
        return {
          tokens: Array.from({ length }, (_, index) => ({
            id: `token-${start + index}`,
            tokenId: `${start + index}`,
            tokenContract: address,
            name: '',
            image: '',
            mintedAt: '1',
            dao: { tokenAddress: address, name: '', symbol: '', contractImage: '' },
          })),
        }
      }
      if (query.includes('profileDashboardCountsPage')) {
        return {
          tokens: [],
          daoTokenOwners: [{ id: 'owner-1', daoTokenCount: 2 }],
          proposalVotedEvents: [{ id: 'vote-1' }],
          proposalCreatedEvents: [{ id: 'proposal-1' }],
          auctionBidPlacedEvents: [{ id: 'bid-1' }],
        }
      }
      return { auctionSettledEvents: [] }
    })

    const result = await profileDashboardQuery(chainId, address)

    expect(result.tokens).toHaveLength(251)
    expect(result.counts).toEqual({
      tokenHoldings: 251,
      proposalVotes: 1,
      proposalsSubmitted: 1,
      bidsPlaced: 1,
    })
    const countRequest = request.mock.calls.find(
      ([query]) =>
        typeof query === 'string' && query.includes('profileDashboardCountsPage')
    )
    expect(countRequest?.[1].skip).toBe(0)
    expect(result.isComplete).toBe(true)
  })

  it('exhausts equal-timestamp settlements by ID and returns deterministic wins', async () => {
    const boundary = Array.from({ length: 251 }, (_, index) =>
      settlement(`settlement-${String(index).padStart(3, '0')}`, '100')
    )
    request.mockImplementation((query = '', variables: Record<string, unknown> = {}) => {
      if (query.includes('profileDashboardAuctionSettlementsAtTimestamp')) {
        return {
          auctionSettledEvents: variables.cursor
            ? boundary.slice(250)
            : boundary.slice(0, 250),
        }
      }
      if (query.includes('profileDashboardAuctionSettlementsPage')) {
        return {
          auctionSettledEvents:
            variables.beforeTimestamp === '100' ? [] : boundary.slice(0, 250),
        }
      }
      if (query.includes('profileDashboardTokensPage')) return { tokens: [] }
      if (query.includes('profileDashboardCountsPage')) {
        return {
          tokens: [],
          daoTokenOwners: [],
          proposalVotedEvents: [],
          proposalCreatedEvents: [],
          auctionBidPlacedEvents: [],
        }
      }
      return { auctionSettledEvents: [] }
    })

    const result = await profileDashboardQuery(chainId, address)

    expect(result.auctionWins).toHaveLength(251)
    expect(result.auctionWins[0].id).toBe('settlement-000')
    expect(result.auctionWins[250].id).toBe('settlement-250')
    const boundaryRequests = request.mock.calls.filter(
      ([query]) =>
        typeof query === 'string' &&
        query.includes('profileDashboardAuctionSettlementsAtTimestamp')
    )
    expect(boundaryRequests[1][1].cursor).toBe('settlement-249')
    expect(result.isComplete).toBe(true)
  })

  it('combines count collections and skips full token metadata in summary mode', async () => {
    request.mockImplementation((query = '') => {
      if (query.includes('profileDashboardCountsPage')) {
        return {
          tokens: [{ id: 'token-1' }, { id: 'token-2' }, { id: 'token-3' }],
          daoTokenOwners: [
            { id: 'owner-1', daoTokenCount: 2 },
            { id: 'owner-2', daoTokenCount: 3 },
          ],
          proposalVotedEvents: [{ id: 'vote-1' }],
          proposalCreatedEvents: [{ id: 'proposal-1' }],
          auctionBidPlacedEvents: [{ id: 'bid-1' }],
        }
      }
      if (query.includes('profileDashboardAuctionSettlementsPage')) {
        return { auctionSettledEvents: [] }
      }
      return { auctionSettledEvents: [] }
    })

    const result = await profileDashboardQuery(chainId, address, { mode: 'summary' })

    expect(result.tokens).toEqual([])
    expect(result.counts).toEqual({
      tokenHoldings: 3,
      proposalVotes: 1,
      proposalsSubmitted: 1,
      bidsPlaced: 1,
    })
    expect(request).toHaveBeenCalledTimes(2)
    expect(
      request.mock.calls.some(([query]) =>
        String(query).includes('profileDashboardTokensPage')
      )
    ).toBe(false)
  })

  it('falls back to dao owner token counts when token IDs are unavailable', async () => {
    request.mockImplementation((query = '') => {
      if (query.includes('profileDashboardCountsPage')) {
        return {
          daoTokenOwners: [
            { id: 'owner-1', daoTokenCount: 2 },
            { id: 'owner-2', daoTokenCount: 3 },
          ],
          proposalVotedEvents: [],
          proposalCreatedEvents: [],
          auctionBidPlacedEvents: [],
        }
      }
      return { auctionSettledEvents: [] }
    })

    const result = await profileDashboardQuery(chainId, address, { mode: 'summary' })

    expect(result.tokens).toEqual([])
    expect(result.counts.tokenHoldings).toBe(5)
  })

  it('only fetches token pages in tokens mode', async () => {
    request.mockResolvedValue({
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
    expect(request).toHaveBeenCalledTimes(1)
    expect(String(request.mock.calls[0][0])).toContain('profileDashboardTokensPage')
  })

  it('passes abort signals through paginated requests', async () => {
    const controller = new AbortController()
    request.mockImplementation((query = '') => {
      if (query.includes('profileDashboardCountsPage')) {
        return {
          tokens: [],
          daoTokenOwners: [],
          proposalVotedEvents: [],
          proposalCreatedEvents: [],
          auctionBidPlacedEvents: [],
        }
      }
      return { auctionSettledEvents: [] }
    })

    await profileDashboardQuery(chainId, address, {
      mode: 'summary',
      signal: controller.signal,
    })

    expect(request.mock.calls.every((call) => call[2] === controller.signal)).toBe(true)
  })
})
