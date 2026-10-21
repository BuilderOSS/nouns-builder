import { CHAIN_ID } from '@buildeross/types'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest'

import { getAlchemyClient } from './alchemyApi'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status })

describe('alchemyApi', () => {
  let fetchMock: MockInstance<typeof fetch>

  beforeEach(() => {
    vi.stubEnv('ALCHEMY_JWT_PRIVATE_KEY', '')
    vi.stubEnv('ALCHEMY_API_KEY', 'server-key')
    fetchMock = vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  const lastRequest = () => {
    const [url, init] = fetchMock.mock.calls.at(-1)!
    return {
      url: String(url),
      method: init?.method ?? 'GET',
      headers: new Headers(init?.headers),
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    }
  }

  it('is null without credentials or for chains alchemy does not serve', () => {
    expect(getAlchemyClient(CHAIN_ID.FOUNDRY)).toBeNull()

    vi.stubEnv('ALCHEMY_API_KEY', '')
    vi.stubEnv('NEXT_PUBLIC_ALCHEMY_API_KEY', '')
    expect(getAlchemyClient(CHAIN_ID.ETHEREUM)).toBeNull()
  })

  it('calls json-rpc methods on the keyless url with an auth header', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ jsonrpc: '2.0', id: 1, result: { tokenBalances: [] } })
    )

    await getAlchemyClient(CHAIN_ID.BASE)!.getTokenBalances('0xowner')

    const request = lastRequest()
    expect(request.url).toBe('https://base-mainnet.g.alchemy.com/v2')
    expect(request.method).toBe('POST')
    expect(request.headers.get('authorization')).toBe('Bearer server-key')
    expect(request.body).toMatchObject({
      method: 'alchemy_getTokenBalances',
      params: ['0xowner', 'erc20'],
    })
  })

  it('surfaces json-rpc errors', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ jsonrpc: '2.0', id: 1, error: { code: -32602, message: 'bad' } })
    )

    await expect(
      getAlchemyClient(CHAIN_ID.BASE)!.getTokenMetadata('0xtoken')
    ).rejects.toThrow('alchemy_getTokenMetadata failed: bad')
  })

  it('calls the nft api on the keyless url', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ownedNfts: [], totalCount: 0 }))

    await getAlchemyClient(CHAIN_ID.ETHEREUM)!.getNftsForOwner('0xowner', {
      pageKey: 'next',
    })

    const request = lastRequest()
    expect(request.url).toBe(
      'https://eth-mainnet.g.alchemy.com/nft/v3/getNFTsForOwner?owner=0xowner&withMetadata=true&pageKey=next'
    )
    expect(request.headers.get('authorization')).toBe('Bearer server-key')
  })

  it('calls the prices api with the chain network', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }))

    await getAlchemyClient(CHAIN_ID.OPTIMISM)!.getTokenPricesByAddress(['0xa', '0xb'])

    const request = lastRequest()
    expect(request.url).toBe('https://api.g.alchemy.com/prices/v1/tokens/by-address')
    expect(request.body).toEqual({
      addresses: [
        { network: 'opt-mainnet', address: '0xa' },
        { network: 'opt-mainnet', address: '0xb' },
      ],
    })
  })

  it('retries rate limits, then fails on client errors without retrying', async () => {
    vi.useFakeTimers()
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 429))
      .mockResolvedValueOnce(jsonResponse({ ownedNfts: [], totalCount: 0 }))

    const pending = getAlchemyClient(CHAIN_ID.ETHEREUM)!.getNftsForOwner('0xowner')
    await vi.runAllTimersAsync()
    await expect(pending).resolves.toEqual({ ownedNfts: [], totalCount: 0 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    vi.useRealTimers()

    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'forbidden' }, 403))
    await expect(
      getAlchemyClient(CHAIN_ID.ETHEREUM)!.getNftMetadata('0xnft', '1')
    ).rejects.toThrow('failed with 403')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
