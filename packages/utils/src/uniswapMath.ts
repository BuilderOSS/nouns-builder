import { isqrt } from './isqrt'
/**
 * Uniswap v3/v4 math utilities for precise price and swap calculations
 * All computations use bigint to avoid floating point precision loss
 */

const Q96 = 2n ** 96n
const Q192 = Q96 * Q96

/**
 * Safely compute 10^n as bigint
 */
export function pow10(decimals: number): bigint {
  return 10n ** BigInt(decimals)
}

/**
 * Compute price ratio from sqrtPriceX96
 * Returns { numerator, denominator } representing token1/token0 price in raw amounts
 *
 * Formula: price = (sqrtPriceX96 / 2^96)^2 = sqrtPriceX96^2 / 2^192
 * This gives token1Raw / token0Raw
 */
export function priceRatioFromSqrtX96(sqrtPriceX96: bigint): {
  numerator: bigint
  denominator: bigint
} {
  const numerator = sqrtPriceX96 * sqrtPriceX96
  const denominator = Q192
  return { numerator, denominator }
}

/**
 * Convert raw price ratio to human-readable price
 * Adjusts for token decimals and returns price as a string
 *
 * @param sqrtPriceX96 - The sqrtPriceX96 value from the pool
 * @param decimals0 - Decimals of token0
 * @param decimals1 - Decimals of token1
 * @returns Price of token1 in terms of token0 (human units)
 */
export function price1Per0FromSqrtX96(
  sqrtPriceX96: bigint,
  decimals0: number,
  decimals1: number
): { numerator: bigint; denominator: bigint } {
  const { numerator: priceNumerator, denominator: priceDenominator } =
    priceRatioFromSqrtX96(sqrtPriceX96)

  // Adjust for decimals: humanPrice = priceRaw * 10^decimals0 / 10^decimals1
  const decimalAdjustment = decimals0 - decimals1

  if (decimalAdjustment >= 0) {
    return {
      numerator: priceNumerator * pow10(decimalAdjustment),
      denominator: priceDenominator,
    }
  } else {
    return {
      numerator: priceNumerator,
      denominator: priceDenominator * pow10(-decimalAdjustment),
    }
  }
}

/**
 * Format a rational number as a fixed-decimal string (e.g. for USD).
 * Rounds HALF-UP at the requested number of fractional digits.
 */
export function formatFixed(
  numerator: bigint,
  denominator: bigint,
  fractionalDigits: number
): string {
  if (denominator === 0n) return 'Infinity'
  const isNegative = numerator < 0n !== denominator < 0n
  let n = numerator < 0n ? -numerator : numerator
  let d = denominator < 0n ? -denominator : denominator

  const scale = 10n ** BigInt(fractionalDigits)
  // scaled = n/d * scale, with half-up rounding
  const scaledTimesD = n * scale
  const q = scaledTimesD / d
  const r = scaledTimesD % d
  const rounded = r * 2n >= d ? q + 1n : q

  const intPart = rounded / scale
  const fracPart = (rounded % scale).toString().padStart(fractionalDigits, '0')
  return (
    (isNegative ? '-' : '') +
    intPart.toString() +
    (fractionalDigits > 0 ? `.${fracPart}` : '')
  )
}

/**
 * Format a rational number (numerator/denominator) as a decimal string
 * with adaptive precision (shows significant digits, not always 8 decimals)
 *
 * @param numerator - Numerator of the rational
 * @param denominator - Denominator of the rational
 * @param maxSignificantDigits - Maximum significant digits to show (default 8)
 * @returns Formatted decimal string
 */
export function formatRational(
  numerator: bigint,
  denominator: bigint,
  maxSignificantDigits: number = 8
): string {
  if (denominator === 0n) return 'Infinity'
  if (numerator === 0n) return '0'

  const isNegative = numerator < 0n !== denominator < 0n
  let n = numerator < 0n ? -numerator : numerator
  let d = denominator < 0n ? -denominator : denominator

  // Integer part
  const integerPart = n / d
  let remainder = n % d

  let result = integerPart.toString()
  let significantDigits = integerPart === 0n ? 0 : result.length

  // If integer part already exceeds significant digits, round there
  if (significantDigits >= maxSignificantDigits) {
    const factor = 10n ** BigInt(significantDigits - maxSignificantDigits)
    const rounded = ((integerPart + factor / 2n) / factor) * factor
    return (isNegative ? '-' : '') + rounded.toString()
  }

  if (remainder === 0n) {
    return (isNegative ? '-' : '') + result
  }

  result += '.'

  const decimals: string[] = []

  while (remainder > 0n && significantDigits < maxSignificantDigits) {
    remainder *= 10n
    const digit = remainder / d
    remainder %= d

    decimals.push(digit.toString())

    // Only count significant digits once we hit nonzero
    if (digit !== 0n || significantDigits > 0) {
      significantDigits++
    }
  }

  // Round last digit if needed
  if (remainder * 2n >= d && decimals.length > 0) {
    let i = decimals.length - 1
    while (i >= 0) {
      const val = BigInt(decimals[i]) + 1n
      if (val < 10n) {
        decimals[i] = val.toString()
        break
      } else {
        decimals[i] = '0'
        i--
      }
    }

    // Carry into integer part
    if (i < 0) {
      const newInt = BigInt(integerPart) + 1n
      result = newInt.toString() + '.'
    }
  }

  // Trim trailing zeros
  while (decimals.length > 0 && decimals[decimals.length - 1] === '0') {
    decimals.pop()
  }

  const final = decimals.length > 0 ? result + decimals.join('') : result.slice(0, -1) // remove trailing dot

  return (isNegative ? '-' : '') + final
}

