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

  // Deposit amount must exceed zero
  if (params.depositAmount <= 0n) {
    errors.push('Deposit amount must be greater than zero')
  }

  // Start time must not be zero
  if (params.startTime === 0) {
    errors.push('Start time must not be zero')
  }

  // Token cannot be the zero address
  // Note: Native ETH should be wrapped to WETH before calling this validation
  if (!params.tokenAddress || params.tokenAddress === ZERO_ADDRESS) {
    errors.push('Token address must be a valid ERC20 token')
  }

  // 2. Linear-Specific Validations (_checkTimestampsAndUnlockAmounts)

  // Start time must be strictly less than end time
  if (params.startTime >= params.endTime) {
    errors.push('Start time must be before end time')
  }

  // When cliff time is non-zero
  if (params.cliffTime > 0) {
    // Start time must be strictly less than cliff time
    if (params.startTime >= params.cliffTime) {
      errors.push('Start time must be before cliff time')
    }

    // Cliff time must be strictly less than end time
    if (params.cliffTime >= params.endTime) {
      errors.push('Cliff time must be before end time')
    }
  } else {
    // When cliff time is zero, the cliff unlock amount must also be zero
    if (params.cliffUnlockAmount > 0n) {
      errors.push('Cliff unlock amount must be zero when cliff time is zero')
    }
  }

  const shape = params.shape.trim()
  if (shape.length > MAX_SHAPE_LENGTH) {
    errors.push(`Shape must be less than ${MAX_SHAPE_LENGTH} characters`)
  }

  // Combined start and cliff unlock amounts cannot exceed the deposit amount
  const totalUnlockAmount = params.startUnlockAmount + params.cliffUnlockAmount
  if (totalUnlockAmount > params.depositAmount) {
    errors.push('Combined unlock amounts cannot exceed deposit amount')
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
