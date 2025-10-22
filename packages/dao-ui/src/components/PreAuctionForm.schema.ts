import { Duration } from '@buildeross/types'
import {
  addressValidationOptionalSchema,
  durationValidationSchema,
  priceValidationSchema,
} from '@buildeross/utils/yup'
import * as Yup from 'yup'

export interface PreAuctionFormValues {
  auctionDuration: Duration
  auctionReservePrice: number
  auctionRewardRecipient?: string
  auctionRewardPercentage: number
}

export const preAuctionValidationSchema = Yup.object().shape({
  auctionDuration: durationValidationSchema(),
  auctionReservePrice: priceValidationSchema,
  auctionRewardRecipient: addressValidationOptionalSchema.when(
    'auctionRewardPercentage',
    (auctionRewardPercentage, schema) => {
      if (!Number.isNaN(auctionRewardPercentage) && Number(auctionRewardPercentage) > 0)
        return schema.required('*') // Recipient is required if reward percentage is greater than 0
      return schema
    }
  ),
  auctionRewardPercentage: priceValidationSchema.max(50, '<= 50%'),
})
