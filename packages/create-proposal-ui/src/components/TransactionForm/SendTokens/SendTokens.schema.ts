import type { AddressType } from '@buildeross/types'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import * as yup from 'yup'

import { TokenMetadataFormValidated } from '../../shared'

export interface RecipientFormValues {
  recipientAddress: string | AddressType
  amount: string
}

export interface SendTokensValues {
  tokenAddress?: AddressType
  tokenMetadata?: TokenMetadataFormValidated
  recipients: RecipientFormValues[]
}

const bigintSchema = yup
  .mixed()
  .transform((value) => {
    if (typeof value === 'string' && /^\d+$/.test(value)) return BigInt(value)
    if (typeof value === 'number' && Number.isInteger(value)) return BigInt(value)
    return value
  })
  .test('is-bigint', '${path} must be a BigInt', (value) => typeof value === 'bigint')

export const TokenMetadataSchema = yup.object({
  name: yup.string().required('Token name is required.'),
  symbol: yup.string().required('Token symbol is required.'),
  decimals: yup.number().required('Token decimals is required.'),
  balance: bigintSchema.required('Token balance is required.'),
  isValid: yup.boolean().required('Token is valid is required.'),
  address: addressValidationSchemaWithError(
    'Token address is invalid.',
    'Token address is required.'
  ),
})

export const RecipientFormSchema = yup.object({
  recipientAddress: addressValidationSchemaWithError(
    'Recipient address is invalid.',
    'Recipient address is required.'
  ),
  amount: yup
    .string()
    .required('Amount is required.')
    .test(
      'is-valid-decimal',
      'Amount must be a valid decimal number (no scientific notation)',
      (value) => {
        if (!value) return false
        // Reject scientific notation, only allow standard decimal format
        // Matches: "1", "1.5", "0.001", ".5" but rejects "1e10", "1E-5"
        const decimalRegex = /^(\d+\.?\d*|\.\d+)$/
        return decimalRegex.test(value)
      }
    )
    .test('is-greater-than-0', 'Must send more than 0 tokens', (value) => {
      if (!value) return false
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    }),
})

const sendTokensSchema = () =>
  yup.object({
    tokenAddress: addressValidationSchemaWithError(
      'Token address is invalid.',
      'Token address is required.'
    ).optional(),
    tokenMetadata: TokenMetadataSchema.optional(),
    recipients: yup
      .array()
      .of(RecipientFormSchema)
      .min(1, 'At least one recipient is required.'),
  })

export default sendTokensSchema
