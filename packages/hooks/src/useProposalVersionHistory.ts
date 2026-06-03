import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { getProposalVersions, type ProposalVersion } from '@buildeross/sdk/subgraph'
import { type CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'

const fetcher = async ([, _chainId, _daoAddress, _proposalNumber]: [
  string,
  CHAIN_ID,
  string,
  number,
]): Promise<ProposalVersion[]> => {
  const versions = await getProposalVersions(_chainId, _daoAddress, _proposalNumber)
  return versions
}

export const useProposalVersionHistory = ({
  chainId,
  daoAddress,
  proposalNumber,
  enabled = true,
}: {
  chainId: CHAIN_ID
  daoAddress?: string
  proposalNumber?: number
  enabled?: boolean
}): {
  versions: ProposalVersion[]
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<ProposalVersion[]>
} => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    ProposalVersion[],
    Error
  >(
    daoAddress && proposalNumber !== undefined && enabled
      ? ([
          SWR_KEYS.PROPOSAL_VERSIONS,
          chainId,
          daoAddress.toLowerCase(),
          proposalNumber,
        ] as const)
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    versions: data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  }
}
