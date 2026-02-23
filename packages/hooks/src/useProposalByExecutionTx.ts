import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import {
  getProposalByExecutionTxHash,
  type ProposalBasicInfo,
} from '@buildeross/sdk/subgraph'
import { type CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'

const fetcher = async ([, _chainId, _executionTransactionHash]: [
  string,
  CHAIN_ID,
  string,
]): Promise<ProposalBasicInfo | undefined> => {
  const proposal = await getProposalByExecutionTxHash(_chainId, _executionTransactionHash)
  return proposal
}

export const useProposalByExecutionTx = ({
  chainId,
  executionTransactionHash,
  enabled = true,
}: {
  chainId: CHAIN_ID
  executionTransactionHash?: string
  enabled?: boolean
}): {
  data: ProposalBasicInfo | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<ProposalBasicInfo | undefined>
} => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    ProposalBasicInfo | undefined,
    Error
  >(
    executionTransactionHash && enabled
      ? ([SWR_KEYS.PROPOSAL_BY_EXECUTION_TX, chainId, executionTransactionHash] as const)
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}
