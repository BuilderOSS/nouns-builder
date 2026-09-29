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
})
