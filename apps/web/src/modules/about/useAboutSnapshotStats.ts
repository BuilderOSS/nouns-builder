import useSWR from 'swr'

import { AboutSnapshotResponse } from './types'

type HttpError = Error & { status?: number; body?: unknown }

const fetcher = async (
  [url]: readonly [string],
  { signal }: { signal?: AbortSignal } = {}
): Promise<AboutSnapshotResponse> => {
  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  })

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

  return body as AboutSnapshotResponse
}

export const useAboutSnapshotStats = () => {
  const { data, error, isLoading, isValidating } = useSWR<
    AboutSnapshotResponse,
    HttpError
  >(['/api/about/snapshot'] as const, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000,
  })

  return {
    data,
    error,
    isLoading: isLoading || isValidating,
  }
}
