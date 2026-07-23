import { getMetadataAttributes } from '@buildeross/sdk/contract'
import { NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { Address } from 'viem'

// Increase timeout to 60 seconds for DAOs with many tokens
export const config = {
  maxDuration: 60,
}

const getAttributesRedisKey = (chainId: number, metadata: string, finalTokenId: string) =>
  `migrate-attributes:${chainId}:${metadata.toLowerCase()}:${finalTokenId}`

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { metadata, chainId, finalTokenId } = req.query as {
      metadata: Address
      chainId: string
      finalTokenId: string
    }

    const chainIdNum = parseInt(chainId)
    const metadataLower = metadata.toLowerCase()
    const cacheKey = getAttributesRedisKey(chainIdNum, metadataLower, finalTokenId)

    // Try to get from Redis cache first
    const redisConnection = getRedisConnection()
    const cachedData = await redisConnection?.get(cacheKey)

    if (cachedData) {
      const result = JSON.parse(cachedData)
      return res.status(200).json({ data: result, source: 'cache' })
    }

    // Cache miss - fetch from blockchain
    const attributes = await getMetadataAttributes(
      metadata as Address,
      BigInt(finalTokenId),
      chainIdNum
    )

    // Store in Redis cache for 7 days
    const TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days
    await redisConnection?.setex(cacheKey, TTL_SECONDS, JSON.stringify(attributes))

    return res.status(200).json({ data: attributes, source: 'blockchain' })
  } catch (e) {
    console.error('[migrate/attributes API] Error fetching attributes:', {
      error: e,
      message: e instanceof Error ? e.message : 'Unknown error',
    })
    res.status(500).send(e)
  }
}

export default withCors()(
  withRateLimit({
    maxRequests: 10,
    windowSeconds: 60,
    keyPrefix: 'migrate:attributes',
  })(handler)
)
