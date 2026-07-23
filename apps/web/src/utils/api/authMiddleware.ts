import { getIronSession } from 'iron-session'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ironOptions, type IronSessionData } from 'src/utils/iron'
import type { SiweMessage } from 'viem/siwe'

export type AuthenticatedNextApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  session: SiweMessage
) => Promise<any> | any

/**
 * Middleware to require authentication on API routes
 * Usage:
 * export default withAuth(async (req, res, session) => {
 *   // session.address is guaranteed to exist here
 *   res.json({ address: session.address })
 * })
 */
export function withAuth(handler: AuthenticatedNextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getIronSession<IronSessionData>(req, res, ironOptions)
      const siweSession = session.siwe

      if (!siweSession || !siweSession.address) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be signed in with Ethereum to access this resource',
        })
      }

      return handler(req, res, siweSession)
    } catch (error) {
      console.error('Error in auth middleware:', error)
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred while checking authentication',
      })
    }
  }
}

/**
 * Helper to get the current session in an API route without requiring authentication
 * Returns null if not authenticated
 */
export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getIronSession<IronSessionData>(req, res, ironOptions)
    return session.siwe || null
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}
