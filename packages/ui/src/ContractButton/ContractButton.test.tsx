import { CHAIN_ID } from '@buildeross/types'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ContractButton } from './ContractButton'

const mockUseAccount = vi.fn()
const mockSwitchChain = vi.fn()
const mockDisconnectWallet = vi.fn()
const mockOpenConnectModal = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useSwitchChain: () => ({ switchChain: mockSwitchChain }),
}))

vi.mock('@buildeross/hooks/useWalletDisconnect', () => ({
  useWalletDisconnect: () => mockDisconnectWallet,
}))

vi.mock('../ConnectModalProvider', () => ({
  useConnectModal: () => ({ openConnectModal: mockOpenConnectModal }),
}))

describe('ContractButton', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows connect wallet popup action when not connected', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    mockUseAccount.mockReturnValue({
      address: undefined,
      chain: undefined,
      connector: undefined,
    })

    render(
      <ContractButton chainId={CHAIN_ID.ETHEREUM} handleClick={handleClick}>
        Submit vote
      </ContractButton>
    )

    await user.click(screen.getByRole('button', { name: 'Submit vote' }))

    expect(handleClick).not.toHaveBeenCalled()
    expect(
      await screen.findByText('Please connect your wallet to continue.')
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Connect Wallet' }))

    await waitFor(() => {
      expect(mockOpenConnectModal).toHaveBeenCalledTimes(1)
    })
    expect(mockDisconnectWallet).not.toHaveBeenCalled()
  })

  it('shows reconnect wallet popup action when connector is invalid', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    mockUseAccount.mockReturnValue({
      address: '0x1234',
      chain: { id: CHAIN_ID.ETHEREUM },
      connector: undefined,
    })
    render(
      <ContractButton chainId={CHAIN_ID.ETHEREUM} handleClick={handleClick}>
        Submit vote
      </ContractButton>
    )

    await user.click(screen.getByRole('button', { name: 'Submit vote' }))

    expect(handleClick).not.toHaveBeenCalled()
    expect(
      await screen.findByText('Wallet session expired. Reconnect to continue.')
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reconnect Wallet' }))

    await waitFor(() => {
      expect(mockDisconnectWallet).toHaveBeenCalledTimes(1)
      expect(mockOpenConnectModal).toHaveBeenCalledTimes(1)
    })
  })

  it('shows switch chain popup action on wrong chain', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    mockUseAccount.mockReturnValue({
      address: '0x1234',
      chain: { id: CHAIN_ID.OPTIMISM },
      connector: { id: 'injected' },
    })

    render(
      <ContractButton chainId={CHAIN_ID.ETHEREUM} handleClick={handleClick}>
        Submit vote
      </ContractButton>
    )

    await user.click(screen.getByRole('button', { name: 'Submit vote' }))

    expect(handleClick).not.toHaveBeenCalled()
    expect(await screen.findByText(/Please switch to/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Switch to/ }))

    await waitFor(() => {
      expect(mockSwitchChain).toHaveBeenCalledTimes(1)
    })
  })
})
