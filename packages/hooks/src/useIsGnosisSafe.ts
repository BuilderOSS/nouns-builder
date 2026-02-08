import type { CHAIN_ID } from '@buildeross/types'
import { type Address, isAddress } from 'viem'
import { useReadContract } from 'wagmi'

export type IsGnosisSafeReturnType = {
  isGnosisSafe: boolean
  isLoading: boolean
  error?: Error | null
}

const GET_OWNERS_FUNCTION_ABI = [
  {
    inputs: [],
    name: 'getOwners',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
]

export const useIsGnosisSafe = (
  address?: Address,
  chainId?: CHAIN_ID
): IsGnosisSafeReturnType => {
  const { data, error, isLoading } = useReadContract({
    query: {
      enabled: !!address && !!chainId && isAddress(address),
      staleTime: 60_000,
    },
    address: address,
    abi: GET_OWNERS_FUNCTION_ABI,
    functionName: 'getOwners',
    chainId: chainId,
  })

  return {
    isGnosisSafe: !!data && !error,
    isLoading,
    error,
  }
}
