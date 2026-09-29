import type { AddressType } from '@buildeross/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchDashboardDataService, getDashboardTtl } from 'src/services/dashboardService'
import { type AuthContext, withAuth } from 'src/utils/api/authMiddleware'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { isAddress } from 'viem'

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  authContext: AuthContext
) {
  const startTime = Date.now()

  // Validate address parameter
  const { address } = req.query

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Address parameter is required' })
  }

  if (!isAddress(address, { strict: false })) {
    return res.status(400).json({ error: 'Invalid address format' })
  }

  // Verify the authenticated user is requesting their own dashboard
  // Use effectiveAddress (Safe if in Safe mode, else EOA)
  if (address.toLowerCase() !== authContext.effectiveAddress.toLowerCase()) {
    return res
      .status(403)
      .json({ error: 'Forbidden: You can only access your own dashboard' })
  }

  try {
    // Fetch dashboard data with caching
    const data = await fetchDashboardDataService(address.toLowerCase() as AddressType)

    // Determine TTL
    const ttl = getDashboardTtl()

    // Set cache headers
    res.setHeader(
      'Cache-Control',
      `public, max-age=${ttl}, stale-while-revalidate=${Math.floor(ttl * 0.5)}`
    )

    // Log request (development only)
    const duration = Date.now() - startTime
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('Dashboard API success', {
        address,
        daoCount: data.length,
        duration,
      })
    }

    return res.status(200).json({ data })
  } catch (err) {
    const duration = Date.now() - startTime
    console.error('Dashboard API error:', {
      method: req.method,
      query: req.query,
      duration,
      error: err,
    })

    // Log to Sentry if available
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(err)
      await sentry.flush(2000)
    } catch (_) {}

    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal server error',
    })
  }
}

export default withCors()(
  withRateLimit({
    maxRequests: 60,
    windowSeconds: 60,
    keyPrefix: 'dashboard',
  })(withAuth(handler))
)
