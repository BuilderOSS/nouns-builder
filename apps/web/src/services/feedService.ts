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
  // TTL by scope
  GLOBAL_TTL: 60, // 1 minute for global feed (high traffic)
  CHAIN_TTL: 180, // 3 minutes for chain-specific feed
  DAO_TTL: 600, // 10 minutes for DAO feed (more stable)
  USER_TTL: 300, // 5 minutes for user activity

  // Key prefixes
  GLOBAL_FEED_PREFIX: 'feed:global',
  CHAIN_FEED_PREFIX: 'feed:chain',
  DAO_FEED_PREFIX: 'feed:dao',
  USER_ACTIVITY_PREFIX: 'feed:user',
} as const

/**
 * Determine cache key prefix based on scope
 */
const getScopePrefix = (params: {
  chainId?: CHAIN_ID
  daoAddress?: string
  actor?: string
}): string => {
  if (params.actor) return CACHE_CONFIG.USER_ACTIVITY_PREFIX
  if (params.daoAddress) return CACHE_CONFIG.DAO_FEED_PREFIX
  if (params.chainId) return CACHE_CONFIG.CHAIN_FEED_PREFIX
  return CACHE_CONFIG.GLOBAL_FEED_PREFIX
}

/**
 * Get TTL based on scope
 */
export function getTtlByScope(params: {
  chainId?: CHAIN_ID
  daoAddress?: string
  actor?: string
}): number {
  if (params.actor) return CACHE_CONFIG.USER_TTL
  if (params.daoAddress) return CACHE_CONFIG.DAO_TTL
  if (params.chainId) return CACHE_CONFIG.CHAIN_TTL
  return CACHE_CONFIG.GLOBAL_TTL
}

/**
 * Generate cache key (without cursor/limit for better cache efficiency)
 */
function generateCacheKey(params: {
  chainId?: CHAIN_ID
  daoAddress?: string
  actor?: string
}): string {
  const { chainId, daoAddress, actor } = params

  const baseKey = JSON.stringify({
    chainId,
    daoAddress: daoAddress?.toLowerCase(),
    actor: actor?.toLowerCase(),
  })

  // Short prefix + hash of params
  const hash = keccak256(toHex(baseKey)).slice(0, 18) // First 8 bytes + '0x'
  const scopePrefix = getScopePrefix({ chainId, daoAddress, actor })

  return `${scopePrefix}:${hash}`
}

/**
 * Log helper that respects NODE_ENV
 */
function log(message: string, data?: any) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(message, data || '')
  }
}

/**
 * Fetch with Redis sorted set cache and request deduplication
 */
