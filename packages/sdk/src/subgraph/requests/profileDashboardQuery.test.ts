import { PUBLIC_SUBGRAPH_URL } from '@buildeross/constants'
import type { CHAIN_ID } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { profileDashboardQuery } from './profileDashboardQuery'

const request = vi.hoisted(() => vi.fn())

vi.mock('graphql-request', () => ({
  GraphQLClient: class {
    request(query: string, variables: Record<string, unknown>) {
      return request(query, variables)
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
      if (query.includes('profileDashboardProposalVotesPage')) {
        return { proposalVotedEvents: [{ id: 'vote-1' }] }
      }
      if (query.includes('profileDashboardProposalsPage')) {
        return { proposalCreatedEvents: [{ id: 'proposal-1' }] }
      }
      if (query.includes('profileDashboardBidsPage')) {
        return { auctionBidPlacedEvents: [{ id: 'bid-1' }] }
      }
      return { auctionSettledEvents: [] }
    })

    const result = await profileDashboardQuery(chainId, address)

    expect(result.tokens).toHaveLength(251)
    expect(result.counts).toEqual({
      proposalVotes: 1,
      proposalsSubmitted: 1,
      bidsPlaced: 1,
    })
    const voteRequest = request.mock.calls.find(
      ([query]) =>
        typeof query === 'string' && query.includes('profileDashboardProposalVotesPage')
    )
    expect(voteRequest?.[1].cursor).toBe('')
    expect(request.mock.calls.some(([, variables]) => 'skip' in variables)).toBe(false)
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
      if (query.includes('profileDashboardProposalVotesPage')) {
        return { proposalVotedEvents: [] }
      }
      if (query.includes('profileDashboardProposalsPage')) {
        return { proposalCreatedEvents: [] }
      }
      return { auctionBidPlacedEvents: [] }
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
})
