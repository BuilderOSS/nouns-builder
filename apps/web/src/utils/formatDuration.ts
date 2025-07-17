import { Duration } from 'src/typings'

export const formatDuration = (duration: Duration): string => {
  const days = `${duration.days || '0'} ${Number(duration.days) === 1 ? 'day' : 'days'}`
  const hours = `${duration.hours || '0'} ${
    Number(duration.hours) === 1 ? 'hour' : 'hours'
  }`
  const minutes = `${duration.minutes || '0'} ${
    Number(duration.minutes) === 1 ? 'minute' : 'minutes'
  }`

  return `${days}, ${hours} & ${minutes}`
}
