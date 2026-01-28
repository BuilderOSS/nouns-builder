import type { AddressType } from '@buildeross/types'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import * as yup from 'yup'

import { TokenMetadataFormValidated, TokenMetadataSchema } from '../../shared'

export interface StreamFormValues {
  recipientAddress: string | AddressType
  amount: string
  durationDays?: number // When durationType is 'days'
  startDate?: string | Date // When durationType is 'dates'
  endDate?: string | Date // When durationType is 'dates'
  cliffDays?: number // Optional cliff period in days
}

export interface StreamTokensValues {
  senderAddress: string | AddressType // Delegate who can cancel streams
  tokenAddress?: AddressType
  tokenMetadata?: TokenMetadataFormValidated
  durationType: 'days' | 'dates' // Toggle between days from now vs start/end dates (applies to all streams)
  cancelable: boolean // Whether streams can be cancelled (applies to all streams)
  transferable: boolean // Whether stream NFTs can be transferred (applies to all streams)
  streams: StreamFormValues[]
}

export const StreamFormSchema = yup.object({
  recipientAddress: addressValidationSchemaWithError(
    'Recipient address is invalid.',
    'Recipient address is required.'
  ),
  amount: yup
    .string()
    .required('Amount is required.')
    .test(
      'is-valid-decimal',
      'Amount must be a valid decimal number (no scientific notation)',
      (value) => {
        if (!value) return false
        // Reject scientific notation, only allow standard decimal format
        // Matches: "1", "1.5", "0.001", ".5" but rejects "1e10", "1E-5"
        const decimalRegex = /^(\d+\.?\d*|\.\d+)$/
        return decimalRegex.test(value)
      }
    )
    .test('is-greater-than-0', 'Must stream more than 0 tokens', (value) => {
      if (!value) return false
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    }),
  durationDays: yup.number().optional(),
  startDate: yup.date().optional(),
  endDate: yup.date().optional(),
  cliffDays: yup
    .number()
    .optional()
    .test(
      'is-non-negative',
      'Cliff period cannot be negative',
      (value) => value === undefined || value >= 0
    ),
})

const streamTokensSchema = () =>
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
    durationType: yup
      .string()
      .oneOf(['days', 'dates'])
      .required('Duration type is required.'),
    cancelable: yup.boolean().required('Cancelable setting is required.'),
    transferable: yup.boolean().required('Transferable setting is required.'),
    streams: yup
      .array()
      .of(StreamFormSchema)
      .min(1, 'At least one stream is required.')
      .test('validate-stream-fields', 'Stream fields validation', function (streams) {
        const durationType = this.parent.durationType
        if (!streams || streams.length === 0) return true

        const errors: yup.ValidationError[] = []
        streams.forEach((stream: StreamFormValues, index: number) => {
          if (durationType === 'days') {
            if (!stream.durationDays || stream.durationDays <= 0) {
              errors.push(
                this.createError({
                  path: `streams[${index}].durationDays`,
                  message: 'Duration must be greater than 0',
                })
              )
            }
          } else if (durationType === 'dates') {
            if (!stream.startDate) {
              errors.push(
                this.createError({
                  path: `streams[${index}].startDate`,
                  message: 'Start date is required',
                })
              )
            } else if (new Date(stream.startDate) <= new Date()) {
              errors.push(
                this.createError({
                  path: `streams[${index}].startDate`,
                  message: 'Start date must be in the future',
                })
              )
            }

            if (!stream.endDate) {
              errors.push(
                this.createError({
                  path: `streams[${index}].endDate`,
                  message: 'End date is required',
                })
              )
            } else if (
              stream.startDate &&
              new Date(stream.endDate) <= new Date(stream.startDate)
            ) {
              errors.push(
                this.createError({
                  path: `streams[${index}].endDate`,
                  message: 'End date must be after start date',
                })
              )
            }
          }
        })

        if (errors.length > 0) {
          throw new yup.ValidationError(errors)
        }
        return true
      }),
  })

export default streamTokensSchema
