import type { DashboardDaoWithState } from '@buildeross/hooks/useDashboardData'
import { type AddressType, CHAIN_ID, ProposalState } from '@buildeross/types'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UrgencyAlerts } from './UrgencyAlerts'
import { dismissedUrgencyAlertsStore } from './useDismissedUrgencyAlerts'

const NOW = 1_700_000_000
const HOUR = 3600
const USER = '0x1111111111111111111111111111111111111111' as AddressType
const DAO_TOKEN = '0x3333333333333333333333333333333333333333'

let mockAddress: AddressType | undefined = USER
let mockDaos: DashboardDaoWithState[] = []

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: mockAddress }),
}))

vi.mock('@buildeross/hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    daos: mockDaos,
    isLoading: false,
    isValidating: false,
    error: undefined,
    refresh: vi.fn(),
  }),
}))

vi.mock('@buildeross/ui/Countdown', () => ({
  Countdown: ({ end }: { end: number }) => <span data-testid="countdown">{end}</span>,
}))

vi.mock('@buildeross/ui/LinksProvider', () => ({
  useLinks: () => ({
    getAuctionLink: (_chainId: unknown, tokenAddress: unknown, tokenId?: unknown) => ({
      href: `/auction/${tokenAddress}/${tokenId}`,
    }),
    getProposalLink: (_chainId: unknown, tokenAddress: unknown, proposalId: unknown) => ({
      href: `/proposal/${tokenAddress}/${proposalId}`,
    }),
  }),
}))

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
) =>
  ({
    endTime: String(endTime),
    highestBid,
    token: { name: 'Test DAO #42', image: null, tokenId: '42' },
  }) as unknown as NonNullable<DashboardDaoWithState['currentAuction']>

const SOME_BID = { amount: '1000000000000000000', bidder: USER }

