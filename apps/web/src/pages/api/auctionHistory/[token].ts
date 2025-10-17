import { auctionHistoryRequest } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/cors'

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
export default withCors(['GET'])(handler)
