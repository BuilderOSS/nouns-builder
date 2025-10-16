import { auctionHistoryRequest } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'

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
