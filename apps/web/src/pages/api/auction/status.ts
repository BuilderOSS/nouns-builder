import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuctionStatuses } from 'src/services/auctionStatusService'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { isAddress } from 'viem'

const MAX_DAOS = 100

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { chainId, daos } = req.query

  if (!chainId || typeof chainId !== 'string' || !daos || typeof daos !== 'string') {
    return res.status(400).json({ error: 'Missing chainId or daos parameter' })
  }

  const chainIdNum = parseInt(chainId, 10)

  if (!PUBLIC_DEFAULT_CHAINS.some((chain) => chain.id === chainIdNum)) {
    return res.status(400).json({ error: 'Invalid chainId' })
  }

  const daoIds = Array.from(
    new Set(
      daos
        .split(',')
        .map((dao) => dao.trim().toLowerCase())
        .filter(Boolean)
    )
  )

  if (!daoIds.length || daoIds.length > MAX_DAOS) {
    return res.status(400).json({ error: `Provide between 1 and ${MAX_DAOS} daos` })
  }

  if (!daoIds.every((dao) => isAddress(dao, { strict: false }))) {
    return res.status(400).json({ error: 'Invalid dao address' })
  }

  try {
    const result = await getAuctionStatuses(chainIdNum as CHAIN_ID, daoIds)

    res.setHeader(
      'Cache-Control',
      result.stale
        ? 'public, s-maxage=1, stale-while-revalidate=2'
        : 'public, s-maxage=3, stale-while-revalidate=5'
    )
    return res.status(200).json(result)
  } catch (error) {
    console.error('Auction status API error:', error)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(502).json({ error: 'Failed to fetch auction status' })
  }
}

export default withCors()(
  withRateLimit({
    maxRequests: 120,
    windowSeconds: 60,
    keyPrefix: 'auction-status',
  })(handler)
)
