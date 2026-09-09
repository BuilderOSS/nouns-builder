import type { SessionOptions } from 'iron-session'
import type { Address } from 'viem'
import type { SiweMessage } from 'viem/siwe'

// Validate IRON_PASSWORD at module load time
const IRON_PASSWORD = process.env.IRON_PASSWORD

if (!IRON_PASSWORD) {
  throw new Error(
    'IRON_PASSWORD environment variable is required for session encryption. ' +
      'Generate one with: openssl rand -base64 32'
  )
}

if (IRON_PASSWORD.length < 32) {
  throw new Error(
    'IRON_PASSWORD must be at least 32 characters long for secure encryption. ' +
      'Current length: ' +
      IRON_PASSWORD.length
  )
}

export const ironOptions: SessionOptions = {
  cookieName: 'siwe',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  password: IRON_PASSWORD,
}

export interface IronSessionData {
  nonce?: string
  siwe?: SiweMessage
  eoaAddress?: Address
  safeAddress?: Address
  safeChainId?: number
}
