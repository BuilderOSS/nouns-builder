import { render } from '@buildeross/test-fixtures'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { QuorumProgress } from './QuorumProgress'

describe('QuorumProgress', () => {
  it('renders FOR votes against the quorum threshold', () => {
    render(<QuorumProgress forVotes={12} quorumVotes={20} />)

    expect(screen.getByText('Quorum')).toBeInTheDocument()
    expect(screen.getByText('12 of 20 For votes')).toBeInTheDocument()
    expect(screen.getByText('8 more For votes needed')).toBeInTheDocument()
    expect(screen.getByTestId('quorum-marker')).toBeInTheDocument()
  })

  it('renders the quorum reached state', () => {
    render(<QuorumProgress forVotes={25} quorumVotes={20} />)

    expect(screen.getByText('Quorum reached')).toBeInTheDocument()
  })

  it('uses singular copy for one remaining vote', () => {
    render(<QuorumProgress forVotes={19} quorumVotes={20} />)

    expect(screen.getByText('1 more For vote needed')).toBeInTheDocument()
  })

  it('handles a zero quorum without crashing', () => {
    render(<QuorumProgress forVotes={0} quorumVotes={0} />)

    expect(screen.getByText('No quorum required')).toBeInTheDocument()
    expect(screen.getByText('Quorum reached')).toBeInTheDocument()
    expect(screen.queryByTestId('quorum-marker')).not.toBeInTheDocument()
  })
})
