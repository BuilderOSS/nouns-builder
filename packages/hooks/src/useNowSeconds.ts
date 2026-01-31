import { useEffect, useState } from 'react'

export function useNowSeconds(enabled: boolean) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    if (!enabled) return
    setNow(Math.floor(Date.now() / 1000))
    const id = window.setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => window.clearInterval(id)
  }, [enabled])

  return now
}
