import type { SessionOptions } from 'iron-session'
import type { SiweMessage } from 'viem/siwe'

export const ironOptions: SessionOptions = {
  cookieName: 'siwe',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
  password: process.env.IRON_PASSWORD as string,
}

export interface IronSessionData {
  nonce?: string
  siwe?: SiweMessage
}
