import { useSyncExternalStore } from 'react'

import { isSiweLogoutGateActive, subscribeSiweLogoutGate } from '../utils/siweAuthFlow'

const getServerSnapshot = () => false

/**
 * Reactive view of the SIWE logout gate. Re-renders when the gate is set or
 * cleared (in this tab or another) and when it expires on its own, so UI that
 * is held back by the gate recovers without waiting for an unrelated render.
 */
export function useSiweLogoutInProgress(): boolean {
  return useSyncExternalStore(
    subscribeSiweLogoutGate,
    isSiweLogoutGateActive,
    getServerSnapshot
  )
}
