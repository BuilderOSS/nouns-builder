import type { AddressType } from '@buildeross/types'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import * as yup from 'yup'

import { TokenMetadataFormValidated, TokenMetadataSchema } from '../../shared'

export interface AirdropRecipientFormValues {
  recipientAddress: string | AddressType
  amount: string
}

export type AirdropType = 'instant' | 'll'

export interface AirdropTokensValues {
  airdropType: AirdropType
  campaignName: string
  adminAddress: string | AddressType
  campaignStartDate: string
  expirationDate: string
  vestingStartDate?: string
  totalDurationDays?: number
  cliffDurationDays?: number
  cancelable: boolean
  transferable: boolean
  tokenAddress?: AddressType
  tokenMetadata?: TokenMetadataFormValidated
  recipients: AirdropRecipientFormValues[]
}

const DECIMAL_REGEX = /^(\d+\.?\d*|\.\d+)$/

const recipientSchema = yup.object({
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
        return DECIMAL_REGEX.test(value)
      }
    )
    .test('is-greater-than-0', 'Amount must be greater than 0', (value) => {
      if (!value) return false
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    }),
})

const airdropTokensSchema = () =>
  yup.object({
    airdropType: yup
      .string()
      .oneOf(['instant', 'll'])
      .required('Airdrop type is required.'),
    campaignName: yup
      .string()
      .trim()
      .min(3, 'Campaign name must be at least 3 characters.')
      .max(64, 'Campaign name must be 64 characters or fewer.')
      .required('Campaign name is required.'),
    adminAddress: addressValidationSchemaWithError(
      'Admin address is invalid.',
      'Admin address is required.'
    ),
    campaignStartDate: yup.string().required('Campaign start date is required.'),
    expirationDate: yup
      .string()
      .required('Campaign expiration date is required.')
      .test(
        'is-after-campaign-start',
        'Expiration must be after campaign start.',
        function (v) {
          const campaignStartDate = this.parent.campaignStartDate
          if (!v || !campaignStartDate) return true
          return new Date(v).getTime() > new Date(campaignStartDate).getTime()
        }
      ),
    vestingStartDate: yup
      .string()
      .optional()
      .when('airdropType', {
        is: 'll',
        then: (schema) =>
          schema
            .required('Vesting start date is required for LL airdrops.')
            .test(
              'is-on-or-after-campaign-start',
              'Vesting start must be at or after campaign start.',
              function (v) {
                const campaignStartDate = this.parent.campaignStartDate
                if (!v || !campaignStartDate) return true
                return new Date(v).getTime() >= new Date(campaignStartDate).getTime()
              }
            ),
        otherwise: (schema) => schema.notRequired(),
      }),
    totalDurationDays: yup
      .number()
      .optional()
      .when('airdropType', {
        is: 'll',
        then: (schema) =>
          schema
            .required('Total duration (days) is required for LL airdrops.')
            .integer('Total duration must be a whole number.')
            .positive('Total duration must be greater than 0.'),
        otherwise: (schema) => schema.notRequired(),
      }),
    cliffDurationDays: yup
      .number()
      .optional()
      .integer('Cliff duration must be a whole number.')
      .min(0, 'Cliff duration cannot be negative.')
      .when(['airdropType', 'totalDurationDays'], {
        is: (airdropType: AirdropType, totalDurationDays: number | undefined) =>
          airdropType === 'll' && typeof totalDurationDays === 'number',
        then: (schema) =>
          schema.max(
            yup.ref('totalDurationDays'),
            'Cliff duration cannot exceed total duration.'
          ),
      }),
    cancelable: yup.boolean().required('Cancelable is required.'),
    transferable: yup.boolean().required('Transferable is required.'),
    tokenAddress: addressValidationSchemaWithError(
      'Token address is invalid.',
      'Token address is required.'
    ).optional(),
    tokenMetadata: TokenMetadataSchema.optional(),
    recipients: yup
      .array()
      .of(recipientSchema)
      .min(1, 'At least one recipient is required.'),
  })

export default airdropTokensSchema
