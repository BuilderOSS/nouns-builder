import type { AddressType } from '@buildeross/types'
import { createContext, useContext } from 'react'
import { useAccount } from 'wagmi'

/**
 * RainbowKit authentication status
 * Defined locally to avoid dependency on @rainbow-me/rainbowkit package
 */
export type AuthenticationStatus = 'loading' | 'unauthenticated' | 'authenticated'

/**
 * AuthStore - Derived state from RainbowKit + wagmi + Session
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

  // Safe-specific fields (when user authenticated via Safe wallet)
  eoaAddress?: AddressType
  safeAddress?: AddressType
  isSafeMode: boolean

  // State flags
  isConnected: boolean // Wallet is connected
  isConnecting: boolean // Wallet connection in progress (always false for now)
  isAuthenticating: boolean // SIWE signature in progress (derived from status === 'loading')
  isAuthenticated: boolean // Fully authenticated (connected + signed)
}

/**
 * Session data from useSession hook
 * Can be provided via SessionContext
 */
export interface SessionData {
  address?: AddressType
  eoaAddress?: AddressType
  safeAddress?: AddressType
  safeChainId?: number
}

/**
 * Context to share session data from SWR
 * This allows session data to be accessed across the app
 */
export const SessionContext = createContext<SessionData | null>(null)

/**
 * Context to share RainbowKit authentication status
 * This is set by the app's _app.tsx
 */
export const AuthStatusContext = createContext<AuthenticationStatus>('loading')

/**
 * Hook to get authentication state
 * Derives state from RainbowKit's authentication status (via context),
 * wagmi's wallet connection, and session data (from SWR)
 */
export function useAuthStore(): AuthStoreState {
  const { isConnected: walletConnected } = useAccount()
  const authStatus = useContext(AuthStatusContext)
  const session = useContext(SessionContext)

  // SSR safety: always treat as loading during server-side rendering
  // This prevents hydration mismatches between server and client
  const isClient = typeof window !== 'undefined'
  const safeAuthStatus: AuthenticationStatus = isClient ? authStatus : 'loading'

  const isAuthenticated = safeAuthStatus === 'authenticated'
  const isAuthenticating = safeAuthStatus === 'loading'

  // Determine primary address (Safe address takes precedence)
  const address = session?.safeAddress || session?.address

  return {
    // Address from session (Safe address if available, otherwise EOA)
    address: isAuthenticated && address ? (address as AddressType) : undefined,

    // Safe-specific fields
    eoaAddress: session?.eoaAddress as AddressType | undefined,
    safeAddress: session?.safeAddress as AddressType | undefined,
    isSafeMode: !!session?.safeAddress,

    isConnected: walletConnected,
    isConnecting: false, // wagmi handles this internally
    isAuthenticating,
    isAuthenticated,
  }
}
