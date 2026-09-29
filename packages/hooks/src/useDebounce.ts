import { useEffect, useState } from 'react'

/**
 * Debounces a value by delaying updates until after a specified delay period.
 * Useful for optimizing performance in search inputs and API calls.
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearchTerm = useDebounce(searchTerm, 500)
 *
 * // API call only happens 500ms after user stops typing
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     fetchSearchResults(debouncedSearchTerm)
 *   }
 * }, [debouncedSearchTerm])
 * ```
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up timeout if value changes before delay completes
    // This ensures we only update after the user has stopped changing the value
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
