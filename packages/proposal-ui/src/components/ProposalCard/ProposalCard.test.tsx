import { ProposalState } from '@buildeross/sdk/contract'
import { BUILDER_DAO, FOUNDRY_CHAIN, render } from '@buildeross/test-fixtures'
import { screen } from '@testing-library/react'
import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'

import { ProposalCard } from './ProposalCard'

describe('proposal card', () => {
  const date = new Date(2022, 1, 1)

  beforeEach(() => {
    vi.setSystemTime(date)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render a proposal card given a succeeded propoasl', async () => {
    render(
      <ProposalCard
        proposer="0x123"
        treasuryAddress="0x123"
        values={[]}
        timeCreated={1668002568}
        title="A proposal title"
        proposalNumber={1}
        state={ProposalState.Succeeded}
        voteEnd={dayjs('2/1/21').unix()}
        voteStart={dayjs('1/1/21').unix()}
      />,
      {
        chain: FOUNDRY_CHAIN,
        addresses: BUILDER_DAO,
      }
    )

    expect(screen.getByText(/A proposal title/)).toBeInTheDocument()
    expect(screen.getByText(/Succeeded/)).toBeInTheDocument()
    expect(screen.queryByTestId('time-prefix')).not.toBeInTheDocument()
  })

  it('should render a proposal card given an active proposal', async () => {
    render(
      <ProposalCard
        proposer="0x123"
        treasuryAddress="0x123"
        values={[]}
        timeCreated={dayjs(date).unix()}
        title="A proposal title"
        proposalNumber={1}
        state={ProposalState.Active}
        voteEnd={dayjs(date).add(2, 'day').unix()}
        voteStart={dayjs(date).subtract(1, 'day').unix()}
      />,
      {
        chain: FOUNDRY_CHAIN,
        addresses: BUILDER_DAO,
      }
    )

    expect(screen.getByText(/A proposal title/)).toBeInTheDocument()
    expect(screen.getByText(/Feb 01, 2022/)).toBeInTheDocument()
    expect(screen.getByText(/Active/)).toBeInTheDocument()
    expect(screen.getByText(/Ends in 2 days/)).toBeInTheDocument()
  })
})
