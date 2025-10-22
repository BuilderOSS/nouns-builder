import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'

interface RateLimitOptions {
  /**
   * Maximum number of requests allowed within the time window
   * @default 20
   */
  maxRequests?: number

  /**
   * Time window in seconds
   * @default 3600 (1 hour)
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
  maxRequests = 20,
  windowSeconds = 3600, // 1 hour
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

        // Get client IP from x-forwarded-for header or fallback to 'unknown'
        const clientIp = (req.headers['x-forwarded-for'] as string) || 'unknown'

        // Create rate limit key with endpoint-specific prefix
        const rateLimitKey = `${keyPrefix}:ratelimit:${clientIp}`

        // Increment request count
        const requests = await redisConnection.incr(rateLimitKey)

        // Set expiry on first request
        if (requests === 1) {
          await redisConnection.expire(rateLimitKey, windowSeconds)
        }

        // Check if rate limit exceeded
        if (requests > maxRequests) {
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
        res.setHeader('X-RateLimit-Reset', (Date.now() + windowSeconds * 1000).toString())

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
