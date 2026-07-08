import { useMemo } from 'react'
import { useReadContract } from 'wagmi'

export type GovernorVersionResult = {
  version: string | undefined
  supportsCandidates: boolean
  isLoading: boolean
}

export type UseGovernorVersionParams = {
  chainId: number
  governorAddress: `0x${string}` | undefined
}

/**
 * Hook to check the Governor contract version and determine if candidates are supported.
 * Uses React Query's built-in caching (via wagmi's useReadContract).
 *
 * @param chainId - The chain ID to query
 * @param governorAddress - The governor contract address
 * @returns {GovernorVersionResult} Object containing version info and candidates support flag
 */
export const useGovernorVersion = ({
  chainId,
  governorAddress,
}: UseGovernorVersionParams): GovernorVersionResult => {
  const { data: governorVersion, isLoading } = useReadContract({
    abi: [
      {
        inputs: [],
        name: 'contractVersion',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    address: governorAddress,
    functionName: 'contractVersion',
    chainId,
    query: {
      enabled: !!governorAddress,
      staleTime: 300000, // 5 minutes - version rarely changes
      gcTime: 600000, // 10 minutes in cache after unused
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  })

  const supportsCandidates = useMemo(() => {
    if (!governorVersion) return false
    const version = governorVersion as string
    // Check if version >= 3.0.0
    const [major] = version.split('.').map(Number)
    return major >= 3
  }, [governorVersion])

  return {
    version: governorVersion as string | undefined,
    supportsCandidates,
    isLoading,
  }
}
