import type { Address } from 'viem'
import { createSiweMessage } from 'viem/siwe'

/**
 * Build the SIWE sign-in message for this site. Shared by the wallet dialog
 * and the RainbowKit adapter so both produce the same message.
 *
 * Expiry is enforced on the server from when the nonce was issued (see
 * SIWE_NONCE_TTL_MS), not via expirationTime, so a wrong device clock can't
 * make every sign-in fail.
 */
export function createSignInMessage({
  address,
  chainId,
  nonce,
  safeAddress,
}: {
  address: Address
  chainId: number
  nonce: string
  safeAddress?: Address
}): string {
  return createSiweMessage({
    domain: window.location.host,
    address,
    statement: safeAddress
      ? `Sign in as owner of Safe ${safeAddress}`
      : 'Sign in with Ethereum to Nouns Builder',
    uri: window.location.origin,
    version: '1',
    chainId,
    nonce,
  })
}
