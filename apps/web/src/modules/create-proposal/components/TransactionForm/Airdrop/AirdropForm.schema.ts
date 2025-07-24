import type { AddressType } from '@buildeross/types'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import * as yup from 'yup'

export interface AirdropFormValues {
  recipientAddress?: string | AddressType
  amount?: number
}

const airdropFormSchema = yup.object({
  recipientAddress: addressValidationSchemaWithError(
    'Recipient address is invalid.',
    'Recipient address is required.'
  ),
  amount: yup.number().min(1, 'Must be at least 1 token').required(),
})

export default airdropFormSchema
