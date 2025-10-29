import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { getFeedData, getUserActivityFeed } from '@buildeross/sdk/subgraph'
import { CHAIN_ID, FeedItem, FeedResponse } from '@buildeross/types'
import { keccak256, toHex } from 'viem'

import { InvalidRequestError } from './errors'
import { getRedisConnection } from './redisConnection'

/**
 * Supported chain IDs
 */
const SUPPORTED_CHAIN_IDS: CHAIN_ID[] = PUBLIC_DEFAULT_CHAINS.map((chain) => chain.id)

/**
 * Execute promises with controlled concurrency
 */
async function executeConcurrently<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrent: number
): Promise<T[]> {
  const results: T[] = []
  for (let i = 0; i < tasks.length; i += maxConcurrent) {
    const batch = tasks.slice(i, i + maxConcurrent)
    const batchResults = await Promise.all(batch.map((t) => t()))
    results.push(...batchResults)
  }
  return results
}

/**
 * Redis cache configuration
 */
const CACHE_CONFIG = {
  TTL_SECONDS: 5 * 60, // 5 minutes
  GLOBAL_FEED_PREFIX: 'feed:global',
  DAO_FEED_PREFIX: 'feed:dao',
  USER_ACTIVITY_PREFIX: 'feed:user',
} as const

/**
 * Generate cache key for Redis
 */
function generateCacheKey(params: {
  chainId?: CHAIN_ID
  daoAddress?: string
  actor?: string
  cursor?: string | number
  limit: number
}): string {
  const { chainId, daoAddress, actor, cursor, limit } = params

  const baseKey = JSON.stringify({
    chainId,
    daoAddress: daoAddress?.toLowerCase(),
    actor: actor?.toLowerCase(),
    cursor: cursor || 'latest',
    limit,
  })

  // short prefix + hash of params
  const hash = keccak256(toHex(baseKey))
  const scope = actor ? 'user' : daoAddress ? 'dao' : chainId ? 'chain' : 'global'

  return `feed:${scope}:${hash}`
}

/**
 * Fetch with Redis cache
 */
export function getTtlByScope(params: {
  chainId?: CHAIN_ID
  daoAddress?: string
  actor?: string
}): number {
  if (params.daoAddress) return 600 // 10 min for DAO
  if (params.actor) return 300 // 5 min for user activity
  if (params.chainId) return 180 // 3 min for chain feed
  return 60 // 1 min for global
}

async function fetchWithCache(
  key: string,
  fetcher: () => Promise<FeedResponse>,
  ttl: number
): Promise<FeedResponse> {
  const redis = getRedisConnection()
  if (!redis) return fetcher()

  // Try cache
  try {
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached) as FeedResponse
  } catch (err) {
    console.warn('Redis read error', err)
  }

  const data = await fetcher()

  if (data.items.length > 0) {
    try {
      // Only write if key doesn’t exist or is expiring soon
      const ttlRemaining = await redis.ttl(key)
      if (ttlRemaining < ttl / 2) {
        await redis.setex(key, ttl, JSON.stringify(data))
      }
    } catch (err) {
      console.warn('Redis write error', err)
    }
  }

  return data
}

/**
 * Utility to ensure deterministic order and pagination cutoff
 */
function sortAndPaginate(feeds: FeedResponse[], limit: number): FeedResponse {
  const allItems: FeedItem[] = []
  feeds.forEach((f) => allItems.push(...f.items))

  // Sort deterministically by timestamp DESC, then by id (and chainId as fallback)
  allItems.sort((a, b) => {
    if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp
    if (a.chainId !== b.chainId) return a.chainId - b.chainId
    return a.id.localeCompare(b.id)
  })

  if (allItems.length <= limit) {
    return { items: allItems, hasMore: false, nextCursor: null }
  }

  const cutoffTs = allItems[limit - 1].timestamp

  // include all events with the same timestamp as cutoff to avoid missing ones
  const finalItems = allItems.filter((i, idx) => idx < limit || i.timestamp === cutoffTs)

  const hasMore = finalItems.length < allItems.length

  if (hasMore) {
    return { items: finalItems, hasMore, nextCursor: cutoffTs }
  }

  return { items: finalItems, hasMore, nextCursor: null }
}

//
// ────────────────────────────────────────────────────────────────
// 📰 FEED SERVICE (Global, Chain, DAO)
// ────────────────────────────────────────────────────────────────
//

type FeedServiceParams = {
  chainId?: CHAIN_ID
  daoAddress?: string
  cursor?: number
  limit?: number
  maxConcurrentConnections?: number
}

