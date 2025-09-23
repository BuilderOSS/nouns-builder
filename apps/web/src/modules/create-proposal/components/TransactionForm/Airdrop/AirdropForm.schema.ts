import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import * as yup from 'yup'

export interface AirdropFormValues {
  recipients: Array<{ address: string; amount: number }>
}

const airdropFormSchema = yup.object({
  recipients: yup
    .array()
    .of(
      yup.object({
        address: addressValidationSchemaWithError(
          'Recipient address is invalid.',
          'Recipient address is required.'
        ),
        amount: yup.number().min(1, 'Must be at least 1 token').required(),
      })
    )
    .min(1, 'At least one recipient is required')
    .max(100, 'Maximum 100 recipients allowed')
    .required(),
})

export default airdropFormSchema
