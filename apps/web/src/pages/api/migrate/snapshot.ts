import { memberSnapshotRequest } from '@buildeross/sdk/subgraph'
import { NextApiRequest, NextApiResponse } from 'next'
import { Address } from 'viem'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Set CORS headers to allow any origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

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

export default handler
