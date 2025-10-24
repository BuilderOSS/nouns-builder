import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'

interface RateLimitOptions {
  /**
   * Maximum number of requests allowed within the time window
   * @default 30
   */
  maxRequests?: number

  /**
   * Time window in seconds
   * @default 300 (5 minutes)
   */
  windowSeconds?: number

  /**
   * Custom key prefix for this specific endpoint
   * @default "api"
   */
  keyPrefix?: string
}

/**
 * Creates a rate limiting wrapper for API endpoints
 * Uses Redis to track request counts per IP address
 */
export const withRateLimit = ({
  maxRequests = 30,
  windowSeconds = 300, // 5 minutes
  keyPrefix = 'api',
}: RateLimitOptions = {}) => {
  return <T extends NextApiHandler>(handler: T): T => {
    return (async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const redisConnection = getRedisConnection()

        // Skip rate limiting if Redis is not available
        if (!redisConnection) {
          console.warn('Rate limiting skipped: Redis connection not available')
          return handler(req, res)
        }

        // Derive client IP safely
        const xff = req.headers['x-forwarded-for'] ?? req.headers['x-real-ip']
        const rawIp = Array.isArray(xff)
          ? xff[0]
          : typeof xff === 'string'
            ? xff.split(',')[0]?.trim()
            : (req.socket.remoteAddress ?? 'unknown')
        const clientIp = rawIp || 'unknown'

        // Create rate limit key scoped by route (path only) + IP
        const route = req.url?.split('?')[0] ?? ''
        const rateLimitKey = `${keyPrefix}:ratelimit:${route}:${clientIp}`

        // Increment request count
        const requests = await redisConnection.incr(rateLimitKey)

        // Ensure key has expiry (handles first-request races)
        if (requests === 1) {
          await redisConnection.expire(rateLimitKey, windowSeconds)
        } else {
          const ttl = await redisConnection.ttl(rateLimitKey)
          if (ttl === -1) {
            await redisConnection.expire(rateLimitKey, windowSeconds)
          }
        }

        // Check if rate limit exceeded
        if (requests > maxRequests) {
          res.setHeader('Retry-After', windowSeconds.toString())
          res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter: windowSeconds,
            limit: maxRequests,
            windowSeconds,
          })
          return
        }

        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests.toString())
        res.setHeader(
          'X-RateLimit-Remaining',
          Math.max(0, maxRequests - requests).toString()
        )
        const resetAt = Math.floor(Date.now() / 1000) + windowSeconds
        res.setHeader('X-RateLimit-Reset', resetAt.toString())

        // Continue to actual handler
        return handler(req, res)
      } catch (error) {
        console.error('Rate limiting error:', error)
        // On rate limiting errors, continue without blocking (fail open)
        return handler(req, res)
      }
    }) as T
  }
}
