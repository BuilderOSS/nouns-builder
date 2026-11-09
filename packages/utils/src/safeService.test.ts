import { CHAIN_ID } from '@buildeross/types'
import type { Address } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getSafeInfo,
  isOwnerOfSafe,
  isSafeAddress,
  isSafeServiceError,
  lookupSafeInfo,
  SafeServiceError,
} from './safeService'

const safeAddress = '0x0000000000000000000000000000000000005aFe' as Address
const owner = '0x000000000000000000000000000000000000c0DE' as Address
const notOwner = '0x0000000000000000000000000000000000000bAd' as Address

const safeResponse = {
  address: safeAddress,
  nonce: 3,
  threshold: 1,
  owners: [owner],
  version: '1.3.0',
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

describe('safeService lookups', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the Safe when the service finds it', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(safeResponse))

    await expect(lookupSafeInfo(safeAddress, CHAIN_ID.ETHEREUM)).resolves.toMatchObject({
      safeAddress,
      owners: [owner],
      threshold: 1,
    })
    await expect(isOwnerOfSafe(owner, safeAddress, CHAIN_ID.ETHEREUM)).resolves.toBe(true)
    await expect(isOwnerOfSafe(notOwner, safeAddress, CHAIN_ID.ETHEREUM)).resolves.toBe(
      false
    )
  })

  it('treats 404 as "no such Safe"', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ detail: 'Not found' }, 404))

    await expect(lookupSafeInfo(safeAddress, CHAIN_ID.ETHEREUM)).resolves.toBeNull()
    await expect(isSafeAddress(safeAddress, CHAIN_ID.ETHEREUM)).resolves.toBe(false)
    await expect(isOwnerOfSafe(owner, safeAddress, CHAIN_ID.ETHEREUM)).resolves.toBe(
      false
    )
  })

  it.each([
    ['a rate limit', () => Promise.resolve(jsonResponse({ detail: 'slow down' }, 429))],
    ['a server error', () => Promise.resolve(jsonResponse({}, 503))],
    ['a network failure', () => Promise.reject(new TypeError('Failed to fetch'))],
  ])('throws SafeServiceError on %s instead of reporting not-found', async (_, impl) => {
    fetchMock.mockImplementation(impl)

    await expect(lookupSafeInfo(safeAddress, CHAIN_ID.ETHEREUM)).rejects.toBeInstanceOf(
      SafeServiceError
    )
    await expect(
      isOwnerOfSafe(owner, safeAddress, CHAIN_ID.ETHEREUM)
    ).rejects.toBeInstanceOf(SafeServiceError)
    await expect(isSafeAddress(safeAddress, CHAIN_ID.ETHEREUM)).rejects.toBeInstanceOf(
      SafeServiceError
    )
  })

  it('keeps getSafeInfo returning null on failures for existing callers', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({}, 429))

    await expect(getSafeInfo(safeAddress, CHAIN_ID.ETHEREUM)).resolves.toBeNull()
  })

  it('recognises SafeServiceError by name across bundle copies', () => {
    const copy = new Error('rate limited')
    copy.name = 'SafeServiceError'

    expect(isSafeServiceError(new SafeServiceError('x'))).toBe(true)
    expect(isSafeServiceError(copy)).toBe(true)
    expect(isSafeServiceError(new Error('x'))).toBe(false)
    expect(isSafeServiceError('SafeServiceError')).toBe(false)
  })

  it('records the HTTP status on SafeServiceError', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({}, 429))

    await expect(lookupSafeInfo(safeAddress, CHAIN_ID.ETHEREUM)).rejects.toMatchObject({
      status: 429,
    })
  })
})
