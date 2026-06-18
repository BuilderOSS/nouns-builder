import type { DashboardDaoWithState } from '@buildeross/hooks/useDashboardData'
import { type AddressType, CHAIN_ID, ProposalState } from '@buildeross/types'
import { describe, expect, it } from 'vitest'

import { DEFAULT_URGENCY_THRESHOLDS, deriveUrgencyAlerts } from './UrgencyAlerts.helper'

const NOW = 1_700_000_000
const HOUR = 3600
const USER = '0x1111111111111111111111111111111111111111' as AddressType
const DAO_TOKEN = '0x3333333333333333333333333333333333333333'

type DashboardProposal = DashboardDaoWithState['proposals'][number]

const buildProposal = (overrides: Partial<DashboardProposal>): DashboardProposal =>
  ({
    proposalId: '0xabc',
    proposalNumber: 7,
    title: 'Test proposal',
    state: ProposalState.Active,
    voteEnd: String(NOW + 3 * HOUR),
    voteStart: String(NOW - HOUR),
    expiresAt: null,
    executableFrom: null,
    timeCreated: String(NOW - HOUR),
    votes: [],
    ...overrides,
  }) as unknown as DashboardProposal

const buildDao = (overrides: Partial<DashboardDaoWithState>): DashboardDaoWithState =>
  ({
    chainId: CHAIN_ID.BASE,
    name: 'Test DAO',
    contractImage: 'https://example.com/image.png',
    tokenAddress: DAO_TOKEN,
    currentAuction: null,
    proposals: [],
    ...overrides,
  }) as unknown as DashboardDaoWithState

const buildAuction = (
  endTime: number,
  highestBid: { amount: string; bidder: string } | null = null
) => ({
  endTime: String(endTime),
  highestBid,
  token: { name: 'Test DAO #42', image: null, tokenId: '42' },
})

const SOME_BID = { amount: '1000000000000000000', bidder: USER }

