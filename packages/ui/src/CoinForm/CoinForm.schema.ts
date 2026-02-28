import {
  DEFAULT_CLANKER_TARGET_FDV,
  DEFAULT_LOCKUP_DAYS,
  DEFAULT_VAULT_PERCENTAGE,
  DEFAULT_VESTING_DAYS,
} from '@buildeross/utils'
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
    .matches(
      /^[A-Z0-9$]+$/,
      'Symbol must only contain uppercase letters, numbers, and $'
    ),
  description: yup
    .string()
    .required('Description is required')
    .min(1, 'Description must be at least 1 character')
    .max(1000, 'Description must be less than 1000 characters'),
  mediaUrl: yup.string().when('mediaFile', {
    is: (mediaFile: File | undefined) => !mediaFile,
    then: (schema) => schema.required('Media is required'),
    otherwise: (schema) => schema,
  }),
  mediaFile: yup.mixed<File>(),
  mediaMimeType: yup.string(),
  imageUrl: yup.string().when('mediaMimeType', {
    is: (mimeType: string | undefined) => mimeType && !mimeType.startsWith('image/'),
    then: (schema) =>
      schema.required('Thumbnail image is required for video/audio content'),
    otherwise: (schema) => schema.notRequired(),
  }),
  imageFile: yup.mixed<File>(),
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
  targetFdvUsd: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return DEFAULT_CLANKER_TARGET_FDV
      }
      const num = Number(originalValue)
      return isNaN(num) ? originalValue : num
    })
    .positive('Target FDV must be a positive number')
    .min(1000, 'Target FDV must be at least $1,000')
    .default(DEFAULT_CLANKER_TARGET_FDV)
    .typeError('Target FDV must be a valid number'),
  // Clanker-specific fields
  poolConfig: yup.string(),
  feeConfig: yup.string(),
  vaultPercentage: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return DEFAULT_VAULT_PERCENTAGE
      }
      const num = Number(originalValue)
      return isNaN(num) ? originalValue : num
    })
    .min(1, 'Vault percentage must be at least 1%')
    .max(90, 'Vault percentage cannot exceed 90%')
    .default(DEFAULT_VAULT_PERCENTAGE)
    .typeError('Vault percentage must be a valid number'),
  lockupDuration: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return DEFAULT_LOCKUP_DAYS
      }
      const num = Number(originalValue)
      return isNaN(num) ? originalValue : num
    })
    .min(7, 'Lockup duration must be at least 7 days')
    .default(DEFAULT_LOCKUP_DAYS)
    .typeError('Lockup duration must be a valid number'),
  vestingDuration: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return DEFAULT_VESTING_DAYS
      }
      const num = Number(originalValue)
      return isNaN(num) ? originalValue : num
    })
    .min(0, 'Vesting duration cannot be negative')
    .default(DEFAULT_VESTING_DAYS)
    .typeError('Vesting duration must be a valid number'),
  vaultRecipient: yup
    .string()
    .test('is-address', 'Must be a valid Ethereum address', function (value) {
      if (!value) return true // optional field
      return /^0x[a-fA-F0-9]{40}$/.test(value)
    }),
  devBuyEthAmount: yup
    .number()
    .transform((value, originalValue) => {
      // Convert empty string to undefined
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return undefined
      }
      // Convert string to number
      const num = Number(originalValue)
      return isNaN(num) ? originalValue : num
    })
    .min(0, 'Dev buy amount cannot be negative')
    .typeError('Dev buy amount must be a valid number'),
})
