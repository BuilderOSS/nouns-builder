import { myDaosRequest } from '@buildeross/sdk/subgraph'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAddress } from 'viem'

import { NotFoundError } from 'src/services/errors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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
