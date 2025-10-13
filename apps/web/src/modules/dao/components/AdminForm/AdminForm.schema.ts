import type { Duration, TokenAllocation } from '@buildeross/types'
import {
  addressValidationSchema,
  durationValidationSchema,
  priceValidationSchema,
  urlValidationSchema,
} from '@buildeross/utils/yup'
import * as Yup from 'yup'

export type { TokenAllocation }

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
  timelockDelay: Duration
  founderAllocation: TokenAllocation[]
  vetoPower: boolean
  vetoer: string
}

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

const twentyFourWeeks = 60 * 60 * 24 * 7 * 24
const tenMinutes = 60 * 10
const fiveMinutes = 60 * 5

export const adminValidationSchema = () =>
  Yup.object().shape({
    auctionDuration: durationValidationSchema(),
    auctionReservePrice: priceValidationSchema,
    proposalThreshold: Yup.number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .required('*')
      .min(0.01, '>= 0.01%')
      .max(10, '<= 10%'),
    quorumThreshold: Yup.number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .required('*')
      .test('greaterThanMin', '>= 2%', (value) => (value ? value >= 2 : false))
      .moreThan(
        Yup.ref('proposalThreshold'),
        'Quorum threshold must be greater than proposal threshold'
      )
      .max(20, '<= 20%'),
    votingDelay: durationValidationSchema(
      { value: 1, description: '1 second' },
      { value: twentyFourWeeks, description: '24 weeks' }
    ),
    votingPeriod: durationValidationSchema(
      { value: tenMinutes, description: '10 minutes' },
      { value: twentyFourWeeks, description: '24 weeks' }
    ),
    timelockDelay: durationValidationSchema(
      { value: fiveMinutes, description: '5 minutes' },
      { value: twentyFourWeeks, description: '24 weeks' }
    ),
    daoAvatar: Yup.string(),
    projectDescription: Yup.string().required('*').max(5000, '< 5000 characters'),
    daoWebsite: urlValidationSchema,
    rendererBase: urlValidationSchema,
    vetoer: Yup.string().when('vetoPower', {
      is: true,
      then: () => addressValidationSchema,
      otherwise: (schema) =>
        schema.transform((value) => (value === undefined ? '' : value)),
    }),
    founderAllocation: Yup.array()
      .of(allocationSchema)
      .test(
        'unique',
        'Founder allocation addresses should be unique.',
        function (values) {
          const addresses = values?.map((v) => v.founderAddress?.toLowerCase?.() || '')
          return values?.length === new Set(addresses)?.size
        }
      ),
    vetoPower: Yup.bool().required('*'),
  })
