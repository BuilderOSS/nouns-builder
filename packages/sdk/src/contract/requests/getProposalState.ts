import { AddressType, BytesType, CHAIN_ID, ProposalState } from '@buildeross/types'
import { serverConfig } from '@buildeross/utils'
import { readContract } from 'wagmi/actions'

import { governorAbi } from '../abis'

export { ProposalState }

export const getProposalState = async (
  chainId: CHAIN_ID,
  governorAddress: AddressType,
  proposalId: BytesType
) => {
  const baseParams = { address: governorAddress, abi: governorAbi, chainId }
  return (await readContract(serverConfig, {
    ...baseParams,
    functionName: 'state',
    args: [proposalId],
  })) as ProposalState
}
