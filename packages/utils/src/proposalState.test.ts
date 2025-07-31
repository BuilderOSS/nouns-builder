import { ProposalState } from '@buildeross/types'

import {
  isProposalExecutable,
  isProposalOpen,
  isProposalSuccessful,
} from './proposalState'

describe('isProposalOpen', () => {
  it('should return true if proposal is open', () => {
    expect(isProposalOpen(ProposalState.Active)).toBe(true)
    expect(isProposalOpen(ProposalState.Queued)).toBe(true)
    expect(isProposalOpen(ProposalState.Succeeded)).toBe(true)
    expect(isProposalOpen(ProposalState.Pending)).toBe(true)
  })

  it('should return false if proposal is not open', () => {
    expect(isProposalOpen(ProposalState.Executed)).toBe(false)
    expect(isProposalOpen(ProposalState.Defeated)).toBe(false)
    expect(isProposalOpen(ProposalState.Canceled)).toBe(false)
    expect(isProposalOpen(ProposalState.Expired)).toBe(false)
  })
})

describe('isProposalSuccessful', () => {
  it('should return ProposalSucceededStatus if proposal is successful', () => {
    expect(isProposalSuccessful(ProposalState.Succeeded)).toBe(true)
    expect(isProposalSuccessful(ProposalState.Queued)).toBe(true)
  })

  it('should return false if proposal is not successful', () => {
    expect(isProposalSuccessful(ProposalState.Executed)).toBe(false)
    expect(isProposalSuccessful(ProposalState.Defeated)).toBe(false)
    expect(isProposalSuccessful(ProposalState.Canceled)).toBe(false)
    expect(isProposalSuccessful(ProposalState.Expired)).toBe(false)
    expect(isProposalSuccessful(ProposalState.Pending)).toBe(false)
    expect(isProposalSuccessful(ProposalState.Active)).toBe(false)
  })
})

describe('isProposalExecutable', () => {
  it('should return true if proposal is queued and executable time has passed', () => {
    const pastTimestamp = Math.floor((Date.now() - 1000 * 60 * 60) / 1000) // 1 hour ago
    const proposal = {
      state: ProposalState.Queued,
      executableFrom: pastTimestamp,
    }

    expect(isProposalExecutable(proposal)).toBe(true)
  })

  it('should return false if proposal is not queued', () => {
    const pastTimestamp = Math.floor((Date.now() - 1000 * 60 * 60) / 1000) // 1 hour ago
    const proposal = {
      state: ProposalState.Succeeded,
      executableFrom: pastTimestamp,
    }

    expect(isProposalExecutable(proposal)).toBe(false)
  })

  it('should return false if executable time has not passed', () => {
    const futureTimestamp = Math.floor((Date.now() + 1000 * 60 * 60) / 1000) // 1 hour from now
    const proposal = {
      state: ProposalState.Queued,
      executableFrom: futureTimestamp,
    }

    expect(isProposalExecutable(proposal)).toBe(false)
  })

  it('should return false if executableFrom is undefined', () => {
    const proposal = {
      state: ProposalState.Queued,
      executableFrom: undefined,
    }

    expect(isProposalExecutable(proposal)).toBe(false)
  })
})
