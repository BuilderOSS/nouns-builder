export const getBaseUrl = () => {
  const env = process.env.VERCEL_ENV ?? 'development'
  const protocol = env === 'development' ? 'http' : 'https'
  const url = process.env.VERCEL_URL ?? 'localhost:3000'
  if (env === 'production') {
    const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? url
    return `${protocol}://${productionUrl}`
  }
  return `${protocol}://${url}`
}
