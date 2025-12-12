import { useEffect, useRef, useState } from 'react'

const SCROLL_THRESHOLD = 10

export function useScrollDirection(threshold = SCROLL_THRESHOLD) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | undefined>()
  const scrollDirectionRef = useRef<'up' | 'down' | undefined>(undefined)
  const lastScrollYRef = useRef(0)
  const accumulatedDistanceRef = useRef(0)
  const lastDirectionRef = useRef<'up' | 'down' | undefined>(undefined)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    // Initialize scroll position on mount
    lastScrollYRef.current = window.scrollY

    const updateScrollDirection = () => {
      const scrollY = Math.max(window.scrollY, 0)
      const scrollDiff = scrollY - lastScrollYRef.current

      if (scrollDiff === 0) {
        return
      }

      const direction = scrollDiff > 0 ? 'down' : 'up'

      // If direction changed, start fresh accumulation
      if (direction !== lastDirectionRef.current) {
        accumulatedDistanceRef.current = scrollDiff
        lastDirectionRef.current = direction
      } else {
        // Same direction, accumulate distance
        accumulatedDistanceRef.current += scrollDiff
      }

      // Update state when threshold is crossed
      const absDistance = Math.abs(accumulatedDistanceRef.current)
      if (direction !== scrollDirectionRef.current && absDistance > threshold) {
        scrollDirectionRef.current = direction
        setScrollDirection(direction)

        // Keep overflow distance for smoother transitions
        const excess = absDistance - threshold
        accumulatedDistanceRef.current =
          Math.sign(accumulatedDistanceRef.current) * excess
      }

      lastScrollYRef.current = scrollY
    }

    const handleScroll = () => {
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          updateScrollDirection()
          rafIdRef.current = null
        })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      // Cancel pending animation frame to prevent setState on unmounted component
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [threshold])

  return scrollDirection
}
