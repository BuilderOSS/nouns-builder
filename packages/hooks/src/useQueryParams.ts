import { useMemo } from 'react'

export const useQueryParams = () => {
  return useMemo(() => {
    if (typeof window === 'undefined') return {}
    return Object.fromEntries(new URLSearchParams(window.location.search))
  }, [])
}
