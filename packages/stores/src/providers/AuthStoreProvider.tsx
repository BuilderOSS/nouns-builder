import { type ReactNode } from 'react'

/**
 * AuthStoreProvider - Kept for backward compatibility
 *
 * Since AuthStore is now a simple derived hook (not a Zustand store),
 * this provider doesn't need to do anything except pass through children.
 *
 * This can be removed in a future cleanup once all imports are updated.
 */
export const AuthStoreProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}