async function fetchWithSortedSetCache(
  key: string,
  fetcher: () => Promise<FeedResponse>,
  ttl: number,
  cursor?: number,
  limit: number = 20
): Promise<FeedResponse> {
  const redis = getRedisConnection()
  if (!redis) return fetcher()

  const lockKey = `${key}:lock`
  const startTime = Date.now()

  // Try to get from sorted set cache
  try {
    const maxScore = cursor?.toString() || '+inf'
    const cachedItems = await redis.zrevrangebyscore(
      key,
      maxScore,
      '-inf',
      'LIMIT',
      0,
      limit + 1
    )

    if (cachedItems.length > 0) {
      const items = cachedItems.map((item) => JSON.parse(item) as FeedItem)
      const hasMore = items.length > limit
      const limitedItems = items.slice(0, limit)

      log('Feed cache hit', {
        key,
        itemCount: limitedItems.length,
        hasMore,
        duration: Date.now() - startTime,
      })

      return hasMore
        ? {
            items: limitedItems,
            hasMore: true,
            nextCursor: limitedItems[limitedItems.length - 1].timestamp,
          }
        : { items: limitedItems, hasMore: false, nextCursor: null }
    }
  } catch (err) {
    console.warn('Redis cache read error:', err)
  }

  // Cache miss - try to acquire lock to prevent thundering herd
  let lockAcquired = false
  try {
    lockAcquired = (await redis.set(lockKey, '1', 'EX', 10, 'NX')) === 'OK'
  } catch (err) {
    console.warn('Redis lock error:', err)
  }

  if (!lockAcquired) {
    // Another request is fetching, wait briefly and retry cache
    log('Waiting for lock', { key })
    await new Promise((resolve) => setTimeout(resolve, 200))

    try {
      const maxScore = cursor?.toString() || '+inf'
      const cachedItems = await redis.zrevrangebyscore(
        key,
        maxScore,
        '-inf',
        'LIMIT',
        0,
        limit + 1
      )

      if (cachedItems.length > 0) {
        const items = cachedItems.map((item) => JSON.parse(item) as FeedItem)
        const hasMore = items.length > limit
        const limitedItems = items.slice(0, limit)

        log('Feed cache hit after wait', { key, itemCount: limitedItems.length })

        return hasMore
          ? {
              items: limitedItems,
              hasMore: true,
              nextCursor: limitedItems[limitedItems.length - 1].timestamp,
            }
          : { items: limitedItems, hasMore: false, nextCursor: null }
      }
    } catch (err) {
      console.warn('Redis retry read error:', err)
    }

    // If still no cache after wait, just fetch (lock may have failed/expired)
    log('Proceeding to fetch without lock', { key })
  }

  try {
    // Fetch fresh data (fetch MORE to populate cache for future pages)
    log('Feed cache miss, fetching fresh data', { key, cursor, limit })
    const data = await fetcher()

    // Store in Redis sorted set
    if (redis && data.items.length > 0) {
      try {
        const pipeline = redis.pipeline()

        for (const item of data.items) {
          // Score = timestamp, Value = JSON serialized item
          pipeline.zadd(key, item.timestamp, JSON.stringify(item))
        }

        pipeline.expire(key, ttl)
        await pipeline.exec()

        log('Feed data cached in sorted set', {
          key,
          itemCount: data.items.length,
          ttl,
          duration: Date.now() - startTime,
        })
      } catch (err) {
        console.warn('Redis cache write error:', err)
      }
    }

    return data
  } finally {
    // Release lock
    if (lockAcquired) {
      try {
        await redis.del(lockKey)
      } catch (err) {
        console.warn('Redis lock release error:', err)
      }
    }
  }
}

/**
 * Sort and paginate feed items with deterministic ordering
 * NOTE: May return duplicates at page boundaries for items with identical timestamps
 */
