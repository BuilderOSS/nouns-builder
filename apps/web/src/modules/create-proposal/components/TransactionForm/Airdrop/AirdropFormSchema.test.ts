import { describe, expect } from 'vitest'

import airdropFormSchema from './AirdropForm.schema'

describe('AirdropForm schema validation', () => {
  it('should validate this AirdropFormValues object with single recipient', async () => {
    const result = await airdropFormSchema.isValid({
      recipients: [
        {
          address: '0xf0A1982603d0b0Ed388994ad0D5BC76f98FFBD92',
          amount: 1,
        },
      ],
    })
    expect(result).toEqual(true)
  })

  it('should validate this AirdropFormValues object with multiple recipients', async () => {
    const result = await airdropFormSchema.isValid({
      recipients: [
        {
          address: '0xf0A1982603d0b0Ed388994ad0D5BC76f98FFBD92',
          amount: 1,
        },
        {
          address: '0x27B4a2eB472C280b17B79c315F79C522B038aFCF',
          amount: 5,
        },
      ],
    })
    expect(result).toEqual(true)
  })

  it('should invalidate this AirdropFormValues object due to below minimum amount', async () => {
    const result = await airdropFormSchema.isValid({
      recipients: [
        {
          address: '0xf0A1982603d0b0Ed388994ad0D5BC76f98FFBD92',
          amount: 0,
        },
      ],
    })
    expect(result).toEqual(false)
  })

  it('should invalidate this AirdropFormValues object due to invalid address', async () => {
    const result = await airdropFormSchema.isValid({
      recipients: [
        {
          address: '0x69420e101',
          amount: 1,
        },
      ],
    })
    expect(result).toEqual(false)
  })

  it('should invalidate this AirdropFormValues object due to empty recipients array', async () => {
    const result = await airdropFormSchema.isValid({
      recipients: [],
    })
    expect(result).toEqual(false)
  })

  it('should invalidate this AirdropFormValues object due to too many recipients (over 100)', async () => {
    const recipients = Array(101)
      .fill(0)
      .map(() => ({
        address: '0xf0A1982603d0b0Ed388994ad0D5BC76f98FFBD92',
        amount: 1,
      }))

    const result = await airdropFormSchema.isValid({
      recipients,
    })
    expect(result).toEqual(false)
  })

  // TODO Figure out why this breaks the test runner
  /* it('should validate this AirdropFormValues object with ENS domain', async () => {
    const result = await airdropFormSchema.isValid({
      recipients: [
        {
          address: 'ens.eth',
          amount: 1
        }
      ]
    })
    expect(result).toEqual(true)
  }) */
})
