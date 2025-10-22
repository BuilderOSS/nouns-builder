import { AddressType } from '@buildeross/types'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import { FormikHelpers } from 'formik'
import * as yup from 'yup'

export const getInitialEscrowFormState = (): EscrowFormValues => ({
  tokenAddress: undefined,
  tokenMetadata: undefined,
  clientAddress: '',
  recipientAddress: '',
  milestones: [
    {
      amount: 0.5,
      title: 'Milestone 1',
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10)
        .toISOString()
        .split('T')[0],
      mediaUrl: '',
      mediaType: undefined,
      mediaFileName: '',
      description: 'About Milestone 1',
    },
  ],
  safetyValveDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    .toISOString()
    .split('T')[0],
})

export interface MilestoneFormValues {
  amount: number
  title: string
  endDate: number | string | Date
  mediaUrl: string | undefined
  mediaType: string | undefined
  mediaFileName: string
  description: string
}

export interface TokenMetadataFormValidated {
  name: string
  symbol: string
  decimals: number
  balance: bigint
  isValid: boolean
  address: AddressType
}

export interface EscrowFormValues {
  clientAddress: string | AddressType
  recipientAddress: string | AddressType
  safetyValveDate: Date | number | string
  milestones: Array<MilestoneFormValues>
  tokenAddress?: AddressType
  tokenMetadata?: TokenMetadataFormValidated
}

export interface EscrowFormProps {
  onSubmit: (values: EscrowFormValues, actions: FormikHelpers<EscrowFormValues>) => void
  isSubmitting: boolean
}
export const MilestoneSchema = yup.object({
  amount: yup
    .number()
    .moreThan(0, 'Amount must be greater than 0')
    .required('Amount is required'),
  title: yup.string().required('Title is required'),
  endDate: yup.date().required('End date is required'),
  mediaUrl: yup.string(),
  mediaType: yup
    .string()
    .oneOf([
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      undefined,
    ]),
  mediaFileName: yup.string(),
  description: yup.string(),
})

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

export const EscrowFormSchema = yup.object({
  clientAddress: addressValidationSchemaWithError(
    'Delegate address is invalid.',
    'Delegate address is required.'
  ),
  recipientAddress: addressValidationSchemaWithError(
    'Recipient address is invalid.',
    'Recipient address is required.'
  ).test(
    'not-same-as-client',
    'Recipient address must be different from the delegate address.',
    function (value) {
      if (!this?.parent?.clientAddress) return true
      return value?.toLowerCase() !== this?.parent?.clientAddress?.toLowerCase()
    }
  ),
  tokenAddress: addressValidationSchemaWithError(
    'Token address is invalid.',
    'Token address is required.'
  ).optional(),
  tokenMetadata: TokenMetadataSchema.optional(),
  safetyValveDate: yup
    .date()
    .required('Safety valve date is required.')
    .min(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      'Safety valve date must be at least 30 days from today or the last milestone.'
    )
    .test(
      'after-last-milestone',
      'Safety valve date must be at least 30 days after the last milestone date.',
      function (value) {
        const milestones = (this.parent.milestones || []) as MilestoneFormValues[]
        if (milestones.length === 0) return true

        // Get the last milestone's end date
        const lastMilestoneDate = new Date(
          Math.max(...milestones.map((m) => new Date(m.endDate).getTime()))
        )

        // Add 30 days to last milestone date
        const minSafetyValveDate = lastMilestoneDate.getTime() + 30 * 24 * 60 * 60 * 1000

        const safetyValveDate = new Date(value as any).getTime()

        return safetyValveDate >= minSafetyValveDate
      }
    ),
  milestones: yup
    .array()
    .of(MilestoneSchema)
    .min(1, 'At least one milestone is required.'),
})
