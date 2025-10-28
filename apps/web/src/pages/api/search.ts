import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { searchDaosRequest } from '@buildeross/sdk/subgraph'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const limit = 30
  const { search, network } = req.query

  const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)

  if (!chain) return res.status(404).end()

  if (!search || typeof search !== 'string') return res.status(400).end()

  const searchRes = await searchDaosRequest(chain.id, search, limit, 0)

  if (!searchRes) {
    return res.status(500).json({ error: 'Search failed' })
  }

  const { maxAge, swr } = CACHE_TIMES.EXPLORE
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  res.status(200).send(searchRes)
}

export default withCors()(handler)
