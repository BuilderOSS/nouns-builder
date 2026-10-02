import { describe, expect, it } from 'vitest'

import {
  getSafeErrorMessage,
  SafeTransactionError,
  SafeTransactionErrorCode,
} from './errors'

describe('Safe transaction errors', () => {
  it('returns a retryable message for unavailable Safe Service', () => {
    expect(
      getSafeErrorMessage(
        new SafeTransactionError(
          'internal details',
          SafeTransactionErrorCode.API_UNAVAILABLE
        )
      )
    ).toBe(
      'Safe Service is temporarily unavailable. Check your connection and try again.'
    )
  })

  it('uses the safe rejection message without exposing unrelated errors', () => {
    expect(
      getSafeErrorMessage(
        new SafeTransactionError(
          'Safe Service rejected this proposal. Check the transaction details and try again.',
          SafeTransactionErrorCode.API_REJECTED
        )
      )
    ).toBe(
      'Safe Service rejected this proposal. Check the transaction details and try again.'
    )
  })

  it('preserves the underlying execution error', () => {
    expect(
      getSafeErrorMessage(
        new SafeTransactionError(
          'Transaction execution failed: execution reverted: GS026',
          SafeTransactionErrorCode.EXECUTION_FAILED
        )
      )
    ).toBe('Transaction execution failed: execution reverted: GS026')
  })

  it('shows the Safe chain mismatch in the transaction UI', () => {
    expect(
      getSafeErrorMessage(
        new SafeTransactionError(
          'Safe is connected to chain 8453, but this transaction requires chain 84532.',
          SafeTransactionErrorCode.CHAIN_MISMATCH
        )
      )
    ).toBe('Safe is connected to chain 8453, but this transaction requires chain 84532.')
  })
})
