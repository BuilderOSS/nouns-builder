import { render } from '@buildeross/test-fixtures'
import { fireEvent, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { SimulationSummary, type SimulationSummaryProps } from './SimulationSummary'

const renderSummary = (props: Partial<SimulationSummaryProps>) =>
  render(
    <SimulationSummary
      failedCount={0}
      notSimulatedCount={0}
      skipSimulation={false}
      onSkipSimulationChange={vi.fn()}
      {...props}
    />
  )

describe('SimulationSummary', () => {
  it('renders nothing when the simulation passed', () => {
    renderSummary({})

    expect(screen.queryByText(/Warning:/)).not.toBeInTheDocument()
  })

  it('shows why the simulation could not run', () => {
    renderSummary({ simulationError: 'Unexpected Error: Unable to simulate' })

    expect(
      screen.getByText('Simulation could not run: Unexpected Error: Unable to simulate')
    ).toBeInTheDocument()
  })

  it('counts failed and not simulated calls', () => {
    renderSummary({ failedCount: 1, notSimulatedCount: 2 })

    expect(
      screen.getByText(
        '1 call failed simulation, 2 calls not simulated. See the highlighted transactions above for details.'
      )
    ).toBeInTheDocument()
  })

  it('lets the user submit anyway', () => {
    const onSkipSimulationChange = vi.fn()
    renderSummary({ failedCount: 2, onSkipSimulationChange })

    expect(
      screen.getByText(
        '2 calls failed simulation. See the highlighted transactions above for details.'
      )
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onSkipSimulationChange).toHaveBeenCalledWith(true)
  })
})
