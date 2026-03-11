import { Address, encodeFunctionData, Hex } from 'viem'

import { batchLockupAbi, factoryMerkleInstantAbi, factoryMerkleLLAbi } from './constants'
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

export interface CreateMerkleInstantParams {
  campaignName: string
  campaignStartTime: number
  expiration: number
  initialAdmin: Address
  ipfsCID: string
  merkleRoot: `0x${string}`
  token: Address
}

export interface CreateMerkleLLParams {
  campaignName: string
  campaignStartTime: number
  cancelable: boolean
  cliffDuration: number
  cliffUnlockPercentage: bigint
  expiration: number
  initialAdmin: Address
  ipfsCID: string
  lockup: Address
  merkleRoot: `0x${string}`
  shape: string
  startUnlockPercentage: bigint
  token: Address
  totalDuration: number
  transferable: boolean
  vestingStartTime: number
}

function validateUint40(value: number, name: string): void {
  const UINT40_MAX = 1_099_511_627_775

  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be an integer, got ${value}`)
  }

  if (value < 0 || value > UINT40_MAX) {
    throw new Error(`${name} must be between 0 and ${UINT40_MAX}, got ${value}`)
  }
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

/**
 * Encode createMerkleInstant calldata for Sablier airdrops factory
 */
export function encodeCreateMerkleInstant(
  params: CreateMerkleInstantParams,
  aggregateAmount: bigint,
  recipientCount: bigint
): Hex {
  validateUint40(params.campaignStartTime, 'campaignStartTime')
  validateUint40(params.expiration, 'expiration')

  return encodeFunctionData({
    abi: factoryMerkleInstantAbi,
    functionName: 'createMerkleInstant',
    args: [
      {
        campaignName: params.campaignName,
        campaignStartTime: params.campaignStartTime,
        expiration: params.expiration,
        initialAdmin: params.initialAdmin,
        ipfsCID: params.ipfsCID,
        merkleRoot: params.merkleRoot,
        token: params.token,
      },
      aggregateAmount,
      recipientCount,
    ],
  })
}

/**
 * Encode createMerkleLL calldata for Sablier airdrops factory
 */
export function encodeCreateMerkleLL(
  params: CreateMerkleLLParams,
  aggregateAmount: bigint,
  recipientCount: bigint
): Hex {
  validateUint40(params.campaignStartTime, 'campaignStartTime')
  validateUint40(params.cliffDuration, 'cliffDuration')
  validateUint40(params.expiration, 'expiration')
  validateUint40(params.totalDuration, 'totalDuration')
  validateUint40(params.vestingStartTime, 'vestingStartTime')

  return encodeFunctionData({
    abi: factoryMerkleLLAbi,
    functionName: 'createMerkleLL',
    args: [
      {
        campaignName: params.campaignName,
        campaignStartTime: params.campaignStartTime,
        cancelable: params.cancelable,
        cliffDuration: params.cliffDuration,
        cliffUnlockPercentage: params.cliffUnlockPercentage,
        expiration: params.expiration,
        initialAdmin: params.initialAdmin,
        ipfsCID: params.ipfsCID,
        lockup: params.lockup,
        merkleRoot: params.merkleRoot,
        shape: params.shape,
        startUnlockPercentage: params.startUnlockPercentage,
        token: params.token,
        totalDuration: params.totalDuration,
        transferable: params.transferable,
        vestingStartTime: params.vestingStartTime,
      },
      aggregateAmount,
      recipientCount,
    ],
  })
}
