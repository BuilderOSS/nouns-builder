import { L2_MIGRATION_DEPLOYER } from '@buildeross/constants/addresses'
import { l2DeployerAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { serverConfig } from '@buildeross/utils/wagmi/serverConfig'
import { getBytecode, readContract } from 'wagmi/actions'

// We are calling a pure function so we can default to any network with an L2 migration deployer
const DEFAULT_L2_CHAIN_ID = CHAIN_ID.BASE

export const applyL1ToL2Alias = async ({
  l1ChainId,
  l2ChainId = DEFAULT_L2_CHAIN_ID,
  address,
}: {
  l1ChainId: CHAIN_ID
  l2ChainId?: CHAIN_ID
  address: AddressType
}) => {
  const bytecode = await getBytecode(serverConfig, { chainId: l1ChainId, address })
  if (bytecode) {
    return await readContract(serverConfig, {
      abi: l2DeployerAbi,
      address: L2_MIGRATION_DEPLOYER[l2ChainId],
      chainId: l2ChainId,
      functionName: 'applyL1ToL2Alias',
      args: [address],
    })
  }

  return address
}
