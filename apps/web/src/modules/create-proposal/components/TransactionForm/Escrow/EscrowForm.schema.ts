import { AddressType } from '@buildeross/types'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import { FormikHelpers } from 'formik'
import * as yup from 'yup'

export interface MilestoneFormValues {
  amount: number
  title: string
  endDate: number & string & Date
  mediaUrl: string | undefined
  mediaType: string | undefined
  mediaFileName: string
  description: string
}

export interface EscrowFormValues {
  clientAddress: string | AddressType
  recipientAddress: string | AddressType
  safetyValveDate: Date | number | string
  milestones: Array<MilestoneFormValues>
}

export interface EscrowFormState {
  formValues: EscrowFormValues
  setFormValues: (values: EscrowFormValues) => void
  resetForm: () => void
  clear: () => void
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

export const EscrowFormSchema = yup
  .object({
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
    safetyValveDate: yup
      .date()
      .required('Safety valve date is required.')
      .min(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        'Safety valve date must be at least 30 days from today or the last milestone whichever is later.'
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
          const minSafetyValveDate =
            lastMilestoneDate.getTime() + 30 * 24 * 60 * 60 * 1000

          const safetyValveDate = new Date(value as any).getTime()

          return safetyValveDate >= minSafetyValveDate
        }
      ),
    milestones: yup
      .array()
      .of(MilestoneSchema)
      .min(1, 'At least one milestone is required.'),
  })
  .test(
    'addresses-not-same',
    'Delegate and recipient addresses must be different.',
    function (values) {
      return values.clientAddress !== values.recipientAddress
    }
  )
