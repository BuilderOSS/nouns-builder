import { BUILDER_DAO, render } from '@buildeross/test-fixtures'
import { CHAIN_ID } from '@buildeross/types'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { VotingPowerCase } from './VotingPowerExplainer.helper'
import {
  VOTING_POWER_DOCS_URL,
  VotingPowerExplainerView,
  VotingPowerExplainerViewProps,
} from './VotingPowerExplainerView'

const baseProps: VotingPowerExplainerViewProps = {
  votingCase: VotingPowerCase.CanVote,
  chainId: CHAIN_ID.FOUNDRY,
  token: BUILDER_DAO.token as `0x${string}`,
  daoName: 'Builder',
  snapshotVotes: 0,
  currentVotes: 0,
  tokenCount: 0,
  delegatedVotes: 0,
  delegateDisplayName: 'delegate.eth',
  snapshotDateLabel: 'Nov 14, 2023 1:00 PM GMT-3',
}

const renderView = (props: Partial<VotingPowerExplainerViewProps>) =>
  render(<VotingPowerExplainerView {...baseProps} {...props} />)

describe('VotingPowerExplainerView', () => {
  it('renders the loading copy', () => {
    renderView({ votingCase: VotingPowerCase.Loading })
    expect(screen.getByText('Checking your voting power...')).toBeInTheDocument()
  })

  it('renders the not-connected copy', () => {
    renderView({ votingCase: VotingPowerCase.NotConnected })
    expect(
      screen.getByText('Connect your wallet to see your voting power for this proposal')
    ).toBeInTheDocument()
  })

  it('renders the no-tokens copy with auction CTA', () => {
    renderView({ votingCase: VotingPowerCase.NoTokens })
    expect(screen.getByText(/You do not hold any/)).toBeInTheDocument()
    const cta = screen.getByText(/Bid in the current auction/)
    expect(cta.closest('a')?.getAttribute('href')).toContain(BUILDER_DAO.token)
  })

  it('renders the acquired-after-snapshot copy with docs link', () => {
    renderView({ votingCase: VotingPowerCase.AcquiredAfterSnapshot, currentVotes: 2 })
    expect(screen.getByText(/snapshotted on/)).toBeInTheDocument()
    expect(screen.getByText(/after the snapshot/)).toBeInTheDocument()
    expect(screen.getByText(/2 votes/)).toBeInTheDocument()
    const learnMore = screen.getByText(/Learn more about voting power/)
    expect(learnMore.closest('a')?.getAttribute('href')).toBe(VOTING_POWER_DOCS_URL)
  })

  it('renders the delegated-away copy with delegate name', () => {
    renderView({
      votingCase: VotingPowerCase.DelegatedAway,
      tokenCount: 3,
      delegateDisplayName: 'delegate.eth',
    })
    expect(screen.getByText(/delegated to/)).toBeInTheDocument()
    expect(screen.getByText(/delegate\.eth/)).toBeInTheDocument()
    const cta = screen.getByText(/Update delegation/)
    expect(cta.closest('a')?.getAttribute('href')).toContain('tab=activity')
  })

  it('renders available votes for the can-vote case', () => {
    renderView({ votingCase: VotingPowerCase.CanVote, snapshotVotes: 2 })
    expect(screen.getByText(/You have/)).toBeInTheDocument()
    expect(screen.getByText(/2 votes/)).toBeInTheDocument()
    expect(screen.getByText(/available for/)).toBeInTheDocument()
  })

  it('renders aggregated voting power for the can-vote-with-delegation case', () => {
    renderView({
      votingCase: VotingPowerCase.CanVoteWithDelegation,
      snapshotVotes: 5,
      delegatedVotes: 3,
    })
    expect(
      screen.getByText(/including 3 delegated to you by other members/)
    ).toBeInTheDocument()
  })
})
