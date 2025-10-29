// pages/api/feed.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from '@/services/redisConnection'
import { fetchFeedData } from '@/services/feed'
import type { FeedItem } from '@buildeross/types'
import withCors from '@/middleware/cors'

const redis = new Redis(process.env.REDIS_URL!)

const FEED_CACHE_TTL = 60 // seconds

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cursor, limit = 20 } = req.query
  const cacheKey = `feed:${cursor || 'start'}:${limit}`

  const redis = getRedisConnection()
  // Try cache first
  const cached = await redis?.get(cacheKey)
  if (cached) {
    return res.status(200).json(JSON.parse(cached))
  }

  // Fetch from GraphQL sources
  const items = await fetchFeedData({ cursor: cursor as string, limit: +limit })

  // Sort by time desc
  const sorted = items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Compute next cursor (oldest item’s timestamp)
  const nextCursor = sorted.at(-1)?.createdAt ?? null

  const result = { items: sorted, nextCursor }

  // Cache result
  await redis?.setex(cacheKey, FEED_CACHE_TTL, JSON.stringify(result))

  return res.status(200).json(result)
}


export default withCors()(handler)