describe('UrgencyAlerts', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW * 1000)
    mockAddress = USER
    mockDaos = []
    dismissedUrgencyAlertsStore.setState({ dismissedIds: [] })
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when the wallet is disconnected', () => {
    mockAddress = undefined
    mockDaos = [buildDao({ currentAuction: buildAuction(NOW + 3 * HOUR) })]
    render(<UrgencyAlerts />)
    expect(screen.queryByTestId('urgency-alerts')).toBeNull()
  })

  it('renders nothing when no deadline is within the warning threshold', () => {
    mockDaos = [
      buildDao({
        currentAuction: buildAuction(NOW + 48 * HOUR),
        // already-voted so no personal VOTE_NEEDED info row competes here;
        // this test isolates the deadline-window behaviour.
        proposals: [
          buildProposal({
            voteEnd: String(NOW + 48 * HOUR),
            votes: [{ voter: USER }] as unknown as any,
          }),
        ],
      }),
    ]
    render(<UrgencyAlerts />)
    expect(screen.queryByTestId('urgency-alerts')).toBeNull()
  })

  it('renders an auction ending alert with link and countdown', () => {
    mockDaos = [buildDao({ currentAuction: buildAuction(NOW + 3 * HOUR) })]
    render(<UrgencyAlerts />)

    expect(screen.getByText('Auction ending soon')).toBeInTheDocument()
    expect(screen.getByText('Test DAO · Test DAO #42')).toBeInTheDocument()

    const link = screen.getByText('Auction ending soon').closest('a')
    // LinkWrapper's default <a> prepends BASE_URL to relative hrefs.
    expect(link?.getAttribute('href')).toMatch(new RegExp(`/auction/${DAO_TOKEN}/42$`))

    expect(screen.getByTestId('countdown')).toBeInTheDocument()

    const row = screen.getByText('Auction ending soon').closest('[data-urgency-level]')
    expect(row).toHaveAttribute('data-urgency-level', 'warning')
  })

  it('marks alerts inside the critical threshold as critical', () => {
    mockDaos = [buildDao({ currentAuction: buildAuction(NOW + HOUR, SOME_BID) })]
    render(<UrgencyAlerts />)
    const row = screen.getByText('Auction ending soon').closest('[data-urgency-level]')
    expect(row).toHaveAttribute('data-urgency-level', 'critical')
  })

  it('shows the unvoted badge when the connected user has not voted', () => {
    mockDaos = [
      buildDao({
        proposals: [buildProposal({ voteEnd: String(NOW + 3 * HOUR), votes: [] as any })],
      }),
    ]
    render(<UrgencyAlerts />)

    expect(screen.getByText('Voting ending soon')).toBeInTheDocument()
    expect(screen.getByText("You haven't voted")).toBeInTheDocument()

    const link = screen.getByText('Voting ending soon').closest('a')
    // LinkWrapper's default <a> prepends BASE_URL to relative hrefs.
    expect(link?.getAttribute('href')).toMatch(new RegExp(`/proposal/${DAO_TOKEN}/7$`))
  })

  it('hides the unvoted badge when the user has voted', () => {
    mockDaos = [
      buildDao({
        proposals: [
          buildProposal({
            voteEnd: String(NOW + 3 * HOUR),
            votes: [{ voter: USER }] as unknown as any,
          }),
        ],
      }),
    ]
    render(<UrgencyAlerts />)
    expect(screen.queryByText("You haven't voted")).toBeNull()
  })

  it('renders an execution expiring alert for queued proposals', () => {
    mockDaos = [
      buildDao({
        proposals: [
          buildProposal({
            state: ProposalState.Queued,
            expiresAt: String(NOW + 5 * HOUR),
          }),
        ],
      }),
    ]
    render(<UrgencyAlerts />)
    expect(screen.getByText('Execution window expiring')).toBeInTheDocument()
  })

  it('dismisses an alert and persists the dismissal across re-renders', () => {
    mockDaos = [buildDao({ currentAuction: buildAuction(NOW + 3 * HOUR) })]
    const { unmount } = render(<UrgencyAlerts />)

    expect(screen.getByText('Auction ending soon')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Dismiss alert'))

    expect(screen.queryByText('Auction ending soon')).toBeNull()
    expect(dismissedUrgencyAlertsStore.getState().dismissedIds).toContain(
      `auction:${CHAIN_ID.BASE}:${DAO_TOKEN}:42`
    )

    unmount()
    render(<UrgencyAlerts />)
    expect(screen.queryByText('Auction ending soon')).toBeNull()
  })

  it('orders alerts by soonest deadline first', () => {
    mockDaos = [
      buildDao({
        currentAuction: buildAuction(NOW + 10 * HOUR),
        proposals: [buildProposal({ voteEnd: String(NOW + HOUR) })],
      }),
    ]
    render(<UrgencyAlerts />)

    const titles = screen
      .getAllByText(/ending soon|expiring/)
      .map((node) => node.textContent)
    expect(titles).toEqual(['Voting ending soon', 'Auction ending soon'])
  })

  it('respects custom thresholds prop', () => {
    mockDaos = [buildDao({ currentAuction: buildAuction(NOW + 2 * HOUR) })]
    render(<UrgencyAlerts thresholds={{ warningSeconds: HOUR, criticalSeconds: 600 }} />)
    expect(screen.queryByTestId('urgency-alerts')).toBeNull()
  })

  it('renders a Ready to queue info alert with proposal link and no countdown', () => {
    mockDaos = [
      buildDao({ proposals: [buildProposal({ state: ProposalState.Succeeded })] }),
    ]
    render(<UrgencyAlerts />)

    expect(screen.getByText('Ready to queue')).toBeInTheDocument()
    const link = screen.getByText('Ready to queue').closest('a')
    expect(link?.getAttribute('href')).toMatch(new RegExp(`/proposal/${DAO_TOKEN}/7$`))

    const row = screen.getByText('Ready to queue').closest('[data-urgency-level]')
    expect(row).toHaveAttribute('data-urgency-level', 'info')
    expect(screen.queryByTestId('countdown')).toBeNull()
  })

  it('renders a Ready to execute info alert for an executable queued proposal', () => {
    mockDaos = [
      buildDao({
        proposals: [
          buildProposal({
            state: ProposalState.Queued,
            expiresAt: null,
            executableFrom: String(NOW - HOUR),
          }),
        ],
      }),
    ]
    render(<UrgencyAlerts />)

    expect(screen.getByText('Ready to execute')).toBeInTheDocument()
    const row = screen.getByText('Ready to execute').closest('[data-urgency-level]')
    expect(row).toHaveAttribute('data-urgency-level', 'info')
    expect(screen.queryByTestId('countdown')).toBeNull()
  })

  it("renders a You haven't voted info alert outside the warning window", () => {
    mockDaos = [
      buildDao({
        proposals: [
          buildProposal({ voteEnd: String(NOW + 4 * 24 * HOUR), votes: [] as any }),
        ],
      }),
    ]
    render(<UrgencyAlerts />)

    expect(screen.getByText("You haven't voted")).toBeInTheDocument()
    expect(screen.getByText(/ends in 4 days/)).toBeInTheDocument()

    const row = screen.getByText("You haven't voted").closest('[data-urgency-level]')
    expect(row).toHaveAttribute('data-urgency-level', 'info')
    expect(screen.queryByTestId('countdown')).toBeNull()
  })

  it('renders a critical Auction has no bids alert with countdown and suppresses the plain row', () => {
    mockDaos = [buildDao({ currentAuction: buildAuction(NOW + HOUR) })]
    render(<UrgencyAlerts />)

    expect(screen.getByText('Auction has no bids')).toBeInTheDocument()
    expect(screen.queryByText('Auction ending soon')).toBeNull()

    const link = screen.getByText('Auction has no bids').closest('a')
    expect(link?.getAttribute('href')).toMatch(new RegExp(`/auction/${DAO_TOKEN}/42$`))

    const row = screen.getByText('Auction has no bids').closest('[data-urgency-level]')
    expect(row).toHaveAttribute('data-urgency-level', 'critical')
    expect(screen.getByTestId('countdown')).toBeInTheDocument()
  })

  it('persists the dismissal key for an info alert', () => {
    mockDaos = [
      buildDao({ proposals: [buildProposal({ state: ProposalState.Succeeded })] }),
    ]
    render(<UrgencyAlerts />)

    expect(screen.getByText('Ready to queue')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Dismiss alert'))

    expect(screen.queryByText('Ready to queue')).toBeNull()
    expect(dismissedUrgencyAlertsStore.getState().dismissedIds).toContain(
      `queueable:${CHAIN_ID.BASE}:${DAO_TOKEN}:0xabc`
    )
  })

  it('hides the personal VOTE_NEEDED row when the wallet is disconnected', () => {
    mockAddress = undefined
    mockDaos = [
      buildDao({
        proposals: [
          buildProposal({ voteEnd: String(NOW + 4 * 24 * HOUR), votes: [] as any }),
        ],
      }),
    ]
    render(<UrgencyAlerts />)
    expect(screen.queryByTestId('urgency-alerts')).toBeNull()
    expect(screen.queryByText("You haven't voted")).toBeNull()
  })

  it('orders a stacked critical, warning and info mix correctly', () => {
    mockDaos = [
      buildDao({
        currentAuction: buildAuction(NOW + HOUR),
        proposals: [
          buildProposal({
            proposalId: '0xwarn',
            voteEnd: String(NOW + 5 * HOUR),
            votes: [{ voter: USER }] as unknown as any,
          }),
          buildProposal({ proposalId: '0xinfo', state: ProposalState.Succeeded }),
        ],
      }),
    ]
    render(<UrgencyAlerts />)

    const rows = Array.from(
      document.querySelectorAll('[data-urgency-level]')
    ) as HTMLElement[]
    expect(rows.map((r) => r.getAttribute('data-urgency-level'))).toEqual([
      'critical',
      'warning',
      'info',
    ])
  })
})
