import { Address, encodeFunctionData, Hex } from 'viem'

import { batchLockupAbi } from './constants'
import { toUD2x18 } from './math'

/**
 * Validates that exponent is within valid UD2x18 range
 * UD2x18 is backed by uint64 with 18 decimals, max value is ~18.446744073709551615
 * @throws Error if exponent is out of range
 */
function validateExponent(exponent: number): void {
  const UD2X18_MAX = 18.446744073709551615

  if (!Number.isFinite(exponent)) {
    throw new Error(`Exponent must be a finite number, got ${exponent}`)
  }

  if (exponent < 0) {
    throw new Error(`Exponent must be non-negative (UD2x18 is unsigned), got ${exponent}`)
  }

  if (exponent > UD2X18_MAX) {
    throw new Error(
      `Exponent must not exceed ${UD2X18_MAX} (UD2x18 maximum), got ${exponent}`
    )
  }
}

export interface CreateWithDurationsLLParams {
  sender: Address
  recipient: Address
  depositAmount: bigint
  cliffDuration: number // in seconds
  totalDuration: number // in seconds
}

export interface CreateWithDurationsLDParams {
  sender: Address
  recipient: Address
  depositAmount: bigint
  totalDuration: number // in seconds
  exponent: number // Exponent for exponential curve (UD2x18: 0 to ~18.446744073709551615)
}

export interface CreateWithTimestampsLLParams {
  sender: Address
  recipient: Address
  depositAmount: bigint
  startTime: number // unix timestamp
  cliffTime: number // unix timestamp (0 if no cliff)
  endTime: number // unix timestamp
}

export interface CreateWithTimestampsLDParams {
  sender: Address
  recipient: Address
  depositAmount: bigint
  startTime: number // unix timestamp
  endTime: number // unix timestamp
  exponent: number // Exponent for exponential curve (UD2x18: 0 to ~18.446744073709551615)
}

/**
 * Encode createWithDurationsLL calldata for batch stream creation
 */
export function encodeCreateWithDurationsLL(
  lockupLinearAddress: Address,
  tokenAddress: Address,
  streams: CreateWithDurationsLLParams[],
  cancelable: boolean = true,
  transferable: boolean = false
): Hex {
  const batch = streams.map((stream) => {
    // Determine shape based on whether there's a cliff
    // Using Sablier's Lockup enum values for proper display in their UI
    const shape = stream.cliffDuration > 0 ? 'cliff' : 'linear'

    return {
      sender: stream.sender,
      recipient: stream.recipient,
      depositAmount: stream.depositAmount,
      cancelable,
      transferable,
      durations: {
        cliff: stream.cliffDuration,
        total: stream.totalDuration,
      },
      unlockAmounts: {
        start: 0n,
        cliff: 0n,
      },
      shape,
    }
  })

  return encodeFunctionData({
    abi: batchLockupAbi,
    functionName: 'createWithDurationsLL',
    args: [lockupLinearAddress, tokenAddress, batch],
  })
}

/**
 * Encode createWithTimestampsLL calldata for batch stream creation
 */
export function encodeCreateWithTimestampsLL(
  lockupLinearAddress: Address,
  tokenAddress: Address,
  streams: CreateWithTimestampsLLParams[],
  cancelable: boolean = true,
  transferable: boolean = false
): Hex {
  const batch = streams.map((stream) => {
    // Determine shape based on whether there's a cliff
    // Using Sablier's Lockup enum values for proper display in their UI
    const shape = stream.cliffTime > 0 ? 'cliff' : 'linear'

    return {
      sender: stream.sender,
      recipient: stream.recipient,
      depositAmount: stream.depositAmount,
      cancelable,
      transferable,
      timestamps: {
        start: stream.startTime,
        end: stream.endTime,
      },
      cliffTime: stream.cliffTime,
      unlockAmounts: {
        start: 0n,
        cliff: 0n,
      },
      shape,
    }
  })

  return encodeFunctionData({
    abi: batchLockupAbi,
    functionName: 'createWithTimestampsLL',
    args: [lockupLinearAddress, tokenAddress, batch],
  })
}

/**
 * Encode createWithDurationsLD calldata for batch exponential stream creation
 */
export function encodeCreateWithDurationsLD(
  lockupDynamicAddress: Address,
  tokenAddress: Address,
  streams: CreateWithDurationsLDParams[],
  cancelable: boolean = true,
  transferable: boolean = false
): Hex {
  const batch = streams.map((stream) => {
    // Validate exponent is within UD2x18 range before encoding
    validateExponent(stream.exponent)

    // Convert exponent to UD2x18 format
    const exponentUD2x18 = toUD2x18(stream.exponent)

    // Build segment for exponential curve
    // Single segment: full amount at end with exponent
    const segments = [
      {
        amount: stream.depositAmount,
        exponent: exponentUD2x18,
        duration: stream.totalDuration,
      },
    ]

    return {
      sender: stream.sender,
      recipient: stream.recipient,
      depositAmount: stream.depositAmount,
      cancelable,
      transferable,
      segmentsWithDuration: segments,
      shape: 'dynamicExponential',
    }
  })

  return encodeFunctionData({
    abi: batchLockupAbi,
    functionName: 'createWithDurationsLD',
    args: [lockupDynamicAddress, tokenAddress, batch],
  })
}

/**
 * Encode createWithTimestampsLD calldata for batch exponential stream creation
 */
export function encodeCreateWithTimestampsLD(
  lockupDynamicAddress: Address,
  tokenAddress: Address,
  streams: CreateWithTimestampsLDParams[],
  cancelable: boolean = true,
  transferable: boolean = false
): Hex {
  const batch = streams.map((stream) => {
    // Validate exponent is within UD2x18 range before encoding
    validateExponent(stream.exponent)

    // Convert exponent to UD2x18 format
    const exponentUD2x18 = toUD2x18(stream.exponent)

    // Build segment for exponential curve
    // Single segment: full amount at end with exponent
    const segments = [
      {
        amount: stream.depositAmount,
        exponent: exponentUD2x18,
        timestamp: stream.endTime,
      },
    ]

    return {
      sender: stream.sender,
      recipient: stream.recipient,
      depositAmount: stream.depositAmount,
      cancelable,
      transferable,
      startTime: stream.startTime,
      segments: segments,
      shape: 'dynamicExponential',
    }
  })

  return encodeFunctionData({
    abi: batchLockupAbi,
    functionName: 'createWithTimestampsLD',
    args: [lockupDynamicAddress, tokenAddress, batch],
  })
}
