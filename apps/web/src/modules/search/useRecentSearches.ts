import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'nouns-builder:recent-searches'
const MAX_RECENT = 6

const read = (): string[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

const write = (values: string[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
  } catch {
    // Storage can be unavailable (private mode, blocked site data); recents are optional
  }
}

/** Recent search queries for this browser, newest first. */
export const useRecentSearches = () => {
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    setRecent(read())
  }, [])

  const add = useCallback((query: string) => {
    const value = query.trim()
    if (!value) return
    const next = [value, ...read().filter((v) => v.toLowerCase() !== value.toLowerCase())]
    const capped = next.slice(0, MAX_RECENT)
    write(capped)
    setRecent(capped)
  }, [])

  const clear = useCallback(() => {
    write([])
    setRecent([])
  }, [])

  return { recent, add, clear }
}