function sortAndPaginate(feeds: FeedResponse[], limit: number): FeedResponse {
  const allItems: FeedItem[] = []
  feeds.forEach((f) => allItems.push(...f.items))

  // Deterministic sort: timestamp DESC, then chainId ASC, then id ASC
  allItems.sort((a, b) => {
    if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp
    if (a.chainId !== b.chainId) return a.chainId - b.chainId
    return a.id.localeCompare(b.id)
  })

  // Simple cutoff - accepts potential duplicates at page boundaries
  const hasMore = allItems.length > limit
  const limitedItems = allItems.slice(0, limit)

  if (hasMore && limitedItems.length > 0) {
    return {
      items: limitedItems,
      hasMore: true,
      nextCursor: limitedItems[limitedItems.length - 1].timestamp,
    }
  }

  return { items: limitedItems, hasMore: false, nextCursor: null }
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

/**
 * Fetch feed data with multi-chain support and Redis caching
 *
 * NOTE: Multi-chain feeds may have small duplicates at page boundaries
 * for items with identical timestamps. This is acceptable for most UIs.
 * Frontend should deduplicate by item.id if needed.
 */
export async function fetchFeedDataService({
  chainId,
  daoAddress,
  cursor,
  limit = 20,
  maxConcurrentConnections = 2,
}: FeedServiceParams): Promise<FeedResponse> {
  try {
    // Validate limit
    if (limit <= 0 || limit > 100) {
      throw new InvalidRequestError('Limit must be between 1 and 100')
    }

    // Validate daoAddress requires chainId
    if (daoAddress && !chainId) {
      throw new InvalidRequestError('chainId is required when daoAddress is specified')
    }

    // Validate chainId is supported
    if (chainId && !SUPPORTED_CHAIN_IDS.includes(chainId)) {
      throw new InvalidRequestError(
        `Unsupported chainId: ${chainId}. Supported chains: ${SUPPORTED_CHAIN_IDS.join(', ')}`
      )
    }

    // DAO-specific feed (single chain)
    if (chainId && daoAddress) {
      const key = generateCacheKey({ chainId, daoAddress })
      const ttl = getTtlByScope({ chainId, daoAddress })

      return fetchWithSortedSetCache(
        key,
        () => getFeedData({ chainId, limit: limit * 3, cursor, dao: daoAddress }),
        ttl,
        cursor,
        limit
      )
    }

    // Chain-specific feed (single chain)
    if (chainId) {
      const key = generateCacheKey({ chainId })
      const ttl = getTtlByScope({ chainId })

      return fetchWithSortedSetCache(
        key,
        () => getFeedData({ chainId, limit: limit * 3, cursor }),
        ttl,
        cursor,
        limit
      )
    }

    // Global feed (all chains) - don't cache merged result, only individual chains
    const perChainLimit = Math.ceil(limit / SUPPORTED_CHAIN_IDS.length) + 10

    const tasks = SUPPORTED_CHAIN_IDS.map((cid) => async () => {
      try {
        const key = generateCacheKey({ chainId: cid })
        const ttl = getTtlByScope({ chainId: cid })

        return await fetchWithSortedSetCache(
          key,
          () => getFeedData({ chainId: cid, limit: perChainLimit * 3, cursor }),
          ttl,
          cursor,
          perChainLimit
        )
      } catch (e) {
        console.error(`Feed fetch failed for chain ${cid}:`, e)
        return { items: [], hasMore: false, nextCursor: null } as FeedResponse
      }
    })

    const allFeeds = await executeConcurrently(tasks, maxConcurrentConnections)
    return sortAndPaginate(allFeeds, limit)
  } catch (err) {
    console.error('Feed service error:', err)

    // Log to Sentry if available
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(err)
      await sentry.flush(2000)
    } catch (_) {}

    return { items: [], hasMore: false, nextCursor: null }
  }
}

//
// ────────────────────────────────────────────────────────────────
// 🧍 USER ACTIVITY SERVICE (Global or Chain-specific)
// ────────────────────────────────────────────────────────────────
//

type UserActivityParams = {
  chainId?: CHAIN_ID
  actor: string
  cursor?: number
  limit?: number
  maxConcurrentConnections?: number
}

/**
 * Fetch user activity feed with multi-chain support and Redis caching
 *
 * NOTE: Multi-chain feeds may have small duplicates at page boundaries
 * for items with identical timestamps. This is acceptable for most UIs.
 * Frontend should deduplicate by item.id if needed.
 */
export async function fetchUserActivityFeedService({
  chainId,
  actor,
  cursor,
  limit = 20,
  maxConcurrentConnections = 2,
}: UserActivityParams): Promise<FeedResponse> {
  try {
    // Validate limit
    if (limit <= 0 || limit > 100) {
      throw new InvalidRequestError('Limit must be between 1 and 100')
    }

    // Validate actor
    if (!actor) {
      throw new InvalidRequestError('actor is required')
    }

    // Validate chainId is supported if provided
    if (chainId && !SUPPORTED_CHAIN_IDS.includes(chainId)) {
      throw new InvalidRequestError(
        `Unsupported chainId: ${chainId}. Supported chains: ${SUPPORTED_CHAIN_IDS.join(', ')}`
      )
    }

    // Chain-specific user activity
    if (chainId) {
      const key = generateCacheKey({ chainId, actor })
      const ttl = getTtlByScope({ chainId, actor })

      return fetchWithSortedSetCache(
        key,
        () => getUserActivityFeed({ chainId, limit: limit * 3, cursor, actor }),
        ttl,
        cursor,
        limit
      )
    }

    // Global user activity (all chains) - don't cache merged result
    const perChainLimit = Math.ceil(limit / SUPPORTED_CHAIN_IDS.length) + 10

    const tasks = SUPPORTED_CHAIN_IDS.map((cid) => async () => {
      try {
        const key = generateCacheKey({ chainId: cid, actor })
        const ttl = getTtlByScope({ chainId: cid, actor })

        return await fetchWithSortedSetCache(
          key,
          () =>
            getUserActivityFeed({
              chainId: cid,
              limit: perChainLimit * 3,
              cursor,
              actor,
            }),
          ttl,
          cursor,
          perChainLimit
        )
      } catch (e) {
        console.error(`User activity fetch failed for chain ${cid}:`, e)
        return { items: [], hasMore: false, nextCursor: null } as FeedResponse
      }
    })

    const allFeeds = await executeConcurrently(tasks, maxConcurrentConnections)
    return sortAndPaginate(allFeeds, limit)
  } catch (err) {
    console.error('User activity feed error:', err)

    // Log to Sentry if available
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(err)
      await sentry.flush(2000)
    } catch (_) {}

    return { items: [], hasMore: false, nextCursor: null }
  }
}

