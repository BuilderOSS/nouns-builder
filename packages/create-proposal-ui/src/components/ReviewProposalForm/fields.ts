import { TransactionBundle } from '@buildeross/types'
import { isAddress } from 'viem'
import * as Yup from 'yup'

import {
  PROPOSAL_DISCUSSION_URL_FORMAT_ERROR,
  PROPOSAL_REPRESENTED_ADDRESS_FORMAT_ERROR,
  PROPOSAL_REPRESENTED_ADDRESS_REQUIRED_ERROR,
  PROPOSAL_SUMMARY_REQUIRED_ERROR,
  PROPOSAL_TITLE_FORMAT_ERROR,
  PROPOSAL_TITLE_MAX_ERROR,
  PROPOSAL_TITLE_MAX_LENGTH,
  PROPOSAL_TITLE_REGEX,
  PROPOSAL_TITLE_REQUIRED_ERROR,
} from '../../constants'

export const ERROR_CODE: Record<string, string> = {
  GENERIC: `Oops. Looks like there was a problem submitting this proposal, please try again..`,
  WRONG_NETWORK: `Oops. Looks like you're on the wrong network. Please switch and try again.`,
  REJECTED: `Oops. Looks like the transaction was rejected.`,
  NOT_ENOUGH_VOTES: `Oops. Looks like you don't have enough votes to submit a proposal.`,
}

export interface FormValues {
  summary: string
  title: string
  representedAddress: string
  discussionUrl: string
  representedAddressEnabled: boolean
  transactions: TransactionBundle[]
}

const isValidDiscussionUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const validationSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .required(PROPOSAL_TITLE_REQUIRED_ERROR)
    .matches(PROPOSAL_TITLE_REGEX, PROPOSAL_TITLE_FORMAT_ERROR)
    .max(PROPOSAL_TITLE_MAX_LENGTH, PROPOSAL_TITLE_MAX_ERROR),
  summary: Yup.string().trim().optional().required(PROPOSAL_SUMMARY_REQUIRED_ERROR),
  representedAddressEnabled: Yup.boolean().required(),
  representedAddress: Yup.string().when('representedAddressEnabled', {
    is: true,
    then: (schema) =>
      schema
        .trim()
        .required(PROPOSAL_REPRESENTED_ADDRESS_REQUIRED_ERROR)
        .test(
          'represented-address-format',
          PROPOSAL_REPRESENTED_ADDRESS_FORMAT_ERROR,
          (value) => !!value && isAddress(value, { strict: false })
        ),
    otherwise: (schema) => schema.optional(),
  }),
  discussionUrl: Yup.string()
    .trim()
    .optional()
    .test('discussion-url-format', PROPOSAL_DISCUSSION_URL_FORMAT_ERROR, (value) => {
      if (!value) return true
      return isValidDiscussionUrl(value)
    }),
  transactions: Yup.array().min(1, 'Minimum one transaction required'),
})
