import { describe, expect, it } from 'vitest'

import {
  getVotingPowerCase,
  VotingPowerCase,
  VotingPowerInputs,
} from './VotingPowerExplainer.helper'

const base: VotingPowerInputs = {
  isConnected: true,
  isLoading: false,
  snapshotVotes: 0,
  currentVotes: 0,
  tokenCount: 0,
  delegatedVotes: 0,
  isDelegating: false,
}

describe('getVotingPowerCase', () => {
  it('returns CanVote when snapshot votes exist and no delegated votes', () => {
    expect(getVotingPowerCase({ ...base, snapshotVotes: 3 })).toBe(
      VotingPowerCase.CanVote
    )
  })

  it('returns CanVoteWithDelegation when snapshot votes include delegated votes', () => {
    expect(getVotingPowerCase({ ...base, snapshotVotes: 5, delegatedVotes: 3 })).toBe(
      VotingPowerCase.CanVoteWithDelegation
    )
  })

  it('returns CanVote even when disconnected if snapshot votes exist', () => {
    expect(getVotingPowerCase({ ...base, isConnected: false, snapshotVotes: 2 })).toBe(
      VotingPowerCase.CanVote
    )
  })

  it('returns NotConnected when wallet is disconnected and no snapshot votes', () => {
    expect(getVotingPowerCase({ ...base, isConnected: false })).toBe(
      VotingPowerCase.NotConnected
    )
  })

  it('returns Loading when connected and data is loading', () => {
    expect(getVotingPowerCase({ ...base, isLoading: true })).toBe(VotingPowerCase.Loading)
  })

  it('returns DelegatedAway when tokens are delegated to another address', () => {
    expect(
      getVotingPowerCase({
        ...base,
        tokenCount: 2,
        currentVotes: 0,
        isDelegating: true,
      })
    ).toBe(VotingPowerCase.DelegatedAway)
  })

  it('returns AcquiredAfterSnapshot when current votes exist but snapshot votes are zero', () => {
    expect(getVotingPowerCase({ ...base, currentVotes: 2 })).toBe(
      VotingPowerCase.AcquiredAfterSnapshot
    )
  })

  it('returns AcquiredAfterSnapshot for token holders with zero votes who are not delegating', () => {
    expect(
      getVotingPowerCase({
        ...base,
        tokenCount: 1,
        currentVotes: 0,
        isDelegating: false,
      })
    ).toBe(VotingPowerCase.AcquiredAfterSnapshot)
  })

  it('prefers DelegatedAway over AcquiredAfterSnapshot when both could apply', () => {
    expect(
      getVotingPowerCase({
        ...base,
        tokenCount: 2,
        currentVotes: 0,
        isDelegating: true,
      })
    ).toBe(VotingPowerCase.DelegatedAway)
  })

  it('returns NoTokens when user has no tokens and no votes', () => {
    expect(getVotingPowerCase(base)).toBe(VotingPowerCase.NoTokens)
  })
})
