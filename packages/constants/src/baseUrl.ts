if (!process.env.BASE_URL) {
  throw new Error('BASE_URL environment variable is not set')
}
export const BASE_URL = process.env.BASE_URL
