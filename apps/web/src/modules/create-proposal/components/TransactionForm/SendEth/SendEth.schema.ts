import type { AddressType } from '@buildeross/types'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import * as yup from 'yup'

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
