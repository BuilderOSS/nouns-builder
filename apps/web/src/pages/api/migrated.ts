import { L2_MIGRATION_DEPLOYER } from '@buildeross/constants/addresses'
import { L2_CHAINS } from '@buildeross/constants/chains'
import { l2DeployerAbi } from '@buildeross/sdk/contract'
import { AddressType, L2MigratedResponse } from '@buildeross/types'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { serverConfig } from '@buildeross/utils/wagmi/serverConfig'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'
import { zeroAddress } from 'viem'
import { readContract } from 'wagmi/actions'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { l1Treasury } = req.query

  const data = await Promise.all(
    L2_CHAINS.map((chainId) => {
      const deployer = L2_MIGRATION_DEPLOYER[chainId]

      if (deployer === zeroAddress) return []
      return readContract(serverConfig, {
        address: deployer,
        chainId: chainId,
        abi: l2DeployerAbi,
        functionName: 'crossDomainDeployerToMigration',
        args: [l1Treasury as AddressType],
      })
    })
  )

  const migrated = data
    .map((x, i) => {
      const [token] = unpackOptionalArray(x, 3)
      return {
        l2TokenAddress: token,
        chainId: L2_CHAINS[i],
      }
    })
    .find((x) => {
      return x.l2TokenAddress !== zeroAddress && x.l2TokenAddress !== undefined
    })

  if (!migrated) {
    return res.status(200).send({ migrated: null })
  }

  res.status(200).send({
    migrated,
  } as L2MigratedResponse)
}

export default withCors()(handler)
