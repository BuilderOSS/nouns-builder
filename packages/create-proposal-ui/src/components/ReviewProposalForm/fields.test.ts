import { describe, expect, it } from 'vitest'

import {
  PROPOSAL_DISCUSSION_URL_FORMAT_ERROR,
  PROPOSAL_REPRESENTED_ADDRESS_FORMAT_ERROR,
  PROPOSAL_REPRESENTED_ADDRESS_REQUIRED_ERROR,
} from '../../constants'
import { validationSchema } from './fields'

const baseValues = {
  title: 'Valid proposal title',
  summary: 'Valid proposal summary',
  representedAddressEnabled: false,
  transactions: [{}],
}

describe('ReviewProposalForm validation schema', () => {
  it('accepts metadata fields when omitted', async () => {
    await expect(validationSchema.isValid(baseValues)).resolves.toBe(true)
  })

  it('requires representedAddress when representedAddressEnabled is true', async () => {
    await expect(
      validationSchema.validate({
        ...baseValues,
        representedAddressEnabled: true,
        representedAddress: '',
      })
    ).rejects.toThrow(PROPOSAL_REPRESENTED_ADDRESS_REQUIRED_ERROR)
  })

  it('rejects invalid representedAddress format', async () => {
    await expect(
      validationSchema.validate({
        ...baseValues,
        representedAddressEnabled: true,
        representedAddress: 'not-an-address',
      })
    ).rejects.toThrow(PROPOSAL_REPRESENTED_ADDRESS_FORMAT_ERROR)
  })

  it('accepts valid representedAddress format', async () => {
    await expect(
      validationSchema.isValid({
        ...baseValues,
        representedAddressEnabled: true,
        representedAddress: '0x000000000000000000000000000000000000dEaD',
      })
    ).resolves.toBe(true)
  })

  it('rejects non-http discussionUrl values', async () => {
    await expect(
      validationSchema.validate({
        ...baseValues,
        discussionUrl: 'ftp://example.com',
      })
    ).rejects.toThrow(PROPOSAL_DISCUSSION_URL_FORMAT_ERROR)
  })

  it('accepts valid https discussionUrl values', async () => {
    await expect(
      validationSchema.isValid({
        ...baseValues,
        discussionUrl: 'https://example.com/proposal/123',
      })
    ).resolves.toBe(true)
  })
})
