import { Duration } from '@buildeross/types'
import {
  addressValidationOptionalSchema,
  durationValidationSchema,
} from '@buildeross/utils/yup'
import * as Yup from 'yup'

import { auctionReservePriceValidationSchema } from 'src/modules/create-dao'

export interface PreAuctionFormValues {
  auctionDuration: Duration
  auctionReservePrice: number
  auctionRewardRecipient?: string
  auctionRewardPercentage: number
}

export const preAuctionValidationSchema = Yup.object().shape({
  auctionDuration: durationValidationSchema(),
  auctionReservePrice: auctionReservePriceValidationSchema,
  auctionRewardRecipient: addressValidationOptionalSchema.when(
    'auctionRewardPercentage',
    (auctionRewardPercentage, schema) => {
      if (!Number.isNaN(auctionRewardPercentage) && Number(auctionRewardPercentage) > 0)
        return schema.required('*') // Recipient is required if reward percentage is greater than 0
      return schema
    }
  ),
  auctionRewardPercentage: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('*')
    .max(50, '<= 50%'),
})
