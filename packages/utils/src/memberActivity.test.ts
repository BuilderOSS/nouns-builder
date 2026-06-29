import { computeActiveMembers, isAddressActive } from './memberActivity'

const nowSeconds = 1_700_000_000

describe('computeActiveMembers', () => {
  it('marks voters on recent completed proposals as active', () => {
    const result = computeActiveMembers({
      recentProposalIds: ['0xP1', '0xP2'],
      votes: [
        { voter: '0xAbC0000000000000000000000000000000000001', proposalId: '0xp1' },
      ],
      bids: [],
      nowSeconds,
    })

    expect(result).toEqual(['0xabc0000000000000000000000000000000000001'])
  })

  it('ignores votes on proposals outside the recent set', () => {
    const result = computeActiveMembers({
      recentProposalIds: ['0xp1'],
      votes: [
        { voter: '0xabc0000000000000000000000000000000000001', proposalId: '0xother' },
      ],
      bids: [],
      nowSeconds,
    })

    expect(result).toEqual([])
  })

  it('respects recentProposalCount threshold', () => {
    const recentProposalIds = ['0xp1', '0xp2', '0xp3', '0xp4', '0xp5', '0xp6']
    const votes = [
      { voter: '0xabc0000000000000000000000000000000000001', proposalId: '0xp6' },
    ]

    expect(
      computeActiveMembers({ recentProposalIds, votes, bids: [], nowSeconds })
    ).toEqual([])

    expect(
      computeActiveMembers({
        recentProposalIds,
        votes,
        bids: [],
        nowSeconds,
        thresholds: { recentProposalCount: 6 },
      })
    ).toEqual(['0xabc0000000000000000000000000000000000001'])
  })

  it('marks recent bidders as active and ignores stale bids', () => {
    const bidWindowSeconds = 30 * 24 * 60 * 60

    const result = computeActiveMembers({
      recentProposalIds: [],
      votes: [],
      bids: [
        {
          bidder: '0xdef0000000000000000000000000000000000002',
          bidTime: nowSeconds - bidWindowSeconds,
        },
        {
          bidder: '0xabc0000000000000000000000000000000000001',
          bidTime: nowSeconds - bidWindowSeconds - 1,
        },
      ],
      nowSeconds,
    })

    expect(result).toEqual(['0xdef0000000000000000000000000000000000002'])
  })

  it('respects bidWindowSeconds threshold', () => {
    const sevenDays = 7 * 24 * 60 * 60
    const bids = [
      {
        bidder: '0xabc0000000000000000000000000000000000001',
        bidTime: nowSeconds - sevenDays,
      },
    ]

    expect(
      computeActiveMembers({ recentProposalIds: [], votes: [], bids, nowSeconds })
    ).toEqual(['0xabc0000000000000000000000000000000000001'])

    expect(
      computeActiveMembers({
        recentProposalIds: [],
        votes: [],
        bids,
        nowSeconds,
        thresholds: { bidWindowSeconds: 86400 },
      })
    ).toEqual([])
  })

  it('deduplicates, lowercases and sorts addresses', () => {
    const result = computeActiveMembers({
      recentProposalIds: ['0xp1'],
      votes: [
        { voter: '0xAbC0000000000000000000000000000000000002', proposalId: '0xp1' },
      ],
      bids: [
        { bidder: '0xabc0000000000000000000000000000000000002', bidTime: nowSeconds },
        { bidder: '0xAAA0000000000000000000000000000000000001', bidTime: nowSeconds },
      ],
      nowSeconds,
    })

    expect(result).toEqual([
      '0xaaa0000000000000000000000000000000000001',
      '0xabc0000000000000000000000000000000000002',
    ])
  })

  it('returns empty array for empty inputs', () => {
    expect(
      computeActiveMembers({ recentProposalIds: [], votes: [], bids: [], nowSeconds })
    ).toEqual([])
  })
})

describe('isAddressActive', () => {
  it('matches case-insensitively and handles undefined', () => {
    const list = ['0xabc0000000000000000000000000000000000001']

    expect(isAddressActive(list, '0xABC0000000000000000000000000000000000001')).toBe(true)
    expect(isAddressActive(list, '0x9990000000000000000000000000000000000009')).toBe(
      false
    )
    expect(isAddressActive(list, undefined)).toBe(false)
  })
})
