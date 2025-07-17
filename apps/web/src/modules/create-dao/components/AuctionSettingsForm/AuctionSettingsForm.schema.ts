import { Duration } from '@buildeross/types'
import * as Yup from 'yup'

import { durationValidationSchema } from 'src/utils/yup'

export interface AuctionSettingsFormValues {
  auctionDuration: Duration
  auctionReservePrice?: number
  proposalThreshold?: number
  quorumThreshold?: number
  votingPeriod: Duration
  votingDelay: Duration
}

const twentyFourWeeks = 60 * 60 * 24 * 7 * 24
const tenMinutes = 60 * 10

export const auctionReservePriceValidationSchema = Yup.number()
  .transform((value) => (isNaN(value) ? undefined : value))
  .required('*')

export const auctionSettingsValidationSchema = Yup.object().shape({
  auctionDuration: durationValidationSchema(),
  auctionReservePrice: auctionReservePriceValidationSchema,
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
})