//
// ────────────────────────────────────────────────────────────────
// ♻️ CACHE MANAGEMENT
// ────────────────────────────────────────────────────────────────
//

/**
 * Invalidate feed cache for a specific scope
 *
 * Examples:
 * - Invalidate all caches for a DAO: { chainId: 1, daoAddress: '0x123...' }
 * - Invalidate all caches for a chain: { chainId: 1 }
 * - Invalidate all user activity for a user: { actor: '0xabc...' }
 * - Invalidate everything: {} (use with caution!)
 */
export async function invalidateFeedCache(params: {
  chainId?: CHAIN_ID
  daoAddress?: string
  actor?: string
}): Promise<void> {
  const redis = getRedisConnection()
  if (!redis) return

  try {
    // Generate the specific cache key
    const key = generateCacheKey(params)

    // Delete the sorted set and any associated locks
    const deleted = await redis.del(key, `${key}:lock`)

    if (deleted > 0) {
      log(`Invalidated feed cache`, { key, deleted })
    } else {
      log(`No cache found to invalidate`, { key })
    }
  } catch (err) {
    console.warn('Feed cache invalidation error:', err)
  }
}

/**
 * Invalidate all caches matching a pattern (use with caution)
 *
 * Examples:
 * - Invalidate all DAO feeds: { scope: 'dao' }
 * - Invalidate all user activity: { scope: 'user' }
 * - Invalidate all feeds: { scope: 'global' }
 */
export async function invalidateFeedCacheByScope(params: {
  scope: 'global' | 'chain' | 'dao' | 'user'
}): Promise<void> {
  const redis = getRedisConnection()
  if (!redis) return

  try {
    const prefixMap = {
      global: CACHE_CONFIG.GLOBAL_FEED_PREFIX,
      chain: CACHE_CONFIG.CHAIN_FEED_PREFIX,
      dao: CACHE_CONFIG.DAO_FEED_PREFIX,
      user: CACHE_CONFIG.USER_ACTIVITY_PREFIX,
    }

    const prefix = prefixMap[params.scope]
    const pattern = `${prefix}:*`

    const keys = await redis.keys(pattern)

    if (keys.length > 0) {
      await redis.del(...keys)
      log(`Invalidated ${keys.length} cache keys`, { scope: params.scope, pattern })
    } else {
      log(`No cache keys found to invalidate`, { scope: params.scope, pattern })
    }
  } catch (err) {
    console.warn('Feed cache scope invalidation error:', err)
  }
}

/**
 * Warm up cache for important feeds
 * Useful for:
 * - Background jobs to keep cache fresh
 * - Webhook handlers after new on-chain events
 * - Scheduled tasks during low-traffic periods
 */