export async function fetchFeedDataService({
  chainId,
  daoAddress,
  cursor,
  limit = 20,
  maxConcurrentConnections = 2,
}: FeedServiceParams): Promise<FeedResponse> {
  try {
    if (daoAddress && !chainId)
      throw new InvalidRequestError('chainId is required when daoAddress is specified')

    // DAO-specific
    if (chainId && daoAddress) {
      const key = generateCacheKey({ chainId, daoAddress, cursor, limit })
      const ttl = getTtlByScope({ chainId, daoAddress })
      return fetchWithCache(
        key,
        () => getFeedData({ chainId, limit, cursor, dao: daoAddress }),
        ttl
      )
    }

    // Chain-specific
    if (chainId) {
      const key = generateCacheKey({ chainId, cursor, limit })
      const ttl = getTtlByScope({ chainId })
      return fetchWithCache(key, () => getFeedData({ chainId, limit, cursor }), ttl)
    }

    // Global feed (all chains)
    const tasks = SUPPORTED_CHAIN_IDS.map(
      (cid) => () =>
        getFeedData({
          chainId: cid,
          limit: Math.ceil(limit / SUPPORTED_CHAIN_IDS.length) + 5,
          cursor,
        }).catch((e) => {
          console.error(`Feed fetch failed for chain ${cid}`, e)
          return { items: [], hasMore: false, nextCursor: null } as FeedResponse
        })
    )

    const allFeeds = await executeConcurrently(tasks, maxConcurrentConnections)
    const merged = sortAndPaginate(allFeeds, limit)

    const key = generateCacheKey({ limit, cursor })
    const redis = getRedisConnection()
    if (redis && merged.items.length > 0) {
      try {
        await redis.setex(key, CACHE_CONFIG.TTL_SECONDS, JSON.stringify(merged))
      } catch (_) {}
    }

    return merged
  } catch (err) {
    console.error('Feed service error', err)
    return { items: [], hasMore: false, nextCursor: null }
  }
}

//
// ────────────────────────────────────────────────────────────────
// 🧍 USER ACTIVITY SERVICE (Global or Chain-specific)
// ────────────────────────────────────────────────────────────────
//

type UserActivityParams =
  | {
      chainId?: undefined
      actor: string
      cursor?: number
      limit?: number
      maxConcurrentConnections?: number
    }
  | {
      chainId: CHAIN_ID
      actor: string
      cursor?: number
      limit?: number
      maxConcurrentConnections?: number
    }

export async function fetchUserActivityFeedService({
  chainId,
  actor,
  cursor,
  limit = 20,
  maxConcurrentConnections = 2,
}: UserActivityParams): Promise<FeedResponse> {
  try {
    // Chain-specific
    if (chainId) {
      const key = generateCacheKey({ chainId, actor, cursor, limit })
      const ttl = getTtlByScope({ chainId, actor })
      return fetchWithCache(
        key,
        () => getUserActivityFeed({ chainId, limit, cursor, actor }),
        ttl
      )
    }

    // Global user feed (all chains)
    const tasks = SUPPORTED_CHAIN_IDS.map(
      (cid) => () =>
        getUserActivityFeed({
          chainId: cid,
          limit: Math.ceil(limit / SUPPORTED_CHAIN_IDS.length) + 5,
          cursor,
          actor,
        }).catch((e) => {
          console.error(`User activity fetch failed for chain ${cid}`, e)
          return { items: [], hasMore: false, nextCursor: null } as FeedResponse
        })
    )

    const allFeeds = await executeConcurrently(tasks, maxConcurrentConnections)
    const merged = sortAndPaginate(allFeeds, limit)

    const key = generateCacheKey({ actor, cursor, limit })
    const redis = getRedisConnection()
    if (redis && merged.items.length > 0) {
      try {
        await redis.setex(key, CACHE_CONFIG.TTL_SECONDS, JSON.stringify(merged))
      } catch (_) {}
    }

    return merged
  } catch (err) {
    console.error('User activity feed error', err)
    return { items: [], hasMore: false, nextCursor: null }
  }
}

//
// ────────────────────────────────────────────────────────────────
// ♻️ CACHE INVALIDATION
// ────────────────────────────────────────────────────────────────
//

export async function invalidateFeedCache(params: {
  chainId?: CHAIN_ID
  daoAddress?: string
  actor?: string
}): Promise<void> {
  const redis = getRedisConnection()
  if (!redis) return
  try {
    const patterns: string[] = []

    if (params.actor && params.chainId)
      patterns.push(
        `${CACHE_CONFIG.USER_ACTIVITY_PREFIX}:${params.actor.toLowerCase()}:${params.chainId}:*`
      )
    else if (params.actor)
      patterns.push(
        `${CACHE_CONFIG.USER_ACTIVITY_PREFIX}:${params.actor.toLowerCase()}:*`
      )

    if (params.daoAddress && params.chainId)
      patterns.push(
        `${CACHE_CONFIG.DAO_FEED_PREFIX}:${params.chainId}:${params.daoAddress.toLowerCase()}:*`
      )
    else if (params.chainId)
      patterns.push(`${CACHE_CONFIG.GLOBAL_FEED_PREFIX}:${params.chainId}:*`)
    else if (params.daoAddress)
      patterns.push(
        `${CACHE_CONFIG.DAO_FEED_PREFIX}:*:${params.daoAddress.toLowerCase()}:*`
      )

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
        console.log(`Invalidated ${keys.length} cache keys for ${pattern}`)
      }
    }
  } catch (err) {
    console.warn('Feed cache invalidation error', err)
  }
}
