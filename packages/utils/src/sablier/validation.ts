import { AddressType } from '@buildeross/types'
import { isAddress } from 'viem'

export interface StreamValidationParams {
  sender: AddressType
  recipient: AddressType
  depositAmount: bigint
  startTime: number
  endTime: number
  cliffTime: number
  startUnlockAmount: bigint
  cliffUnlockAmount: bigint
  tokenAddress: AddressType
  shape: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const MAX_SHAPE_LENGTH = 32

/**
 * Validates stream parameters based on Sablier's Helpers.sol checkCreateLL requirements
 * See: https://github.com/sablier-labs/lockup/blob/main/src/libraries/Helpers.sol
 */
export function validateSablierStream(params: StreamValidationParams): ValidationResult {
  const errors: string[] = []

  // 1. Common Stream Parameters (_checkCreateStream)

  // Sender address must not be zero
  if (!params.sender || params.sender === ZERO_ADDRESS || !isAddress(params.sender)) {
    errors.push('Sender address must be a valid non-zero address')
  }

  // Recipient address must not be zero
  if (
    !params.recipient ||
    params.recipient === ZERO_ADDRESS ||
    !isAddress(params.recipient)
  ) {
    errors.push('Recipient address must be a valid non-zero address')
  }

  // Deposit amount must be non-negative and exceed zero
  if (typeof params.depositAmount !== 'bigint') {
    errors.push('Deposit amount must be a valid BigInt')
  } else if (params.depositAmount < 0n) {
    errors.push('Deposit amount cannot be negative')
  } else if (params.depositAmount <= 0n) {
    errors.push('Deposit amount must be greater than zero')
  }

  // Start unlock amount must be non-negative
  if (typeof params.startUnlockAmount !== 'bigint') {
    errors.push('Start unlock amount must be a valid BigInt')
  } else if (params.startUnlockAmount < 0n) {
    errors.push('Start unlock amount cannot be negative')
  }

  // Cliff unlock amount must be non-negative
  if (typeof params.cliffUnlockAmount !== 'bigint') {
    errors.push('Cliff unlock amount must be a valid BigInt')
  } else if (params.cliffUnlockAmount < 0n) {
    errors.push('Cliff unlock amount cannot be negative')
  }

  // Token address must be a valid non-zero address
  // Note: Native ETH should be wrapped to WETH before calling this validation
  if (!params.tokenAddress || !isAddress(params.tokenAddress)) {
    errors.push('Token address must be a valid ERC20 address')
  } else if (params.tokenAddress === ZERO_ADDRESS) {
    errors.push('Token address cannot be the zero address')
  }

  // 2. Linear-Specific Validations (_checkTimestampsAndUnlockAmounts)

  // Validate timestamp types and non-negativity
  if (!Number.isFinite(params.startTime)) {
    errors.push('Start time must be a valid number')
  } else if (params.startTime < 0) {
    errors.push('Start time cannot be negative')
  } else if (params.startTime === 0) {
    errors.push('Start time must not be zero')
  }

  if (!Number.isFinite(params.endTime)) {
    errors.push('End time must be a valid number')
  } else if (params.endTime < 0) {
    errors.push('End time cannot be negative')
  }

  if (!Number.isFinite(params.cliffTime)) {
    errors.push('Cliff time must be a valid number')
  } else if (params.cliffTime < 0) {
    errors.push('Cliff time cannot be negative')
  }

  // Timestamp ordering validations (only if all timestamps are valid numbers)
  if (
    Number.isFinite(params.startTime) &&
    Number.isFinite(params.endTime) &&
    params.startTime >= 0 &&
    params.endTime >= 0
  ) {
    // Start time must be strictly less than end time
    if (params.startTime >= params.endTime) {
      errors.push('Start time must be before end time')
    }
  }

  // When cliff time is non-zero
  if (
    Number.isFinite(params.cliffTime) &&
    params.cliffTime >= 0 &&
    params.cliffTime > 0
  ) {
    // Start time must be strictly less than cliff time
    if (
      Number.isFinite(params.startTime) &&
      params.startTime >= 0 &&
      params.startTime >= params.cliffTime
    ) {
      errors.push('Start time must be before cliff time')
    }

    // Cliff time must be strictly less than end time
    if (
      Number.isFinite(params.endTime) &&
      params.endTime >= 0 &&
      params.cliffTime >= params.endTime
    ) {
      errors.push('Cliff time must be before end time')
    }
  } else if (params.cliffTime === 0) {
    // When cliff time is zero, the cliff unlock amount must also be zero
    if (typeof params.cliffUnlockAmount === 'bigint' && params.cliffUnlockAmount > 0n) {
      errors.push('Cliff unlock amount must be zero when cliff time is zero')
    }
  }

  // Shape validation
  if (typeof params.shape !== 'string') {
    errors.push('Shape must be a string')
  } else {
    const trimmedShape = params.shape.trim()
    const byteLen = new TextEncoder().encode(trimmedShape).length
    if (byteLen > MAX_SHAPE_LENGTH) {
      errors.push(
        `Shape must be less than ${MAX_SHAPE_LENGTH} bytes (currently ${byteLen} bytes)`
      )
    }
  }

  // Combined start and cliff unlock amounts cannot exceed the deposit amount
  if (
    typeof params.startUnlockAmount === 'bigint' &&
    typeof params.cliffUnlockAmount === 'bigint' &&
    typeof params.depositAmount === 'bigint'
  ) {
    const totalUnlockAmount = params.startUnlockAmount + params.cliffUnlockAmount
    if (totalUnlockAmount > params.depositAmount) {
      errors.push('Combined unlock amounts cannot exceed deposit amount')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates batch stream creation
 */
export function validateBatchStreams(
  streams: StreamValidationParams[]
): ValidationResult {
  const errors: string[] = []

  if (streams.length === 0) {
    errors.push('At least one stream is required')
  }

  // Validate each stream
  streams.forEach((stream, index) => {
    const result = validateSablierStream(stream)
    if (!result.isValid) {
      result.errors.forEach((error) => {
        errors.push(`Stream #${index + 1}: ${error}`)
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}