/**
 * Format a token amount from raw bigint to human-readable string
 *
 * @param rawAmount - Raw token amount (smallest unit)
 * @param decimals - Token decimals
 * @param sigFigs - Significant figures to display (default 6)
 * @returns Formatted amount string
 */
export function formatAmount(
  rawAmount: bigint,
  decimals: number,
  sigFigs: number = 6
): string {
  const divisor = pow10(decimals)
  return formatRational(rawAmount, divisor, sigFigs)
}

/**
 * Format USD value with commas and 2 decimal places
 */
export function formatUsd(value: bigint, decimals: number = 0): string {
  // USD should be fixed 2 decimals (not significant digits).
  const formatted =
    decimals > 0 ? formatFixed(value, pow10(decimals), 2) : formatFixed(value, 1n, 2)
  const [intPart, decPart] = formatted.split('.')

  // Add commas to integer part
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas
}

/**
 * Format USD value from rational number with adaptive precision
 * - If >= $1: 2 decimals with commas (e.g., "$1,234.56")
 * - If $0.01 <= value < $1: 4 decimals (e.g., "$0.0789")
 * - If < $0.01: 6 significant figures (e.g., "$0.00079")
 */
export function formatUsdFromRational(numerator: bigint, denominator: bigint): string {
  if (denominator === 0n) return 'Infinity'
  if (numerator === 0n) return '0.00'

  // Check if value >= 1
  if (numerator >= denominator) {
    // Use 2 decimals with commas
    const fixed = formatFixed(numerator, denominator, 2)
    const [intPart, decPart] = fixed.split('.')
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return decPart ? `${withCommas}.${decPart}` : withCommas
  }

  // Check if value >= 0.01
  if (numerator * 100n >= denominator) {
    // Use 4 decimals
    return formatFixed(numerator, denominator, 4)
  }

  // value < 0.01: Use 6 significant figures
  return formatRational(numerator, denominator, 6)
}

/**
 * Get human-readable price from sqrtPriceX96 considering token order
 * Returns price of base token in terms of quote token
 *
 * @param sqrtPriceX96 - The sqrtPriceX96 from the pool
 * @param baseTokenDecimals - Base token decimals
 * @param quoteTokenDecimals - Quote token decimals
 * @param baseIsToken0 - True if base token is token0 in the pool
 * @returns Formatted price string (quote per base)
 */
export function humanPriceQuotePerBase(
  sqrtPriceX96: bigint,
  baseTokenDecimals: number,
  quoteTokenDecimals: number,
  baseIsToken0: boolean
): string {
  if (baseIsToken0) {
    // base = token0, quote = token1
    // We want quote/base = token1/token0, which is what sqrtPriceX96 gives us
    const { numerator, denominator } = price1Per0FromSqrtX96(
      sqrtPriceX96,
      baseTokenDecimals,
      quoteTokenDecimals
    )
    return formatRational(numerator, denominator)
  } else {
    // base = token1, quote = token0
    // We want quote/base = token0/token1, which is the inverse
    const { numerator, denominator } = price1Per0FromSqrtX96(
      sqrtPriceX96,
      quoteTokenDecimals,
      baseTokenDecimals
    )
    return formatRational(denominator, numerator)
  }
}

/**
 * Compute sqrtPriceX96 from human price (quote per base)
 *
 * @param humanPrice - Price in human units (quote per base)
 * @param baseTokenDecimals - Base token decimals
 * @param quoteTokenDecimals - Quote token decimals
 * @param baseIsToken0 - True if base token is token0
 * @returns sqrtPriceX96
 */
export function sqrtPriceX96FromHumanPrice(
  humanPrice: bigint,
  humanPriceDecimals: number,
  baseTokenDecimals: number,
  quoteTokenDecimals: number,
  baseIsToken0: boolean
): bigint {
  return sqrtPriceX96FromRational(
    humanPrice,
    1n,
    humanPriceDecimals,
    baseTokenDecimals,
    quoteTokenDecimals,
    baseIsToken0
  )
}

/**
 * Calculate target sqrtPriceX96 from target market cap
 *
 * @param totalSupply - Total supply in raw units (bigint)
 * @param baseTokenDecimals - Base token decimals
 * @param targetMarketCapUsd - Target market cap in USD (as bigint with usdDecimals)
 * @param usdDecimals - Decimals for USD value (e.g., 6 for micro-dollars)
 * @param quoteTokenUsdPrice - Quote token price in USD (as bigint with usdDecimals)
 * @param quoteTokenDecimals - Quote token decimals
 * @param baseIsToken0 - True if base is token0
 * @returns sqrtPriceX96
 */
