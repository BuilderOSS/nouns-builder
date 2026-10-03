import type { NextApiRequest, NextApiResponse } from 'next'

function isSameOrigin(req: NextApiRequest) {
  const origin = req.headers.origin
  const host = req.headers.host

  if (typeof origin !== 'string' || !host) return false

  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/**
 * Reject cross-origin browser requests before they can use a cookie-backed capability.
 */
export function withSameOrigin<T extends (...args: any[]) => any>(handler: T): T {
  return (async (req: NextApiRequest, res: NextApiResponse, ...args: unknown[]) => {
    if (!isSameOrigin(req)) {
      return res.status(403).json({ error: 'Cross-origin requests are not allowed' })
    }

    return handler(req, res, ...args)
  }) as T
}
