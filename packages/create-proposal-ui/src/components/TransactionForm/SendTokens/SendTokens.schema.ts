import type { AddressType } from '@buildeross/types'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import * as yup from 'yup'

import { TokenMetadataFormValidated, TokenMetadataSchema } from '../../shared'

export interface RecipientFormValues {
  recipientAddress: string | AddressType
  amount: string
}

export interface SendTokensValues {
  tokenAddress?: AddressType
  tokenMetadata?: TokenMetadataFormValidated
  recipients: RecipientFormValues[]
}

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
