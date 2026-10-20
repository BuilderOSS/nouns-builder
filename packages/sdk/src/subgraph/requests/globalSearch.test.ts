import { CHAIN_ID, ProposalState } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  deriveSearchProposalState,
  globalAddressLookupRequest,
  globalSearchRequest,
} from './globalSearch'

const sdkMock = vi.hoisted(() => ({
  globalSearch: vi.fn(),
  globalAddressLookup: vi.fn(),
}))

vi.mock('../client', () => ({
  SDK: {
    connect: () => sdkMock,
  },
}))

const daoRef = {
  id: '0xdao',
  name: 'Gnars',
  symbol: 'GNAR',
  tokenAddress: '0xdao',
  contractImage: 'ipfs://dao',
}

const fullDao = {
  ...daoRef,
  description: 'shred',
  projectURI: 'https://gnars.com',
  totalSupply: 10,
  proposalCount: 2,
  ownerCount: 5,
  metadataAddress: '0xmeta',
  treasuryAddress: '0xtreasury',
  governorAddress: '0xgov',
  auctionAddress: '0xauction',
}

const proposal = (overrides = {}) => ({
  id: '0xp1',
  proposalId: '0xp1',
  proposalNumber: 4,
  title: 'Fund skate park',
  proposer: '0xproposer',
  timeCreated: '100',
  voteStart: '200',
  voteEnd: '300',
  expiresAt: null,
  executed: false,
  canceled: false,
  vetoed: false,
  queued: false,
  forVotes: 10,
  againstVotes: 2,
  abstainVotes: 0,
  quorumVotes: '5',
  voteCount: 3,
  dao: daoRef,
  ...overrides,
})

describe('deriveSearchProposalState', () => {
  it('prefers terminal flags', () => {
    expect(deriveSearchProposalState(proposal({ canceled: true }), 250)).toBe(
      ProposalState.Canceled
    )
    expect(deriveSearchProposalState(proposal({ vetoed: true }), 250)).toBe(
      ProposalState.Vetoed
    )
    expect(deriveSearchProposalState(proposal({ executed: true }), 250)).toBe(
      ProposalState.Executed
    )
  })

  it('handles queued and expired proposals', () => {
    expect(
      deriveSearchProposalState(proposal({ queued: true, expiresAt: '1000' }), 500)
    ).toBe(ProposalState.Queued)
    expect(
      deriveSearchProposalState(proposal({ queued: true, expiresAt: '1000' }), 1000)
    ).toBe(ProposalState.Expired)
  })

  it('uses the voting window and quorum', () => {
    expect(deriveSearchProposalState(proposal(), 150)).toBe(ProposalState.Pending)
    expect(deriveSearchProposalState(proposal(), 250)).toBe(ProposalState.Active)
    expect(deriveSearchProposalState(proposal(), 350)).toBe(ProposalState.Succeeded)
    expect(deriveSearchProposalState(proposal({ quorumVotes: '20' }), 350)).toBe(
      ProposalState.Defeated
    )
  })
})

