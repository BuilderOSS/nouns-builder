/**
 * Calculate integer square root of a bigint using Newton's method
 * @param n - The number to calculate the square root of
 * @returns The floor of the square root
 */
export function isqrt(n: bigint): bigint {
  if (n < 0n) throw new RangeError('square root of negative numbers is not supported')
  if (n < 2n) return n

  // bit length
  const bits = n.toString(2).length
  // initial guess: 2^(ceil(bits/2))
  let x = 1n << BigInt((bits + 1) >> 1)

  while (true) {
    const y = (x + n / x) >> 1n
    if (y === x || y === x - 1n) return y < x ? y : x // ensure floor
    x = y
  }
}
