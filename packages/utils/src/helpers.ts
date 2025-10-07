import { PUBLIC_ALL_CHAINS, TESTNET_CHAINS } from '@buildeross/constants'
import { CHAIN_ID, Duration } from '@buildeross/types'
import { isAddress } from 'viem'

/**
 *
 * camelToTitle
 * @param camel: string
 * @returns string
 */

export const camelToTitle = (camel: string) => {
  if (!camel) return ''

  const result = camel.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

/*

  covert time { days, hours, minutes, seconds } to seconds

*/
export const toSeconds = ({ days, hours, minutes, seconds }: Duration): number => {
  let secs = 0

  if (!!days) {
    secs = secs + Number(days) * 24 * 60 * 60
  }

  if (!!hours) {
    secs = secs + Number(hours) * 60 * 60
  }

  if (!!minutes) {
    secs = secs + Number(minutes) * 60
  }

  if (!!seconds) {
    secs = secs + Number(seconds)
  }

  return secs
}

/*

  covert seconds to { days, hours, minutes }

*/
export const fromSeconds = (value: bigint | number | undefined): Duration => {
  if (!value) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const _seconds = Number(value)
  let minutes = _seconds / 60
  let hours = minutes / 60
  let days = hours / 24
  let seconds = 0

  if (days >= 1) {
    const daysMod = days % 1
    days = days - daysMod

    if (daysMod > 0) {
      hours = daysMod * 24
      const hoursMod = hours % 1
      if (hoursMod > 0) {
        hours = hours - hoursMod
        minutes = Math.round(hoursMod * 60)
      } else if (hoursMod === 0) {
        return { days, hours, minutes: 0, seconds: 0 }
      }
    } else if (daysMod === 0) {
      return { days, hours: 0, minutes: 0, seconds: 0 }
    }
  } else if (hours >= 1) {
    const hoursMod = hours % 1
    if (hoursMod > 0) {
      days = 0
      hours = hours - hoursMod
      minutes = Math.round(hoursMod * 60)
    } else if (hoursMod === 0) {
      return { days: 0, hours, minutes: 0, seconds: 0 }
    }
  } else {
    const minutesMod = minutes % 1
    seconds = Math.round(minutesMod * 60)
    minutes = minutes - minutesMod

    hours = hours >= 1 ? hours : 0
    days = days >= 1 ? days : 0
  }
  return { days, hours, minutes, seconds }
}

/**
 * Determines whether an object is empty or not.
 *
 * @param object
 * @returns {boolean}
 */
export const isEmpty = (object: {}) => {
  for (let key in object) {
    if (object.hasOwnProperty(key)) return false
  }
  return true
}

/**
 * Flattens Nested Object
 *
 * @params object
 * @returns object
 */

export const flatten = (object: object) => {
  if (typeof object !== 'object') return

  return Object.assign(
    {},
    ...(function _flatten(o: any = {}): any {
      if (!isEmpty(o)) {
        return [].concat(
          ...Object?.keys(o).map((k) =>
            typeof o[k] === 'object' ? _flatten(o[k]) : { [k]: o[k] }
          )
        )
      }
    })(object)
  )
}

/**
 * Create snippet of wallet address or
 * return address if it is not a "address"
 * as defined by Ethers.
 *
 * @param addr
 * @param chars
 * @returns {string || null}
 */

export const walletSnippet = (addr: string | number | undefined, chars: number = 5) => {
  if (!addr) {
    return ''
  }
  let _addr = addr.toString()

  return isAddress(_addr)
    ? _addr.substring(0, chars) +
        '...' +
        _addr.substring(_addr.length - chars, _addr.length)
    : _addr
}

/**
 * Pass a normal function in to have it return a promise with its valud
 *
 * @param fn: function
 * @returns any
 */

export const resolvedPromise = (fn: () => void) => new Promise((resolve) => resolve(fn))

export function isEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key) || !isEqual(a[key], b[key])) {
      return false
    }
  }

  return true
}

/**
 * compare two nearly identical objects and return an array of changes values
 *
 * @param initialValues: object
 * @param values: object
 *
 * @returns []
 * */

