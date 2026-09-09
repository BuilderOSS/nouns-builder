import { setSafeInfo } from '@buildeross/utils'
import type { Address } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

  it('prefers the saved Safe EOA address when the cache is empty', async () => {
    const fallback = '0x0000000000000000000000000000000000000001' as Address
    const eoa = '0x0000000000000000000000000000000000000002' as Address

    setSafeInfo(
      {
        safeAddress: '0x0000000000000000000000000000000000000003' as Address,
        chainId: 1,
        threshold: 1,
        owners: [eoa],
        isReadOnly: false,
      },
      'injected',
      eoa
    )

    const connector = {
      id: 'safeOwner',
      cachedEOAAddress: null,
      getEOAAddress: vi.fn().mockResolvedValue(null),
    } as any

    await expect(resolveSigningAddress(connector, fallback)).resolves.toBe(eoa)
  })

  it('returns the fallback address for normal wallets', async () => {
    const fallback = '0x0000000000000000000000000000000000000001' as Address

    await expect(
      resolveSigningAddress({ id: 'injected' } as any, fallback)
    ).resolves.toBe(fallback)
  })

  it('prefers the cached EOA for Safe wallets', async () => {
    const fallback = '0x0000000000000000000000000000000000000001' as Address
    const eoa = '0x0000000000000000000000000000000000000002' as Address

    const connector = {
      id: 'safeOwner',
      cachedEOAAddress: eoa,
      getEOAAddress: vi.fn(),
    } as any

    await expect(resolveSigningAddress(connector, fallback)).resolves.toBe(eoa)
    expect(connector.getEOAAddress).not.toHaveBeenCalled()
  })
})
