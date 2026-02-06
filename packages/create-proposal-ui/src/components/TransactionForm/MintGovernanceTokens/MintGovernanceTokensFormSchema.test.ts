import { describe, expect } from 'vitest'

import mintGovernanceTokensFormSchema from './MintGovernanceTokensForm.schema'

describe('MintGovernanceTokensForm schema validation', () => {
  it('should validate this MintGovernanceTokensFormValues object with single recipient', async () => {
    const result = await mintGovernanceTokensFormSchema.isValid({
      recipients: [
        {
          address: '0xf0A1982603d0b0Ed388994ad0D5BC76f98FFBD92',
          amount: 1,
        },
      ],
    })
    expect(result).toEqual(true)
  })

  it('should validate this MintGovernanceTokensFormValues object with multiple recipients', async () => {
    const result = await mintGovernanceTokensFormSchema.isValid({
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

  it('should invalidate this MintGovernanceTokensFormValues object due to below minimum amount', async () => {
    const result = await mintGovernanceTokensFormSchema.isValid({
      recipients: [
        {
          address: '0xf0A1982603d0b0Ed388994ad0D5BC76f98FFBD92',
          amount: 0,
        },
      ],
    })
    expect(result).toEqual(false)
  })

  it('should invalidate this MintGovernanceTokensFormValues object due to empty recipients array', async () => {
    const result = await mintGovernanceTokensFormSchema.isValid({
      recipients: [],
    })
    expect(result).toEqual(false)
  })

  it('should invalidate this MintGovernanceTokensFormValues object due to too many recipients (over 100)', async () => {
    const recipients = Array(101)
      .fill(0)
      .map(() => ({
        address: '0xf0A1982603d0b0Ed388994ad0D5BC76f98FFBD92',
        amount: 1,
      }))

    const result = await mintGovernanceTokensFormSchema.isValid({
      recipients,
    })
    expect(result).toEqual(false)
  })
})
