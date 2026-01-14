import { PUBLIC_IS_TESTNET } from '@buildeross/constants/chains'
import { myDaosRequest } from '@buildeross/sdk/subgraph'
import { AddressType } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { NotFoundError } from 'src/services/errors'
import { getRedisConnection } from 'src/services/redisConnection'
import { withCors } from 'src/utils/api/cors'
import { isAddress, keccak256 } from 'viem'

/**
 * Redis cache configuration
 */
const CACHE_CONFIG = {
  MY_DAOS_TTL: 300, // 5 minutes for user DAOs data
  MY_DAOS_PREFIX: PUBLIC_IS_TESTNET ? 'testnet:mydaos:user' : 'mydaos:user',
} as const

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
 * Generate cache key for user DAOs
 */
function generateCacheKey(address: AddressType): string {
  const hash = keccak256(address).slice(0, 18)
  return `${CACHE_CONFIG.MY_DAOS_PREFIX}:${hash}`
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const startTime = Date.now()
  const { user } = req.query

  // Validate address parameter
  if (!user || typeof user !== 'string') {
    return res.status(400).json({ error: 'User parameter is required' })
  }

  if (!isAddress(user, { strict: false })) {
    return res.status(400).json({ error: 'Invalid address format' })
  }

  const address = user.toLowerCase() as AddressType
  const redis = getRedisConnection()
  const cacheKey = generateCacheKey(address)
  const lockKey = `${cacheKey}:lock`
  let lockAcquired = false

  try {
    // Try to get from cache
    if (redis) {
      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          log('MyDAOs cache hit', { address, duration: Date.now() - startTime })

          // Set cache headers
          const ttl = CACHE_CONFIG.MY_DAOS_TTL
          res.setHeader(
            'Cache-Control',
            `public, max-age=${ttl}, stale-while-revalidate=${Math.floor(ttl * 0.5)}`
          )

          return res.status(200).json(JSON.parse(cached))
        }
      } catch (err) {
        console.warn('Redis cache read error:', err)
      }

      // Cache miss - try to acquire lock to prevent thundering herd
      try {
        lockAcquired = (await redis.set(lockKey, '1', 'EX', 30, 'NX')) === 'OK'
      } catch (err) {
        console.warn('Redis lock error:', err)
      }

      if (!lockAcquired) {
        // Another request is fetching, wait briefly and retry cache
        log('Waiting for lock', { address })
        await new Promise((resolve) => setTimeout(resolve, 300))

        try {
          const cached = await redis.get(cacheKey)
          if (cached) {
            log('MyDAOs cache hit after wait', {
              address,
              duration: Date.now() - startTime,
            })

            // Set cache headers
            const ttl = CACHE_CONFIG.MY_DAOS_TTL
            res.setHeader(
              'Cache-Control',
              `public, max-age=${ttl}, stale-while-revalidate=${Math.floor(ttl * 0.5)}`
            )

            return res.status(200).json(JSON.parse(cached))
          }
        } catch (err) {
          console.warn('Redis cache retry error:', err)
        }
      }
    }

    // Fetch fresh data
    log('MyDAOs cache miss, fetching', { address })
    const daos = await myDaosRequest(address)

    // Store in cache
    if (redis) {
      try {
        await redis.setex(cacheKey, CACHE_CONFIG.MY_DAOS_TTL, JSON.stringify(daos))
        log('MyDAOs cached', { address, count: daos.length })
      } catch (err) {
        console.warn('Redis cache write error:', err)
      }
    }

    // Set cache headers
    const ttl = CACHE_CONFIG.MY_DAOS_TTL
    res.setHeader(
      'Cache-Control',
      `public, max-age=${ttl}, stale-while-revalidate=${Math.floor(ttl * 0.5)}`
    )

    // Log request (development only)
    const duration = Date.now() - startTime
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('MyDAOs API success', {
        address,
        daoCount: daos.length,
        duration,
      })
    }

    return res.status(200).json(daos)
  } catch (e) {
    const duration = Date.now() - startTime
    console.error('MyDAOs API error:', {
      method: req.method,
      query: req.query,
      duration,
      error: e,
    })

    // Log to Sentry if available
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      await sentry.flush(2000)
    } catch (_) {}

    if (e instanceof NotFoundError) {
      return res.status(404).json({ error: 'daos not found' })
    }

    return res.status(500).json({
      error: e instanceof Error ? e.message : 'Internal server error',
    })
  } finally {
    // Release lock if acquired
    if (redis && lockAcquired) {
      try {
        await redis.del(lockKey)
      } catch (err) {
        console.warn('Redis lock release error:', err)
      }
    }
  }
}

export default withCors()(handler)
