import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import type { ProfileActivityKind } from 'src/utils/profileDashboard'

import { ProfileActivityKindMenu } from './ProfileActivityKindMenu'

const options = [
  { value: 'bid' as const, label: 'Bids' },
  { value: 'win' as const, label: 'Wins' },
  { value: 'settled' as const, label: 'Settles' },
]

const Harness = () => {
  const [selectedKinds, setSelectedKinds] = React.useState<ProfileActivityKind[]>([])
  return (
    <ProfileActivityKindMenu
      label="Filter auction activity"
      options={options}
      selectedKinds={selectedKinds}
      onChange={setSelectedKinds}
    />
  )
}

describe('ProfileActivityKindMenu', () => {
  it('summarizes empty, single, and multiple selections and closes on Escape', () => {
    render(<Harness />)
    const button = screen.getByRole('button', { name: 'Filter auction activity' })

    expect(button).toHaveTextContent('All')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveAttribute('aria-controls')

    fireEvent.click(screen.getByRole('checkbox', { name: 'Bids' }))
    expect(button).toHaveTextContent('Bids')

    fireEvent.click(screen.getByRole('checkbox', { name: 'Wins' }))
    expect(button).toHaveTextContent('2 selected')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  it('closes when focus moves to an outside pointer target', () => {
    render(
      <>
        <Harness />
        <button type="button">Outside</button>
      </>
    )
    const filterButton = screen.getByRole('button', { name: 'Filter auction activity' })
    fireEvent.click(filterButton)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }))

    expect(filterButton).toHaveAttribute('aria-expanded', 'false')
  })
})
