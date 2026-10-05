import { useConnectModal } from '@buildeross/ui/ConnectModalProvider'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { WalletConnectProvider } from './WalletConnectProvider'

vi.mock('next/dynamic', () => ({
  default: () => {
    return function MockWalletConnectDialog({
      isOpen,
      onClose,
    }: {
      isOpen: boolean
      onClose: () => void
    }) {
      if (!isOpen) return null

      return React.createElement(
        'div',
        { role: 'dialog' },
        React.createElement('button', { onClick: onClose }, 'Close')
      )
    }
  },
}))

function OpenButton() {
  const { openConnectModal } = useConnectModal()
  return <button onClick={openConnectModal}>Connect</button>
}

describe('WalletConnectProvider', () => {
  it('opens the shared wallet dialog through the app connect callback', () => {
    render(
      <WalletConnectProvider>
        <OpenButton />
      </WalletConnectProvider>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
