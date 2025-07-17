import { readContract } from 'wagmi/actions'

import { AddressType, BytesType, CHAIN_ID, ProposalState } from 'src/typings'
import { config } from 'src/utils/wagmi/server.config'

import { governorAbi } from '../abis'

export { ProposalState }

export const getProposalState = async (
  chainId: CHAIN_ID,
  governorAddress: AddressType,
  proposalId: BytesType
) => {
  const baseParams = { address: governorAddress, abi: governorAbi, chainId }
  return (await readContract(config, {
    ...baseParams,
    functionName: 'state',
    args: [proposalId],
  })) as ProposalState
}
