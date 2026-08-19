import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { EscrowTransactionCard } from './EscrowTransactionCard'

const mockParseEscrowDeploy = vi.fn()
const mockUseEnsData = vi.fn()
const mockUseTokenMetadataSingle = vi.fn()

vi.mock('./escrowDeploy', () => ({
  parseEscrowDeploy: (...args: unknown[]) => mockParseEscrowDeploy(...args),
}))

vi.mock('@buildeross/hooks/useEnsData', () => ({
  useEnsData: (...args: unknown[]) => mockUseEnsData(...args),
}))

vi.mock('@buildeross/hooks/useTokenMetadata', () => ({
  useTokenMetadataSingle: (...args: unknown[]) => mockUseTokenMetadataSingle(...args),
}))

describe('EscrowTransactionCard', () => {
  it('shows payout rows only when they differ from the base parties', () => {
    mockParseEscrowDeploy.mockReturnValue({
      version: 'v2',
      provider: '0x3333333333333333333333333333333333333333',
      milestoneAmounts: [1n],
      totalAmount: 1n,
      fundAmount: 1n,
      escrow: {
        clientAddress: '0x1111111111111111111111111111111111111111',
        clientRecipientAddress: '0x5555555555555555555555555555555555555555',
        providerAddress: '0x3333333333333333333333333333333333333333',
        providerRecipientAddress: '0x4444444444444444444444444444444444444444',
        resolverAddress: '0x2222222222222222222222222222222222222222',
        tokenAddress: '0x4200000000000000000000000000000000000006',
      },
    })
    mockUseEnsData.mockReturnValue({ ensName: undefined })
    mockUseTokenMetadataSingle.mockReturnValue({
      tokenMetadata: { decimals: 18, symbol: 'ETH' },
    })

    render(
      <EscrowTransactionCard chainId={8453 as any} target="0xabc" calldata="0x1234" />
    )

    expect(screen.getByText('Client')).toBeInTheDocument()
    expect(screen.getByText('Client payout')).toBeInTheDocument()
    expect(screen.getByText('Provider')).toBeInTheDocument()
    expect(screen.getByText('Provider payout')).toBeInTheDocument()
  })

  it('hides payout rows when they match the base parties', () => {
    mockParseEscrowDeploy.mockReturnValue({
      version: 'v2',
      provider: '0x3333333333333333333333333333333333333333',
      milestoneAmounts: [1n],
      totalAmount: 1n,
      fundAmount: 1n,
      escrow: {
        clientAddress: '0x1111111111111111111111111111111111111111',
        clientRecipientAddress: '0x1111111111111111111111111111111111111111',
        providerAddress: '0x3333333333333333333333333333333333333333',
        providerRecipientAddress: '0x3333333333333333333333333333333333333333',
        resolverAddress: '0x2222222222222222222222222222222222222222',
        tokenAddress: '0x4200000000000000000000000000000000000006',
      },
    })
    mockUseEnsData.mockReturnValue({ ensName: undefined })
    mockUseTokenMetadataSingle.mockReturnValue({
      tokenMetadata: { decimals: 18, symbol: 'ETH' },
    })

    render(
      <EscrowTransactionCard chainId={8453 as any} target="0xabc" calldata="0x1234" />
    )

    expect(screen.getByText('Client')).toBeInTheDocument()
    expect(screen.queryByText('Client payout')).toBeNull()
    expect(screen.getByText('Provider')).toBeInTheDocument()
    expect(screen.queryByText('Provider payout')).toBeNull()
  })

  it('uses the legacy provider address when the top-level provider is absent', () => {
    mockParseEscrowDeploy.mockReturnValue({
      version: 'legacy',
      milestoneAmounts: [1n],
      totalAmount: 1n,
      fundAmount: 1n,
      escrow: {
        clientAddress: '0x1111111111111111111111111111111111111111',
        providerAddress: '0x3333333333333333333333333333333333333333',
        clientRecipientAddress: '0x1111111111111111111111111111111111111111',
        providerRecipientAddress: '0x4444444444444444444444444444444444444444',
        resolverAddress: '0x2222222222222222222222222222222222222222',
        tokenAddress: '0x4200000000000000000000000000000000000006',
      },
    })
    mockUseEnsData.mockReturnValue({ ensName: undefined })
    mockUseTokenMetadataSingle.mockReturnValue({
      tokenMetadata: { decimals: 18, symbol: 'ETH' },
    })

    render(
      <EscrowTransactionCard chainId={8453 as any} target="0xabc" calldata="0x1234" />
    )

    expect(screen.getByText('Provider')).toBeInTheDocument()
    expect(screen.getByText('Provider payout')).toBeInTheDocument()
  })
})
