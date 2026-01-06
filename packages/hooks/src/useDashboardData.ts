import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { ProposalState } from '@buildeross/sdk/contract'
import { type DashboardDao as DashboardDaoBase } from '@buildeross/sdk/subgraph'
import type { AddressType } from '@buildeross/types'
import { useCallback, useMemo } from 'react'
import useSWR from 'swr'

export type DashboardDaoWithState = Omit<DashboardDaoBase, 'proposals'> & {
  proposals: Array<
    DashboardDaoBase['proposals'][number] & {
      state: ProposalState
    }
  >
}

type UseDashboardDataOptions = {
  address?: AddressType
  enabled?: boolean
  onError?: (error: HttpError) => void
}

type UseDashboardDataReturn = {
  daos: DashboardDaoWithState[]
  isLoading: boolean
  isValidating: boolean
  error: Error | undefined
  refresh: () => Promise<void>
}

type HttpError = Error & { status?: number; body?: unknown }

/**
 * Fetcher for dashboard data
 */
const fetcher = async (
  params: [string, AddressType],
  { signal }: { signal?: AbortSignal } = {}
): Promise<{ data: DashboardDaoWithState[] }> => {
  const [, address] = params
  const url = `/api/dashboard?address=${address}`
  const res = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  })

  const text = await res.text()
  const body = text ? JSON.parse(text) : {}
  if (!res.ok) {
    const err: HttpError = new Error(body?.error || res.statusText)
    err.status = res.status
    err.body = body
    throw err
  }
  return body as { data: DashboardDaoWithState[] }
}

/**
 * Hook for fetching user dashboard data (DAOs and proposals)
 *
 * @example
 * const { daos, isLoading, error, refresh } = useDashboardData({
 *   address: '0x123...',
 * })
 *
 * @example
 * // Conditionally fetch based on address
 * const { address } = useAccount()
 * const { daos, isLoading } = useDashboardData({
 *   address,
 *   enabled: !!address,
 * })
 */
export function useDashboardData({
  address,
  enabled = true,
  onError,
}: UseDashboardDataOptions): UseDashboardDataReturn {
  const swrKey = useMemo(() => {
    if (!enabled || !address) return null
    return [SWR_KEYS.DASHBOARD, address] as const
  }, [enabled, address])

  const { data, error, isValidating, mutate } = useSWR<
    { data: DashboardDaoWithState[] },
    HttpError
  >(swrKey, fetcher, {
    revalidateOnFocus: false,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
      // Don't retry on 4xx errors (client errors)
      if (
        error.status === 400 ||
        error.status === 404 ||
        error.message.includes('Invalid address')
      ) {
        return
      }

      // Max 3 retries
      if (retryCount >= 3) return

      // Exponential backoff: 5s, 10s, 20s
      const timeout = 5000 * Math.pow(2, retryCount)
      setTimeout(() => revalidate({ retryCount }), timeout)
    },
    // Dedupe requests within 2 seconds
    dedupingInterval: 2000,
    onError: (err) => {
      console.error('Dashboard fetch error:', err)
      onError?.(err)
    },
  })

  const daos = useMemo(() => data?.data ?? [], [data])
  const isLoading = useMemo(
    () => !data && !error && enabled && !!address,
    [data, error, enabled, address]
  )

  const refresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  return {
    daos,
    isLoading,
    isValidating,
    error,
    refresh,
  }
}
