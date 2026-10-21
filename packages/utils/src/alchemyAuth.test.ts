import {
  decodeProtectedHeader,
  exportPKCS8,
  exportSPKI,
  generateKeyPair,
  importSPKI,
  jwtVerify,
} from 'jose'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  alchemyServerFetch,
  getAlchemyServerAuthHeader,
  isAlchemyServerAuthConfigured,
  resetAlchemyServerAuthCache,
} from './alchemyAuth'

let privateKeyPem: string
let publicKeyPem: string

beforeAll(async () => {
  const { privateKey, publicKey } = await generateKeyPair('RS256', { extractable: true })
  privateKeyPem = await exportPKCS8(privateKey)
  publicKeyPem = await exportSPKI(publicKey)
})

const bearer = (header: string | undefined) => header?.replace(/^Bearer /, '')

describe('alchemyAuth', () => {
  beforeEach(() => {
    resetAlchemyServerAuthCache()
    vi.stubEnv('ALCHEMY_JWT_PRIVATE_KEY', '')
    vi.stubEnv('ALCHEMY_JWT_KEY_ID', '')
    vi.stubEnv('ALCHEMY_API_KEY', '')
    vi.stubEnv('NEXT_PUBLIC_ALCHEMY_API_KEY', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('is unconfigured without credentials', async () => {
    expect(isAlchemyServerAuthConfigured()).toBe(false)
    expect(await getAlchemyServerAuthHeader()).toBeUndefined()
  })

  it('signs a short-lived RS256 jwt with the key id', async () => {
    vi.stubEnv('ALCHEMY_JWT_PRIVATE_KEY', privateKeyPem)
    vi.stubEnv('ALCHEMY_JWT_KEY_ID', 'key-123')
    vi.stubEnv('ALCHEMY_API_KEY', 'server-key')

    const token = bearer(await getAlchemyServerAuthHeader())!

    expect(decodeProtectedHeader(token)).toEqual({ alg: 'RS256', kid: 'key-123' })
    const { payload } = await jwtVerify(token, await importSPKI(publicKeyPem, 'RS256'))
    expect(payload.exp! - payload.iat!).toBe(600)
  })

  it('accepts a pem with escaped newlines', async () => {
    vi.stubEnv('ALCHEMY_JWT_PRIVATE_KEY', privateKeyPem.replace(/\n/g, '\\n'))
    vi.stubEnv('ALCHEMY_JWT_KEY_ID', 'key-123')

    const token = bearer(await getAlchemyServerAuthHeader())!

    await expect(
      jwtVerify(token, await importSPKI(publicKeyPem, 'RS256'))
    ).resolves.toBeDefined()
  })

  it('reuses the token until it nears expiry', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.stubEnv('ALCHEMY_JWT_PRIVATE_KEY', privateKeyPem)
    vi.stubEnv('ALCHEMY_JWT_KEY_ID', 'key-123')

    const [first, concurrent] = await Promise.all([
      getAlchemyServerAuthHeader(),
      getAlchemyServerAuthHeader(),
    ])
    expect(concurrent).toBe(first)

    vi.advanceTimersByTime(8 * 60 * 1000)
    expect(await getAlchemyServerAuthHeader()).toBe(first)

    vi.advanceTimersByTime(60 * 1000 + 1)
    expect(await getAlchemyServerAuthHeader()).not.toBe(first)
  })

  it('rejects pkcs#1 keys with a conversion hint', async () => {
    vi.stubEnv(
      'ALCHEMY_JWT_PRIVATE_KEY',
      '-----BEGIN RSA PRIVATE KEY-----\nabc\n-----END RSA PRIVATE KEY-----'
    )
    vi.stubEnv('ALCHEMY_JWT_KEY_ID', 'key-123')

    await expect(getAlchemyServerAuthHeader()).rejects.toThrow(/PKCS#8/)
  })

  it('falls back to the server key, then the public key', async () => {
    vi.stubEnv('NEXT_PUBLIC_ALCHEMY_API_KEY', 'public-key')
    expect(await getAlchemyServerAuthHeader()).toBe('Bearer public-key')

    vi.stubEnv('ALCHEMY_API_KEY', 'server-key')
    expect(await getAlchemyServerAuthHeader()).toBe('Bearer server-key')
  })

  it('needs both the private key and key id to use a jwt', async () => {
    vi.stubEnv('ALCHEMY_JWT_PRIVATE_KEY', privateKeyPem)
    vi.stubEnv('ALCHEMY_API_KEY', 'server-key')

    expect(await getAlchemyServerAuthHeader()).toBe('Bearer server-key')
  })

  it('adds the authorization header to requests, keeping other headers', async () => {
    vi.stubEnv('ALCHEMY_API_KEY', 'server-key')
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }))

    await alchemyServerFetch('https://eth-mainnet.g.alchemy.com/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const [url, init] = fetchMock.mock.calls[0]
    const headers = new Headers(init?.headers)
    expect(url).toBe('https://eth-mainnet.g.alchemy.com/v2')
    expect(init?.method).toBe('POST')
    expect(headers.get('authorization')).toBe('Bearer server-key')
    expect(headers.get('content-type')).toBe('application/json')
  })
})
