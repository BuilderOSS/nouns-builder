import { describe, expect, it } from 'vitest'

import { getTransactionSummaryError } from './useTransactionSummary'

describe('getTransactionSummaryError', () => {
  it('hides the summary when signed out or AI is not configured', () => {
    expect(getTransactionSummaryError(401, 'Unauthorized').kind).toBe('hidden')
    expect(getTransactionSummaryError(403).kind).toBe('hidden')
    expect(getTransactionSummaryError(503, 'ai_unavailable').kind).toBe('hidden')
  })

  it('maps rate limits and failures to friendly messages', () => {
    expect(getTransactionSummaryError(429)).toMatchObject({
      kind: 'rateLimited',
      message: 'Too many requests. Try again in a minute.',
    })
    expect(
      getTransactionSummaryError(500, 'transaction summary generation failed')
    ).toMatchObject({ kind: 'failed', message: "Couldn't generate a summary." })
  })
})
