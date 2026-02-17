import { Duration } from '@buildeross/types'

export const formatDuration = (duration: Duration): string => {
  const parts: string[] = []

  if (duration.days)
    parts.push(`${duration.days} ${duration.days === 1 ? 'day' : 'days'}`)
  if (duration.hours)
    parts.push(`${duration.hours} ${duration.hours === 1 ? 'hour' : 'hours'}`)
  if (duration.minutes)
    parts.push(`${duration.minutes} ${duration.minutes === 1 ? 'minute' : 'minutes'}`)
  if (duration.seconds)
    parts.push(`${duration.seconds} ${duration.seconds === 1 ? 'second' : 'seconds'}`)

  if (parts.length === 0) return '0 minutes'
  if (parts.length === 1) return parts[0]
  return `${parts.slice(0, -1).join(', ')} & ${parts[parts.length - 1]}`
}
