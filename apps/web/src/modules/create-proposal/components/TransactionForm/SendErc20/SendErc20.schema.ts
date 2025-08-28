import type { AddressType } from '@buildeross/types'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import * as yup from 'yup'

import {
  TokenMetadataFormValidated,
  TokenMetadataSchema,
} from '../Escrow/EscrowForm.schema'

export { type TokenMetadataFormValidated }

export interface SendErc20Values {
  tokenAddress?: string | AddressType
  tokenMetadata?: TokenMetadataFormValidated
  recipientAddress?: string | AddressType
  amount?: number
}

export const sendErc20Schema = () =>
  yup.object({
    tokenAddress: addressValidationSchemaWithError(
      'Token address is invalid.',
      'Token address is required.'
    ),
    tokenMetadata: TokenMetadataSchema.optional(),
    recipientAddress: addressValidationSchemaWithError(
      'Recipient address is invalid.',
      'Recipient address is required.'
    ),
    amount: yup
      .number()
      .required()
      .test(
        'is-greater-than-0',
        'Must send more than 0 tokens',
        (value) => !!value && value > 0
      ),
  })
