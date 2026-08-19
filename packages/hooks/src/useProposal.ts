import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { getProposal, type Proposal } from '@buildeross/sdk/subgraph'
import { type CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'

const fetcher = async ([, _chainId, _proposalId]: [string, CHAIN_ID, string]): Promise<
  Proposal | undefined
> => {
  const proposal = await getProposal(_chainId, _proposalId)
  return proposal
}

export const useProposal = ({
  chainId,
  proposalId,
  enabled = true,
}: {
  chainId: CHAIN_ID
  proposalId?: string
  enabled?: boolean
}): {
  proposal: Proposal | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<Proposal | undefined>
} => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    Proposal | undefined,
    Error
  >(
    proposalId && enabled
      ? ([SWR_KEYS.PROPOSAL, chainId, proposalId.toLowerCase()] as const)
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    proposal: data,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}
