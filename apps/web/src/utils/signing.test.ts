import type { Address } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getSavedSafeInfoMock } = vi.hoisted(() => ({ getSavedSafeInfoMock: vi.fn() }))

vi.mock('@buildeross/utils', () => ({ getSavedSafeInfo: getSavedSafeInfoMock }))

import { resolveSigningAddress } from './signing'

function createStorage() {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  }
}

describe('resolveSigningAddress', () => {
  beforeEach(() => {
    const storage = createStorage()
    vi.stubGlobal('window', { localStorage: storage })
    vi.stubGlobal('localStorage', storage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('prefers the saved Safe owner address when the cache is empty', async () => {
    const fallback = '0x0000000000000000000000000000000000000001' as Address
    const eoa = '0x0000000000000000000000000000000000000002' as Address

    getSavedSafeInfoMock.mockReturnValue({ ownerAddress: eoa })

    const connector = {
      id: 'safeOwner',
      cachedOwnerAddress: null,
      getOwnerAddress: vi.fn().mockResolvedValue(null),
    } as any

    await expect(resolveSigningAddress(connector, fallback)).resolves.toBe(eoa)
  })

  it('returns the fallback address for normal wallets', async () => {
    const fallback = '0x0000000000000000000000000000000000000001' as Address

    await expect(
      resolveSigningAddress({ id: 'injected' } as any, fallback)
    ).resolves.toBe(fallback)
  })

  it('prefers the current owner wallet over a stale cached address', async () => {
    const fallback = '0x0000000000000000000000000000000000000001' as Address
    const cachedEoa = '0x0000000000000000000000000000000000000002' as Address
    const currentEoa = '0x0000000000000000000000000000000000000003' as Address

    const connector = {
      id: 'safeOwner',
      cachedOwnerAddress: cachedEoa,
      getOwnerAddress: vi.fn().mockResolvedValue(currentEoa),
    } as any

    await expect(resolveSigningAddress(connector, fallback)).resolves.toBe(currentEoa)
    expect(connector.getOwnerAddress).toHaveBeenCalledOnce()
  })
})
