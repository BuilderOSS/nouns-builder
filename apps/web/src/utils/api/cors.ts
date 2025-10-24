import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH'

function originAllowed(origin: string, allowedOrigins: string[]) {
  return allowedOrigins.some((allowed) => {
    if (allowed === '*') return true
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2)
      try {
        const { hostname } = new URL(origin)
        return hostname === domain || hostname.endsWith(`.${domain}`)
      } catch {
        return false
      }
    }
    return origin.toLowerCase() === allowed.toLowerCase()
  })
}

interface WithCorsOptions {
  allowedMethods?: Method[]
  allowedOrigins?: string[] // optional whitelist
  allowCredentials?: boolean
}

export const withCors = ({
  allowedMethods = ['GET'],
  allowedOrigins = ['*'],
  allowCredentials = false,
}: WithCorsOptions = {}) => {
  return <T extends NextApiHandler>(handler: T): T => {
    return (async (req: NextApiRequest, res: NextApiResponse) => {
      // --- Determine allowed origin ---
      const origin = req.headers.origin

      if (!origin) return handler(req, res)

      let allowOrigin = '*'

      // --- Determine allowed origin safely ---
      const allowAnyOrigin = allowedOrigins.includes('*')

      if (!allowAnyOrigin) {
        if (originAllowed(origin, allowedOrigins)) {
          allowOrigin = origin
        } else {
          res.status(403).json({ error: 'CORS: Origin not allowed' })
          return
        }
      }

      if (allowCredentials && allowOrigin === '*') {
        console.warn('CORS misconfiguration: cannot use "*" with credentials')
        res
          .status(500)
          .json({ error: 'CORS misconfiguration: credentials + * not allowed' })
        return
      }

      // --- Set base CORS headers ---
      if (allowOrigin) {
        res.setHeader('Access-Control-Allow-Origin', allowOrigin)
      }

      // Preserve existing Vary header values and add Origin if not present
      const existingVary = res.getHeader('Vary')
      const varyValues = new Set<string>()

      if (existingVary) {
        if (typeof existingVary === 'string') {
          existingVary.split(',').forEach((v) => varyValues.add(v.trim()))
        } else if (Array.isArray(existingVary)) {
          existingVary.forEach((v) => {
            if (typeof v === 'string') {
              v.split(',').forEach((val) => varyValues.add(val.trim()))
            }
          })
        }
      }

      varyValues.add('Origin')
      res.setHeader('Vary', Array.from(varyValues).join(', '))

      if (allowCredentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true')
      }

      // Auto-allow HEAD when GET is allowed
      const methodsWithHead = allowedMethods.includes('GET')
        ? [...allowedMethods, 'HEAD']
        : allowedMethods

      const allAllowedMethods = [...new Set([...methodsWithHead, 'OPTIONS'])]

      res.setHeader('Access-Control-Allow-Methods', allAllowedMethods.join(', '))

      // Allow dynamic headers from preflight requests
      const requestHeaders = req.headers['access-control-request-headers']
      if (Array.isArray(requestHeaders)) {
        res.setHeader('Access-Control-Allow-Headers', requestHeaders.join(', '))
      } else if (typeof requestHeaders === 'string') {
        res.setHeader('Access-Control-Allow-Headers', requestHeaders)
      } else {
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, X-Requested-With, Accept, Accept-Language'
        )
      }

      // --- Handle preflight requests ---
      if (req.method === 'OPTIONS') {
        res.setHeader('Cache-Control', 'public, max-age=600') // 10 minutes
        res.setHeader('Access-Control-Max-Age', '600') // 10 minutes
        res.setHeader('Content-Length', '0')
        // 204 = No Content (better for preflight)
        res.status(204).end()
        return
      }

      // --- Reject disallowed methods ---
      if (
        !req.method ||
        !allAllowedMethods.includes(req.method.toUpperCase() as Method)
      ) {
        res.setHeader('Allow', allAllowedMethods.join(', '))
        res.status(405).end(`Method ${req.method} Not Allowed`)
        return
      }

      // --- Continue to actual handler ---
      return handler(req, res)
    }) as T
  }
}
