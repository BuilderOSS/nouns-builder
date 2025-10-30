import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { Auction_OrderBy, exploreDaosRequest } from '@buildeross/sdk/subgraph'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'

const VALID_ORDER_BY_VALUES = Object.values(Auction_OrderBy)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const limit = 30
  const { page, orderBy, network } = req.query

  // Validate and normalize page
  const pageInt = Math.max(1, parseInt(page as string, 10) || 1)

  // Validate network
  const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)
  if (!chain) {
    return res.status(404).json({ error: 'Network not found' })
  }

  // Validate orderBy parameter
  if (orderBy && !VALID_ORDER_BY_VALUES.includes(orderBy as Auction_OrderBy)) {
    return res.status(400).json({
      error: 'Invalid orderBy parameter',
      validValues: VALID_ORDER_BY_VALUES,
    })
  }

  try {
    const exploreRes = await exploreDaosRequest(
      chain.id,
      limit,
      (pageInt - 1) * limit,
      orderBy as Auction_OrderBy
    )

    if (!exploreRes) {
      return res.status(500).json({ error: 'Explore request failed' })
    }

    const { maxAge, swr } = CACHE_TIMES.EXPLORE
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )

    return res.status(200).json(exploreRes)
  } catch (error) {
    console.error('Explore error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors()(
  withRateLimit({
    maxRequests: 60, // Higher limit - simple paginated queries
    windowSeconds: 60, // 1 minute window
    keyPrefix: 'explore',
  })(handler)
)
