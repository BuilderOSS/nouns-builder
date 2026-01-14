import { getTreasuryAssetPins } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { isAddress } from 'viem'

const getPinnedAssetsKey = (chainId: CHAIN_ID, daoAddress: string) =>
  `pinned-assets:${chainId}:${daoAddress.toLowerCase()}`

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chainId, daoAddress } = req.query

  if (!chainId || !daoAddress) {
    return res.status(400).json({ error: 'Missing chainId or daoAddress parameter' })
  }

  const chainIdNum = parseInt(chainId as string, 10)

  if (!Object.values(CHAIN_ID).includes(chainIdNum)) {
    return res.status(400).json({ error: 'Invalid chainId' })
  }

  if (!isAddress(daoAddress as string)) {
    return res.status(400).json({ error: 'Invalid DAO address' })
  }

  try {
    const redis = getRedisConnection()
    const cacheKey = getPinnedAssetsKey(chainIdNum as CHAIN_ID, daoAddress as string)

    // Check cache
    if (redis) {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return res.status(200).json({
          data: JSON.parse(cached),
          source: 'cache',
        })
      }
    }

    // Fetch from subgraph
    const pinnedAssets = await getTreasuryAssetPins(
      daoAddress as string,
      chainIdNum as CHAIN_ID,
      false // Don't include revoked pins
    )

    // Cache the result (5 minutes TTL to match token balances)
    if (redis) {
      await redis.setex(cacheKey, 300, JSON.stringify(pinnedAssets))
    }

    return res.status(200).json({
      data: pinnedAssets,
      source: 'fetched',
    })
  } catch (error) {
    console.error('Pinned assets API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors()(
  withRateLimit({
    keyPrefix: 'api:pinnedAssets',
  })(handler)
)