describe('deriveUrgencyAlerts', () => {
  it('returns an empty array when there are no daos', () => {
    expect(deriveUrgencyAlerts([], NOW)).toEqual([])
  })

  it('creates a warning alert for an auction ending within the warning threshold', () => {
    const dao = buildDao({ currentAuction: buildAuction(NOW + 3 * HOUR) as any })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      type: 'AUCTION_ENDING',
      level: 'warning',
      endTime: NOW + 3 * HOUR,
      tokenId: '42',
      tokenName: 'Test DAO #42',
      id: `auction:${CHAIN_ID.BASE}:${DAO_TOKEN}:42`,
    })
  })

  it('creates a critical alert for an auction ending within the critical threshold', () => {
    const dao = buildDao({
      currentAuction: buildAuction(NOW + HOUR, SOME_BID) as any,
    })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts[0]).toMatchObject({ type: 'AUCTION_ENDING', level: 'critical' })
  })

  it('ignores auctions ending beyond the warning threshold', () => {
    const dao = buildDao({ currentAuction: buildAuction(NOW + 25 * HOUR) as any })
    expect(deriveUrgencyAlerts([dao], NOW, USER)).toEqual([])
  })

  it('ignores auctions that already ended', () => {
    const dao = buildDao({ currentAuction: buildAuction(NOW - 60) as any })
    expect(deriveUrgencyAlerts([dao], NOW, USER)).toEqual([])
  })

  it('ignores daos without a current auction', () => {
    const dao = buildDao({ currentAuction: null })
    expect(deriveUrgencyAlerts([dao], NOW, USER)).toEqual([])
  })

  it('treats threshold boundaries inclusively', () => {
    const warningDao = buildDao({
      currentAuction: buildAuction(
        NOW + DEFAULT_URGENCY_THRESHOLDS.warningSeconds,
        SOME_BID
      ) as any,
    })
    expect(deriveUrgencyAlerts([warningDao], NOW, USER)[0].level).toBe('warning')

    const criticalDao = buildDao({
      currentAuction: buildAuction(
        NOW + DEFAULT_URGENCY_THRESHOLDS.criticalSeconds,
        SOME_BID
      ) as any,
    })
    expect(deriveUrgencyAlerts([criticalDao], NOW, USER)[0].level).toBe('critical')

    const excludedDao = buildDao({
      currentAuction: buildAuction(
        NOW + DEFAULT_URGENCY_THRESHOLDS.warningSeconds + 1,
        SOME_BID
      ) as any,
    })
    expect(deriveUrgencyAlerts([excludedDao], NOW, USER)).toEqual([])
  })

  it('creates a voting alert with hasVoted false when the user has not voted', () => {
    const dao = buildDao({ proposals: [buildProposal({ votes: [] as any })] })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts[0]).toMatchObject({
      type: 'VOTING_ENDING',
      hasVoted: false,
      proposalNumber: 7,
      proposalTitle: 'Test proposal',
      id: `vote:${CHAIN_ID.BASE}:${DAO_TOKEN}:0xabc`,
    })
  })

  it('sets hasVoted true when the user has voted (case-insensitive)', () => {
    const dao = buildDao({
      proposals: [
        buildProposal({ votes: [{ voter: USER.toUpperCase() }] as unknown as any }),
      ],
    })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect((alerts[0] as { hasVoted: boolean }).hasVoted).toBe(true)
  })

  it('sets hasVoted false when no user address is provided', () => {
    const dao = buildDao({
      proposals: [buildProposal({ votes: [{ voter: USER }] as unknown as any })],
    })
    const alerts = deriveUrgencyAlerts([dao], NOW)
    expect((alerts[0] as { hasVoted: boolean }).hasVoted).toBe(false)
  })

  it('ignores non-active proposals for voting alerts', () => {
    const dao = buildDao({
      proposals: [
        buildProposal({
          state: ProposalState.Queued,
          voteEnd: String(NOW + HOUR),
          expiresAt: null,
        }),
      ],
    })
    expect(deriveUrgencyAlerts([dao], NOW, USER)).toEqual([])
  })

  it('creates an execution expiring alert for queued proposals', () => {
    const dao = buildDao({
      proposals: [
        buildProposal({
          state: ProposalState.Queued,
          expiresAt: String(NOW + 5 * HOUR),
        }),
      ],
    })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts[0]).toMatchObject({
      type: 'EXECUTION_EXPIRING',
      endTime: NOW + 5 * HOUR,
      id: `execution:${CHAIN_ID.BASE}:${DAO_TOKEN}:0xabc`,
    })
  })

  it('ignores queued proposals without expiresAt', () => {
    const dao = buildDao({
      proposals: [buildProposal({ state: ProposalState.Queued, expiresAt: null })],
    })
    expect(deriveUrgencyAlerts([dao], NOW, USER)).toEqual([])
  })

  it('falls back to the proposal number when the title is missing', () => {
    const dao = buildDao({ proposals: [buildProposal({ title: null as any })] })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect((alerts[0] as { proposalTitle: string }).proposalTitle).toBe('Proposal #7')
  })

  it('sorts alerts by soonest deadline first', () => {
    const dao = buildDao({
      currentAuction: buildAuction(NOW + 10 * HOUR) as any,
      proposals: [buildProposal({ voteEnd: String(NOW + HOUR) })],
    })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts.map((a) => a.type)).toEqual(['VOTING_ENDING', 'AUCTION_ENDING'])
  })

  // ---------------------------------------------------------------------------
  // VOTE_NEEDED (#4) — info, personal, fires only outside the warning window
  // ---------------------------------------------------------------------------

  it('creates a VOTE_NEEDED info alert for an active unvoted proposal outside the warning window', () => {
    const dao = buildDao({
      proposals: [buildProposal({ voteEnd: String(NOW + 4 * 24 * HOUR), votes: [] })],
    })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      type: 'VOTE_NEEDED',
      level: 'info',
      endTime: null,
      proposalNumber: 7,
      proposalTitle: 'Test proposal',
      id: `vote-needed:${CHAIN_ID.BASE}:${DAO_TOKEN}:0xabc:${USER.toLowerCase()}`,
    })
  })

  it('does not emit VOTE_NEEDED inside the warning window (VOTING_ENDING covers it)', () => {
    const dao = buildDao({
      proposals: [buildProposal({ voteEnd: String(NOW + 3 * HOUR), votes: [] })],
    })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts.map((a) => a.type)).toEqual(['VOTING_ENDING'])
  })

  it('does not emit VOTE_NEEDED when the user has already voted (case-insensitive)', () => {
    const dao = buildDao({
      proposals: [
        buildProposal({
          voteEnd: String(NOW + 4 * 24 * HOUR),
          votes: [{ voter: USER.toUpperCase() }] as unknown as any,
        }),
      ],
    })
    expect(deriveUrgencyAlerts([dao], NOW, USER)).toEqual([])
  })

  it('does not emit VOTE_NEEDED without a connected user address', () => {
    const dao = buildDao({
      proposals: [buildProposal({ voteEnd: String(NOW + 4 * 24 * HOUR), votes: [] })],
    })
    expect(deriveUrgencyAlerts([dao], NOW)).toEqual([])
  })

  it('treats the VOTE_NEEDED / VOTING_ENDING boundary at warningSeconds', () => {
    const { warningSeconds } = DEFAULT_URGENCY_THRESHOLDS

    const atBoundary = buildDao({
      proposals: [buildProposal({ voteEnd: String(NOW + warningSeconds), votes: [] })],
    })
    // inclusive: exactly warningSeconds away is still VOTING_ENDING
    expect(deriveUrgencyAlerts([atBoundary], NOW, USER).map((a) => a.type)).toEqual([
      'VOTING_ENDING',
    ])

    const justOutside = buildDao({
      proposals: [
        buildProposal({ voteEnd: String(NOW + warningSeconds + 1), votes: [] }),
      ],
    })
    expect(deriveUrgencyAlerts([justOutside], NOW, USER).map((a) => a.type)).toEqual([
      'VOTE_NEEDED',
    ])
  })

  // ---------------------------------------------------------------------------
  // PROPOSAL_EXECUTABLE (#5) — info, dedup against EXECUTION_EXPIRING
  // ---------------------------------------------------------------------------

  it('creates a PROPOSAL_EXECUTABLE info alert for a queued proposal past executableFrom', () => {
    const dao = buildDao({
      proposals: [
        buildProposal({
          state: ProposalState.Queued,
          expiresAt: null,
          executableFrom: String(NOW - HOUR),
        }),
      ],
    })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      type: 'PROPOSAL_EXECUTABLE',
      level: 'info',
      endTime: null,
      id: `executable:${CHAIN_ID.BASE}:${DAO_TOKEN}:0xabc`,
    })
  })

  it('does not emit PROPOSAL_EXECUTABLE when executableFrom is in the future', () => {
    const dao = buildDao({
      proposals: [
        buildProposal({
          state: ProposalState.Queued,
          expiresAt: null,
          executableFrom: String(NOW + HOUR),
        }),
      ],
    })
    expect(deriveUrgencyAlerts([dao], NOW, USER)).toEqual([])
  })

  it('suppresses PROPOSAL_EXECUTABLE when an EXECUTION_EXPIRING exists for the same proposal', () => {
    const dao = buildDao({
      proposals: [
        buildProposal({
          state: ProposalState.Queued,
          expiresAt: String(NOW + 5 * HOUR),
          executableFrom: String(NOW - HOUR),
        }),
      ],
    })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts).toHaveLength(1)
    expect(alerts[0].type).toBe('EXECUTION_EXPIRING')
  })

  // ---------------------------------------------------------------------------
  // PROPOSAL_QUEUEABLE (#6) — info, state-driven
  // ---------------------------------------------------------------------------

  it('creates a PROPOSAL_QUEUEABLE info alert for a succeeded proposal', () => {
    const dao = buildDao({
      proposals: [buildProposal({ state: ProposalState.Succeeded })],
    })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      type: 'PROPOSAL_QUEUEABLE',
      level: 'info',
      endTime: null,
      id: `queueable:${CHAIN_ID.BASE}:${DAO_TOKEN}:0xabc`,
    })
  })

  it('does not emit PROPOSAL_QUEUEABLE for non-succeeded states', () => {
    const pending = buildDao({
      proposals: [buildProposal({ state: ProposalState.Pending })],
    })
    expect(deriveUrgencyAlerts([pending], NOW, USER)).toEqual([])
  })

  // ---------------------------------------------------------------------------
  // AUCTION_NO_BIDS (#7) — critical, dedup against AUCTION_ENDING
  // ---------------------------------------------------------------------------

  it('creates a critical AUCTION_NO_BIDS alert and suppresses AUCTION_ENDING in the critical window', () => {
    const dao = buildDao({ currentAuction: buildAuction(NOW + HOUR) as any })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      type: 'AUCTION_NO_BIDS',
      level: 'critical',
      endTime: NOW + HOUR,
      tokenId: '42',
      id: `auction-nobids:${CHAIN_ID.BASE}:${DAO_TOKEN}:42`,
    })
  })

  it('falls back to AUCTION_ENDING when a bid is present in the critical window', () => {
    const dao = buildDao({
      currentAuction: buildAuction(NOW + HOUR, SOME_BID) as any,
    })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts.map((a) => a.type)).toEqual(['AUCTION_ENDING'])
    expect(alerts[0].level).toBe('critical')
  })

  it('keeps plain AUCTION_ENDING for a no-bid auction that is only within the warning window', () => {
    const dao = buildDao({ currentAuction: buildAuction(NOW + 5 * HOUR) as any })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts.map((a) => a.type)).toEqual(['AUCTION_ENDING'])
    expect(alerts[0].level).toBe('warning')
  })

  it('treats the AUCTION_NO_BIDS critical boundary inclusively', () => {
    const { criticalSeconds } = DEFAULT_URGENCY_THRESHOLDS

    const atBoundary = buildDao({
      currentAuction: buildAuction(NOW + criticalSeconds) as any,
    })
    expect(deriveUrgencyAlerts([atBoundary], NOW, USER).map((a) => a.type)).toEqual([
      'AUCTION_NO_BIDS',
    ])

    const justOutside = buildDao({
      currentAuction: buildAuction(NOW + criticalSeconds + 1) as any,
    })
    expect(deriveUrgencyAlerts([justOutside], NOW, USER).map((a) => a.type)).toEqual([
      'AUCTION_ENDING',
    ])
  })

  // ---------------------------------------------------------------------------
  // Ordering — (level rank, then soonest deadline / newest info)
  // ---------------------------------------------------------------------------

  it('orders stacked alerts critical → warning → info', () => {
    const dao = buildDao({
      // critical: no-bid auction inside the critical window
      currentAuction: buildAuction(NOW + HOUR) as any,
      proposals: [
        // warning: voting ending inside the warning window
        buildProposal({
          proposalId: '0xwarn',
          voteEnd: String(NOW + 5 * HOUR),
          votes: [{ voter: USER }] as unknown as any,
        }),
        // info: succeeded → queueable
        buildProposal({ proposalId: '0xinfo', state: ProposalState.Succeeded }),
      ],
    })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts.map((a) => a.level)).toEqual(['critical', 'warning', 'info'])
    expect(alerts.map((a) => a.type)).toEqual([
      'AUCTION_NO_BIDS',
      'VOTING_ENDING',
      'PROPOSAL_QUEUEABLE',
    ])
  })

  it('orders two info kinds by newest timeCreated first', () => {
    const dao = buildDao({
      proposals: [
        buildProposal({
          proposalId: '0xold',
          state: ProposalState.Succeeded,
          timeCreated: String(NOW - 10 * HOUR),
        }),
        buildProposal({
          proposalId: '0xnew',
          state: ProposalState.Succeeded,
          timeCreated: String(NOW - HOUR),
        }),
      ],
    })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts.map((a) => a.id)).toEqual([
      `queueable:${CHAIN_ID.BASE}:${DAO_TOKEN}:0xnew`,
      `queueable:${CHAIN_ID.BASE}:${DAO_TOKEN}:0xold`,
    ])
  })

  it('respects custom thresholds', () => {
    const thresholds = { warningSeconds: HOUR, criticalSeconds: 600 }

    const beyond = buildDao({
      currentAuction: buildAuction(NOW + 2 * HOUR, SOME_BID) as any,
    })
    expect(deriveUrgencyAlerts([beyond], NOW, USER, thresholds)).toEqual([])

    const warning = buildDao({
      currentAuction: buildAuction(NOW + 0.5 * HOUR, SOME_BID) as any,
    })
    expect(deriveUrgencyAlerts([warning], NOW, USER, thresholds)[0].level).toBe('warning')

    const critical = buildDao({
      currentAuction: buildAuction(NOW + 500, SOME_BID) as any,
    })
    expect(deriveUrgencyAlerts([critical], NOW, USER, thresholds)[0].level).toBe(
      'critical'
    )
  })
})
