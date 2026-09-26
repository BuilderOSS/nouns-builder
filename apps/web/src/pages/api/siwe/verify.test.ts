import type { NextApiRequest, NextApiResponse } from 'next'
import { createSiweMessage } from 'viem/siwe'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getIronSessionMock, isOwnerOfSafeMock, verifyMessageMock } = vi.hoisted(() => {
  process.env.IRON_PASSWORD = 'test-password-at-least-32-characters-long-for-testing'

  return {
    getIronSessionMock: vi.fn(),
    isOwnerOfSafeMock: vi.fn(),
    verifyMessageMock: vi.fn(),
  }
})

vi.mock('iron-session', () => ({ getIronSession: getIronSessionMock }))

vi.mock('@buildeross/utils/provider', () => ({
  getProvider: () => ({ verifyMessage: verifyMessageMock }),
}))

vi.mock('@buildeross/utils/safeService', () => ({ isOwnerOfSafe: isOwnerOfSafeMock }))

vi.mock('src/services/redisConnection', () => ({ getRedisConnection: () => undefined }))

import verifyHandler from './verify'

type ApiResponse = NextApiResponse & { body?: unknown; statusCode?: number }

const ownerAddress = '0x000000000000000000000000000000000000c0DE'
const safeAddress = '0x0000000000000000000000000000000000005aFe'

function createRequest(): NextApiRequest {
  const message = createSiweMessage({
    domain: 'builder.test',
    address: ownerAddress,
    uri: 'https://builder.test',
    version: '1',
    chainId: 1,
    nonce: '12345678',
  })

  return {
    body: {
      message,
      signature: `0x${'11'.repeat(65)}`,
      safeAddress,
      safeChainId: 1,
    },
    headers: {},
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
    const session = { nonce: '12345678', save: vi.fn() }
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
    const session = { nonce: '12345678', save: vi.fn() }
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
})
