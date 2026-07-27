import type { AddressType } from '@buildeross/types'
import { createContext, useContext } from 'react'
import { useAccount } from 'wagmi'

/**
 * RainbowKit authentication status
 * Defined locally to avoid dependency on @rainbow-me/rainbowkit package
 */
export type AuthenticationStatus = 'loading' | 'unauthenticated' | 'authenticated'

/**
 * AuthStore - Derived state from RainbowKit + wagmi
 *
 * Key invariant: address is ONLY set when user is fully authenticated
 * (wallet connected + SIWE signed)
 *
 * This is no longer a Zustand store - it's a simple hook that derives
 * authentication state from RainbowKit's status and wagmi.
 *
 * Note: chainId is NOT stored here - use wagmi's useChainId() hook instead
 */

export type AuthStoreState = {
  // Only set when FULLY authenticated (connected + SIWE signed)
  address: AddressType | undefined

  // State flags
  isConnected: boolean // Wallet is connected
  isConnecting: boolean // Wallet connection in progress (always false for now)
  isAuthenticating: boolean // SIWE signature in progress (derived from status === 'loading')
  isAuthenticated: boolean // Fully authenticated (connected + signed)
}

/**
 * Context to share RainbowKit authentication status
 * This is set by the app's _app.tsx
 */
export const AuthStatusContext = createContext<AuthenticationStatus>('loading')

/**
 * Hook to get authentication state
 * Derives state from RainbowKit's authentication status (via context) and wagmi's wallet connection
 */
export function useAuthStore(): AuthStoreState {
  const { address: walletAddress, isConnected: walletConnected } = useAccount()
  const authStatus = useContext(AuthStatusContext)

  // SSR safety: always treat as loading during server-side rendering
  // This prevents hydration mismatches between server and client
  const isClient = typeof window !== 'undefined'
  const safeAuthStatus: AuthenticationStatus = isClient ? authStatus : 'loading'

  const isAuthenticated = safeAuthStatus === 'authenticated'
  const isAuthenticating = safeAuthStatus === 'loading'

  return {
    // Address only available when authenticated
    address:
      isAuthenticated && walletAddress ? (walletAddress as AddressType) : undefined,

    isConnected: walletConnected,
    isConnecting: false, // wagmi handles this internally
    isAuthenticating,
    isAuthenticated,
  }
}

// For backward compatibility - some code may call getAuthStore().getState()
// This is deprecated and should be replaced with useAuthStore() hook
export const getAuthStore = () => {
  console.warn(
    'getAuthStore() is deprecated. Use the useAuthStore() hook instead. ' +
      'Direct store access is no longer supported.'
  )
  return {
    getState: () => ({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isAuthenticating: false,
      isAuthenticated: false,
    }),
  }
}
