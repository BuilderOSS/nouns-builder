import { getIronSession } from 'iron-session'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ironOptions, type IronSessionData } from 'src/utils/iron'
import type { Address } from 'viem'
import type { SiweMessage } from 'viem/siwe'

/**
 * Authentication context that includes both EOA and Safe information
 */
export interface AuthContext {
  eoaAddress: Address // EOA that signed the SIWE message
  safeAddress?: Address // Safe address (if in Safe mode)
  safeChainId?: number // Chain ID of the Safe
  effectiveAddress: Address // Address acting on behalf of (Safe if present, else EOA)
  isSafeMode: boolean // True if user is acting as Safe owner
  siwe: SiweMessage // Original SIWE message
}

/**
 * Build AuthContext from session data
 */
export function getAuthContext(session: IronSessionData): AuthContext {
  const eoaAddress = session.siwe?.address as Address
  const safeAddress = session.safeAddress
  const safeChainId = session.safeChainId
  const isSafeMode = !!safeAddress

  return {
    eoaAddress,
    safeAddress,
    safeChainId,
    effectiveAddress: safeAddress || eoaAddress,
    isSafeMode,
    siwe: session.siwe!,
  }
}

/**
 * Get the effective address (Safe if in Safe mode, otherwise EOA)
 */
export function getEffectiveAddress(session: IronSessionData): Address {
  return session.safeAddress || (session.siwe?.address as Address)
}

export type AuthenticatedNextApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  authContext: AuthContext
) => Promise<any> | any

/**
 * Middleware to require authentication on API routes
 * Usage:
 * export default withAuth(async (req, res, authContext) => {
 *   // authContext.eoaAddress - EOA that signed
 *   // authContext.effectiveAddress - Safe (if Safe mode) or EOA
 *   // authContext.isSafeMode - true if acting as Safe owner
 *   res.json({ address: authContext.effectiveAddress })
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

      const authContext = getAuthContext(session)
      return handler(req, res, authContext)
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
 * Get the current session without requiring authentication
 * Returns the session data or null if not authenticated
 */
export async function getSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<IronSessionData | null> {
  try {
    const session = await getIronSession<IronSessionData>(req, res, ironOptions)
    if (!session.siwe?.address) return null
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

/**
 * Helper to get the current auth context in an API route without requiring authentication
 * Returns null if not authenticated
 */
export async function getAuthContextFromRequest(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthContext | null> {
  try {
    const session = await getIronSession<IronSessionData>(req, res, ironOptions)
    if (!session.siwe?.address) return null
    return getAuthContext(session)
  } catch (error) {
    console.error('Error getting auth context:', error)
    return null
  }
}
