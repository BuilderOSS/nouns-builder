import { describe, expect, it, vi } from 'vitest'

import { withTimeout } from './withTimeout'

describe('withTimeout', () => {
  it('returns the operation result before the deadline', async () => {
    await expect(
      withTimeout(Promise.resolve('ready'), 100, 'Profile lookup')
    ).resolves.toBe('ready')
  })

  it('retains support for function-based callers', async () => {
    await expect(withTimeout(() => Promise.resolve('ready'), 100)).resolves.toBe('ready')
  })

  it('rejects with the operation label after the deadline', async () => {
    vi.useFakeTimers()
    const pending = new Promise<never>(() => undefined)
    const onTimeout = vi.fn()
    const result = withTimeout(pending, 8_000, 'DAO proposal enrichment', onTimeout)
    const assertion = expect(result).rejects.toThrow(
      'DAO proposal enrichment timed out after 8000ms'
    )

    await vi.advanceTimersByTimeAsync(8_000)
    await assertion
    expect(onTimeout).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })
})
