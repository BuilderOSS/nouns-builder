import { useEffect, useState } from 'react'

type QueryParams = Record<string, string>

export const useQueryParams = () => {
  const [state, setState] = useState<{ pathname: string; query: QueryParams }>({
    pathname: '',
    query: {},
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const getParams = () => {
      const url = new URL(window.location.href)
      const query = Object.fromEntries(url.searchParams.entries())
      return { pathname: url.pathname, query }
    }

    const update = () => setState(getParams())

    update() // initial

    // Fire synthetic event on push/replace
    const dispatch = () => window.dispatchEvent(new Event('locationchange'))

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

  return state
}
