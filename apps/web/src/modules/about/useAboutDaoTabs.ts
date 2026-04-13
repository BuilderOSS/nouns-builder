import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import useSWR from 'swr'

import { AboutDaoTabsResponse } from './types'

type HttpError = Error & { status?: number; body?: unknown }

const fetcher = async (
  [, network]: readonly [string, string],
  { signal }: { signal?: AbortSignal } = {}
): Promise<AboutDaoTabsResponse> => {
  const response = await fetch(`/api/about/dao-tabs?network=${network}`, {
    signal,
    headers: { Accept: 'application/json' },
  })

  const text = await response.text()
  const body = text ? JSON.parse(text) : {}

  if (!response.ok) {
    const err: HttpError = new Error(body?.error || response.statusText)
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
