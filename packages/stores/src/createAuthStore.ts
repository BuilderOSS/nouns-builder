import { createStore, type StateCreator } from 'zustand'

// Define our own type to avoid RainbowKit dependency
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type AuthStoreState = {
  address: string | undefined
  isConnected: boolean
  authStatus: AuthStatus
  chainId: number | undefined
}

export type AuthStoreActions = {
  setAddress: (address: string | undefined) => void
  setIsConnected: (connected: boolean) => void
  setAuthStatus: (status: AuthStatus) => void
  setChainId: (chainId: number | undefined) => void
  reset: () => void
}

export type AuthStoreProps = AuthStoreState & AuthStoreActions

const initialState: AuthStoreState = {
  address: undefined,
  isConnected: false,
  authStatus: 'loading',
  chainId: undefined,
}

const createAuthState: StateCreator<AuthStoreProps> = (set) => ({
  ...initialState,
  setAddress: (address) => set({ address }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setAuthStatus: (authStatus) => set({ authStatus }),
  setChainId: (chainId) => set({ chainId }),
  reset: () => set(initialState),
})

// Singleton - only one auth session at a time
const authStoreInstance = createStore<AuthStoreProps>(createAuthState)

export const getAuthStore = () => {
  return authStoreInstance
}
