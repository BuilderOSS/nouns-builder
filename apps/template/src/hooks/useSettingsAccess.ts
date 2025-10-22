import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useVotes } from '@buildeross/hooks/useVotes'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { useAccount } from 'wagmi'

export const useSettingsAccess = () => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { address } = useAccount()

  const { isLoading, hasThreshold } = useVotes({
    chainId: chain.id,
    governorAddress: addresses.governor,
    signerAddress: address,
    collectionAddress: addresses.token,
  })

  const { isGovernanceDelayed } = useDelayedGovernance({
    chainId: chain.id,
    tokenAddress: addresses.token,
    governorAddress: addresses.governor,
  })

  const hasAccess = address && hasThreshold && !isGovernanceDelayed

  return {
    isLoading,
    hasAccess,
  }
}
