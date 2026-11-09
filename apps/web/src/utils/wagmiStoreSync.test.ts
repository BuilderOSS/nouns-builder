import { describe, expect, it } from 'vitest'

import { classifyWagmiStorageEvent, WAGMI_STORE_KEY } from './wagmiStoreSync'

const store = (current: string | null) =>
  JSON.stringify({
    state: {
      connections: { __type: 'Map', value: current ? [[current, {}]] : [] },
      chainId: 1,
      current,
    },
    version: 2,
  })

describe('classifyWagmiStorageEvent', () => {
  it('ignores wagmi bookkeeping keys, including removals', () => {
    expect(classifyWagmiStorageEvent('wagmi.io.metamask.disconnected', null)).toBe(
      'ignored'
    )
    expect(classifyWagmiStorageEvent('wagmi.recentConnectorId', null)).toBe('ignored')
    expect(classifyWagmiStorageEvent('wagmi.safeOwner.disconnected', 'true')).toBe(
      'ignored'
    )
    expect(classifyWagmiStorageEvent('unrelated', null)).toBe('ignored')
    expect(classifyWagmiStorageEvent(null, null)).toBe('ignored')
  })

  it('treats a removed store as a disconnect', () => {
    expect(classifyWagmiStorageEvent(WAGMI_STORE_KEY, null)).toBe('disconnected')
  })

  it('treats a store with no current connection as a disconnect', () => {
    expect(classifyWagmiStorageEvent(WAGMI_STORE_KEY, store(null))).toBe('disconnected')
  })

  it('treats a store with a current connection as a change', () => {
    expect(classifyWagmiStorageEvent(WAGMI_STORE_KEY, store('uid-1'))).toBe('changed')
  })

  it('does not guess a disconnect from an unreadable store', () => {
    expect(classifyWagmiStorageEvent(WAGMI_STORE_KEY, '{not json')).toBe('changed')
  })
})
