import * as yup from 'yup'

import type { AddressType } from 'src/typings'
import { addressValidationSchemaWithError } from 'src/utils/yup'

export interface SendErc20Values {
  tokenAddress?: string | AddressType
  recipientAddress?: string | AddressType
  amount?: number
}

const sendErc20Schema = (tokenBalance: number) =>
  yup.object({
    tokenAddress: addressValidationSchemaWithError(
      'Token address is invalid.',
      'Token address is required.'
    ),
    recipientAddress: addressValidationSchemaWithError(
      'Recipient address is invalid.',
      'Recipient address is required.'
    ),
    amount: yup
      .number()
      .required()
      .max(tokenBalance, 'Token balance is insufficient to send tokens.')
      .test(
        'is-greater-than-0',
        'Must send more than 0 tokens',
        (value) => !!value && value > 0
      ),
  })

export default sendErc20Schema
