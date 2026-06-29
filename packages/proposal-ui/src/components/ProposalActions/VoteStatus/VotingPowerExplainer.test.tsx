import { BUILDER_DAO, render } from '@buildeross/test-fixtures'
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { VotingPowerExplainer } from './VotingPowerExplainer'

const VOTING_POWER_DOCS_URL =
  'https://docs.nouns.build/onboarding/governance/#-voting-power'

const USER_ADDRESS = '0x1111111111111111111111111111111111111111'
const OTHER_ADDRESS = '0x2222222222222222222222222222222222222222'

let mockAccount: { address?: string }
let mockUseVotesReturn: {
  isLoading: boolean
  isOwner: boolean
  isVetoer: boolean
  hasThreshold: boolean
  isDelegating: boolean
  delegatedTo?: string
  proposalVotesRequired: bigint
  votes: bigint
}
let mockMembershipReturn: {
  data:
    | {
        tokenCount: number
        voteCount: number
        voteDistribution: Record<string, number>
      }
    | undefined
  isLoading: boolean
  isValidating: boolean
  error: undefined
  mutate: () => void
}

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return { ...actual, useAccount: () => mockAccount }
})

vi.mock('@buildeross/hooks/useVotes', () => ({
  useVotes: () => mockUseVotesReturn,
}))

vi.mock('@buildeross/hooks/useDaoMembership', () => ({
  useDaoMembership: () => mockMembershipReturn,
}))

vi.mock('@buildeross/hooks/useEnsData', () => ({
  useEnsData: (addr?: string) => ({
    displayName: addr ? 'delegate.eth' : '',
    isLoading: false,
  }),
}))

const TIME_CREATED = 1700000000

const renderExplainer = (snapshotVotes = 0) =>
  render(
    <VotingPowerExplainer
      snapshotVotes={snapshotVotes}
      timeCreated={TIME_CREATED}
      daoName={'Builder'}
    />,
    { addresses: BUILDER_DAO }
  )

describe('VotingPowerExplainer', () => {
  beforeEach(() => {
    mockAccount = { address: USER_ADDRESS }
    mockUseVotesReturn = {
      isLoading: false,
      isOwner: false,
      isVetoer: false,
      hasThreshold: false,
      isDelegating: false,
      delegatedTo: undefined,
      proposalVotesRequired: 1n,
      votes: 0n,
    }
    mockMembershipReturn = {
      data: undefined,
      isLoading: false,
      isValidating: false,
      error: undefined,
      mutate: () => {},
    }
  })

  it('renders connect prompt when wallet is not connected', () => {
    mockAccount = { address: undefined }

    renderExplainer(0)

    expect(
      screen.getByText('Connect your wallet to see your voting power for this proposal')
    ).toBeInTheDocument()
  })

  it('renders loading state while voting power is loading', () => {
    mockUseVotesReturn = { ...mockUseVotesReturn, isLoading: true }

    renderExplainer(0)

    expect(screen.getByText('Checking your voting power...')).toBeInTheDocument()
  })

  it('renders no-tokens explanation with auction CTA', () => {
    renderExplainer(0)

    expect(screen.getByText(/You do not hold any/)).toBeInTheDocument()

    const cta = screen.getByText(/Bid in the current auction/)
    const href = cta.closest('a')?.getAttribute('href')
    expect(href).toContain(BUILDER_DAO.token)
  })

  it('renders snapshot explanation when votes were acquired after the snapshot', () => {
    mockUseVotesReturn = { ...mockUseVotesReturn, votes: 2n }

    renderExplainer(0)

    expect(screen.getByText(/snapshotted on/)).toBeInTheDocument()
    expect(screen.getByText(/after the snapshot/)).toBeInTheDocument()
    expect(screen.getByText(/2 votes/)).toBeInTheDocument()
    expect(screen.getByText(/2023/)).toBeInTheDocument()

    const learnMore = screen.getByText(/Learn more about voting power/)
    expect(learnMore.closest('a')?.getAttribute('href')).toBe(VOTING_POWER_DOCS_URL)
  })

  it('renders delegation info with delegate name and update CTA', () => {
    mockUseVotesReturn = {
      ...mockUseVotesReturn,
      votes: 0n,
      isDelegating: true,
      delegatedTo: OTHER_ADDRESS as `0x${string}`,
    }
    mockMembershipReturn = {
      ...mockMembershipReturn,
      data: { tokenCount: 3, voteCount: 0, voteDistribution: {} },
    }

    renderExplainer(0)

    expect(screen.getByText(/delegated to/)).toBeInTheDocument()
    expect(screen.getByText(/delegate\.eth/)).toBeInTheDocument()

    const cta = screen.getByText(/Update delegation/)
    expect(cta.closest('a')?.getAttribute('href')).toContain('tab=activity')
  })

  it('renders available votes when user can vote', () => {
    renderExplainer(2)

    expect(screen.getByText(/You have/)).toBeInTheDocument()
    expect(screen.getByText(/2 votes/)).toBeInTheDocument()
    expect(screen.getByText(/available for/)).toBeInTheDocument()
  })

  it('renders aggregated voting power for delegates', () => {
    mockMembershipReturn = {
      ...mockMembershipReturn,
      data: {
        tokenCount: 2,
        voteCount: 5,
        voteDistribution: {
          [USER_ADDRESS]: 2,
          [OTHER_ADDRESS]: 3,
        },
      },
    }

    renderExplainer(5)

    expect(
      screen.getByText(/including 3 delegated to you by other members/)
    ).toBeInTheDocument()
  })
})
