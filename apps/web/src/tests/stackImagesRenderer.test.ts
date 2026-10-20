// @vitest-environment node
import type { NextApiRequest, NextApiResponse } from 'next'
import handler from 'src/pages/api/renderer/stack-images'
import {
  BLUE,
  decodeFrames,
  makeGif,
  makePng,
  rect,
  RED,
  solid,
} from 'src/utils/renderer/testImages'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const SIZE = 40
const PNG_URI =
  'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/base.png'
const GIF_URI =
  'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/anim.gif'

type MockRes = {
  statusCode: number
  headers: Record<string, string>
  body?: unknown
  ended: boolean
}

const run = async (method: 'GET' | 'HEAD', query: Record<string, string | string[]>) => {
  const state: MockRes = { statusCode: 200, headers: {}, ended: false }
  const res = {
    setHeader: (k: string, v: string) => {
      state.headers[k.toLowerCase()] = v
      return res
    },
    status: (code: number) => {
      state.statusCode = code
      return res
    },
    json: (body: unknown) => {
      state.body = body
      state.ended = true
      return res
    },
    send: (body: unknown) => {
      state.body = body
      state.ended = true
      return res
    },
    end: () => {
      state.ended = true
      return res
    },
  }
  const req = { method, query, headers: {} }
  await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse)
  return state
}

let files: Record<string, Buffer>
const fetchMock = vi.fn()

beforeEach(async () => {
  files = {
    'base.png': await makePng(SIZE, solid(BLUE)),
    'anim.gif': await makeGif(SIZE, [
      rect(RED, [0, 0, 0.5, 0.5])(SIZE),
      rect(RED, [0.5, 0, 1, 0.5])(SIZE),
    ]),
  }
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
    const name = url.split('/').pop()!
    const file = files[name]
    if (!file) return new Response('not found', { status: 404 })
    const range = (init?.headers as Record<string, string> | undefined)?.Range
    const body = range ? file.subarray(0, Number(range.split('-')[1]) + 1) : file
    return new Response(new Uint8Array(body), { status: range ? 206 : 200 })
  })
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'info').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  fetchMock.mockReset()
})

describe('/api/renderer/stack-images', () => {
  it('rejects requests without images', async () => {
    const res = await run('GET', {})
    expect(res.statusCode).toBe(400)
  })

  it('renders static stacks as webp with long cache headers', async () => {
    const res = await run('GET', { images: [PNG_URI, PNG_URI] })
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toBe('image/webp')
    expect(res.headers['cache-control']).toMatch(/s-maxage=\d+, stale-while-revalidate/)
    expect(res.headers['x-renderer-fallback']).toBeUndefined()
  })

  it('accepts a single image query string', async () => {
    const res = await run('GET', { images: PNG_URI })
    expect(res.headers['content-type']).toBe('image/webp')
  })

  it('renders animated stacks as gif by default', async () => {
    const res = await run('GET', { images: [PNG_URI, GIF_URI] })
    expect(res.headers['content-type']).toBe('image/gif')
    const out = await decodeFrames(res.body as Buffer)
    expect(out.pages).toBe(2)
  })

  it('renders animated webp with format=webp', async () => {
    const res = await run('GET', { images: [PNG_URI, GIF_URI], format: 'webp' })
    expect(res.headers['content-type']).toBe('image/webp')
    expect((await decodeFrames(res.body as Buffer)).pages).toBe(2)
  })

  it('renders a static first frame with static=1', async () => {
    const res = await run('GET', { images: [PNG_URI, GIF_URI], static: '1' })
    expect(res.headers['content-type']).toBe('image/webp')
    expect((await decodeFrames(res.body as Buffer)).pages).toBe(1)
  })

  it('returns 500 without caching when a layer cannot be fetched', async () => {
    const res = await run('GET', {
      images: [
        PNG_URI,
        'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/missing.png',
      ],
    })
    expect(res.statusCode).toBe(500)
    expect(res.headers['cache-control']).toBe('no-store')
  })

  describe('HEAD', () => {
    it('reports webp for static stacks using ranged requests only', async () => {
      const res = await run('HEAD', { images: [PNG_URI, PNG_URI] })
      expect(res.statusCode).toBe(200)
      expect(res.body).toBeUndefined()
      expect(res.headers['content-type']).toBe('image/webp')
      for (const [, init] of fetchMock.mock.calls) {
        expect((init as RequestInit).headers).toMatchObject({ Range: expect.any(String) })
      }
    })

    it('reports gif when any layer is animated', async () => {
      const res = await run('HEAD', { images: [PNG_URI, GIF_URI] })
      expect(res.headers['content-type']).toBe('image/gif')
    })

    it('honours format and static params', async () => {
      expect(
        (await run('HEAD', { images: [PNG_URI, GIF_URI], format: 'webp' })).headers[
          'content-type'
        ]
      ).toBe('image/webp')
      expect(
        (await run('HEAD', { images: [PNG_URI, GIF_URI], static: 'true' })).headers[
          'content-type'
        ]
      ).toBe('image/webp')
    })

    it('reads only a prefix when the gateway ignores Range', async () => {
      const big = Buffer.concat([files['anim.gif'], Buffer.alloc(512 * 1024)])
      files['anim.gif'] = big
      fetchMock.mockImplementation(
        async () => new Response(new Uint8Array(big), { status: 200 })
      )
      const res = await run('HEAD', { images: [GIF_URI] })
      expect(res.headers['content-type']).toBe('image/gif')
    })

    it('falls back to webp when sniffing fails', async () => {
      fetchMock.mockImplementation(async () => new Response('', { status: 500 }))
      const res = await run('HEAD', { images: [GIF_URI] })
      expect(res.statusCode).toBe(200)
      expect(res.headers['content-type']).toBe('image/webp')
    })
  })
})
