import { governorAbi, tokenAbi } from '@buildeross/sdk/contract'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { useReadContracts } from 'wagmi'

export type UseVotesReturnType = {
  isLoading: boolean
  isOwner: boolean
  isVetoer: boolean
  hasThreshold: boolean
  isDelegating: boolean
  delegatedTo?: AddressType
  proposalVotesRequired: bigint
  votes: bigint
}

export const useVotes = ({
  chainId,
  collectionAddress,
  governorAddress,
  signerAddress,
  enabled = true,
}: {
  chainId: CHAIN_ID
  collectionAddress?: AddressType
  governorAddress?: AddressType
  signerAddress?: AddressType
  enabled?: boolean
}): UseVotesReturnType => {
  const { data, isLoading } = useReadContracts({
    query: {
      enabled: !!collectionAddress && !!governorAddress && !!signerAddress && enabled,
    },
    allowFailure: false,
    contracts: [
      {
        address: collectionAddress as AddressType,
        abi: tokenAbi,
        functionName: 'getVotes',
        args: [signerAddress as AddressType],
        chainId,
      },
      {
        address: collectionAddress as AddressType,
        abi: tokenAbi,
        functionName: 'delegates',
        args: [signerAddress as AddressType],
        chainId,
      },
      {
        address: governorAddress as AddressType,
        abi: governorAbi,
        functionName: 'proposalThreshold',
        chainId,
      },
      {
        address: governorAddress as AddressType,
        abi: governorAbi,
        functionName: 'vetoer',
        chainId,
      },
    ] as const,
  })

  if (!data || isLoading || data.some((d) => d === undefined || d === null)) {
    return {
      isLoading,
      isOwner: false,
      isVetoer: false,
      hasThreshold: false,
      isDelegating: false,
      delegatedTo: undefined,
      proposalVotesRequired: 0n,
      votes: 0n,
    }
  }

  const [votes, delegate, proposalThreshold, vetoer] = data

  return {
    isLoading,
    isDelegating: delegate?.toLowerCase() !== signerAddress?.toLowerCase(),
    delegatedTo: delegate,
    isOwner: votes > 0,
    isVetoer: vetoer?.toLowerCase() === signerAddress?.toLowerCase(),
    hasThreshold: votes > proposalThreshold,
    proposalVotesRequired: proposalThreshold + BigInt(1),
    votes,
  }
}
