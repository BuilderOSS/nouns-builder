/**
 * Time conversion utilities for converting between seconds (BigInt/number) and
 * the DaysHoursMinsSecs component structure
 */

import { Duration } from '@buildeross/types'

export interface TimeStructure {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/**
 * Converts a Duration (with optional fields) to a TimeStructure (with required fields)
 * @param duration - Duration with optional fields
 * @returns TimeStructure with all fields defined
 */
export const durationToTimeStructure = (duration?: Duration): TimeStructure => {
  return {
    days: duration?.days ?? 0,
    hours: duration?.hours ?? 0,
    minutes: duration?.minutes ?? 0,
    seconds: duration?.seconds ?? 0,
  }
}

/**
 * Converts a BigInt representing seconds to a TimeStructure
 * @param totalSeconds - Total seconds as BigInt
 * @returns TimeStructure with days, hours, minutes, seconds
 */
export const bigIntSecondsToTimeStructure = (totalSeconds: bigint): TimeStructure => {
  const total = Number(totalSeconds)
  return numberSecondsToTimeStructure(total)
}

/**
 * Converts a number representing seconds to a TimeStructure
 * @param totalSeconds - Total seconds as number
 * @returns TimeStructure with days, hours, minutes, seconds
 */
export const numberSecondsToTimeStructure = (totalSeconds: number): TimeStructure => {
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  return { days, hours, minutes, seconds }
}

/**
 * Converts a TimeStructure to total seconds as BigInt
 * @param time - TimeStructure with days, hours, minutes, seconds
 * @returns Total seconds as BigInt
 */
export const timeStructureToBigIntSeconds = (time: TimeStructure): bigint => {
  // Handle empty/undefined values
  const days = time.days || 0
  const hours = time.hours || 0
  const minutes = time.minutes || 0
  const seconds = time.seconds || 0

  const total = days * 86400 + hours * 3600 + minutes * 60 + seconds
  return BigInt(total)
}

/**
 * Converts a TimeStructure to total seconds as number
 * @param time - TimeStructure with days, hours, minutes, seconds
 * @returns Total seconds as number
 */
export const timeStructureToNumberSeconds = (time: TimeStructure): number => {
  // Handle empty/undefined values
  const days = time.days || 0
  const hours = time.hours || 0
  const minutes = time.minutes || 0
  const seconds = time.seconds || 0

  return days * 86400 + hours * 3600 + minutes * 60 + seconds
}
