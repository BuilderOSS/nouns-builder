import { CHAIN_ID } from '@buildeross/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { parseEther } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PlaceBid } from './PlaceBid'

const mockMutate = vi.fn()

vi.mock('swr', () => ({
  default: vi.fn(() => ({ data: undefined })),
  useSWRConfig: () => ({ mutate: mockMutate }),
}))

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>()

  return {
    ...actual,
    useAccount: () => ({
      address: '0x1234',
      chain: { id: CHAIN_ID.ETHEREUM },
    }),
    useBalance: () => ({ data: { value: parseEther('1') } }),
    useConfig: () => ({}),
    useReadContracts: () => ({ data: [parseEther('1'), 10n] }),
  }
})

vi.mock('wagmi/actions', () => ({
  simulateContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
  writeContract: vi.fn(),
}))

vi.mock('@buildeross/hooks/useMinBidIncrement', () => ({
  useMinBidIncrement: () => ({ minBidAmount: 1 }),
}))

vi.mock('@buildeross/ui/LinksProvider', () => ({
  useLinks: () => ({
    getAuctionLink: () => ({ href: '/auction' }),
  }),
}))

vi.mock('@buildeross/ui/ContractButton', () => ({
  ContractButton: ({ children, handleClick, disabled }: any) => (
    <button disabled={disabled} onClick={() => handleClick()}>
      {children}
    </button>
  ),
}))

vi.mock('@buildeross/ui/Modal', () => ({
  AnimatedModal: ({ children, open }: any) => (open ? <div>{children}</div> : null),
}))

vi.mock('@buildeross/ui/ShareButton', () => ({
  ShareButton: () => <button>Share</button>,
}))

vi.mock('@buildeross/utils/helpers', () => ({
  unpackOptionalArray: (values: any[]) => values,
}))

vi.mock('@buildeross/utils/numbers', () => ({
  formatCryptoVal: (value: number | string | bigint) => String(value),
}))

vi.mock('@buildeross/zord', () => ({
  Box: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Flex: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <p>{children}</p>,
}))

describe('PlaceBid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows insufficient balance error while typing a higher bid', async () => {
    const user = userEvent.setup()

    render(
      <PlaceBid
        chainId={CHAIN_ID.ETHEREUM}
        auctionAddress={'0x0000000000000000000000000000000000000001'}
        tokenAddress={'0x0000000000000000000000000000000000000002'}
        tokenId="1"
        daoName="Test DAO"
      />
    )

    await user.type(screen.getByRole('spinbutton'), '2')

    expect(screen.getByText('Insufficient ETH balance for this bid.')).toBeTruthy()
    expect(
      (screen.getByRole('button', { name: 'Place bid' }) as HTMLButtonElement).disabled
    ).toBe(true)
  })

  it('clears insufficient balance error when bid is reduced within balance', async () => {
    const user = userEvent.setup()

    render(
      <PlaceBid
        chainId={CHAIN_ID.ETHEREUM}
        auctionAddress={'0x0000000000000000000000000000000000000001'}
        tokenAddress={'0x0000000000000000000000000000000000000002'}
        tokenId="1"
        daoName="Test DAO"
      />
    )

    const input = screen.getByRole('spinbutton')

    await user.type(input, '2')
    expect(screen.getByText('Insufficient ETH balance for this bid.')).toBeTruthy()

    await user.clear(input)
    await user.type(input, '1')

    expect(screen.queryByText('Insufficient ETH balance for this bid.')).toBeNull()
    expect(
      (screen.getByRole('button', { name: 'Place bid' }) as HTMLButtonElement).disabled
    ).toBe(false)
  })
})
