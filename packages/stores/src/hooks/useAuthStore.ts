/**
 * Re-export useAuthStore from createAuthStore
 *
 * The AuthStore is now a derived hook (not a Zustand store)
 * It derives state from RainbowKit + wagmi
 */
export { useAuthStore } from '../createAuthStore'
