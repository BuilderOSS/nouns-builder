import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearSafeInfo, getSavedSafeInfo, setSafeInfo } from './safeStorage'

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

describe('safeStorage', () => {
  beforeEach(() => {
    const storage = createStorage()
    vi.stubGlobal('window', { localStorage: storage })
    vi.stubGlobal('localStorage', storage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('persists the Safe EOA address alongside safe info', () => {
    setSafeInfo(
      {
        safeAddress: '0x0000000000000000000000000000000000000001' as any,
        chainId: 1,
        threshold: 1,
        owners: ['0x0000000000000000000000000000000000000002' as any],
        isReadOnly: false,
      },
      'injected',
      '0x0000000000000000000000000000000000000003' as any
    )

    expect(getSavedSafeInfo()).toMatchObject({
      safeAddress: '0x0000000000000000000000000000000000000001',
      chainId: 1,
      eoaConnectorId: 'injected',
      eoaAddress: '0x0000000000000000000000000000000000000003',
    })
  })

  it('clears saved safe info', () => {
    setSafeInfo(
      {
        safeAddress: '0x0000000000000000000000000000000000000001' as any,
        chainId: 1,
        threshold: 1,
        owners: ['0x0000000000000000000000000000000000000002' as any],
        isReadOnly: false,
      },
      'injected',
      '0x0000000000000000000000000000000000000003' as any
    )

    clearSafeInfo()

    expect(getSavedSafeInfo()).toBeNull()
  })
})