export const compareAndReturn = (initialValues: {}, values: {}) => {
  const updates = Object.entries(initialValues).reduce((acc: {}[] = [], cv: any) => {
    const _field = cv[0]
    const _value = cv[1]
    let _values: any[] = Object.entries(values)
    const value = _values.filter((item) => item[0] === _field)[0][1]

    if (!isEqual(_value, value)) {
      if (typeof value !== 'object') {
        if (_value.toString() !== value.toString()) {
          acc.push({
            field: _field,
            value: value,
          })
        }
      } else {
        const initValueObject: any[] = Object.entries(_value)
        const valueObject: any[] = Object.entries(value)
        initValueObject.reduce((_acc: any[] = [], _cv: any[]) => {
          const _f = _cv[0]
          const _v = _cv[1].toString()
          const v = valueObject.filter((item) => item[0] === _f)[0]?.[1].toString()

          if (!isEqual(_v, v)) {
            acc.push({
              field: _field,
              value: value,
            })
          }
        }, [])
      }
    }

    return acc
  }, [])

  return updates.filter(
    (object, index) =>
      index === updates.findIndex((obj) => JSON.stringify(obj) === JSON.stringify(object))
  )
}

/*

  Get Date x years from today

*/
export const formatDate = (date: Date | string, readable: boolean = false) => {
  if (typeof date === 'string') {
    const [year, month, day] = date.split('-')
    return readable ? `${month}/${day}/${year}` : `${year}-${month}-${day}`
  } else {
    let month = String(date.getMonth() + 1)
    let day = String(date.getDate())
    let year = String(date.getFullYear())

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return readable ? `${month}/${day}/${year}` : `${year}-${month}-${day}`
  }
}

export const formatDateTime = (date: Date) => {
  const ye = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
  }).format(date)
  const mo = new Intl.DateTimeFormat('en-US', {
    month: 'short',
  }).format(date)
  const da = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
  }).format(date)
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
  return `${mo} ${da}, ${ye} ${time}`
}

export const yearsAhead = (years: number) => {
  let d = new Date()
  let year = d.getFullYear()
  let month = d.getMonth()
  let day = d.getDate()
  return formatDate(new Date(year + years, month, day), false)
}

export const handleGMTOffset = () => {
  const now = new Date()
  const timezoneOffset = now.getTimezoneOffset() // in minutes
  const totalMinutes = -timezoneOffset // flip sign because offset is opposite of GMT

  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.abs(totalMinutes % 60)

  const sign = hours >= 0 ? '+' : '-'
  const absHours = Math.abs(hours).toString().padStart(2, '0')
  const paddedMinutes = minutes.toString().padStart(2, '0')

  return `GMT ${sign}${absHours}:${paddedMinutes}`
}

/**
 * Takes a possibly undefined array and returns either the array, or an array of undefined of
 * length expectedLength
 *
 * @param array possibly undefined array
 * @param expectedLength the expected length of the array if it were not undefined
 * @returns {T | undefined[]}
 */
export function unpackOptionalArray<T = []>(
  array: T | undefined,
  expectedLength: number
): T | undefined[] {
  if (!array) {
    return Array(expectedLength).fill(undefined)
  }
  return array
}

// Markdown is impossible to detect in all cases, but this should cover most of the cases we'll run into
export const isPossibleMarkdown = (text: string) => {
  const markdownRegex =
    /(?:\*\*[^\*]+\*\*)|(?:__[^\_]+__)|(?:\*[^\*]+\*)|(?:_[^\_]+_)|(?:\#[^\#]+\#)|(?:\!\[[^\]]*\]\([^\)]+\))|(?:\[[^\]]+\]\([^\)]+\))/g
  return markdownRegex.test(text)
}

export function maxChar(str: string, maxLength: number) {
  if (str.length <= maxLength) {
    return str
  }
  return str.slice(0, maxLength) + '...'
}

export const chainIdToSlug = (chainId: CHAIN_ID): string | undefined =>
  PUBLIC_ALL_CHAINS.find((chain) => chain.id === chainId)?.slug

export const isTestnetChain = (chainId: CHAIN_ID): boolean =>
  TESTNET_CHAINS.some((chain) => chain.id === chainId)
