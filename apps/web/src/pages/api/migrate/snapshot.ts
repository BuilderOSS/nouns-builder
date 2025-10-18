import { memberSnapshotRequest } from '@buildeross/sdk/subgraph'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'
import { Address } from 'viem'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { chainId, token } = req.query as {
      token: Address
      chainId: string
    }

    const snapshot = await memberSnapshotRequest(parseInt(chainId), token)

    res.status(200).send(snapshot)
  } catch (e) {
    res.status(500).send(e)
  }
}

export default withCors(['GET'])(handler)
