import { myDaosRequest } from '@buildeross/sdk/subgraph'
import { NextApiRequest, NextApiResponse } from 'next'
import { NotFoundError } from 'src/services/errors'
import { getAddress } from 'viem'

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

  const { user } = req.query

  let address: string

  try {
    address = getAddress(user as string)
  } catch (e) {
    return res.status(400).json({ error: 'bad address input' })
  }
  try {
    const daos = await myDaosRequest(address)

    res.status(200).json(daos)
  } catch (e) {
    if (e instanceof NotFoundError) {
      return res.status(404).json({ error: 'daos not found' })
    }

    return res.status(500).json({ error: 'backend failed' })
  }
}

export default handler
