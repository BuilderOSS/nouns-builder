import { useSafeAuth } from '@buildeross/hooks'
import { useWalletDisconnect } from '@buildeross/hooks/useWalletDisconnect'
import { useCallback, useRef } from 'react'
import { useSWRConfig } from 'swr'

import { debugSession } from '../utils/debug'
import {
  beginSiweLogout,
  cancelSiweAuthFlow,
  SIWE_LOGOUT_EVENT,
  SIWE_ME_PATH,
} from '../utils/siweAuthFlow'

/**
 * App-specific disconnect hook that wraps useWalletDisconnect
 * and adds SIWE session + Safe cleanup logic
 */
export function useAppDisconnect(): () => Promise<void> {
  const baseDisconnect = useWalletDisconnect()
  const { clearSafe } = useSafeAuth()
  const { mutate } = useSWRConfig()

  // Track if disconnect is in progress
  const disconnectInProgressRef = useRef(false)

  return useCallback(async () => {
    // Prevent concurrent disconnect operations
    if (disconnectInProgressRef.current) {
      debugSession('Disconnect already in progress, skipping')
      return
    }

    try {
      disconnectInProgressRef.current = true

      // 1) Cancel any pending SIWE auth flow
      beginSiweLogout()
      cancelSiweAuthFlow()

      // 2) Clear Safe wallet info
      clearSafe()

      // 3) Optimistically clear SWR cache to prevent showing stale session data
      // Use mutate with revalidate=false to immediately update cache without refetching
      mutate(SIWE_ME_PATH, null, false)

      // 4) Ask the app-level session machine to perform logout
      window.dispatchEvent(new Event(SIWE_LOGOUT_EVENT))

      // 5) Disconnect wallet only after logout has been initiated
      await baseDisconnect()
    } finally {
      // Reset flag after a delay to prevent rapid re-triggers
      setTimeout(() => {
        disconnectInProgressRef.current = false
      }, 500)
    }
  }, [baseDisconnect, clearSafe, mutate])
}
