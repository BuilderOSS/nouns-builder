import { useInterval } from './useInterval'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

interface Countdown {
  isEnded: boolean
  countdownString: string
  countdownStringDays: string
}

/** useCountdown should always be used within a component using useIsMounted() to avoid "content
 * does not match server-rendered HTML" errors. */
export const useCountdown = (
  endTime: number,
  onEnd: <T extends any[]>(...args: T) => void,
): Countdown => {
  const [now, setNow] = useState(dayjs.unix(Date.now() / 1000))
  const [isRunning, setIsRunning] = useState(true)

  const isRunningInterval = isRunning ? 1000 : null

  useInterval(() => {
    setNow(dayjs.unix(Date.now() / 1000))
  }, isRunningInterval)

  const end = Number.isNaN(endTime) ? dayjs.unix(0) : dayjs.unix(endTime)
  const countdown = end.diff(now, 'second')

  useEffect(() => {
    if (now >= end) {
      setIsRunning(false)
      onEnd()
    }
  }, [now, end, onEnd])

  return {
    isEnded: now >= end,
    countdownString: `${Math.floor(countdown / 3600)}h ${Math.floor(
      (countdown % 3600) / 60,
    )}m ${countdown % 60}s`,
    countdownStringDays:
      countdown > 172800
        ? `${Math.floor(countdown / 86400)} days`
        : `${Math.floor(countdown / 3600)
            .toString()
            .padStart(2, '0')}h ${Math.floor((countdown % 3600) / 60)
            .toString()
            .padStart(2, '0')}m ${(countdown % 60).toString().padStart(2, '0')}s`,
  }
}
