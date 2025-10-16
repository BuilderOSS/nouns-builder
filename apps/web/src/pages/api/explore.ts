import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { Auction_OrderBy, exploreDaosRequest } from '@buildeross/sdk/subgraph'
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

  const limit = 30
  const { page, orderBy, network } = req.query
  const pageInt = parseInt(page as string, 10) || 1

  const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)

  if (!chain) return res.status(404).end()

  const exploreRes = await exploreDaosRequest(
    chain.id,
    (pageInt - 1) * limit,
    orderBy as Auction_OrderBy
  )

  const { maxAge, swr } = CACHE_TIMES.EXPLORE
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  res.status(200).send(exploreRes)
}

export default handler
