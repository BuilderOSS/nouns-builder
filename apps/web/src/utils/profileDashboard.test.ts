import type { FeedItem } from '@buildeross/types'

import {
  classifyProfileActivity,
  combineChainResults,
  createDaoKey,
  createTokenKey,
  dedupeProfileTokens,
  filterProfileActivity,
  filterProfileActivityByKinds,
  filterProfileTokens,
  getInitialProfileTokenVisibleCount,
  getUnifiedProfileActivity,
  GOVERNANCE_ACTIVITY_FILTER_OPTIONS,
  isOwnProfileAddress,
  parseDaoKeys,
  type ProfileToken,
  summarizeProfileStats,
  toggleDaoSelection,
} from './profileDashboard'

const address = '0xAbC0000000000000000000000000000000000000'
const otherAddress = '0xdef0000000000000000000000000000000000000'

const baseItem = {
  id: 'event-1',
  daoId: '0xDaa0000000000000000000000000000000000000',
  daoName: 'Test DAO',
  daoImage: '',
  daoSymbol: 'TEST',
  chainId: 1,
  timestamp: 1,
  actor: address,
  txHash: '0x01',
  blockNumber: 1,
  addresses: {
    token: '0xDaa0000000000000000000000000000000000000',
    auction: '0xAaa0000000000000000000000000000000000000',
    treasury: '0xBbb0000000000000000000000000000000000000',
    metadata: '0xCcc0000000000000000000000000000000000000',
    governor: '0xEee0000000000000000000000000000000000000',
  },
} as const

const makeBid = (id: string): FeedItem =>
  ({
    ...baseItem,
    id,
    type: 'AUCTION_BID_PLACED',
    auctionId: 'auction-1',
    tokenId: '1',
    bidder: address,
    amount: '1',
    tokenName: 'Token 1',
    tokenImage: '',
  }) as FeedItem

const token = (chainId: number, tokenId: string): ProfileToken => ({
  chainId,
  chainSlug: chainId === 1 ? 'ethereum' : 'base',
  chainName: chainId === 1 ? 'Ethereum' : 'Base',
  tokenId,
  tokenContract: baseItem.daoId,
  name: `Token ${tokenId}`,
  image: '',
  mintedAt: tokenId,
  daoName: 'Test DAO',
  daoSymbol: 'TEST',
})

