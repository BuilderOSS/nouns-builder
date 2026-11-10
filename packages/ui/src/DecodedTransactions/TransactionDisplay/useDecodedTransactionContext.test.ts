import { CHAIN_ID, type DecodedTransactionData } from '@buildeross/types'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useDecodedTransactionContext } from './useDecodedTransactionContext'

const mockUseTokenMetadataSingle = vi.fn()

vi.mock('@buildeross/hooks/useTokenMetadata', () => ({
  useTokenMetadataSingle: (...args: unknown[]) => mockUseTokenMetadataSingle(...args),
}))
vi.mock('@buildeross/hooks/useNftMetadata', () => ({
  useNftMetadata: () => ({ metadata: undefined, isLoading: false }),
}))

const PERMIT2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3'
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const ROUTER = '0x6fF5693b99212Da76ad316178A184AB56D299b43'

const tx = (
  functionName: string,
  args: Record<string, { name: string; type: string; value: string }>
): DecodedTransactionData =>
  ({ functionName, functionSig: '', args, argOrder: Object.keys(args) }) as any

const requestedToken = () => mockUseTokenMetadataSingle.mock.calls.at(-1)?.[1]

describe('useDecodedTransactionContext token resolution', () => {
  beforeEach(() => {
    mockUseTokenMetadataSingle.mockReset()
    mockUseTokenMetadataSingle.mockReturnValue({
      tokenMetadata: undefined,
      isLoading: false,
    })
  })

  it('uses the target as the token for an ERC-20 approve', () => {
    renderHook(() =>
      useDecodedTransactionContext({
        chainId: CHAIN_ID.BASE,
        target: USDC,
        value: '0',
        transaction: tx('approve', {
          spender: { name: 'spender', type: 'address', value: ROUTER },
          amount: { name: 'amount', type: 'uint256', value: '1' },
        }),
      })
    )

    expect(requestedToken()).toBe(USDC)
  })

  it("uses Permit2 approve's token argument instead of the Permit2 contract", () => {
    renderHook(() =>
      useDecodedTransactionContext({
        chainId: CHAIN_ID.BASE,
        target: PERMIT2,
        value: '0',
        transaction: tx('approve', {
          token: { name: 'token', type: 'address', value: USDC },
          spender: { name: 'spender', type: 'address', value: ROUTER },
          amount: { name: 'amount', type: 'uint160', value: '1' },
          expiration: { name: 'expiration', type: 'uint48', value: '1' },
        }),
      })
    )

    expect(requestedToken()).toBe(USDC)
  })
})
