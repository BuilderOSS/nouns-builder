import { TokenMetadata } from '@buildeross/types'
import { formatUnits } from 'viem'

/**
 * Formats token-based values (amounts, values, prices).
 * Handles arrays, comma-separated strings, and numeric conversions.
 */
export const formatTokenValue = (
  rawValue: unknown,
  tokenMetadata?: TokenMetadata
): string | string[] => {
  const decimals = tokenMetadata?.decimals ?? 18
  const symbol = tokenMetadata?.symbol ?? 'ETH'

  try {
    let values: string[]

    if (Array.isArray(rawValue)) {
      values = rawValue.map((v) => v?.toString?.() ?? String(v))
    } else if (typeof rawValue === 'string' && rawValue.includes(',')) {
      values = rawValue
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    } else {
      values = [rawValue?.toString?.() ?? String(rawValue)]
    }

    const formattedList = values.map((v) => {
      try {
        const n = BigInt(v.trim())
        return `${formatUnits(n, decimals)} ${symbol}`
      } catch {
        return `${v} (raw)`
      }
    })

    return formattedList.length === 1 ? formattedList[0] : formattedList
  } catch {
    return String(rawValue)
  }
}

/**
 * Formats BPS (basis points) values as percentages.
 * 10000 BPS = 100%
 */
export const formatBpsValue = (rawValue: unknown): string => {
  try {
    let values: string[]

    if (Array.isArray(rawValue)) {
      values = rawValue.map((v) => v?.toString?.() ?? String(v))
    } else if (typeof rawValue === 'string' && rawValue.includes(',')) {
      values = rawValue
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    } else {
      values = [rawValue?.toString?.() ?? String(rawValue)]
    }

    const formattedList = values.map((v) => {
      const num = Number(v)
      if (isFinite(num)) {
        return `${(num / 100).toFixed(2)}%`
      } else {
        return `${v} (raw)`
      }
    })

    return formattedList.join(', ')
  } catch {
    return String(rawValue)
  }
}