export function targetSqrtPriceX96FromMarketCap(params: {
  totalSupply: bigint
  baseTokenDecimals: number
  targetMarketCapUsd: bigint
  usdDecimals: number
  quoteTokenUsdPrice: bigint
  quoteTokenDecimals: number
  baseIsToken0: boolean
}): bigint {
  const {
    totalSupply,
    baseTokenDecimals,
    targetMarketCapUsd,
    usdDecimals,
    quoteTokenUsdPrice,
    quoteTokenDecimals,
    baseIsToken0,
  } = params

  // targetPriceUsd = targetMarketCapUsd / (totalSupply / 10^baseDecimals)
  //                = targetMarketCapUsd * 10^baseDecimals / totalSupply
  // All in USD units with usdDecimals decimals
  const targetPriceUsdNumerator = targetMarketCapUsd * pow10(baseTokenDecimals)
  const targetPriceUsdDenominator = totalSupply

  // targetPriceQuote = targetPriceUsd / quoteTokenUsdPrice

  // If quoteTokenUsdPrice is also scaled by 10^usdDecimals, then:
  // quote/base = (targetPriceUsd / 10^usdDecimals) / (quoteUsd / 10^usdDecimals)
  //            = targetPriceUsd / quoteUsd
  // BUT our targetPriceUsdNumerator/Denominator is still in "scaled USD" units,
  // so we must multiply numerator by 10^usdDecimals to preserve the intended decimal scale.
  // Result is quote/base with usdDecimals decimals.
  const targetPriceQuoteNumerator = targetPriceUsdNumerator * pow10(usdDecimals)
  const targetPriceQuoteDenominator = targetPriceUsdDenominator * quoteTokenUsdPrice

  // Now convert to sqrtPriceX96
  // We have quote per base with usdDecimals decimals
  return sqrtPriceX96FromRational(
    targetPriceQuoteNumerator,
    targetPriceQuoteDenominator,
    usdDecimals,
    baseTokenDecimals,
    quoteTokenDecimals,
    baseIsToken0
  )
}

/**
 * Helper: sqrtPriceX96 from rational price
 */
function sqrtPriceX96FromRational(
  priceNumerator: bigint,
  priceDenominator: bigint,
  priceDecimals: number,
  baseTokenDecimals: number,
  quoteTokenDecimals: number,
  baseIsToken0: boolean
): bigint {
  // price is quote/base with priceDecimals decimals
  // Convert to raw price (token1/token0)

  let rawPriceNumerator: bigint
  let rawPriceDenominator: bigint

  if (baseIsToken0) {
    // rawPrice = token1/token0 = quote/base
    // priceHuman = (quote/base) = token1Human/token0Human
    // priceRaw   = token1Raw/token0Raw
    // priceHuman = priceRaw * 10^(dec0-dec1)  =>  priceRaw = priceHuman * 10^(dec1-dec0)
    // => raw = (priceNumerator/priceDenominator) * 10^quoteDecimals / (10^baseDecimals * 10^priceDecimals)
    rawPriceNumerator = priceNumerator * pow10(quoteTokenDecimals)
    rawPriceDenominator = priceDenominator * pow10(baseTokenDecimals + priceDecimals)
  } else {
    // rawPrice = token1/token0 = base/quote = 1/(quote/base)
    // If base is token1 and quote is token0, then token1/token0 = base/quote = 1/(quote/base).
    // Invert the human quote/base and apply the same raw conversion.
    // raw = (priceDen/priceNum) * 10^baseDecimals / (10^quoteDecimals * 10^priceDecimals)
    rawPriceNumerator = priceDenominator * pow10(baseTokenDecimals)
    rawPriceDenominator = priceNumerator * pow10(quoteTokenDecimals + priceDecimals)
  }

  // sqrtPriceX96^2 = rawPrice * 2^192
  // => sqrtPriceX96 = floor( sqrt( (rawNum * 2^192) / rawDen ) )
  // Doing one division before sqrt is much less lossy than sqrt(num)/sqrt(den).
  const scaled = (rawPriceNumerator * Q192) / rawPriceDenominator

  // Guard against underflow: if scaled is 0, the target price is too small
  if (scaled === 0n) {
    throw new Error(
      `Target price too small: results in sqrtPriceX96 underflow. ` +
        `rawPriceNumerator=${rawPriceNumerator}, rawPriceDenominator=${rawPriceDenominator}`
    )
  }

  return isqrt(scaled)
}

/**
 * Validate tick is a multiple of tickSpacing
 */
export function isValidTick(tick: number, tickSpacing: number): boolean {
  return tick % tickSpacing === 0
}

/**
 * Snap tick to nearest valid tick for the given spacing
 */
export function snapTickToSpacing(tick: number, tickSpacing: number): number {
  return Math.round(tick / tickSpacing) * tickSpacing
}
