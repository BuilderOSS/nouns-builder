import { NATIVE_TOKEN_ADDRESS, WETH_ADDRESS } from '@buildeross/constants'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Address, zeroAddress } from 'viem'

/**
 * Get the WETH contract address for a given chain
 * @throws Error if chain ID is unsupported
 */
export function getWrappedTokenAddress(chainId: number | string): Address {
  const id = Number(chainId) as CHAIN_ID
  const address = WETH_ADDRESS[id]

  if (!address || address === zeroAddress) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }

  return address as Address
}

/**
 * Check if a token address is native ETH (NATIVE_TOKEN_ADDRESS)
 */
export function isNativeEth(tokenAddress: string | AddressType): boolean {
  const normalized = tokenAddress.toLowerCase()
  return normalized === NATIVE_TOKEN_ADDRESS.toLowerCase()
}

// WETH9 ABI - deposit and approve functions
export const weth9Abi = [
  {
    type: 'function',
    name: 'deposit',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
] as const
