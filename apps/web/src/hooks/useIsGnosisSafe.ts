import { Address, isAddress } from 'viem'
import { useReadContract } from 'wagmi'

import { CHAIN_ID } from 'src/typings'

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
