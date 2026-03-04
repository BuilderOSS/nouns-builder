import { assert, describe, it } from 'vitest'

import { formatTokenAmount } from './numbers'

describe('formatTokenAmount', () => {
  it('shows at least two decimals for whole numbers', () => {
    assert.equal(formatTokenAmount('42'), '42.00')
  })

  it('truncates (does not round) beyond max decimals', () => {
    assert.equal(formatTokenAmount('1.23456789129'), '1.2345678912')
  })

  it('keeps values representable within max decimals', () => {
    assert.equal(formatTokenAmount('0.0000000019'), '0.0000000019')
  })

  it('shows a small non-zero indicator for tiny values that collapse to zero', () => {
    assert.equal(formatTokenAmount('0.00000000009'), '<0.000000001')
  })
})
