import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'

import { auctionHistoryRequest } from 'src/data/subgraph/requests/auctionHistory'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token, chainId, startTime } = req.query

  try {
    if (!token || !chainId || !startTime) {
      throw new Error('Invalid query')
    }
    const auctionHistory = await auctionHistoryRequest(
      Number(chainId) as CHAIN_ID,
      (token as string).toLowerCase(),
      Number(startTime)
    )
    res.status(200).json({ auctionHistory })
  } catch (error) {
    res.status(500).json({ error })
  }
}
export default handler
