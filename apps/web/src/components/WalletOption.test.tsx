import { render, screen } from '@testing-library/react'

import { WalletOption } from './WalletOption'

describe('WalletOption', () => {
  it('shows a compact recent label when the wallet is recent', () => {
    render(
      <WalletOption
        name="Rainbow"
        icon="/icons/wallets/walletconnect.svg"
        iconBackground="#fff"
        recent
        onClick={() => {}}
      />
    )

    expect(screen.getByText('Rainbow')).toBeVisible()
    expect(screen.getByText('Recent')).toBeVisible()
  })
})
