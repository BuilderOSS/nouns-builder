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

const buildAuction = (endTime: number) => ({
  endTime: String(endTime),
  highestBid: null,
  token: { name: 'Test DAO #42', image: null, tokenId: '42' },
})

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
    const dao = buildDao({ currentAuction: buildAuction(NOW + HOUR) as any })
    const alerts = deriveUrgencyAlerts([dao], NOW, USER)
    expect(alerts[0].level).toBe('critical')
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
        NOW + DEFAULT_URGENCY_THRESHOLDS.warningSeconds
      ) as any,
    })
    expect(deriveUrgencyAlerts([warningDao], NOW, USER)[0].level).toBe('warning')

    const criticalDao = buildDao({
      currentAuction: buildAuction(
        NOW + DEFAULT_URGENCY_THRESHOLDS.criticalSeconds
      ) as any,
    })
    expect(deriveUrgencyAlerts([criticalDao], NOW, USER)[0].level).toBe('critical')

    const excludedDao = buildDao({
      currentAuction: buildAuction(
        NOW + DEFAULT_URGENCY_THRESHOLDS.warningSeconds + 1
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
      id: `vote:${CHAIN_ID.BASE}:0xabc`,
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
      id: `execution:${CHAIN_ID.BASE}:0xabc`,
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

  it('respects custom thresholds', () => {
    const thresholds = { warningSeconds: HOUR, criticalSeconds: 600 }

    const beyond = buildDao({ currentAuction: buildAuction(NOW + 2 * HOUR) as any })
    expect(deriveUrgencyAlerts([beyond], NOW, USER, thresholds)).toEqual([])

    const warning = buildDao({ currentAuction: buildAuction(NOW + 0.5 * HOUR) as any })
    expect(deriveUrgencyAlerts([warning], NOW, USER, thresholds)[0].level).toBe('warning')

    const critical = buildDao({ currentAuction: buildAuction(NOW + 500) as any })
    expect(deriveUrgencyAlerts([critical], NOW, USER, thresholds)[0].level).toBe(
      'critical'
    )
  })
})
