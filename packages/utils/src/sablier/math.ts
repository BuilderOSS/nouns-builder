/**
 * TypeScript port of calculateStreamedAmountLD (Solidity).
 *
 */

import Decimal from 'decimal.js'

export type Segment = {
  timestamp: number // uint40 in solidity
  amount: bigint // uint128 in solidity (token base units, e.g. wei)
  exponent: number // used as fixed-point exponent; keep as number here
}

/**
 * Floors a Decimal and returns bigint (like Solidity's uint cast truncation).
 * Assumes d >= 0.
 */
function floorDecimalToBigint(d: Decimal): bigint {
  if (!d.isFinite() || d.isNeg()) throw new Error('Invalid number for uint conversion')
  // Use a non-exponential integer string to avoid scientific notation.
  return BigInt(d.floor().toFixed(0))
}

/**
 * Calculates the streamed amount for Lockup Dynamic (LD) streams.
 *
 * @param depositedAmount uint128 (base units)
 * @param endTime         uint40
 * @param segments        ordered ascending by timestamp; last timestamp == endTime; first > startTime
 * @param startTime       uint40
 * @param withdrawnAmount uint128 (unused for return value; kept for signature compatibility)
 * @param now             uint40
 */
export function calculateStreamedAmountLD(params: {
  depositedAmount: bigint
  endTime: number
  segments: Segment[]
  startTime: number
  withdrawnAmount: bigint
  now: number
}): bigint {
  const { depositedAmount, endTime, segments, startTime, now } = params

  // If the start time is in the future, return zero.
  if (startTime > now) return 0n

  // If the end time is not in the future, return the deposited amount.
  if (endTime <= now) return depositedAmount

  if (segments.length === 0) throw new Error('segments cannot be empty')

  // Sum the amounts in all segments that precede the block timestamp.
  let previousSegmentAmounts = 0n

  let index = 0
  let currentSegmentTimestamp = segments[0].timestamp

  // Mirrors Solidity assumptions: there exists a segment timestamp >= now.
  while (currentSegmentTimestamp < now) {
    previousSegmentAmounts += segments[index].amount
    index += 1
    if (index >= segments.length) {
      // Defensive guard (Solidity relies on invariants to avoid OOB)
      return depositedAmount
    }
    currentSegmentTimestamp = segments[index].timestamp
  }

  // Current segment is at `index`.
  const currentSegmentAmountBase = segments[index].amount
  const currentSegmentExponent = segments[index].exponent
  currentSegmentTimestamp = segments[index].timestamp

  const previousTimestamp = index === 0 ? startTime : segments[index - 1].timestamp

  const elapsedTime = now - previousTimestamp
  const segmentDuration = currentSegmentTimestamp - previousTimestamp

  if (segmentDuration <= 0) {
    throw new Error(
      'Invalid segmentDuration (timestamps must be strictly increasing and > startTime)'
    )
  }

  // elapsedTimePercentage = elapsedTime / segmentDuration
  const elapsedTimePercentage = new Decimal(elapsedTime).div(segmentDuration)

  // multiplier = (elapsedTimePercentage ^ exponent)
  const multiplier = elapsedTimePercentage.pow(currentSegmentExponent)

  // streamed in base units:
  // streamedBase = floor(multiplier * currentSegmentAmountBase)
  //
  // We do this with Decimal to avoid bigint->number overflow/precision issues.
  const amountBaseDec = new Decimal(currentSegmentAmountBase.toString())
  const segmentStreamedBaseDec = multiplier.mul(amountBaseDec)

  // If streamed amount exceeds segment amount, void current segment.
  // IMPORTANT: return *total streamed so far* only (do NOT mix in withdrawnAmount).
  if (segmentStreamedBaseDec.gt(amountBaseDec)) {
    // Pure “total streamed” semantic, matching the normal path’s meaning.
    return previousSegmentAmounts
  }

  const segmentStreamedAmountBase = floorDecimalToBigint(segmentStreamedBaseDec)

  return previousSegmentAmounts + segmentStreamedAmountBase
}
/**
 * Port of calculateStreamedAmountLL() to TypeScript bigint arithmetic.
 *
 * Notes:
 * - Uses integer division (floor) for the percentage multiplication.
 * - Mirrors the Solidity branching and safety checks.
 */
export function calculateStreamedAmountLL(params: {
  now: number
  cliffTime: number
  depositedAmount: bigint
  endTime: number
  startTime: number
  unlockStart: bigint
  unlockCliff: bigint
  withdrawnAmount: bigint
}): bigint {
  const {
    now,
    cliffTime,
    depositedAmount,
    endTime,
    startTime,
    unlockStart,
    unlockCliff,
    withdrawnAmount,
  } = params

  // If the start time is in the future, return zero.
  if (startTime > now) return 0n

  // If the cliff time is in the future, return the start unlock amount.
  if (cliffTime > now) return unlockStart

  // If the end time is not in the future, return the deposited amount.
  if (endTime <= now) return depositedAmount

  const unlockSum = unlockStart + unlockCliff

  // Safety: if unlock sum >= deposited, streamed is deposited.
  if (unlockSum >= depositedAmount) return depositedAmount

  // Determine elapsed time + range depending on whether cliffTime is "disabled" (0)
  let elapsed: bigint
  let range: bigint

  if (cliffTime === 0) {
    elapsed = BigInt(now - startTime)
    range = BigInt(endTime - startTime)
  } else {
    elapsed = BigInt(now - cliffTime)
    range = BigInt(endTime - cliffTime)
  }

  // Defensive: avoid division by zero (shouldn’t happen if times are valid)
  if (range <= 0n) return unlockSum

  const streamableAmount = depositedAmount - unlockSum

  // unlockSum + (elapsed/range) * streamableAmount  (all integer math)
  const streamed = unlockSum + (elapsed * streamableAmount) / range

  // Solidity safety: if streamed > deposited, return withdrawnAmount (freeze)
  if (streamed > depositedAmount) return withdrawnAmount

  return streamed
}

const WAD = 10n ** 18n

export function toUD2x18(value: string | number): bigint {
  // Convert to string without going through floating math where possible
  // NOTE: For true decimal safety, prefer passing a string from the UI.
  const s = typeof value === 'number' ? String(value) : value

  if (!/^\d+(\.\d+)?$/.test(s)) {
    throw new Error(`Invalid decimal: ${s}`)
  }

  const [whole, frac = ''] = s.split('.')
  if (frac.length > 18) {
    throw new Error(`Too many decimal places (max 18): ${s}`)
  }

  const fracPadded = (frac + '0'.repeat(18)).slice(0, 18)

  return BigInt(whole) * WAD + BigInt(fracPadded)
}
