import { Proposal } from '@buildeross/sdk/subgraph'
import { render } from '@buildeross/test-fixtures'
import { screen } from '@testing-library/react'
import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'

import { ProposalDetailsGrid } from './ProposalDetailsGrid'

const proposal = {
  forVotes: 3,
  againstVotes: 1,
  abstainVotes: 0,
  quorumVotes: '2',
  snapshotBlockNumber: '123',
  voteEnd: dayjs('1/1/21').unix(),
  timeCreated: dayjs('1/1/21').unix(),
} as unknown as Proposal

describe('ProposalDetailsGrid', () => {
  it('renders vote tiles, quorum progress and threshold tile', () => {
    render(<ProposalDetailsGrid proposal={proposal} />)

    expect(screen.getByText('For')).toBeInTheDocument()
    expect(screen.getByText('Against')).toBeInTheDocument()
    expect(screen.getByText('Abstain')).toBeInTheDocument()
    expect(screen.getByTestId('quorum-progress')).toBeInTheDocument()
    expect(screen.getByText('Threshold')).toBeInTheDocument()
  })
})
