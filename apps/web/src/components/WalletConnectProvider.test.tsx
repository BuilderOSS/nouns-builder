import { useConnectModal } from '@buildeross/ui/ConnectModalProvider'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { WalletConnectProvider } from './WalletConnectProvider'

const mockUseAuthStore = vi.fn(() => ({ isConnected: false, isAuthenticated: false }))

vi.mock('wagmi', () => ({
  useAccount: () => ({ isConnected: false }),
}))

vi.mock('@buildeross/stores', () => ({
  useAuthStore: () => mockUseAuthStore(),
}))

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
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({ isConnected: false, isAuthenticated: false })
  })

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

  it('closes the shared wallet dialog when already connected and authenticated', () => {
    mockUseAuthStore.mockReturnValue({ isConnected: true, isAuthenticated: true })

    render(
      <WalletConnectProvider>
        <OpenButton />
      </WalletConnectProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
