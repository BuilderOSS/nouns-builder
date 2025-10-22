import { Duration } from '@buildeross/types'
import { durationValidationSchema, priceValidationSchema } from '@buildeross/utils/yup'
import * as Yup from 'yup'

export interface AuctionSettingsFormValues {
  auctionDuration: Duration
  auctionReservePrice?: number
  proposalThreshold?: number
  quorumThreshold?: number
  votingPeriod: Duration
  votingDelay: Duration
  timelockDelay: Duration
}

const twentyFourWeeks = 60 * 60 * 24 * 7 * 24
const tenMinutes = 60 * 10
const fiveMinutes = 60 * 5

export const auctionSettingsValidationSchema = Yup.object().shape({
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
})
