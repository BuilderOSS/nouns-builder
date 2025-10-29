import { CHAIN_ID, FeedResponse, FeedItem } from '@buildeross/types'
import { getFeedData } from '@buildeross/sdk/subgraph'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { getRedisConnection } from './redisConnection'
import { InvalidRequestError } from './errors'

/**
 * Supported chain IDs for feed operations
 */
const SUPPORTED_CHAIN_IDS: CHAIN_ID[] = PUBLIC_DEFAULT_CHAINS.map(chain => chain.id)

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
    const batchResults = await Promise.all(batch.map(task => task()))
    results.push(...batchResults)
  }

  return results
}

type FeedServiceParamsGlobal = {
  chainId?: CHAIN_ID
  daoAddress?: never // Cannot specify daoAddress without chainId
  cursor?: string
  limit?: number
  maxConcurrentConnections?: number
}

type FeedServiceParamsWithDAO = {
  chainId: CHAIN_ID // Required when daoAddress is specified
  daoAddress: string
  cursor?: string
  limit?: number
  maxConcurrentConnections?: number
}

type FeedServiceParams = FeedServiceParamsGlobal | FeedServiceParamsWithDAO

type InternalFeedParams = {
  chainId: CHAIN_ID
  daoAddress?: string
  cursor?: string
  limit: number
}

/**
 * Redis cache configuration for feed data
 */
const CACHE_CONFIG = {
  // Cache for 5 minutes for real-time feel but reduce API calls
  TTL_SECONDS: 5 * 60,
  // Key prefixes for different cache types
  GLOBAL_FEED_PREFIX: 'feed:global',
  DAO_FEED_PREFIX: 'feed:dao',
} as const

/**
 * Generate Redis cache key for feed data
 */
function generateCacheKey(params: InternalFeedParams): string {
  const { chainId, daoAddress, cursor, limit } = params

  if (daoAddress) {
    return `${CACHE_CONFIG.DAO_FEED_PREFIX}:${chainId}:${daoAddress.toLowerCase()}:${cursor || 'latest'}:${limit}`
  }

  return `${CACHE_CONFIG.GLOBAL_FEED_PREFIX}:${chainId}:${cursor || 'latest'}:${limit}`
}

/**
 * Internal method to fetch feed data for a specific chain/DAO with caching
 */
async function fetchFeedDataInternal(params: InternalFeedParams): Promise<FeedResponse> {
  const redis = getRedisConnection()
  const cacheKey = generateCacheKey(params)

  // Try to get from cache first
  if (redis) {
    try {
      const cachedData = await redis.get(cacheKey)
      if (cachedData) {
        const parsed = JSON.parse(cachedData) as FeedResponse
        console.log('Feed cache hit', {
          chainId: params.chainId,
          dao: params.daoAddress,
          cacheKey
        })
        return parsed
      }
    } catch (error) {
      console.warn('Redis cache read error:', error)
      // Continue with fresh fetch if cache fails
    }
  }

  // Fetch fresh data from SDK
  console.log('Feed cache miss, fetching fresh data', {
    chainId: params.chainId,
    dao: params.daoAddress,
    cacheKey
  })

  const feedData = await getFeedData({
    chainId: params.chainId,
    limit: params.limit,
    cursor: params.cursor,
    dao: params.daoAddress,
  })

  // Cache the result
  if (redis && feedData.items.length > 0) {
    try {
      await redis.setex(
        cacheKey,
        CACHE_CONFIG.TTL_SECONDS,
        JSON.stringify(feedData)
      )
      console.log('Feed data cached', {
        chainId: params.chainId,
        dao: params.daoAddress,
        itemCount: feedData.items.length,
        cacheKey
      })
    } catch (error) {
      console.warn('Redis cache write error:', error)
      // Don't fail the request if cache write fails
    }
  }

  return feedData
}

/**
 * Main feed service function that handles multiple chains and optional DAO filtering
 */
