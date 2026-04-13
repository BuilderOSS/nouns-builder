import useSWR from 'swr'

import { AboutShowcaseResponse } from './types'

type HttpError = Error & { status?: number; body?: unknown }

const fetcher = async (
  [url]: readonly [string],
  { signal }: { signal?: AbortSignal } = {}
): Promise<AboutShowcaseResponse> => {
  const response = await fetch(url, {
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

  return body as AboutShowcaseResponse
}

export const useAboutShowcase = () => {
  const { data, error, isLoading, isValidating } = useSWR<
    AboutShowcaseResponse,
    HttpError
  >(['/api/about/showcase'] as const, fetcher, {
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
