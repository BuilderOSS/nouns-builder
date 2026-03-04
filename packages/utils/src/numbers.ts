import BigNumber from 'bignumber.js'

export type BigNumberish = BigNumber | bigint | string | number

type DecimalFormatMode = 'round' | 'truncate'

type DecimalFormatOptions = {
  minDecimals: number
  maxDecimals: number
  mode?: DecimalFormatMode
  useGrouping?: boolean
}

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

function formatDecimalValue(
  value: BigNumber | BigNumberish | string,
  { minDecimals, maxDecimals, mode = 'round', useGrouping = false }: DecimalFormatOptions
): string {
  const raw = typeof value === 'string' ? value : value?.toString()
  const parsed = new BigNumber(raw)

  if (!parsed.isFinite()) return '0'

  const roundingMode =
    mode === 'truncate' ? BigNumber.ROUND_DOWN : BigNumber.ROUND_HALF_UP
  const normalized = parsed.decimalPlaces(maxDecimals, roundingMode)

  let [integerPart, fractionalPart = ''] = normalized.toFixed(maxDecimals).split('.')

  fractionalPart = fractionalPart.replace(/0+$/, '')
  if (fractionalPart.length < minDecimals) {
    fractionalPart = fractionalPart.padEnd(minDecimals, '0')
  }

  if (useGrouping) {
    const sign = integerPart.startsWith('-') ? '-' : ''
    const absInteger = sign ? integerPart.slice(1) : integerPart
    integerPart = `${sign}${absInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  }

  return fractionalPart.length > 0 ? `${integerPart}.${fractionalPart}` : integerPart
}

export function formatTokenAmount(value: BigNumber | BigNumberish | string): string {
  const minDecimals = 2
  const maxDecimals = 10
  const mode: DecimalFormatMode = 'truncate'
  const useGrouping = false

  const formatted = formatDecimalValue(value, {
    minDecimals,
    maxDecimals,
    mode,
    useGrouping,
  })

  const raw = typeof value === 'string' ? value : value?.toString()
  const parsed = new BigNumber(raw)
  if (!parsed.isFinite()) return formatted

  const zeroFormatted = formatDecimalValue(0, {
    minDecimals,
    maxDecimals,
    mode,
    useGrouping,
  })

  const threshold = new BigNumber(10).pow(1 - maxDecimals)
  if (
    parsed.isGreaterThan(0) &&
    parsed.isLessThan(threshold) &&
    formatted === zeroFormatted
  ) {
    return `<${threshold.toFixed(Math.max(0, maxDecimals - 1))}`
  }

  return formatted
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
    return `${sign}$${formatDecimalValue(absValue, {
      minDecimals: 2,
      maxDecimals: 2,
      mode: 'round',
      useGrouping: true,
    })}`
  }

  // For prices >= $0.01, use 4 decimals
  if (absValue >= 0.01) {
    return `${sign}$${formatDecimalValue(absValue, {
      minDecimals: 4,
      maxDecimals: 4,
      mode: 'round',
      useGrouping: false,
    })}`
  }

  // For very small prices (< $0.01), show up to 10 decimals
  // This handles values like $0.0000000433 properly.
  const formatted = formatDecimalValue(absValue, {
    minDecimals: 2,
    maxDecimals: 10,
    mode: 'round',
    useGrouping: false,
  })

  return `${sign}$${formatted}`
}
