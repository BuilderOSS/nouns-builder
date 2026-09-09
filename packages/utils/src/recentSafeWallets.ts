import type { Address } from 'viem'
import { getAddress, isAddress } from 'viem'

const STORAGE_KEY = 'recent-safe-wallets'
const MAX_RECENT_SAFE_WALLETS = 3

export interface RecentSafeWallet {
  safeAddress: Address
  chainId: number
  timestamp: number
}

const getLocalStorage = () =>
  typeof window === 'undefined' ? undefined : window.localStorage

const getStorageKey = (safeAddress: Address, chainId: number) =>
  `${safeAddress.toLowerCase()}:${chainId}`

const isRecentSafeWallet = (value: unknown): value is RecentSafeWallet => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<RecentSafeWallet>

  return (
    typeof candidate.safeAddress === 'string' &&
    isAddress(candidate.safeAddress) &&
    typeof candidate.chainId === 'number' &&
    Number.isInteger(candidate.chainId) &&
    typeof candidate.timestamp === 'number' &&
    Number.isFinite(candidate.timestamp)
  )
}

const dedupeRecentSafeWallets = (wallets: RecentSafeWallet[]) => {
  const seen = new Set<string>()

  return wallets.filter((wallet) => {
    const key = getStorageKey(wallet.safeAddress, wallet.chainId)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function getRecentSafeWallets(): RecentSafeWallet[] {
  const storage = getLocalStorage()
  if (!storage) return []

  try {
    const stored = storage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored) as unknown
    if (!Array.isArray(parsed)) return []

    return dedupeRecentSafeWallets(
      parsed
        .filter(isRecentSafeWallet)
        .map((wallet) => ({
          safeAddress: getAddress(wallet.safeAddress),
          chainId: wallet.chainId,
          timestamp: wallet.timestamp,
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
    ).slice(0, MAX_RECENT_SAFE_WALLETS)
  } catch {
    return []
  }
}

export function addRecentSafeWallet(safeAddress: Address, chainId: number): void {
  const storage = getLocalStorage()
  if (!storage || !isAddress(safeAddress) || !Number.isInteger(chainId)) return

  const nextWallet: RecentSafeWallet = {
    safeAddress: getAddress(safeAddress),
    chainId,
    timestamp: Date.now(),
  }

  const nextWallets = [
    nextWallet,
    ...getRecentSafeWallets().filter(
      (wallet) =>
        getStorageKey(wallet.safeAddress, wallet.chainId) !==
        getStorageKey(nextWallet.safeAddress, nextWallet.chainId)
    ),
  ].slice(0, MAX_RECENT_SAFE_WALLETS)

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(nextWallets))
  } catch {
    // Ignore storage failures.
  }
}
