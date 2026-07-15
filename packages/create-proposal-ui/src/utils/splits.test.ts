import { describe, expect, it } from 'vitest'

import {
  formatSplitAddress,
  IMMUTABLE_CONTROLLER,
  prepareSplitConfigForSDK,
  type SplitRecipient,
  validateSplitRecipients,
} from './splits'

const A = '0xAbC0000000000000000000000000000000000001'
const B = '0xAbC0000000000000000000000000000000000002'
const C = '0xAbC0000000000000000000000000000000000003'

const rs = (list: Array<[string, number]>): SplitRecipient[] =>
  list.map(([address, percentAllocation]) => ({ address, percentAllocation }))

describe('validateSplitRecipients', () => {
  it('accepts a valid split summing to 100', () => {
    expect(
      validateSplitRecipients(
        rs([
          [A, 60],
          [B, 40],
        ])
      )
    ).toEqual([])
  })

  it('requires at least 2 recipients', () => {
    const errs = validateSplitRecipients(rs([[A, 100]]))
    expect(errs[0].message).toMatch(/at least 2/)
  })

  it('flags allocations that do not total 100', () => {
    const errs = validateSplitRecipients(
      rs([
        [A, 50],
        [B, 40],
      ])
    )
    expect(errs.some((e) => /total 100%/.test(e.message))).toBe(true)
  })

  it('flags invalid addresses', () => {
    const errs = validateSplitRecipients(
      rs([
        ['not-an-address', 50],
        [B, 50],
      ])
    )
    expect(errs.some((e) => /invalid address/.test(e.message))).toBe(true)
  })

  it('flags duplicate addresses (case-insensitive)', () => {
    const errs = validateSplitRecipients(
      rs([
        [A, 50],
        [A.toLowerCase(), 50],
      ])
    )
    expect(errs.some((e) => /Duplicate/.test(e.message))).toBe(true)
  })

  it('flags more than 4 decimal places', () => {
    const errs = validateSplitRecipients(
      rs([
        [A, 33.33333],
        [B, 66.66667],
      ])
    )
    expect(errs.some((e) => /decimal places/.test(e.message))).toBe(true)
  })

  it('allows 3-way splits within the epsilon', () => {
    expect(
      validateSplitRecipients(
        rs([
          [A, 33.3333],
          [B, 33.3333],
          [C, 33.3334],
        ])
      )
    ).toEqual([])
  })
})

describe('prepareSplitConfigForSDK', () => {
  it('defaults the controller to the immutable sentinel', () => {
    const out = prepareSplitConfigForSDK({
      recipients: rs([
        [A, 60],
        [B, 40],
      ]),
      distributorFeePercent: 0,
    })
    expect(out.controller).toBe(IMMUTABLE_CONTROLLER)
    expect(out.recipients).toHaveLength(2)
  })
})

describe('formatSplitAddress', () => {
  it('shortens an address', () => {
    expect(formatSplitAddress(A)).toBe('0xAbC0...0001')
  })
})
