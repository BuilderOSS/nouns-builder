import { useMemo } from 'react'
import { useReadContract } from 'wagmi'

// Generic contract version result
export type ContractVersionResult = {
  version: string | undefined
  isV3OrHigher: boolean
  isLoading: boolean
}

export type UseContractVersionParams = {
  chainId: number
  contractAddress: `0x${string}` | undefined
}

// Contract version ABI (shared by Governor and Manager)
const CONTRACT_VERSION_ABI = [
  {
    inputs: [],
    name: 'contractVersion',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/**
 * Generic hook to check contract version.
 * Uses React Query's built-in caching (via wagmi's useReadContract).
 *
 * @param chainId - The chain ID to query
 * @param contractAddress - The contract address
 * @returns {ContractVersionResult} Object containing version info and v3+ flag
 */
export const useContractVersion = ({
  chainId,
  contractAddress,
}: UseContractVersionParams): ContractVersionResult => {
  const { data: contractVersion, isLoading } = useReadContract({
    abi: CONTRACT_VERSION_ABI,
    address: contractAddress,
    functionName: 'contractVersion',
    chainId,
    query: {
      enabled: !!contractAddress,
      staleTime: 300000, // 5 minutes - version rarely changes
      gcTime: 600000, // 10 minutes in cache after unused
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  })

  const isV3OrHigher = useMemo(() => {
    if (!contractVersion) return false
    const version = contractVersion as string
    // Check if version >= 3.0.0
    const [major] = version.split('.').map(Number)
    return major >= 3
  }, [contractVersion])

  return {
    version: contractVersion as string | undefined,
    isV3OrHigher,
    isLoading,
  }
}

// Legacy type for backwards compatibility
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
 * Wrapper around useContractVersion for backwards compatibility.
 *
 * @param chainId - The chain ID to query
 * @param governorAddress - The governor contract address
 * @returns {GovernorVersionResult} Object containing version info and candidates support flag
 */
export const useGovernorVersion = ({
  chainId,
  governorAddress,
}: UseGovernorVersionParams): GovernorVersionResult => {
  const { version, isV3OrHigher, isLoading } = useContractVersion({
    chainId,
    contractAddress: governorAddress,
  })

  return {
    version,
    supportsCandidates: isV3OrHigher,
    isLoading,
  }
}

// Manager-specific types
export type ManagerVersionResult = {
  version: string | undefined
  isV3OrHigher: boolean
  isLoading: boolean
}

export type UseManagerVersionParams = {
  chainId: number
  managerAddress: `0x${string}` | undefined
}

/**
 * Hook to check the Manager contract version.
 * Useful for determining which deploy function signature to use.
 *
 * @param chainId - The chain ID to query
 * @param managerAddress - The manager contract address
 * @returns {ManagerVersionResult} Object containing version info and v3+ flag
 */
export const useManagerVersion = ({
  chainId,
  managerAddress,
}: UseManagerVersionParams): ManagerVersionResult => {
  return useContractVersion({
    chainId,
    contractAddress: managerAddress,
  })
}
