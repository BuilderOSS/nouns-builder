import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import {
  getProposalByExecutionTxHash,
  type ProposalBasicInfo,
} from '@buildeross/sdk/subgraph'
import { type CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'

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
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    executionTransactionHash && enabled
      ? ([SWR_KEYS.PROPOSAL_BY_EXECUTION_TX, chainId, executionTransactionHash] as const)
      : null,
    async ([, _chainId, _executionTransactionHash]) =>
      getProposalByExecutionTxHash(_chainId, _executionTransactionHash),
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
