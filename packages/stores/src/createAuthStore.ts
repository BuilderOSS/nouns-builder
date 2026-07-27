import type { AddressType } from '@buildeross/types'
import { createStore, type StateCreator } from 'zustand'

/**
 * AuthStore manages the user's authentication state
 *
 * Key invariant: address is ONLY set when user is fully authenticated
 * (wallet connected + SIWE signed)
 *
 * Note: chainId is NOT stored here - use wagmi's useChainId() hook instead
 */

export type AuthStoreState = {
  // Only set when FULLY authenticated (connected + SIWE signed)
  address: AddressType | undefined

  // State flags
  isConnected: boolean // Wallet is connected
  isConnecting: boolean // Wallet connection in progress
  isAuthenticating: boolean // SIWE signature in progress
  isAuthenticated: boolean // Fully authenticated (connected + signed)
}

export type AuthStoreActions = {
  // Set authentication state (sets address and isAuthenticated together)
  setAuthenticated: (address: AddressType) => void

  // Set connection state
  setConnected: (connected: boolean) => void
  setConnecting: (connecting: boolean) => void

  // Set authentication loading state
  setAuthenticating: (authenticating: boolean) => void

  // Clear all state (on disconnect or logout)
  reset: () => void
}

export type AuthStoreProps = AuthStoreState & AuthStoreActions

const initialState: AuthStoreState = {
  address: undefined,
  isConnected: false,
  isConnecting: false,
  isAuthenticating: false,
  isAuthenticated: false,
}

const createAuthState: StateCreator<AuthStoreProps> = (set) => ({
  ...initialState,

  // Set authenticated state (address and isAuthenticated together)
  setAuthenticated: (address) =>
    set({
      address,
      isAuthenticated: true,
      isAuthenticating: false,
    }),

  // Set connection state
  setConnected: (isConnected) => set({ isConnected }),
  setConnecting: (isConnecting) => set({ isConnecting }),

  // Set authentication loading state
  setAuthenticating: (isAuthenticating) => set({ isAuthenticating }),

  // Clear all state
  reset: () => set(initialState),
})

// Singleton - only one auth session at a time
const authStoreInstance = createStore<AuthStoreProps>(createAuthState)

export const getAuthStore = () => {
  return authStoreInstance
}