export async function fetchFeedData({
  chainId,
  daoAddress,
  cursor,
  limit = 20,
  maxConcurrentConnections = 2,
}: FeedServiceParams): Promise<FeedResponse> {
  try {
    // Runtime validation: daoAddress requires chainId
    if (daoAddress && !chainId) {
      throw new InvalidRequestError('chainId is required when daoAddress is specified')
    }

    // Validate chainId is supported
    if (chainId && !SUPPORTED_CHAIN_IDS.includes(chainId)) {
      throw new InvalidRequestError(`Unsupported chainId: ${chainId}. Supported chains: ${SUPPORTED_CHAIN_IDS.join(', ')}`)
    }

    // If chainId is specified, fetch from that specific chain
    if (chainId) {
      return await fetchFeedDataInternal({
        chainId,
        daoAddress,
        cursor,
        limit,
      })
    }

    // If no chainId specified, fetch from all supported chains and merge
    const feedTasks = SUPPORTED_CHAIN_IDS.map(chain => () =>
      fetchFeedDataInternal({
        chainId: chain,
        daoAddress,
        cursor,
        limit: Math.ceil(limit / SUPPORTED_CHAIN_IDS.length) + 5, // Fetch more per chain to ensure we have enough after merging
      }).catch(error => {
        console.error(`Failed to fetch feed for chain ${chain}:`, error)
        return { items: [], hasMore: false, nextCursor: null } as FeedResponse
      })
    )

    const allFeeds = await executeConcurrently(feedTasks, maxConcurrentConnections)

    // Merge and sort all feed items by timestamp
    const allItems: FeedItem[] = []
    allFeeds.forEach(feed => allItems.push(...feed.items))

    // Sort by timestamp descending
    allItems.sort((a, b) => b.timestamp - a.timestamp)

    // Take only the requested limit
    const limitedItems = allItems.slice(0, limit)

    // Determine if there are more items available
    const hasMore = allItems.length > limit || allFeeds.some(feed => feed.hasMore)
    const nextCursor = hasMore ? limitedItems[limitedItems.length - 1]?.timestamp.toString() : null

    return hasMore
      ? { items: limitedItems, hasMore: true, nextCursor: nextCursor! }
      : { items: limitedItems, hasMore: false, nextCursor: null }

  } catch (error) {
    console.error('Feed service error:', error)

    // Log to Sentry if available
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(error)
      sentry.flush(2000).catch(() => { })
    } catch (_) { }

    return { items: [], hasMore: false, nextCursor: null }
  }
}

/**
 * Utility function to invalidate cache for a specific DAO or chain
 * Useful when new activity is detected that should be immediately visible
 */
export async function invalidateFeedCache(params: {
  chainId?: CHAIN_ID
  daoAddress?: string
}): Promise<void> {
  const redis = getRedisConnection()
  if (!redis) return

  try {
    const patterns: string[] = []

    if (params.chainId && params.daoAddress) {
      // Invalidate specific DAO cache
      patterns.push(`${CACHE_CONFIG.DAO_FEED_PREFIX}:${params.chainId}:${params.daoAddress.toLowerCase()}:*`)
    } else if (params.chainId) {
      // Invalidate all cache for a chain
      patterns.push(`${CACHE_CONFIG.GLOBAL_FEED_PREFIX}:${params.chainId}:*`)
      patterns.push(`${CACHE_CONFIG.DAO_FEED_PREFIX}:${params.chainId}:*`)
    } else if (params.daoAddress) {
      // Invalidate cache for a DAO across all chains
      patterns.push(`${CACHE_CONFIG.DAO_FEED_PREFIX}:*:${params.daoAddress.toLowerCase()}:*`)
    }

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
        console.log(`Invalidated ${keys.length} feed cache keys for pattern: ${pattern}`)
      }
    }
  } catch (error) {
    console.warn('Feed cache invalidation error:', error)
  }
}

/**
 * Warm up cache for important DAOs/chains
 * Can be called periodically or triggered by webhooks
 */
export async function warmupFeedCache(params: {
  chainIds?: CHAIN_ID[]
  daoAddresses?: string[]
  limit?: number
  maxConcurrentConnections?: number
}): Promise<void> {
  const {
    chainIds = SUPPORTED_CHAIN_IDS,
    daoAddresses = [],
    limit = 20,
    maxConcurrentConnections = 2
  } = params

  try {
    // Validate all chainIds are supported
    const unsupportedChains = chainIds.filter(chainId => !SUPPORTED_CHAIN_IDS.includes(chainId))
    if (unsupportedChains.length > 0) {
      throw new InvalidRequestError(`Unsupported chainIds: ${unsupportedChains.join(', ')}. Supported chains: ${SUPPORTED_CHAIN_IDS.join(', ')}`)
    }

    const warmupTasks: (() => Promise<any>)[] = []

    // Warm up global feeds for each chain
    for (const chainId of chainIds) {
      warmupTasks.push(() =>
        fetchFeedDataInternal({
          chainId,
          limit,
        }).catch(error => {
          console.warn(`Failed to warm up global feed for chain ${chainId}:`, error)
        })
      )
    }

    // Warm up specific DAO feeds
    for (const chainId of chainIds) {
      for (const daoAddress of daoAddresses) {
        warmupTasks.push(() =>
          fetchFeedDataInternal({
            chainId,
            daoAddress,
            limit,
          }).catch(error => {
            console.warn(`Failed to warm up DAO feed for ${daoAddress} on chain ${chainId}:`, error)
          })
        )
      }
    }

    await executeConcurrently(warmupTasks, maxConcurrentConnections)
    console.log(`Successfully warmed up feed cache for ${chainIds.length} chains and ${daoAddresses.length} DAOs`)

  } catch (error) {
    console.error('Feed cache warmup error:', error)
  }
}
