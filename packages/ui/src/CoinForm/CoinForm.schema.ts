import * as yup from 'yup'

export const coinFormSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(1, 'Name must be at least 1 character')
    .max(100, 'Name must be less than 100 characters'),
  symbol: yup
    .string()
    .required('Symbol is required')
    .min(1, 'Symbol must be at least 1 character')
    .max(10, 'Symbol must be less than 10 characters')
    .matches(/^[A-Z0-9]+$/, 'Symbol must only contain uppercase letters and numbers'),
  description: yup
    .string()
    .required('Description is required')
    .min(1, 'Description must be at least 1 character')
    .max(1000, 'Description must be less than 1000 characters'),
  imageUrl: yup.string().when('imageFile', {
    is: (imageFile: File | undefined) => !imageFile,
    then: (schema) => schema.required('Image is required'),
    otherwise: (schema) => schema,
  }),
  imageFile: yup.mixed<File>(),
  mediaUrl: yup.string(),
  mediaFile: yup.mixed<File>(),
  mediaMimeType: yup.string(),
  properties: yup
    .object()
    .test(
      'valid-properties',
      'All property keys and values must be strings',
      function (value) {
        if (!value) return true

        for (const [key, val] of Object.entries(value)) {
          if (typeof key !== 'string' || typeof val !== 'string') {
            return false
          }
        }
        return true
      }
    ),
  currency: yup.string(),
  minFdvUsd: yup
    .number()
    .positive('Minimum FDV must be a positive number')
    .min(49, 'Minimum FDV must be at least $49')
    .typeError('Minimum FDV must be a valid number'),
})
