import { describe, expect, it } from 'vitest'

import { getErrorMessage, WALLET_CONNECTION_ERROR_MESSAGE } from './errors'

describe('getErrorMessage', () => {
  it.each([
    'n.connector.getChainId is not a function',
    new Error('n.connector.getChainId is not a function'),
    { shortMessage: 'n.connector.getChainId is not a function' },
  ])('replaces stale wallet connector errors with a reconnect instruction', (error) => {
    expect(getErrorMessage(error)).toBe(WALLET_CONNECTION_ERROR_MESSAGE)
  })

  it('preserves unrelated error messages', () => {
    expect(getErrorMessage(new Error('User rejected the request.'))).toBe(
      'User rejected the request.'
    )
  })
})
