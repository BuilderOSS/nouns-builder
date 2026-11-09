// wagmi persists its connection state under `${storageKey}.store`; the app
// uses wagmi's default storage key, `wagmi`.
export const WAGMI_STORE_KEY = 'wagmi.store'

export type WagmiStoreChange = 'disconnected' | 'changed' | 'ignored'

/**
 * Classify a cross-tab `storage` event for wagmi.
 *
 * Only the persisted store says whether another tab still has a connection.
 * wagmi also writes and removes bookkeeping keys (`wagmi.recentConnectorId`,
 * `wagmi.<connector>.disconnected`, ...) during normal connects, so treating
 * any `wagmi.*` removal as a disconnect logged tabs out on false alarms.
 */
export function classifyWagmiStorageEvent(
  key: string | null,
  newValue: string | null
): WagmiStoreChange {
  if (key !== WAGMI_STORE_KEY) return 'ignored'

  // Store removed entirely (app disconnect wipes wagmi keys)
  if (newValue === null) return 'disconnected'

  try {
    const parsed = JSON.parse(newValue) as { state?: { current?: string | null } }
    // A store with no current connection means the other tab disconnected.
    if (parsed?.state && !parsed.state.current) return 'disconnected'
  } catch {
    // Unreadable store: don't guess a disconnect, just re-check the session.
  }

  return 'changed'
}
