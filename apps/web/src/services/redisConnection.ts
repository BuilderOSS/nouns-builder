import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL

export const getRedisConnection = (): Redis | undefined => {
  if (!REDIS_URL) return

  return new Redis(REDIS_URL)
}
