import { addressValidationSchema } from '@buildeross/utils/yup'
import * as Yup from 'yup'

export const delegateValidationSchema = Yup.object().shape({
  address: addressValidationSchema,
})
