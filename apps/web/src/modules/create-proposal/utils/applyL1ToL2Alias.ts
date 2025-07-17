import { getBytecode, readContract } from 'wagmi/actions'

import { L2_MIGRATION_DEPLOYER } from 'src/constants/addresses'
import { L2DeployerABI } from 'src/data/contract/abis/L2MigrationDeployer'
import { AddressType, CHAIN_ID } from 'src/typings'
import { config } from 'src/utils/wagmi/server.config'

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
  const bytecode = await getBytecode(config, { chainId: l1ChainId, address })
  if (bytecode) {
    return await readContract(config, {
      abi: L2DeployerABI,
      address: L2_MIGRATION_DEPLOYER[l2ChainId],
      chainId: l2ChainId,
      functionName: 'applyL1ToL2Alias',
      args: [address],
    })
  }

  return address
}
