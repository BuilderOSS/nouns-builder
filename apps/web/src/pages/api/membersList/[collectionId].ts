import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'

import { votersRequest } from 'src/data/subgraph/requests/daoVoters'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { collectionId, chainId, page, limit } = req.query

  try {
    if (!collectionId || !chainId) {
      throw new Error('Invalid query')
    }
    const membersList = await votersRequest(
      Number(chainId) as CHAIN_ID,
      (collectionId as string).toLowerCase(),
      typeof Number(page) === 'number' ? Number(page) : undefined,
      typeof Number(limit) === 'number' ? Number(limit) : undefined
    )
    res.status(200).json({ membersList })
  } catch (error) {
    res.status(500).json({ error })
  }
}
export default handler
