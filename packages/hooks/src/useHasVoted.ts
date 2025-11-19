import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { getUserProposalVote, type ProposalVoteFragment } from '@buildeross/sdk/subgraph'
import type { AddressType, BytesType, CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'

interface UseHasVotedParams {
  chainId: CHAIN_ID
  proposalId?: BytesType
  voterAddress?: AddressType
  enabled?: boolean
}

interface UseHasVotedReturn {
  vote: ProposalVoteFragment | undefined
  hasVoted: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<ProposalVoteFragment | undefined>
}

export const useHasVoted = ({
  chainId,
  proposalId,
  voterAddress,
  enabled = true,
}: UseHasVotedParams): UseHasVotedReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    proposalId && voterAddress && enabled
      ? ([SWR_KEYS.PROPOSAL, 'vote', chainId, proposalId, voterAddress] as const)
      : null,
    ([, , _chainId, _proposalId, _voterAddress]) =>
      getUserProposalVote(_chainId, _proposalId, _voterAddress),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    vote: data,
    hasVoted: !!data,
    isLoading,
    error,
    mutate,
  }
}
