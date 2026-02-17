/**
 * Format market cap to human-readable format
 * Examples:
 * - 1234 -> "$1.23K"
 * - 1234567 -> "$1.23M"
 * - 1234567890 -> "$1.23B"
 * - null/undefined -> "—"
 */
export function formatMarketCap(marketCap: number | null | undefined): string {
  if (marketCap === null || marketCap === undefined || !Number.isFinite(marketCap)) {
    return '—'
  }

  if (marketCap === 0) {
    return '$0'
  }

  const absValue = Math.abs(marketCap)
  const sign = marketCap < 0 ? '-' : ''

  if (absValue >= 1_000_000_000) {
    // Billions
    return `${sign}$${(absValue / 1_000_000_000).toFixed(2)}B`
  } else if (absValue >= 1_000_000) {
    // Millions
    return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`
  } else if (absValue >= 1_000) {
    // Thousands
    return `${sign}$${(absValue / 1_000).toFixed(2)}K`
  } else {
    // Less than 1000
    return `${sign}$${absValue.toFixed(2)}`
  }
}

/**
 * Format price to human-readable format with appropriate precision
 * Uses adaptive precision:
 * - If >= $1: 2 decimals with commas (e.g., "$1,234.56")
 * - If $0.01 <= value < $1: 4 decimals (e.g., "$0.0789")
 * - If < $0.01: Show up to 10 decimals, trimming trailing zeros (e.g., "$0.0000000433")
 * - null/undefined -> "—"
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || !Number.isFinite(price)) {
    return '—'
  }

  if (price === 0) {
    return '$0.00'
  }

  const absValue = Math.abs(price)
  const sign = price < 0 ? '-' : ''

  // For prices >= $1, use 2 decimals with thousand separators
  if (absValue >= 1) {
    return `${sign}$${absValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  // For prices >= $0.01, use 4 decimals
  if (absValue >= 0.01) {
    return `${sign}$${absValue.toFixed(4)}`
  }

  // For very small prices (< $0.01), show up to 10 decimals
  // This handles values like $0.0000000433 properly
  let formatted = absValue.toFixed(10)

  // Trim trailing zeros but keep at least 2 decimals
  formatted = formatted.replace(/(\.\d*?)0+$/, '$1')
  if (formatted.endsWith('.')) {
    formatted += '00'
  } else {
    const decimalPart = formatted.split('.')[1]
    if (decimalPart && decimalPart.length < 2) {
      formatted += '0'
    }
  }

  return `${sign}$${formatted}`
}

/**
 * Format supply to human-readable format
 * Examples:
 * - 1000000000 -> "1.00B"
 * - 100000000000 -> "100.00B"
 */
export function formatSupply(supply: number | bigint): string {
  const value = typeof supply === 'bigint' ? Number(supply) : supply

  if (!Number.isFinite(value)) {
    return '—'
  }

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  } else {
    return value.toString()
  }
}
