import { memberSnapshotRequest } from '@buildeross/sdk/subgraph'
import { NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'
import { withCors } from 'src/utils/api/cors'
import { Address } from 'viem'

// Increase timeout to 60 seconds for DAOs with many members
export const config = {
  maxDuration: 60,
}

const getSnapshotRedisKey = (chainId: number, token: string) =>
  `migrate-snapshot:${chainId}:${token.toLowerCase()}`

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { chainId, token } = req.query as {
      token: Address
      chainId: string
    }

    const chainIdNum = parseInt(chainId)
    const tokenLower = token.toLowerCase()
    const cacheKey = getSnapshotRedisKey(chainIdNum, tokenLower)

    // Try to get from Redis cache first
    const redisConnection = getRedisConnection()
    const cachedData = await redisConnection?.get(cacheKey)

    if (cachedData) {
      const result = JSON.parse(cachedData)
      return res.status(200).json({ data: result, source: 'cache' })
    }

    // Cache miss - fetch from subgraph
    const snapshot = await memberSnapshotRequest(chainIdNum, token)

    // Store in Redis cache for 7 days
    const TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days
    await redisConnection?.setex(cacheKey, TTL_SECONDS, JSON.stringify(snapshot))

    return res.status(200).json({ data: snapshot, source: 'subgraph' })
  } catch (e) {
    console.error('[migrate/snapshot API] Error fetching snapshot:', {
      error: e,
      message: e instanceof Error ? e.message : 'Unknown error',
    })
    res.status(500).send(e)
  }
}

export default withCors()(handler)
