import type { AddressType } from '@buildeross/types'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import * as yup from 'yup'

import { TokenMetadataFormValidated } from '../../shared'

export interface StreamFormValues {
  recipientAddress: string | AddressType
  amount: number
  durationType: 'days' | 'dates' // Toggle between days from now vs start/end dates
  durationDays?: number // When durationType is 'days'
  startDate?: string | Date // When durationType is 'dates'
  endDate?: string | Date // When durationType is 'dates'
  cliffDays?: number // Optional cliff period in days
}

export interface SablierStreamValues {
  senderAddress: string | AddressType // Delegate who can cancel streams
  tokenAddress?: AddressType
  tokenMetadata?: TokenMetadataFormValidated
  streams: StreamFormValues[]
}

const bigintSchema = yup
  .mixed()
  .transform((value) => {
    if (typeof value === 'string' && /^\d+$/.test(value)) return BigInt(value)
    if (typeof value === 'number' && Number.isInteger(value)) return BigInt(value)
    return value
  })
  .test('is-bigint', '${path} must be a BigInt', (value) => typeof value === 'bigint')

export const TokenMetadataSchema = yup.object({
  name: yup.string().required('Token name is required.'),
  symbol: yup.string().required('Token symbol is required.'),
  decimals: yup.number().required('Token decimals is required.'),
  balance: bigintSchema.required('Token balance is required.'),
  isValid: yup.boolean().required('Token is valid is required.'),
  address: addressValidationSchemaWithError(
    'Token address is invalid.',
    'Token address is required.'
  ),
})

export const StreamFormSchema = yup.object({
  recipientAddress: addressValidationSchemaWithError(
    'Recipient address is invalid.',
    'Recipient address is required.'
  ),
  amount: yup
    .number()
    .required('Amount is required.')
    .test(
      'is-greater-than-0',
      'Must stream more than 0 tokens',
      (value) => !!value && value > 0
    ),
  durationType: yup
    .string()
    .oneOf(['days', 'dates'])
    .required('Duration type is required.'),
  durationDays: yup.number().when('durationType', {
    is: 'days',
    then: (schema) =>
      schema
        .required('Duration in days is required.')
        .test(
          'is-greater-than-0',
          'Duration must be greater than 0',
          (value) => !!value && value > 0
        ),
    otherwise: (schema) => schema.optional(),
  }),
  startDate: yup.date().when('durationType', {
    is: 'dates',
    then: (schema) =>
      schema
        .required('Start date is required.')
        .min(new Date(), 'Start date must be in the future.'),
    otherwise: (schema) => schema.optional(),
  }),
  endDate: yup.date().when('durationType', {
    is: 'dates',
    then: (schema) =>
      schema
        .required('End date is required.')
        .test('is-after-start', 'End date must be after start date.', function (value) {
          const { startDate } = this.parent
          if (!startDate || !value) return true
          return new Date(value) > new Date(startDate)
        }),
    otherwise: (schema) => schema.optional(),
  }),
  cliffDays: yup
    .number()
    .optional()
    .test(
      'is-non-negative',
      'Cliff period cannot be negative',
      (value) => value === undefined || value >= 0
    ),
})

const sablierStreamSchema = () =>
  yup.object({
    senderAddress: addressValidationSchemaWithError(
      'Sender address is invalid.',
      'Sender address is required.'
    ),
    tokenAddress: addressValidationSchemaWithError(
      'Token address is invalid.',
      'Token address is required.'
    ).optional(),
    tokenMetadata: TokenMetadataSchema.optional(),
    streams: yup.array().of(StreamFormSchema).min(1, 'At least one stream is required.'),
  })

export default sablierStreamSchema
