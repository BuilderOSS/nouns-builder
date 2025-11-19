import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { governorAbi } from '@buildeross/sdk/contract'
import {
  type AddressType,
  type BytesType,
  type CHAIN_ID,
  ProposalState,
} from '@buildeross/types'
import { useMemo } from 'react'
import useSWR from 'swr'
import { useConfig } from 'wagmi'
import { readContract } from 'wagmi/actions'

interface UseProposalStateParams {
  chainId: CHAIN_ID
  governorAddress: AddressType
  proposalId: BytesType
}

interface ProposalStateData {
  state?: ProposalState
  isActive: boolean
  isPending: boolean
  isSucceeded: boolean
  isQueued: boolean
  isExecuted: boolean
  isDefeated: boolean
  isCanceled: boolean
  isVetoed: boolean
  isExpired: boolean
  isLoading: boolean
  error?: Error
}

export const useProposalState = ({
  chainId,
  governorAddress,
  proposalId,
}: UseProposalStateParams): ProposalStateData => {
  const config = useConfig()

  const {
    data: state,
    error,
    isLoading,
  } = useSWR(
    chainId && governorAddress && proposalId
      ? ([SWR_KEYS.PROPOSAL, 'state', chainId, governorAddress, proposalId] as const)
      : null,
    ([, , _chainId, _governorAddress, _proposalId]) =>
      readContract(config, {
        abi: governorAbi,
        address: _governorAddress as AddressType,
        functionName: 'state',
        args: [_proposalId],
        chainId: _chainId,
      }) as Promise<ProposalState>,
    { revalidateOnFocus: true }
  )

  const proposalStateData = useMemo(() => {
    return {
      state,
      isActive: state === ProposalState.Active,
      isPending: state === ProposalState.Pending,
      isSucceeded: state === ProposalState.Succeeded,
      isQueued: state === ProposalState.Queued,
      isExecuted: state === ProposalState.Executed,
      isDefeated: state === ProposalState.Defeated,
      isCanceled: state === ProposalState.Canceled,
      isVetoed: state === ProposalState.Vetoed,
      isExpired: state === ProposalState.Expired,
      isLoading,
      error,
    }
  }, [state, isLoading, error])

  return proposalStateData
}
