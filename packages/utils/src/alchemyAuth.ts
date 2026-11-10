/**
 * Server-side Alchemy auth.
 *
 * The public `NEXT_PUBLIC_ALCHEMY_API_KEY` is locked to our domains with an
 * allowlist, which server requests (no Origin header) can't pass. Server code
 * instead calls keyless Alchemy URLs with an `Authorization: Bearer` header,
 * carrying (in order of preference):
 *
 * 1. a short-lived JWT signed with `ALCHEMY_JWT_PRIVATE_KEY` (PKCS#8 PEM) under
 *    `ALCHEMY_JWT_KEY_ID` — the key ID Alchemy shows after importing the public key
 * 2. the server-only `ALCHEMY_API_KEY`
 * 3. the public `NEXT_PUBLIC_ALCHEMY_API_KEY` (local dev, where it is unrestricted)
 *
 * See https://www.alchemy.com/docs/how-to-use-jwts-for-api-requests
 */

import type { KeyLike } from 'jose'

const JWT_ALGORITHM = 'RS256'
const JWT_TTL_SECONDS = 10 * 60
/** Re-sign once the cached token has less than this left. */
const JWT_REFRESH_MARGIN_SECONDS = 60

type CachedJwt = { token: string; expiresAt: number }

let cachedJwt: CachedJwt | undefined
let pendingJwt: Promise<CachedJwt> | undefined
let cachedKey: { pem: string; key: Promise<KeyLike> } | undefined

// Hosts often store multi-line PEMs with escaped newlines
const normalizePem = (pem: string) => pem.trim().replace(/\\n/g, '\n')

const getJwtConfig = () => {
  const privateKey = process.env.ALCHEMY_JWT_PRIVATE_KEY
  const keyId = process.env.ALCHEMY_JWT_KEY_ID
  if (!privateKey || !keyId) return undefined
  return { privateKey: normalizePem(privateKey), keyId }
}

const getApiKey = () =>
  process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || undefined

export const isAlchemyServerAuthConfigured = (): boolean =>
  !!getJwtConfig() || !!getApiKey()

const importPrivateKey = (pem: string): Promise<KeyLike> => {
  if (cachedKey?.pem === pem) return cachedKey.key
  if (pem.includes('BEGIN RSA PRIVATE KEY')) {
    throw new Error(
      'ALCHEMY_JWT_PRIVATE_KEY must be a PKCS#8 PEM ("BEGIN PRIVATE KEY"); convert it with `openssl pkcs8 -topk8 -nocrypt -in private_key.pem`'
    )
  }
  // Loaded lazily so browser bundles never pull in jose
  const key = import('jose').then(({ importPKCS8 }) => importPKCS8(pem, JWT_ALGORITHM))
  // Don't cache a key that failed to import
  key.catch(() => {
    if (cachedKey?.key === key) cachedKey = undefined
  })
  cachedKey = { pem, key }
  return key
}

const signJwt = async (privateKey: string, keyId: string): Promise<CachedJwt> => {
  const { SignJWT } = await import('jose')
  const key = await importPrivateKey(privateKey)
  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresAt = issuedAt + JWT_TTL_SECONDS
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: JWT_ALGORITHM, kid: keyId })
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .sign(key)
  return { token, expiresAt }
}

const getJwt = async (privateKey: string, keyId: string): Promise<string> => {
  const now = Math.floor(Date.now() / 1000)
  if (cachedJwt && cachedJwt.expiresAt - now > JWT_REFRESH_MARGIN_SECONDS) {
    return cachedJwt.token
  }
  // Share one signing call between concurrent requests
  if (!pendingJwt) {
    pendingJwt = signJwt(privateKey, keyId)
      .then((jwt) => {
        cachedJwt = jwt
        return jwt
      })
      .finally(() => {
        pendingJwt = undefined
      })
  }
  return (await pendingJwt).token
}

/**
 * The `Authorization` header value for server-side Alchemy requests, or
 * undefined when no server credentials are configured.
 */
export const getAlchemyServerAuthHeader = async (): Promise<string | undefined> => {
  const jwtConfig = getJwtConfig()
  if (jwtConfig) {
    return `Bearer ${await getJwt(jwtConfig.privateKey, jwtConfig.keyId)}`
  }
  const apiKey = getApiKey()
  return apiKey ? `Bearer ${apiKey}` : undefined
}

/** `fetch` that adds the server-side Alchemy `Authorization` header. */
export const alchemyServerFetch = async (
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> => {
  const auth = await getAlchemyServerAuthHeader()
  if (!auth) return fetch(input, init)
  const headers = new Headers(init?.headers)
  headers.set('Authorization', auth)
  return fetch(input, { ...init, headers })
}

/** Test-only: drop the cached key and token. */
export const resetAlchemyServerAuthCache = () => {
  cachedJwt = undefined
  pendingJwt = undefined
  cachedKey = undefined
}
