import { Duration } from '@buildeross/types'
import {
  addressValidationSchema,
  durationValidationSchema,
  urlValidationSchema,
} from '@buildeross/utils/yup'
import * as Yup from 'yup'

import { TokenAllocation, auctionSettingsValidationSchema } from 'src/modules/create-dao'

export interface AdminFormValues {
  daoAvatar: string
  daoWebsite: string
  projectDescription: string
  rendererBase: string
  auctionDuration: Duration
  auctionReservePrice: number
  proposalThreshold: number
  quorumThreshold: number
  votingPeriod: Duration
  votingDelay: Duration
  founderAllocation: TokenAllocation[]
  vetoPower: boolean
  vetoer: string
}

const twentyFourWeeks = 60 * 60 * 24 * 7 * 24
const tenMinutes = 60 * 10

const allocationSchema = Yup.object().shape({
  founderAddress: addressValidationSchema,
  allocationPercentage: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('*')
    .integer('Must be whole number')
    .max(100, '< 100')
    .when('admin', (admin, schema) => {
      if (!admin) return schema.min(1, '> 0') // (condition, errorMessage) - allocation represented as % must be greater than or equal to 0
      return schema
    }),
  endDate: Yup.string()
    .required('*')
    .test(
      'isDateInFuture',
      'Must be in future',
      (value: string | undefined, fieldData) => {
        if (!value) return false
        // override validation if parent endDate is the same as this endDate
        // This prevents the form from locking up if the founder allocation end data
        // has already passed.
        if (value === fieldData?.parent?.endDate) return true
        const date = new Date(value)
        const now = new Date()
        return date > now
      }
    ),
  admin: Yup.boolean(),
})

export const adminValidationSchema = () =>
  Yup.object()
    .concat(auctionSettingsValidationSchema)
    .concat(
      Yup.object().shape({
        daoAvatar: Yup.string(),
        projectDescription: Yup.string().required('*').max(5000, '< 5000 characters'),
        daoWebsite: urlValidationSchema,
        rendererBaseUrl: urlValidationSchema,
        vetoer: addressValidationSchema,
        votingDelay: durationValidationSchema(
          { value: 1, description: '1 second' },
          { value: twentyFourWeeks, description: '24 weeks' }
        ),
        votingPeriod: durationValidationSchema(
          { value: tenMinutes, description: '10 minutes' },
          { value: twentyFourWeeks, description: '24 weeks' }
        ),
        founderAllocation: Yup.array()
          .of(allocationSchema)
          .test(
            'unique',
            'Founder allocation addresses should be unique.',
            function (values) {
              const addresses = values?.map((v) => v.founderAddress)
              return values?.length === new Set(addresses)?.size
            }
          ),
        vetoPower: Yup.bool().required('*'),
      })
    )
