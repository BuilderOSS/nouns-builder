import { FeedEventType } from '@buildeross/sdk/subgraph'
import { fireEvent, render, screen } from '@testing-library/react'

import { ProfileActivityFilters } from './ProfileActivityFilters'

const props = {
  daos: [
    {
      chainId: 1,
      collectionAddress: '0xDaa0000000000000000000000000000000000000',
      name: 'Test DAO',
    },
  ],
  value: {
    eventTypes: [] as FeedEventType[],
    daoKeys: ['1:0xdaa0000000000000000000000000000000000000'],
  },
  onChange: vi.fn(),
  onReset: vi.fn(),
}

describe('ProfileActivityFilters', () => {
  it('exposes the DAO label separately from its help text', () => {
    render(<ProfileActivityFilters {...props} />)

    const daoLabel = screen.getByText('Test DAO')
    const help = screen.getByText(/Select DAOs from the sidebar/)

    expect(daoLabel).toHaveAttribute('aria-describedby', help.id)
    expect(daoLabel).not.toHaveAttribute('aria-label')
  })

  it('uses checkbox-group semantics and dismisses the popup with Escape', () => {
    render(<ProfileActivityFilters {...props} />)

    const trigger = screen.getByRole('button', {
      name: 'Filter profile activity by type',
    })
    fireEvent.click(trigger)

    expect(screen.getByRole('group', { name: 'Activity types' })).toBeVisible()
    expect(trigger).not.toHaveAttribute('aria-haspopup')

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(
      screen.queryByRole('group', { name: 'Activity types' })
    ).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()

    fireEvent.click(trigger)
    fireEvent.pointerDown(document.body)
    expect(
      screen.queryByRole('group', { name: 'Activity types' })
    ).not.toBeInTheDocument()
  })
})
