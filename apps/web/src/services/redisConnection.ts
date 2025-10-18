import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL

let cachedConnection: Redis | undefined

export const getRedisConnection = (): Redis | undefined => {
  if (!REDIS_URL) return

  if (cachedConnection) {
    return cachedConnection
  }

  cachedConnection = new Redis(REDIS_URL)
  return cachedConnection
}
