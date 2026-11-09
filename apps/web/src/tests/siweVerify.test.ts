import type { NextApiRequest, NextApiResponse } from 'next'
import { createSiweMessage } from 'viem/siwe'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getIronSessionMock, isOwnerOfSafeMock, verifyMessageMock, SafeServiceError } =
  vi.hoisted(() => {
    process.env.IRON_PASSWORD = 'test-password-at-least-32-characters-long-for-testing'

    class SafeServiceError extends Error {}

    return {
      getIronSessionMock: vi.fn(),
      isOwnerOfSafeMock: vi.fn(),
      verifyMessageMock: vi.fn(),
      SafeServiceError,
    }
  })

vi.mock('iron-session', () => ({ getIronSession: getIronSessionMock }))

vi.mock('@buildeross/utils/provider', () => ({
  getProvider: () => ({ verifyMessage: verifyMessageMock }),
}))

vi.mock('@buildeross/utils/safeService', () => ({
  isOwnerOfSafe: isOwnerOfSafeMock,
  isSafeServiceError: (error: unknown) => error instanceof SafeServiceError,
}))

vi.mock('src/services/redisConnection', () => ({ getRedisConnection: () => undefined }))

import verifyHandler from '../pages/api/siwe/verify'
import { SIWE_NONCE_TTL_MS } from '../utils/siweAuthFlow'

type ApiResponse = NextApiResponse & { body?: unknown; statusCode?: number }

const ownerAddress = '0x000000000000000000000000000000000000c0DE'
const safeAddress = '0x0000000000000000000000000000000000005aFe'

function createRequest(
  overrides: Partial<Parameters<typeof createSiweMessage>[0]> = {}
): NextApiRequest {
  const message = createSiweMessage({
    domain: 'builder.test',
    address: ownerAddress,
    uri: 'https://builder.test',
    version: '1',
    chainId: 1,
    nonce: '12345678',
    ...overrides,
  })

  return {
    body: {
      message,
      signature: `0x${'11'.repeat(65)}`,
      safeAddress,
      safeChainId: 1,
    },
    headers: { host: 'builder.test', origin: 'https://builder.test' },
    method: 'POST',
    socket: { remoteAddress: '203.0.113.10' },
    url: '/api/siwe/verify',
  } as unknown as NextApiRequest
}

function createResponse(): ApiResponse {
  const response = {
    setHeader: vi.fn(),
    status(code: number) {
      response.statusCode = code
      return response
    },
    json(body: unknown) {
      response.body = body
      return response
    },
    end: vi.fn(),
  } as unknown as ApiResponse
  return response
}

describe('POST /api/siwe/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyMessageMock.mockResolvedValue(true)
    isOwnerOfSafeMock.mockResolvedValue(true)
  })

  it('verifies an EIP-1271 owner signature before authorizing it for a Safe', async () => {
    const session = { nonce: '12345678', nonceIssuedAt: Date.now(), save: vi.fn() }
    getIronSessionMock.mockResolvedValue(session)
    const request = createRequest()
    const response = createResponse()

    await verifyHandler(request, response)

    expect(verifyMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ address: ownerAddress })
    )
    expect(isOwnerOfSafeMock).toHaveBeenCalledWith(ownerAddress, safeAddress, 1)
    expect(session).toMatchObject({
      ownerAddress,
      safeAddress,
      safeChainId: 1,
    })
    expect(session.save).toHaveBeenCalledOnce()
    expect(response.body).toEqual({ ok: true })
  })

  it('rejects an otherwise valid contract-wallet signature when it is not a Safe owner', async () => {
    const session = { nonce: '12345678', nonceIssuedAt: Date.now(), save: vi.fn() }
    getIronSessionMock.mockResolvedValue(session)
    isOwnerOfSafeMock.mockResolvedValue(false)
    const response = createResponse()

    await verifyHandler(createRequest(), response)

    expect(verifyMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ address: ownerAddress })
    )
    expect(session.save).not.toHaveBeenCalled()
    expect(response.statusCode).toBe(403)
  })

  it('rejects a message signed for another domain', async () => {
    const session = { nonce: '12345678', nonceIssuedAt: Date.now(), save: vi.fn() }
    getIronSessionMock.mockResolvedValue(session)
    const response = createResponse()

    await verifyHandler(createRequest({ domain: 'evil.test' }), response)

    expect(response.statusCode).toBe(400)
    expect(session.save).not.toHaveBeenCalled()
  })

  it('rejects a message whose URI points at another site', async () => {
    const session = { nonce: '12345678', nonceIssuedAt: Date.now(), save: vi.fn() }
    getIronSessionMock.mockResolvedValue(session)
    const response = createResponse()

    await verifyHandler(createRequest({ uri: 'https://evil.test/login' }), response)

    expect(response.statusCode).toBe(400)
    expect(session.save).not.toHaveBeenCalled()
  })

  it('rejects a message past its expiration time', async () => {
    const session = { nonce: '12345678', nonceIssuedAt: Date.now(), save: vi.fn() }
    getIronSessionMock.mockResolvedValue(session)
    const response = createResponse()

    await verifyHandler(
      createRequest({ expirationTime: new Date(Date.now() - 1000) }),
      response
    )

    expect(response.statusCode).toBe(400)
    expect(session.save).not.toHaveBeenCalled()
  })

  it('rejects a nonce issued too long ago, or without an issue time', async () => {
    for (const nonceIssuedAt of [Date.now() - SIWE_NONCE_TTL_MS - 1000, undefined]) {
      const session = { nonce: '12345678', nonceIssuedAt, save: vi.fn() }
      getIronSessionMock.mockResolvedValue(session)
      const response = createResponse()

      await verifyHandler(createRequest(), response)

      expect(response.statusCode).toBe(422)
      expect(session.save).not.toHaveBeenCalled()
    }
  })

  it('reports a Safe service outage as unavailable, not as a non-owner', async () => {
    const session = { nonce: '12345678', nonceIssuedAt: Date.now(), save: vi.fn() }
    getIronSessionMock.mockResolvedValue(session)
    isOwnerOfSafeMock.mockRejectedValue(new SafeServiceError('429'))
    const response = createResponse()

    await verifyHandler(createRequest(), response)

    expect(response.statusCode).toBe(503)
    expect(session.save).not.toHaveBeenCalled()
  })
})
