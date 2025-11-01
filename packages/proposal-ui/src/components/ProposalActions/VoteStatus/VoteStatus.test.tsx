import { ProposalState } from '@buildeross/sdk/contract'
import { ProposalVoteSupport as Support } from '@buildeross/sdk/subgraph'
import { render } from '@buildeross/test-fixtures'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { VoteStatus } from './VoteStatus'

describe('VoteStatus', () => {
  it('should render proposal countdown to active if state is in pending', () => {
    render(
      <VoteStatus
        votesAvailable={0}
        proposalId={'0x12'}
        voteStart={1630000000}
        state={ProposalState.Pending}
        daoName={'xcz'}
        title={'Upgrade xcz'}
      />
    )
    expect(screen.getByText('Time until voting starts')).toBeInTheDocument()
  })

  it('should render you cannot vote given no signersVote, no votes cast and the proposal is active', () => {
    render(
      <VoteStatus
        votesAvailable={0}
        proposalId={'0x12'}
        voteStart={1630000000}
        state={ProposalState.Active}
        daoName={'xcz'}
        title={'Upgrade xcz'}
      />
    )

    expect(
      screen.getByText('You must hold at least one xcz token to vote on proposals')
    ).toBeInTheDocument()
  })

  it('should render you can vote given proposal is active, no signerVote and votesAvailable', () => {
    render(
      <VoteStatus
        votesAvailable={2}
        proposalId={'0x12'}
        voteStart={1630000000}
        state={ProposalState.Active}
        daoName={'xcz'}
        title={'Upgrade xcz'}
      />
    )

    expect(screen.getByText(/You have/)).toBeInTheDocument()
    expect(screen.getByText(/2 votes/)).toBeInTheDocument()
    expect(screen.getByText(/available for xcz/)).toBeInTheDocument()
  })

  describe('given a signers vote', () => {
    it('should render voted for on succeeded proposal', () => {
      render(
        <VoteStatus
          signerVote={{
            voter: '0x12345',
            reason: 'FOR',
            support: Support.For,
            weight: 3,
          }}
          votesAvailable={1}
          proposalId={'0x12'}
          voteStart={1630000000}
          state={ProposalState.Succeeded}
          daoName={'xcz'}
          title={'Upgrade xcz'}
        />
      )

      expect(screen.getByText(/You voted/)).toBeInTheDocument()
      expect(screen.getByText(/for/)).toBeInTheDocument()
      expect(screen.getByText(/with 3 votes/)).toBeInTheDocument()
    })

    it('should render voted against on a queued proposal', () => {
      render(
        <VoteStatus
          signerVote={{
            voter: '0x12345',
            reason: '',
            support: Support.Against,
            weight: 5,
          }}
          votesAvailable={1}
          proposalId={'0x12'}
          voteStart={1630000000}
          state={ProposalState.Queued}
          daoName={'xcz'}
          title={'Upgrade xcz'}
        />
      )

      expect(screen.getByText(/You voted/)).toBeInTheDocument()
      expect(screen.getByText(/against/)).toBeInTheDocument()
      expect(screen.getByText(/with 5 votes/)).toBeInTheDocument()
    })

    it('should render an abstained vote on an active proposal', () => {
      render(
        <VoteStatus
          signerVote={{
            voter: '0x12345',
            reason: '',
            support: Support.Abstain,
            weight: 5,
          }}
          votesAvailable={1}
          proposalId={'0x12'}
          voteStart={1630000000}
          state={ProposalState.Active}
          daoName={'xcz'}
          title={'Upgrade xcz'}
        />
      )

      expect(screen.getByText('You abstained from voting')).toBeInTheDocument()
    })
  })

  it('should render did not participate status given 1 vote available, executed state, and no votes placed', () => {
    render(
      <VoteStatus
        signerVote={undefined}
        votesAvailable={1}
        proposalId={'0x12'}
        voteStart={1630000000}
        state={ProposalState.Executed}
        daoName={'xcz'}
        title={'Upgrade xcz'}
      />
    )

    expect(
      screen.getByText('You did not participate in voting on this proposal')
    ).toBeInTheDocument()
  })

  // what might be the boundaries and edge cases we should consider in rendering?
})
