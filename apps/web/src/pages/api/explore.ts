import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { Auction_OrderBy, exploreDaosRequest } from '@buildeross/sdk/subgraph'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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

export default withCors()(handler)
