import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { getProposals } from '@buildeross/sdk/subgraph'
import { getUserProposalVote } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import useSWR from 'swr'

export interface UseActiveMemberParams {
  chainId: CHAIN_ID
  /** DAO token contract address — used to fetch recent proposals. */
  tokenAddress: AddressType
  /** Address of the member to check. */
  voterAddress?: AddressType
  /** How many recent proposals to check participation against. Defaults to 5. */
  proposalCount?: number
  enabled?: boolean
}

export interface UseActiveMemberReturn {
  /** True when the member voted on at least one of the last `proposalCount` proposals. */
  isActive: boolean
  isLoading: boolean
  error?: Error
}

async function fetchIsActiveMember(
  chainId: CHAIN_ID,
  tokenAddress: string,
  voterAddress: string,
  proposalCount: number
): Promise<boolean> {
  const { proposals } = await getProposals(chainId, tokenAddress, proposalCount)
  if (!proposals.length) return false

  const votes = await Promise.all(
    proposals.map((p) => getUserProposalVote(chainId, p.proposalId, voterAddress))
  )

  return votes.some(Boolean)
}

export const useActiveMember = ({
  chainId,
  tokenAddress,
  voterAddress,
  proposalCount = 5,
  enabled = true,
}: UseActiveMemberParams): UseActiveMemberReturn => {
  const { data, error, isLoading } = useSWR(
    chainId && tokenAddress && voterAddress && enabled
      ? ([
          SWR_KEYS.PROPOSALS,
          'active-member',
          chainId,
          tokenAddress,
          voterAddress,
          proposalCount,
        ] as const)
      : null,
    ([, , _chainId, _token, _voter, _count]) =>
      fetchIsActiveMember(_chainId, _token, _voter, _count),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60_000,
    }
  )

  return {
    isActive: data ?? false,
    isLoading,
    error,
  }
}