export async function warmupFeedCache(params: {
  chainIds?: CHAIN_ID[]
  daoAddresses?: Array<{ chainId: CHAIN_ID; address: string }>
  actors?: Array<{ chainId?: CHAIN_ID; address: string }>
  limit?: number
  maxConcurrentConnections?: number
}): Promise<void> {
  const {
    chainIds = [],
    daoAddresses = [],
    actors = [],
    limit = 50, // Fetch more to populate cache
    maxConcurrentConnections = 2,
  } = params

  try {
    const warmupTasks: (() => Promise<any>)[] = []

    // Warm up chain feeds
    for (const chainId of chainIds) {
      if (!SUPPORTED_CHAIN_IDS.includes(chainId)) {
        console.warn(`Skipping unsupported chainId in warmup: ${chainId}`)
        continue
      }

      warmupTasks.push(async () => {
        try {
          await fetchFeedDataService({ chainId, limit })
          log(`Warmed up chain feed`, { chainId })
        } catch (error) {
          console.warn(`Failed to warm up chain feed ${chainId}:`, error)
        }
      })
    }

    // Warm up DAO feeds
    for (const { chainId, address } of daoAddresses) {
      if (!SUPPORTED_CHAIN_IDS.includes(chainId)) {
        console.warn(`Skipping unsupported chainId in warmup: ${chainId}`)
        continue
      }

      warmupTasks.push(async () => {
        try {
          await fetchFeedDataService({ chainId, daoAddress: address, limit })
          log(`Warmed up DAO feed`, { chainId, daoAddress: address })
        } catch (error) {
          console.warn(
            `Failed to warm up DAO feed ${address} on chain ${chainId}:`,
            error
          )
        }
      })
    }

    // Warm up user activity feeds
    for (const { chainId, address } of actors) {
      if (chainId && !SUPPORTED_CHAIN_IDS.includes(chainId)) {
        console.warn(`Skipping unsupported chainId in warmup: ${chainId}`)
        continue
      }

      warmupTasks.push(async () => {
        try {
          await fetchUserActivityFeedService({ chainId, actor: address, limit })
          log(`Warmed up user activity`, { chainId, actor: address })
        } catch (error) {
          console.warn(
            `Failed to warm up user activity ${address} on chain ${chainId}:`,
            error
          )
        }
      })
    }

    await executeConcurrently(warmupTasks, maxConcurrentConnections)

    log('Feed cache warmup complete', {
      chains: chainIds.length,
      daos: daoAddresses.length,
      actors: actors.length,
      totalTasks: warmupTasks.length,
    })
  } catch (error) {
    console.error('Feed cache warmup error:', error)
  }
}

/**
 * Get cache statistics (useful for monitoring)
 *
 * WARNING: Uses KEYS command which can be slow on large datasets.
 * Use sparingly in production or consider using SCAN instead.
 */
export async function getFeedCacheStats(): Promise<{
  totalKeys: number
  keysByScope: Record<string, number>
  memoryUsage?: string
}> {
  const redis = getRedisConnection()
  if (!redis) {
    return { totalKeys: 0, keysByScope: {} }
  }

  try {
    const scopes = ['global', 'chain', 'dao', 'user'] as const
    const keysByScope: Record<string, number> = {}

    for (const scope of scopes) {
      const prefixMap = {
        global: CACHE_CONFIG.GLOBAL_FEED_PREFIX,
        chain: CACHE_CONFIG.CHAIN_FEED_PREFIX,
        dao: CACHE_CONFIG.DAO_FEED_PREFIX,
        user: CACHE_CONFIG.USER_ACTIVITY_PREFIX,
      }

      const pattern = `${prefixMap[scope]}:*`
      const keys = await redis.keys(pattern)
      keysByScope[scope] = keys.length
    }

    const totalKeys = Object.values(keysByScope).reduce((sum, count) => sum + count, 0)

    // Try to get memory info (may not be available on all Redis setups)
    let memoryUsage: string | undefined
    try {
      const info = await redis.info('memory')
      const match = info.match(/used_memory_human:(.+)/)
      if (match) {
        memoryUsage = match[1].trim()
      }
    } catch (_) {
      // Memory info not available
    }

    return { totalKeys, keysByScope, memoryUsage }
  } catch (err) {
    console.warn('Error getting cache stats:', err)
    return { totalKeys: 0, keysByScope: {} }
  }
}
