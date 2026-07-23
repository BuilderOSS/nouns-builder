import { useAuthStore } from '@buildeross/stores'
import type { AuthenticationStatus } from '@rainbow-me/rainbowkit'
import { useCallback, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'

/**
 * Syncs wagmi wallet state with AuthStore and RainbowKit authentication
 *
 * Handles:
 * - Wallet connection/disconnection
 * - Account switching (clears auth on account change)
 * - SIWE authentication state
 * - Session verification on mount and window focus
 *
 * Bug fixes:
 * - Proper event listener cleanup
 * - Account switching detection
 * - Stale closure prevention
 * - Gap state handling
 */
export function useWagmiAuthSync(
  rainbowKitAuthStatus: AuthenticationStatus,
  setRainbowKitAuthStatus: (status: AuthenticationStatus) => void
) {
  const { address, isConnected, connector } = useAccount()
  const { setConnected, setConnecting, setAuthenticated, reset } = useAuthStore()

  const prevAddressRef = useRef<string | undefined>(undefined)
  const fetchingRef = useRef(false)

  // Core sync effect - handles the main state flow
  useEffect(() => {
    // 1. Handle disconnection
    if (!isConnected) {
      reset()
      if (rainbowKitAuthStatus !== 'unauthenticated') {
        setRainbowKitAuthStatus('unauthenticated')
      }
      prevAddressRef.current = undefined
      return
    }

    // 2. Update connected state
    setConnected(true)

    // 3. Handle account switch (treat as logout - requires re-authentication)
    if (prevAddressRef.current && prevAddressRef.current !== address) {
      reset()
      setRainbowKitAuthStatus('unauthenticated')
      prevAddressRef.current = address

      void fetch('/api/siwe/logout', { method: 'POST' })
      return
    }
    prevAddressRef.current = address

    // 4. Set authenticated state when both conditions met
    if (rainbowKitAuthStatus === 'authenticated' && address) {
      setAuthenticated(address)
    } else if (rainbowKitAuthStatus === 'unauthenticated') {
      // Clear auth data if SIWE session expired
      reset()
      setConnected(true) // But keep connected state
    }
  }, [
    isConnected,
    address,
    rainbowKitAuthStatus,
    setConnected,
    setAuthenticated,
    reset,
    setRainbowKitAuthStatus,
  ])

  // Connector state - properly cleanup event listeners
  useEffect(() => {
    if (!connector?.emitter) {
      setConnecting(false)
      return
    }

    // Use named functions so cleanup works correctly
    const handleConnect = () => setConnecting(false)
    const handleError = () => setConnecting(false)

    setConnecting(true)
    connector.emitter.on('connect', handleConnect)
    connector.emitter.on('error', handleError)

    return () => {
      connector.emitter.off('connect', handleConnect)
      connector.emitter.off('error', handleError)
    }
  }, [connector, setConnecting])

  // Session verification
  const verifySession = useCallback(async () => {
    if (fetchingRef.current) return

    fetchingRef.current = true
    try {
      const response = await fetch('/api/siwe/me')
      const json = await response.json()

      const sessionAddress =
        typeof json.address === 'string' ? json.address.toLowerCase() : undefined
      const connectedAddress = address?.toLowerCase()

      // Only consider the session authenticated when it matches the connected wallet.
      const newStatus =
        sessionAddress && connectedAddress && sessionAddress === connectedAddress
          ? 'authenticated'
          : 'unauthenticated'

      if (newStatus !== rainbowKitAuthStatus) {
        setRainbowKitAuthStatus(newStatus)
      }
    } catch {
      if (rainbowKitAuthStatus !== 'unauthenticated') {
        setRainbowKitAuthStatus('unauthenticated')
      }
    } finally {
      fetchingRef.current = false
    }
  }, [address, rainbowKitAuthStatus, setRainbowKitAuthStatus])

  // Initial check and window focus
  useEffect(() => {
    verifySession()
    window.addEventListener('focus', verifySession)
    return () => window.removeEventListener('focus', verifySession)
  }, [verifySession])
}
