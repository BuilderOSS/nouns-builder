import { PUBLIC_ALL_CHAINS, RPC_URLS } from '@buildeross/constants'
import { AddressType, BytesType, CHAIN_ID, ProposalState } from '@buildeross/types'
import { serverConfig } from '@buildeross/utils'
import { createPublicClient, fallback, http } from 'viem'
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
    const rpcUrls = RPC_URLS[chainId] ?? []
    const client = createPublicClient({
      chain,
      transport: fallback(
        rpcUrls
          .map((rpcUrl) => http(rpcUrl, { fetchOptions: { signal } }))
          .concat(http(undefined, { fetchOptions: { signal } }))
      ),
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
