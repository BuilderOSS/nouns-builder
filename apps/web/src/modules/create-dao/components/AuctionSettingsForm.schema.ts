import { Duration } from '@buildeross/types'
import * as Yup from 'yup'

export interface AuctionSettingsFormValues {
  auctionDuration: Duration
  auctionReservePrice?: number
  proposalThreshold?: number
  quorumThreshold?: number
}

export const auctionSettingsValidationSchema = Yup.object().shape({
  auctionDuration: Yup.object()
    .shape({
      seconds: Yup.number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .min(0, '>= 0')
        .max(60, '<= 60 seconds'),
      minutes: Yup.number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .min(0, '>= 0')
        .max(60, '<= 60 minutes'),
      days: Yup.number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .min(0, '>= 0'),
      hours: Yup.number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .min(0, '>= 0')
        .max(24, '<= 24 hours'),
    })
    .test('valueCheck', 'Value below minimum', (value) => {
      const values = Object.values(value).map((num) => {
        return Number.isNaN(num) || typeof num === 'undefined' ? 0 : num
      })
      return values.filter((val) => val > 0).length > 0
    }),
  auctionReservePrice: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('*')
    .min(0.0001, '> 0.0001 ETH'), // temp until protocol supports 0 ETH reserve price
  proposalThreshold: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('*')
    .min(0.01, '>= 0.01%')
    .max(10, '<= 10%'),
  quorumThreshold: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('*')
    .min(2, '>= 2%')
    .moreThan(
      Yup.ref('proposalThreshold'),
      'Quorum threshold must be greater than proposal threshold'
    )
    .max(20, '<= 20%'),
})
