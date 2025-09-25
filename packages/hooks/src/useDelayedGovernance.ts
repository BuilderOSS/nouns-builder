import { governorAbi, tokenAbi } from '@buildeross/sdk'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useReadContract } from 'wagmi'

export const useDelayedGovernance = ({
  tokenAddress,
  governorAddress,
  chainId,
}: {
  tokenAddress?: AddressType
  governorAddress?: AddressType
  chainId: CHAIN_ID
}): {
  delayedUntilTimestamp: bigint
  isGovernanceDelayed: boolean
  isLoading: boolean
  error: Error | null
} => {
  const {
    data: delayedUntilTimestamp,
    isLoading: isLoadingDelay,
    error: delayError,
  } = useReadContract({
    abi: governorAbi,
    address: governorAddress,
    chainId,
    functionName: 'delayedGovernanceExpirationTimestamp',
  })

  const {
    data: remainingTokensInReserve,
    isLoading: isLoadingTokens,
    error: tokensError,
  } = useReadContract({
    abi: tokenAbi,
    address: tokenAddress,
    chainId,
    functionName: 'remainingTokensInReserve',
  })

  const isLoading = isLoadingDelay || isLoadingTokens
  const error = delayError || tokensError

  if (remainingTokensInReserve === 0n)
    return { delayedUntilTimestamp: 0n, isGovernanceDelayed: false, isLoading, error }

  const isGovernanceDelayed = delayedUntilTimestamp
    ? new Date().getTime() < Number(delayedUntilTimestamp) * 1000
    : false

  return {
    delayedUntilTimestamp: delayedUntilTimestamp || 0n,
    isGovernanceDelayed,
    isLoading,
    error,
  }
}
