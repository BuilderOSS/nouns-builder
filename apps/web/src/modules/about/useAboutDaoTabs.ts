import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import useSWR from 'swr'

import { AboutDaoTabsResponse } from './types'

type HttpError = Error & { status?: number; body?: unknown }

const fetcher = async (
  [, network]: readonly [string, string],
  { signal }: { signal?: AbortSignal } = {}
): Promise<AboutDaoTabsResponse> => {
  const response = await fetch(
    `/api/about/dao-tabs?network=${encodeURIComponent(network)}`,
    {
      signal,
      headers: { Accept: 'application/json' },
    }
  )

  const text = await response.text()
  let body: unknown = {}

  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    body = text
  }

  if (!response.ok) {
    const err: HttpError = new Error(
      typeof body === 'object' && body && 'error' in body
        ? String((body as { error?: string }).error || response.statusText)
        : response.statusText
    )
    err.status = response.status
    err.body = body
    throw err
  }

  return body as AboutDaoTabsResponse
}

export const useAboutDaoTabs = (network?: string) => {
  const swrKey = network ? ([SWR_KEYS.EXPLORE, network] as const) : null

  const { data, error, isLoading, isValidating } = useSWR<
    AboutDaoTabsResponse,
    HttpError
  >(swrKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000,
  })

  return {
    data,
    error,
    isLoading: !!swrKey && (isLoading || isValidating),
  }
}
