import type { AddressType } from '@buildeross/types'
import * as yup from 'yup'

import { addressValidationSchemaWithError } from 'src/utils/yup'

export interface SendEthValues {
  recipientAddress?: string | AddressType
  amount?: number
}

const sendEthSchema = (treasuryBalance: number) =>
  yup.object({
    recipientAddress: addressValidationSchemaWithError(
      'Recipient address is invalid.',
      'Recipient address is required.'
    ),
    amount: yup
      .number()
      .required()
      .max(treasuryBalance, 'Treasury balance is insufficient to send ETH.')
      .test(
        'is-greater-than-0',
        'Must send more than 0 ETH',
        (value) => !!value && value > 0
      ),
  })

export default sendEthSchema
