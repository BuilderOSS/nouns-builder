import { CHAIN_ID } from '@buildeross/types'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { parseEther, stringToHex } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { PlaceBid } from './PlaceBid'

const mockMutate = vi.fn()
let mockBalanceValue = parseEther('1')

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
    useBalance: () => ({ data: { value: mockBalanceValue } }),
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
    mockBalanceValue = parseEther('1')
    vi.mocked(simulateContract).mockResolvedValue({ request: {} as any } as any)
    vi.mocked(writeContract).mockResolvedValue('0x1234' as `0x${string}`)
    vi.mocked(waitForTransactionReceipt).mockResolvedValue({} as any)
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

  it('shows helper text when bid amount is empty', () => {
    render(
      <PlaceBid
        chainId={CHAIN_ID.ETHEREUM}
        auctionAddress={'0x0000000000000000000000000000000000000001'}
        tokenAddress={'0x0000000000000000000000000000000000000002'}
        tokenId="1"
        daoName="Test DAO"
      />
    )

    expect(screen.getByText('Enter at least 1 ETH to place a bid.')).toBeTruthy()
    expect(
      (screen.getByRole('button', { name: 'Place bid' }) as HTMLButtonElement).disabled
    ).toBe(true)
  })

  it('shows helper text when bid is below minimum', async () => {
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

    await user.type(screen.getByRole('spinbutton'), '0.5')

    expect(screen.getByText('Bid must be at least 1 ETH.')).toBeTruthy()
    expect(
      (screen.getByRole('button', { name: 'Place bid' }) as HTMLButtonElement).disabled
    ).toBe(true)
  })

  it('clears helper text when bid becomes valid and affordable', async () => {
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

    await user.type(input, '0.5')
    expect(screen.getByText('Bid must be at least 1 ETH.')).toBeTruthy()

    await user.clear(input)
    await user.type(input, '1')

    expect(screen.queryByText('Bid must be at least 1 ETH.')).toBeNull()
    expect(screen.queryByText('Enter at least 1 ETH to place a bid.')).toBeNull()
    expect(screen.queryByText('Insufficient ETH balance for this bid.')).toBeNull()
    expect(
      (screen.getByRole('button', { name: 'Place bid' }) as HTMLButtonElement).disabled
    ).toBe(false)
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

  it('shows insufficient balance state when wallet balance is zero', async () => {
    const user = userEvent.setup()
    mockBalanceValue = 0n

    render(
      <PlaceBid
        chainId={CHAIN_ID.ETHEREUM}
        auctionAddress={'0x0000000000000000000000000000000000000001'}
        tokenAddress={'0x0000000000000000000000000000000000000002'}
        tokenId="1"
        daoName="Test DAO"
      />
    )

    await user.type(screen.getByRole('spinbutton'), '1')

    expect(screen.getByText('Insufficient ETH balance for this bid.')).toBeTruthy()
    expect(
      (screen.getByRole('button', { name: 'Place bid' }) as HTMLButtonElement).disabled
    ).toBe(true)
  })

  it('appends comment bytes as dataSuffix for createBid', async () => {
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

    await user.type(screen.getByRole('spinbutton'), '1')
    await user.type(screen.getByPlaceholderText('Add a bid comment (optional)'), 'gm')
    await user.click(screen.getByRole('button', { name: 'Place bid' }))

    expect(simulateContract).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        functionName: 'createBid',
        dataSuffix: stringToHex('gm'),
      })
    )
  })

  it('appends comment bytes as dataSuffix for createBidWithReferral', async () => {
    const user = userEvent.setup()

    render(
      <PlaceBid
        chainId={CHAIN_ID.ETHEREUM}
        auctionAddress={'0x0000000000000000000000000000000000000001'}
        tokenAddress={'0x0000000000000000000000000000000000000002'}
        tokenId="1"
        daoName="Test DAO"
        referral={'0x0000000000000000000000000000000000000003'}
      />
    )

    await user.type(screen.getByRole('spinbutton'), '1')
    await user.type(screen.getByPlaceholderText('Add a bid comment (optional)'), 'hello')
    await user.click(screen.getByRole('button', { name: 'Place bid' }))

    expect(simulateContract).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        functionName: 'createBidWithReferral',
        dataSuffix: stringToHex('hello'),
      })
    )
  })

  it('does not set dataSuffix when comment is blank', async () => {
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

    await user.type(screen.getByRole('spinbutton'), '1')
    await user.type(screen.getByPlaceholderText('Add a bid comment (optional)'), '   ')
    await user.click(screen.getByRole('button', { name: 'Place bid' }))

    const [, request] = vi.mocked(simulateContract).mock.calls[0]
    expect(request).not.toHaveProperty('dataSuffix')
  })

  it('resets bid amount and comment after a successful bid', async () => {
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

    const amountInput = screen.getByRole('spinbutton') as HTMLInputElement
    const commentInput = screen.getByLabelText('Add a bid comment') as HTMLTextAreaElement

    await user.type(amountInput, '1')
    await user.type(commentInput, 'gm')
    await user.click(screen.getByRole('button', { name: 'Place bid' }))

    await waitFor(() => {
      const currentAmountInput = screen.getByRole('spinbutton') as HTMLInputElement
      const currentCommentInput = screen.getByLabelText(
        'Add a bid comment'
      ) as HTMLTextAreaElement

      expect(currentAmountInput.value).toBe('')
      expect(currentCommentInput.value).toBe('')
    })
  })

  it('shows validation error and blocks submit for invalid replacement characters', async () => {
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

    await user.type(screen.getByRole('spinbutton'), '1')
    await user.type(screen.getByLabelText('Add a bid comment'), '\uFFFD')

    expect(
      screen.getByText(
        'Bid comment contains unsupported characters. Please retype your comment.'
      )
    ).toBeTruthy()
    expect(
      (screen.getByRole('button', { name: 'Place bid' }) as HTMLButtonElement).disabled
    ).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Place bid' }))
    expect(simulateContract).not.toHaveBeenCalled()
  })

  it('limits bid comments to 140 bytes', async () => {
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

    const commentInput = screen.getByPlaceholderText(
      'Add a bid comment (optional)'
    ) as HTMLTextAreaElement

    await user.type(commentInput, '😀'.repeat(40))

    expect(commentInput.maxLength).toBe(140)
    expect(new TextEncoder().encode(commentInput.value).length).toBeLessThanOrEqual(140)
  })
})