describe('profile dashboard helpers', () => {
  it('creates normalized composite DAO and token keys', () => {
    expect(createDaoKey(1, ' 0xAbC ')).toBe('1:0xabc')
    expect(createTokenKey({ chainId: 1, tokenContract: '0xAbC', tokenId: '7' })).toBe(
      '1:0xabc:7'
    )
    expect(parseDaoKeys(['1:0xAbC', '1:0xabc', 'invalid'])).toEqual(['1:0xabc'])
  })

  it('toggles multiple DAO selections and returns to all when the final item is removed', () => {
    const first = toggleDaoSelection([], '1:0xAbC')
    const second = toggleDaoSelection(first, '8453:0xDef')
    expect(second).toEqual(['1:0xabc', '8453:0xdef'])
    expect(toggleDaoSelection(second, '1:0xABC')).toEqual(['8453:0xdef'])
    expect(toggleDaoSelection(['1:0xabc'], '1:0xABC')).toEqual([])
  })

  it('shows owner-only controls only for the connected profile address', () => {
    expect(isOwnProfileAddress('0xAbC', '0xabc')).toBe(true)
    expect(isOwnProfileAddress('0xdef', '0xabc')).toBe(false)
    expect(isOwnProfileAddress(undefined, '0xabc')).toBe(false)
  })

  it('applies the same DAO selection to activity groups and tokens', () => {
    const selected = [createDaoKey(1, baseItem.daoId)]
    const bid = makeBid('bid')
    const proposal = {
      ...baseItem,
      id: 'proposal',
      type: 'PROPOSAL_CREATED',
      proposalId: '0x02',
      proposalNumber: '2',
      proposalTitle: 'Proposal',
      proposalDescription: '',
      proposalTimeCreated: '1',
      proposer: address,
    } as FeedItem

    expect(filterProfileActivity([bid, proposal], address, 'auction', selected)).toEqual([
      bid,
    ])
    expect(
      filterProfileActivity([bid, proposal], address, 'governance', selected)
    ).toEqual([proposal])
    expect(filterProfileTokens([token(1, '1'), token(8453, '2')], selected)).toEqual([
      token(1, '1'),
    ])
  })

  it('classifies auction wins by winner rather than settlement actor', () => {
    const settlement = {
      ...baseItem,
      type: 'AUCTION_SETTLED',
      actor: otherAddress,
      auctionId: 'auction-1',
      tokenId: '1',
      tokenName: 'Token 1',
      tokenImage: '',
      winner: address,
      amount: '1',
    } as FeedItem

    expect(classifyProfileActivity(settlement, address)).toEqual({
      group: 'auction',
      kind: 'win',
    })
    expect(classifyProfileActivity(settlement, otherAddress)).toEqual({
      group: 'auction',
      kind: 'settled',
    })
  })

  it('filters activity kinds after the shared DAO filter is applied', () => {
    const selected = [createDaoKey(1, baseItem.daoId)]
    const bid = makeBid('bid')
    const win = {
      ...baseItem,
      id: 'win',
      type: 'AUCTION_SETTLED',
      actor: otherAddress,
      auctionId: 'auction-1',
      tokenId: '1',
      tokenName: 'Token 1',
      tokenImage: '',
      winner: address,
      amount: '1',
    } as FeedItem
    const otherDaoBid = {
      ...makeBid('other-dao-bid'),
      daoId: otherAddress,
    } as FeedItem
    const daoFiltered = filterProfileActivity(
      [bid, win, otherDaoBid],
      address,
      'auction',
      selected
    )

    expect(filterProfileActivityByKinds(daoFiltered, address, ['bid', 'win'])).toEqual([
      bid,
      win,
    ])
    expect(filterProfileActivityByKinds(daoFiltered, address, ['settled'])).toEqual([])
    expect(filterProfileActivityByKinds(daoFiltered, address, [])).toEqual([bid, win])
  })

  it('deduplicates, filters, and reverse-sorts unified activity across both groups', () => {
    const bid = { ...makeBid('shared'), timestamp: 2 } as FeedItem
    const duplicateBid = { ...bid, timestamp: 1 } as FeedItem
    const proposal = {
      ...baseItem,
      id: 'proposal',
      timestamp: 3,
      type: 'PROPOSAL_CREATED',
      proposalId: '0x02',
      proposalNumber: '2',
      proposalTitle: 'Proposal',
      proposalDescription: '',
      proposalTimeCreated: '1',
      proposer: address,
    } as FeedItem

    expect(
      getUnifiedProfileActivity(
        [duplicateBid, proposal],
        [bid],
        address,
        [createDaoKey(1, baseItem.daoId)],
        []
      )
    ).toEqual([proposal, bid])
    expect(getUnifiedProfileActivity([proposal, bid], [], address, [], ['bid'])).toEqual([
      bid,
    ])
  })

  it('exposes every indexed governance activity kind in the filter', () => {
    expect(GOVERNANCE_ACTIVITY_FILTER_OPTIONS.map(({ value }) => value)).toEqual([
      'proposal',
      'vote',
      'update',
      'execution',
    ])
  })

  it('shows all small galleries and caps the initial large gallery at four wide rows', () => {
    expect(getInitialProfileTokenVisibleCount(0)).toBe(0)
    expect(getInitialProfileTokenVisibleCount(16)).toBe(16)
    expect(getInitialProfileTokenVisibleCount(17)).toBe(17)
    expect(getInitialProfileTokenVisibleCount(32)).toBe(32)
    expect(getInitialProfileTokenVisibleCount(80)).toBe(32)
  })

  it('counts the complete activity set rather than the five visible rows', () => {
    const activity = Array.from({ length: 8 }, (_, index) => makeBid(`bid-${index}`))
    const stats = summarizeProfileStats({
      daoKeys: [createDaoKey(1, baseItem.daoId)],
      tokens: [token(1, '1')],
      activity,
      profileAddress: address,
    })

    expect(stats.bids).toBe(8)
  })

  it('deduplicates cross-chain tokens by chain, contract, and token id', () => {
    expect(
      dedupeProfileTokens([token(1, '1'), token(1, '1'), token(8453, '1')])
    ).toHaveLength(2)
  })

  it('retains successful chain data and marks partial failures incomplete', () => {
    expect(
      combineChainResults([
        { chainId: 1, data: [token(1, '1')], isComplete: true },
        { chainId: 8453, error: 'timeout', isComplete: false },
      ])
    ).toEqual({
      data: [token(1, '1')],
      failedChainIds: [8453],
      isComplete: false,
    })
  })
})
