import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { addRecentSafeWallet, getRecentSafeWallets } from './recentSafeWallets'

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

describe('recentSafeWallets', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: createStorage() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('dedupes by safe address and chain and keeps the most recent entries', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    addRecentSafeWallet('0x0000000000000000000000000000000000000001', 1)
    vi.setSystemTime(new Date('2026-01-01T00:01:00.000Z'))
    addRecentSafeWallet('0x0000000000000000000000000000000000000002', 8453)
    vi.setSystemTime(new Date('2026-01-01T00:02:00.000Z'))
    addRecentSafeWallet('0x0000000000000000000000000000000000000001', 1)
    vi.setSystemTime(new Date('2026-01-01T00:03:00.000Z'))
    addRecentSafeWallet('0x0000000000000000000000000000000000000003', 10)
    vi.setSystemTime(new Date('2026-01-01T00:04:00.000Z'))
    addRecentSafeWallet('0x0000000000000000000000000000000000000004', 137)

    const recent = getRecentSafeWallets()

    expect(recent).toHaveLength(3)
    expect(recent.map((wallet) => wallet.safeAddress)).toEqual([
      '0x0000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000003',
      '0x0000000000000000000000000000000000000001',
    ])

    vi.useRealTimers()
  })

  it('ignores invalid stored data', () => {
    window.localStorage.setItem(
      'recent-safe-wallets',
      JSON.stringify([{ safeAddress: 'not-an-address', chainId: 1, timestamp: 1 }])
    )

    expect(getRecentSafeWallets()).toEqual([])
  })
})
