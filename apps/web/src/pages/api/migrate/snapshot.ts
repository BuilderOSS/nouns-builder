import { memberSnapshotRequest } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'
import { withCors } from 'src/utils/api/cors'
import { Address, isAddress } from 'viem'

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

    // Validate inputs
    if (!chainId || !token) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both chainId and token are required',
      })
    }

    const chainIdNum = parseInt(chainId)
    if (!Object.values(CHAIN_ID).includes(chainIdNum)) {
      return res.status(400).json({
        error: 'Invalid chain ID',
        message: `Chain ID ${chainIdNum} is not supported`,
      })
    }

    if (!isAddress(token)) {
      return res.status(400).json({
        error: 'Invalid address',
        message: 'Token must be a valid Ethereum address',
      })
    }

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
    return res.status(500).json({
      error: 'Internal server error',
      message: e instanceof Error ? e.message : 'Failed to fetch snapshot',
    })
  }
}

export default withCors()(handler)
