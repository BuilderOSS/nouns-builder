import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { searchDaosRequest } from '@buildeross/sdk/subgraph'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'

const MIN_SEARCH_LENGTH = 3
const MAX_SEARCH_LENGTH = 100 // Prevent abuse

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const limit = 30
  const { page, search, network } = req.query
  const pageInt = Math.max(1, parseInt(page as string, 10) || 1)

  const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)

  if (!chain) {
    return res.status(404).json({ error: 'Network not found' })
  }

  if (!search || typeof search !== 'string' || search.trim().length === 0) {
    return res.status(400).json({ error: 'Search query required' })
  }

  const trimmedSearch = search.trim()

  if (trimmedSearch.length < MIN_SEARCH_LENGTH) {
    return res.status(400).json({
      error: `Search must be at least ${MIN_SEARCH_LENGTH} characters`,
    })
  }

  if (trimmedSearch.length > MAX_SEARCH_LENGTH) {
    return res.status(400).json({
      error: `Search must be less than ${MAX_SEARCH_LENGTH} characters`,
    })
  }

  try {
    const searchRes = await searchDaosRequest(
      chain.id,
      trimmedSearch,
      limit,
      (pageInt - 1) * limit
    )

    if (!searchRes) {
      return res.status(500).json({ error: 'Search failed' })
    }

    const { maxAge, swr } = CACHE_TIMES.EXPLORE
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )

    return res.status(200).json(searchRes)
  } catch (error) {
    console.error('Search error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors()(
  withRateLimit({
    maxRequests: 30,
    windowSeconds: 60, // 30 requests per minute
    keyPrefix: 'search',
  })(handler)
)
