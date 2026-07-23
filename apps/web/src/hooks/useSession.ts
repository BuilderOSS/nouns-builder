import useSWR from 'swr'

import type { SessionData } from '../types/auth'
import { debugSession } from '../utils/debug'
import { SIWE_ME_PATH } from '../utils/siweAuthFlow'

const fetcher = async (url: string): Promise<SessionData> => {
  debugSession('Fetching session from %s', url)
  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    debugSession('Session fetch failed: %d', res.status)
    // Return empty for auth errors (expected case - not authenticated)
    if (res.status === 401 || res.status === 403) {
      return {}
    }
    // Throw for server errors so SWR can handle retry
    throw new Error(`Session fetch failed: ${res.status}`)
  }

  const data = await res.json()
  debugSession('Session data: %O', data)
  return data
}

export function useSession() {
  const { data, error, mutate, isLoading } = useSWR<SessionData>(SIWE_ME_PATH, fetcher, {
    refreshInterval: 60000, // Auto-refresh every minute
    revalidateOnFocus: true, // Check when tab focused
    revalidateOnReconnect: true, // Check when network restored
    shouldRetryOnError: false, // Don't retry 401s
    dedupingInterval: 5000, // Dedupe within 5 seconds
  })

  return {
    session: data,
    address: data?.safeAddress || data?.address,
    eoaAddress: data?.eoaAddress,
    safeAddress: data?.safeAddress,
    isAuthenticated: !!(data?.address || data?.safeAddress),
    isSafeMode: !!data?.safeAddress,
    isLoading,
    error,
    refresh: mutate,
  }
}
