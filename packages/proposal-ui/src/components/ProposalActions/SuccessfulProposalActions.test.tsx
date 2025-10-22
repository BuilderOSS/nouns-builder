import { ProposalState } from '@buildeross/sdk/contract'
import { Proposal } from '@buildeross/sdk/subgraph'
import { screen } from '@testing-library/react'
import dayjs from 'dayjs'
import React from 'react'
import { render } from 'src/test/utils'
import { describe, expect, it, vi } from 'vitest'

import { SuccessfulProposalActions } from './SuccessfulProposalActions'

describe('proposal status', () => {
  const date = new Date(2022, 1, 1)

  beforeEach(() => {
    vi.setSystemTime(date)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render a succeeded proposal', async () => {
    render(
      <SuccessfulProposalActions
        proposal={
          {
            proposalId: '0x9ddab946',
            state: ProposalState.Succeeded,
            calldatas: [
              '0x1e83409a000000000000000000000000dc9b96ea4966d063dd5c8dbaf08fe59062091b6d',
            ],
            targets: ['0xc20dac0b62b28edde0c44ab1be2206a1c48e6a67'],
            values: ['0'],
            descriptionHash:
              '0xf7bf256625bf1d86a299fe194328b2cc7145877bbd004e8d63a93885df4917a3',
            proposer: '0xd1d1d4e36117ab794ec5d4c78cbd3a8904e691d0',
          } as Proposal
        }
      />
    )

    expect(screen.getByText('Queue')).toBeInTheDocument()
    expect(screen.getByText('Queue this proposal before it expires')).toBeInTheDocument()
  })

  it('should render a queued proposal', async () => {
    render(
      <SuccessfulProposalActions
        proposal={
          {
            proposalId: '0x9ddab946',
            state: ProposalState.Queued,
            calldatas: [
              '0x1e83409a000000000000000000000000dc9b96ea4966d063dd5c8dbaf08fe59062091b6d',
            ],
            targets: ['0xc20dac0b62b28edde0c44ab1be2206a1c48e6a67'],
            values: ['0'],
            descriptionHash:
              '0xf7bf256625bf1d86a299fe194328b2cc7145877bbd004e8d63a93885df4917a3',
            proposer: '0xd1d1d4e36117ab794ec5d4c78cbd3a8904e691d0',
            executableFrom: dayjs(date).add(2, 'day').unix(),
          } as Proposal
        }
      />
    )

    expect(screen.getByText('48h 00m 00s')).toBeInTheDocument()
    expect(
      screen.getByText('Time remaining before this proposal can be executed')
    ).toBeInTheDocument()
  })
})
