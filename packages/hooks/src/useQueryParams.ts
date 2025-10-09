import { useEffect, useState } from 'react'

type QueryParams = Record<string, string>

export const useQueryParams = (): QueryParams => {
  const [query, setQuery] = useState<QueryParams>({})

  useEffect(() => {
    if (typeof window === 'undefined') return

    const getParams = (): QueryParams =>
      Object.fromEntries(new URLSearchParams(window.location.search))

    const update = () => setQuery(getParams())

    update() // initial

    // Generic browser listeners for navigation updates
    const dispatch = () => window.dispatchEvent(new Event('locationchange'))

    // Patch pushState / replaceState once per runtime
    if (!(window as any).__location_patched) {
      const { pushState, replaceState } = window.history

      window.history.pushState = function (...args) {
        pushState.apply(this, args as any)
        dispatch()
      }

      window.history.replaceState = function (...args) {
        replaceState.apply(this, args as any)
        dispatch()
      }

      window.addEventListener('popstate', dispatch)
      ;(window as any).__location_patched = true
    }

    window.addEventListener('locationchange', update)
    return () => {
      window.removeEventListener('locationchange', update)
    }
  }, [])

  return query
}
