import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { useDropdownDismiss } from './useDropdownDismiss'

const Harness = ({ onDismiss }: { onDismiss: () => void }) => {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  useDropdownDismiss({
    isOpen: true,
    onDismiss,
    rootRef,
    triggerRef,
  })

  return (
    <>
      <button ref={triggerRef}>Toggle menu</button>
      <div ref={rootRef}>Menu content</div>
      <button>Outside</button>
    </>
  )
}

describe('useDropdownDismiss', () => {
  it('does not dismiss when the open trigger is pressed', () => {
    const onDismiss = vi.fn()
    render(<Harness onDismiss={onDismiss} />)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Toggle menu' }))
    expect(onDismiss).not.toHaveBeenCalled()

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
