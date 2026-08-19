import { describe, expect, it } from 'vitest'

import {
  PROPOSAL_DISCUSSION_URL_FORMAT_ERROR,
  PROPOSAL_REPRESENTED_ADDRESS_FORMAT_ERROR,
  PROPOSAL_REPRESENTED_ADDRESS_REQUIRED_ERROR,
} from '../../constants'
import { createValidationSchema, PROPOSAL_UPDATE_MESSAGE_REQUIRED_ERROR } from './fields'

const baseValues = {
  title: 'Valid proposal title',
  summary: 'Valid proposal summary',
  representedAddressEnabled: false,
  transactions: [{}],
}

describe('ReviewProposalForm validation schema', () => {
  describe('new proposal (isUpdating = false)', () => {
    const schema = createValidationSchema(false)

    it('accepts metadata fields when omitted', async () => {
      await expect(schema.isValid(baseValues)).resolves.toBe(true)
    })

    it('requires representedAddress when representedAddressEnabled is true', async () => {
      await expect(
        schema.validate({
          ...baseValues,
          representedAddressEnabled: true,
          representedAddress: '',
        })
      ).rejects.toThrow(PROPOSAL_REPRESENTED_ADDRESS_REQUIRED_ERROR)
    })

    it('rejects invalid representedAddress format', async () => {
      await expect(
        schema.validate({
          ...baseValues,
          representedAddressEnabled: true,
          representedAddress: 'not-an-address',
        })
      ).rejects.toThrow(PROPOSAL_REPRESENTED_ADDRESS_FORMAT_ERROR)
    })

    it('accepts valid representedAddress format', async () => {
      await expect(
        schema.isValid({
          ...baseValues,
          representedAddressEnabled: true,
          representedAddress: '0x000000000000000000000000000000000000dEaD',
        })
      ).resolves.toBe(true)
    })

    it('rejects non-http discussionUrl values', async () => {
      await expect(
        schema.validate({
          ...baseValues,
          discussionUrl: 'ftp://example.com',
        })
      ).rejects.toThrow(PROPOSAL_DISCUSSION_URL_FORMAT_ERROR)
    })

    it('accepts valid https discussionUrl values', async () => {
      await expect(
        schema.isValid({
          ...baseValues,
          discussionUrl: 'https://example.com/proposal/123',
        })
      ).resolves.toBe(true)
    })

    it('does not require updateMessage', async () => {
      await expect(
        schema.isValid({
          ...baseValues,
          updateMessage: '',
        })
      ).resolves.toBe(true)
    })
  })

  describe('updating proposal (isUpdating = true)', () => {
    const schema = createValidationSchema(true)

    it('requires updateMessage when updating', async () => {
      await expect(
        schema.validate({
          ...baseValues,
          updateMessage: '',
        })
      ).rejects.toThrow(PROPOSAL_UPDATE_MESSAGE_REQUIRED_ERROR)
    })

    it('accepts valid updateMessage when updating', async () => {
      await expect(
        schema.isValid({
          ...baseValues,
          updateMessage: 'Updated transaction amounts',
        })
      ).resolves.toBe(true)
    })
  })
})
