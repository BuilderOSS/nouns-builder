import { createContext, type ReactNode } from 'react'

import { getAuthStore } from '../createAuthStore'

type AuthStoreContextType = {
  store: ReturnType<typeof getAuthStore>
}

export const AuthStoreContext = createContext<AuthStoreContextType | null>(null)

export const AuthStoreProvider = ({ children }: { children: ReactNode }) => {
  const store = getAuthStore()

  return (
    <AuthStoreContext.Provider value={{ store }}>{children}</AuthStoreContext.Provider>
  )
}
