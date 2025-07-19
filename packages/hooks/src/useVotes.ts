import { governorAbi, tokenAbi } from '@buildeross/sdk'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useReadContracts } from 'wagmi'

export const useVotes = ({
  chainId,
  collectionAddress,
  governorAddress,
  signerAddress,
}: {
  chainId: CHAIN_ID
  collectionAddress?: AddressType
  governorAddress?: AddressType
  signerAddress?: AddressType
}) => {
  const { data, isLoading } = useReadContracts({
    query: {
      enabled: !!collectionAddress && !!governorAddress && !!signerAddress,
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
    ] as const,
  })

  if (!data || isLoading || data.some((d) => d === undefined || d === null)) {
    return {
      isLoading,
      isOwner: false,
      hasThreshold: false,
    }
  }

  const [votes, delegates, proposalThreshold] = data

  return {
    isLoading,
    isDelegating: delegates !== signerAddress,
    delegatedTo: delegates,
    isOwner: votes > 0,
    hasThreshold: votes > proposalThreshold,
    proposalVotesRequired: proposalThreshold + BigInt(1),
    votes,
  }
}
