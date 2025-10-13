import * as Yup from 'yup'

export const priceValidationSchema = Yup.number()
  .transform((value) => (isNaN(value) ? undefined : value))
  .required('*')
