import BigNumber from 'bignumber.js'

export type BigNumberish = BigNumber | bigint | string | number

const ONE_QUADRILLION = new BigNumber(1000000000000000)
const ONE_TRILLION = new BigNumber(1000000000000)
const ONE_BILLION = new BigNumber(1000000000)
const ONE_MILLION = new BigNumber(1000000)
const ONE_HUNDRED_THOUSAND = new BigNumber(100000)
const TEN_THOUSAND = new BigNumber(10000)
const ONE_THOUSAND = new BigNumber(1000)
const ONE_HUNDRED = new BigNumber(100)
const TEN = new BigNumber(10)
const ONE = new BigNumber(1)
const ONE_MILLIONTH = new BigNumber(0.000001)

export function numberFormatter(number: number | string) {
  const parsed =
    typeof number === 'string'
      ? number.includes('.')
        ? parseFloat(number)
        : parseInt(number, 10)
      : number

  if (Number.isNaN(parsed)) return '0'

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: parsed > 9 ? 5 : 6,
  }).format(parsed)
}

function formatCryptoValUnder100K(amount: BigNumber) {
  const formattedVal = amount.isInteger()
    ? amount.toFormat(2)
    : amount.isGreaterThan(TEN_THOUSAND)
      ? amount.precision(7).decimalPlaces(2).toFormat()
      : amount.isGreaterThan(ONE_THOUSAND)
        ? amount.precision(6).decimalPlaces(2)
        : amount.isGreaterThan(ONE_HUNDRED)
          ? amount.precision(6).decimalPlaces(3)
          : amount.isGreaterThan(TEN)
            ? amount.precision(6).decimalPlaces(4)
            : amount.isGreaterThan(ONE)
              ? amount.precision(6).decimalPlaces(5)
              : amount.isGreaterThanOrEqualTo(ONE_MILLIONTH)
                ? amount.precision(6).decimalPlaces(6)
                : `<${ONE_MILLIONTH}` // otherwise we'll get output like '1e-18'
  return formattedVal.toString()
}

function formatCryptoValFrom100Kto1Quadrillion(amount: BigNumber) {
  return amount.isGreaterThan(ONE_TRILLION)
    ? `${amount.dividedBy(ONE_TRILLION).decimalPlaces(2).toString()}T`
    : amount.isGreaterThan(ONE_BILLION)
      ? `${amount.dividedBy(ONE_BILLION).decimalPlaces(2).toString()}B`
      : amount.isGreaterThan(ONE_MILLION)
        ? `${amount.dividedBy(ONE_MILLION).decimalPlaces(2).toString()}M`
        : `${amount.dividedBy(ONE_THOUSAND).decimalPlaces(2).toString()}k`
}

export function formatCryptoVal(cryptoVal: BigNumber | BigNumberish | string) {
  const raw = typeof cryptoVal === 'string' ? cryptoVal : cryptoVal?.toString()
  const parsedamount = new BigNumber(raw)
  return parsedamount.isGreaterThan(ONE_QUADRILLION)
    ? parsedamount.toExponential(2).toString().replace('e+', 'ᴇ')
    : parsedamount.isGreaterThanOrEqualTo(ONE_HUNDRED_THOUSAND)
      ? formatCryptoValFrom100Kto1Quadrillion(parsedamount)
      : formatCryptoValUnder100K(parsedamount)
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
