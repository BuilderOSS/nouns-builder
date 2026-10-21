import { PUBLIC_ALL_CHAINS } from '@buildeross/constants'
import { AddressType, BytesType, CHAIN_ID, ProposalState } from '@buildeross/types'
import { getRpcTransports, serverConfig } from '@buildeross/utils'
import { createPublicClient, fallback } from 'viem'
import { readContract } from 'wagmi/actions'

import { governorAbi } from '../abis'

export { ProposalState }

export const getProposalState = async (
  chainId: CHAIN_ID,
  governorAddress: AddressType,
  proposalId: BytesType,
  signal?: AbortSignal
) => {
  const baseParams = { address: governorAddress, abi: governorAbi, chainId }

  if (signal) {
    const chain = PUBLIC_ALL_CHAINS.find((candidate) => candidate.id === chainId)
    const client = createPublicClient({
      chain,
      transport: fallback(getRpcTransports(chainId, { fetchOptions: { signal } })),
    })

    return (await client.readContract({
      ...baseParams,
      functionName: 'state',
      args: [proposalId],
    })) as ProposalState
  }

  return (await readContract(serverConfig, {
    ...baseParams,
    functionName: 'state',
    args: [proposalId],
  })) as ProposalState
}
