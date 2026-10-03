import type { NextApiRequest, NextApiResponse } from 'next'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getIronSessionMock, fetchMock } = vi.hoisted(() => {
  process.env.IRON_PASSWORD = 'test-password-at-least-32-characters-long-for-testing'
  process.env.UNISWAP_API_KEY = 'test-uniswap-key'
  process.env.SAFE_API_KEY = 'test-safe-key'

  return {
    getIronSessionMock: vi.fn(),
    fetchMock: vi.fn(),
  }
})

vi.mock('iron-session', () => ({ getIronSession: getIronSessionMock }))
vi.mock('src/services/redisConnection', () => ({ getRedisConnection: () => undefined }))
vi.stubGlobal('fetch', fetchMock)

import safeProposeHandler from '../pages/api/safe/propose'
import uniswapSwapHandler from '../pages/api/uniswap/swap'

type ApiResponse = NextApiResponse & { body?: unknown; statusCode?: number }

const ownerAddress = '0x000000000000000000000000000000000000c0DE'
const safeAddress = '0x0000000000000000000000000000000000005aFe'
const tokenIn = '0x0000000000000000000000000000000000000001'
const tokenOut = '0x0000000000000000000000000000000000000002'

function createResponse() {
  const response = {
    getHeader: vi.fn(),
    setHeader: vi.fn(),
    status(code: number) {
      response.statusCode = code
      return response
    },
    json(body: unknown) {
      response.body = body
      return response
    },
  } as unknown as ApiResponse
  return response
}

function createRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
) {
  return {
    body,
    headers,
    method: 'POST',
    socket: { remoteAddress: '203.0.113.10' },
    url: '/api/test',
  } as unknown as NextApiRequest
}

describe('privileged API route protections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects an anonymous Uniswap transaction request', async () => {
    getIronSessionMock.mockResolvedValue({})
    const response = createResponse()

    await uniswapSwapHandler(
      createRequest({
        chainId: 1,
        tokenIn,
        tokenOut,
        amount: '1',
        sender: safeAddress,
      }),
      response
    )

    expect(response.statusCode).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a cross-origin Uniswap transaction request after authentication', async () => {
    getIronSessionMock.mockResolvedValue({ siwe: { address: ownerAddress } })
    const response = createResponse()

    await uniswapSwapHandler(
      createRequest(
        { chainId: 1, tokenIn, tokenOut, amount: '1', sender: safeAddress },
        { host: 'nouns.build', origin: 'https://attacker.example' }
      ),
      response
    )

    expect(response.statusCode).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects invalid Uniswap parameters before contacting the upstream API', async () => {
    getIronSessionMock.mockResolvedValue({ siwe: { address: ownerAddress } })
    const response = createResponse()

    await uniswapSwapHandler(
      createRequest(
        { chainId: 1, tokenIn, tokenOut, amount: '0', sender: safeAddress },
        { host: 'nouns.build', origin: 'https://nouns.build' }
      ),
      response
    )

    expect(response.statusCode).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('allows an authenticated same-origin Uniswap request', async () => {
    getIronSessionMock.mockResolvedValue({ siwe: { address: ownerAddress } })
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routing: 'CLASSIC',
          quote: {
            input: { amount: '1000000000000000000' },
            output: { amount: '2000000', minimumAmount: '1900000' },
          },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ swap: {} }) })
    const response = createResponse()

    await uniswapSwapHandler(
      createRequest(
        { chainId: 1, tokenIn, tokenOut, amount: '1', sender: safeAddress },
        { host: 'nouns.build', origin: 'https://nouns.build' }
      ),
      response
    )

    expect(response.statusCode).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('rejects a Safe proposal when the authenticated Safe does not match', async () => {
    getIronSessionMock.mockResolvedValue({
      ownerAddress,
      safeAddress,
      safeChainId: 1,
      siwe: { address: ownerAddress },
    })
    const response = createResponse()

    await safeProposeHandler(
      createRequest(
        {
          chainId: 1,
          safeAddress: tokenIn,
          safeTransactionData: {},
          safeTxHash: '0x1234',
          senderAddress: ownerAddress,
          senderSignature: '0x1234',
        },
        { host: 'nouns.build', origin: 'https://nouns.build' }
      ),
      response
    )

    expect(response.statusCode).toBe(403)
  })
})
