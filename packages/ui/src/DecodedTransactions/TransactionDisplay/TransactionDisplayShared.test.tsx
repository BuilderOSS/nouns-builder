import type { SimulationOutput } from '@buildeross/types'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { SimulationWarning } from './TransactionDisplayShared'

const simulation = (overrides: Partial<SimulationOutput>): SimulationOutput => ({
  index: 0,
  status: false,
  gas_used: 0,
  block_number: 100,
  from: '0x1111111111111111111111111111111111111111',
  to: '0x2222222222222222222222222222222222222222',
  input: '0x',
  value: '0',
  ...overrides,
})

describe('SimulationWarning', () => {
  it('renders nothing for a successful call', () => {
    const { container } = render(
      <SimulationWarning simulation={simulation({ status: true })} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows that a failed call may fail, with its reason', () => {
    render(
      <SimulationWarning
        simulation={simulation({ error: 'Ownable: caller is not the owner' })}
      />
    )

    expect(
      screen.getByText('Simulation indicates this call may fail.')
    ).toBeInTheDocument()
    expect(screen.getByText('Ownable: caller is not the owner')).toBeInTheDocument()
  })

  it('does not report a call the simulation never reached as failing', () => {
    render(
      <SimulationWarning
        simulation={simulation({
          notSimulated: true,
          error: 'Too many earlier calls failed',
        })}
      />
    )

    expect(screen.getByText('Simulation did not reach this call.')).toBeInTheDocument()
    expect(screen.getByText('Too many earlier calls failed')).toBeInTheDocument()
    expect(
      screen.queryByText('Simulation indicates this call may fail.')
    ).not.toBeInTheDocument()
  })
})
