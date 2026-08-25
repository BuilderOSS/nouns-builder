import { render } from '@buildeross/test-fixtures'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { QuorumProgress } from './QuorumProgress'

describe('QuorumProgress', () => {
  it('renders FOR votes against the quorum threshold', () => {
    render(<QuorumProgress forVotes={12} quorumVotes={20} />)

    expect(screen.getByText('Quorum')).toBeInTheDocument()
    expect(screen.getByLabelText('12 of 20 For votes')).toBeInTheDocument()
    expect(screen.getByText('8 to go')).toBeInTheDocument()
    expect(screen.getByTestId('quorum-marker')).toBeInTheDocument()
  })

  it('renders the quorum reached state', () => {
    render(<QuorumProgress forVotes={25} quorumVotes={20} />)

    expect(screen.getByText('Reached')).toBeInTheDocument()
    expect(screen.queryByTestId('quorum-marker')).not.toBeInTheDocument()
  })

  it('uses singular copy for one remaining vote', () => {
    render(<QuorumProgress forVotes={19} quorumVotes={20} />)

    expect(screen.getByText('1 to go')).toBeInTheDocument()
  })

  it('clamps the fill and hides the marker when quorum is exceeded', () => {
    render(<QuorumProgress forVotes={105} quorumVotes={65} />)

    expect(screen.getByText('162% of quorum')).toBeInTheDocument()
    expect(screen.queryByTestId('quorum-marker')).not.toBeInTheDocument()
  })

  it('handles a zero quorum without crashing', () => {
    render(<QuorumProgress forVotes={0} quorumVotes={0} />)

    expect(screen.getByLabelText('No quorum required')).toBeInTheDocument()
    expect(screen.getByText('Reached')).toBeInTheDocument()
    expect(screen.queryByTestId('quorum-marker')).not.toBeInTheDocument()
  })
})
