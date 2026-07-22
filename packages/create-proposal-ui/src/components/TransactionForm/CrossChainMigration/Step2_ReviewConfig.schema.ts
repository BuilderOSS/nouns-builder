import { AddressType } from '@buildeross/types'
import { durationValidationSchema, toSeconds } from '@buildeross/utils'
import * as Yup from 'yup'

import { TimeStructure } from '../../../utils/timeConversions'

export interface Founder {
  wallet: AddressType
  ownershipPct: number
  vestExpiry: bigint
}

export interface Step2ConfigFormValues {
  name: string
  symbol: string
  reservedUntilTokenId: bigint
  founders: Founder[]
  reservePrice: bigint
  auctionDuration: TimeStructure
  proposalThresholdBps: bigint
  quorumThresholdBps: bigint
  proposalUpdatablePeriod?: TimeStructure
  votingDelay: TimeStructure
  votingPeriod: TimeStructure
}

const twentyFourWeeks = 60 * 60 * 24 * 7 * 24

export const step2ConfigValidationSchema = (isV3OrHigher: boolean) =>
  Yup.object().shape({
    name: Yup.string()
      .required('DAO name is required')
      .trim()
      .min(1, 'DAO name is required'),
    symbol: Yup.string()
      .required('Token symbol is required')
      .trim()
      .min(1, 'Token symbol is required'),
    reservedUntilTokenId: Yup.mixed().test(
      'is-non-negative-bigint',
      'Reserved tokens must be non-negative',
      (value) => {
        if (typeof value === 'bigint') {
          return value >= 0n
        }
        return false
      }
    ),
    founders: Yup.array()
      .of(
        Yup.object().shape({
          wallet: Yup.string().required('Wallet address is required'),
          ownershipPct: Yup.number()
            .required('Ownership percentage is required')
            .min(0, 'Ownership must be between 0-100')
            .max(100, 'Ownership must be between 0-100'),
          vestExpiry: Yup.mixed(),
        })
      )
      .min(1, 'At least one founder is required'),
    auctionDuration: durationValidationSchema(
      { value: 1, description: '1 second' },
      { value: twentyFourWeeks, description: '24 weeks' }
    ),
    votingDelay: durationValidationSchema(
      { value: 1, description: '1 second' },
      { value: twentyFourWeeks, description: '24 weeks' }
    ),
    votingPeriod: durationValidationSchema(
      { value: 600, description: '10 minutes' },
      { value: twentyFourWeeks, description: '24 weeks' }
    ),
    ...(isV3OrHigher && {
      proposalUpdatablePeriod: durationValidationSchema(
        { value: 0, description: '0 seconds' },
        { value: twentyFourWeeks, description: '24 weeks' }
      ).test(
        'lessThanOrEqualToVotingPeriod',
        'Proposal updatable period must be less than or equal to voting period',
        function (value) {
          if (!value) return true // Optional field
          const { votingPeriod } = this.parent
          if (!votingPeriod) return true
          return toSeconds(value) <= toSeconds(votingPeriod)
        }
      ),
    }),
  })
