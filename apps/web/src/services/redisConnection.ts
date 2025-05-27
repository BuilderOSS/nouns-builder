import Redis from 'ioredis'

export const getRedisConnection = (): Redis | undefined => {
  if (!process.env.REDIS_URL) return

  return new Redis(process.env.REDIS_URL)
}