describe('globalSearchRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps and dedupes results across indexes', async () => {
    sdkMock.globalSearch.mockResolvedValueOnce({
      daoSearch: [fullDao],
      daos: [fullDao],
      proposalSearch: [proposal()],
      candidateSearch: [
        {
          id: 'c1-v2',
          title: 'Candidate title',
          createdAt: '50',
          attester: '0xattester',
          versionNumber: '2',
          group: { id: 'c1', candidateNumber: 1, proposer: '0xproposer', dao: daoRef },
          proposal: null,
        },
        {
          id: 'c1-v1',
          title: 'Candidate title old',
          createdAt: '40',
          attester: '0xattester',
          versionNumber: '1',
          group: { id: 'c1', candidateNumber: 1, proposer: '0xproposer', dao: daoRef },
          proposal: null,
        },
      ],
      voteSearch: [
        {
          id: '0xtx:1',
          transactionHash: '0xtx',
          timestamp: '400',
          voter: '0xvoter',
          support: 'FOR',
          weight: 2,
          reason: 'love it',
          dao: daoRef,
          proposal: { proposalNumber: 4, title: null },
        },
      ],
      bidSearch: [
        {
          id: '0xbid:2',
          transactionHash: '0xbid',
          amount: '100000000000000000',
          bidder: '0xbidder',
          comment: 'gm',
          bidTime: '500',
          dao: daoRef,
          auction: { token: { tokenId: '7', name: 'Gnars #7', image: null } },
        },
      ],
    })

    const result = await globalSearchRequest(CHAIN_ID.BASE, 'skate:*', 'skate', {
      types: ['daos', 'proposals', 'candidates', 'votes', 'bids'],
      first: 5,
    })

    expect(sdkMock.globalSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'skate:*',
        first: 6,
        skip: 0,
        withDaos: true,
        withVotes: true,
        proposalWhere: { replacedBy: null },
        candidateWhere: { revoked: false },
      })
    )
    expect(result.daos).toHaveLength(1)
    expect(result.daos[0]).toMatchObject({
      type: 'dao',
      chainId: CHAIN_ID.BASE,
      id: `${CHAIN_ID.BASE}:0xdao`,
      dao: { name: 'Gnars', image: 'ipfs://dao', governorAddress: '0xgov' },
    })
    expect(result.proposals[0]).toMatchObject({
      type: 'proposal',
      proposalNumber: 4,
      title: 'Fund skate park',
      timeCreated: 100,
    })
    expect(result.candidates).toHaveLength(1)
    expect(result.candidates[0]).toMatchObject({ groupId: 'c1', versionNumber: 2 })
    expect(result.votes[0]).toMatchObject({
      support: 'FOR',
      reason: 'love it',
      proposalTitle: 'Proposal 4',
      timestamp: 400,
    })
    expect(result.bids[0]).toMatchObject({
      amount: '100000000000000000',
      tokenId: '7',
      tokenName: 'Gnars #7',
      comment: 'gm',
    })
  })

  it('scopes to a DAO and skips the DAO index', async () => {
    sdkMock.globalSearch.mockResolvedValueOnce({})

    await globalSearchRequest(CHAIN_ID.BASE, 'x:*', 'x', {
      types: ['daos', 'proposals', 'candidates', 'votes', 'bids'],
      first: 5,
      daoId: '0xDAO',
    })

    expect(sdkMock.globalSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        withDaos: false,
        proposalWhere: { replacedBy: null, dao: '0xdao' },
        candidateWhere: { revoked: false, group_: { dao: '0xdao' } },
        voteWhere: { dao: '0xdao' },
        bidWhere: { dao: '0xdao' },
      })
    )
  })

  it('returns empty results without querying for blank text', async () => {
    const result = await globalSearchRequest(CHAIN_ID.BASE, ' ', ' ', {
      types: ['proposals'],
      first: 5,
    })
    expect(sdkMock.globalSearch).not.toHaveBeenCalled()
    expect(result.proposals).toEqual([])
  })
})

describe('globalAddressLookupRequest', () => {
  it('lowercases the address and strips profile metadata', async () => {
    sdkMock.globalAddressLookup.mockResolvedValueOnce({
      profile: {
        __typename: 'Profile',
        id: '0xabc',
        tokenCount: 1,
        ownerDaoCount: 1,
        voterDaoCount: 1,
        proposalVotesCount: 2,
        proposalsSubmittedCount: 0,
        bidsPlacedCount: 3,
        auctionWinsCount: 1,
        lastActiveAt: '900',
      },
      daos: [],
      proposals: [],
      proposalVotes: [],
      auctionBids: [],
    })

    const result = await globalAddressLookupRequest(CHAIN_ID.ETHEREUM, '0xABC', 3)

    expect(sdkMock.globalAddressLookup).toHaveBeenCalledWith({
      id: '0xabc',
      address: '0xabc',
      first: 3,
      proposalWhere: { proposer: '0xabc', replacedBy: null },
      voteWhere: { voter: '0xabc' },
      bidWhere: { bidder: '0xabc' },
    })
    expect(result.profile).toEqual({
      chainId: CHAIN_ID.ETHEREUM,
      tokenCount: 1,
      ownerDaoCount: 1,
      voterDaoCount: 1,
      proposalVotesCount: 2,
      proposalsSubmittedCount: 0,
      bidsPlacedCount: 3,
      auctionWinsCount: 1,
      lastActiveAt: '900',
    })
  })

  it('scopes proposals, votes and bids to a DAO', async () => {
    sdkMock.globalAddressLookup.mockResolvedValueOnce({
      profile: null,
      daos: [],
      proposals: [],
      proposalVotes: [],
      auctionBids: [],
    })

    await globalAddressLookupRequest(CHAIN_ID.BASE, '0xABC', 5, '0xDAO')

    expect(sdkMock.globalAddressLookup).toHaveBeenCalledWith(
      expect.objectContaining({
        proposalWhere: { proposer: '0xabc', replacedBy: null, dao: '0xdao' },
        voteWhere: { voter: '0xabc', dao: '0xdao' },
        bidWhere: { bidder: '0xabc', dao: '0xdao' },
      })
    )
  })
})
