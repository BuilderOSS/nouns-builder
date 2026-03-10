import { BuilderTransaction } from '@buildeross/types'
import * as Yup from 'yup'

import {
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
  summary?: string
  title?: string
  transactions: BuilderTransaction[]
}

export const validationSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .required(PROPOSAL_TITLE_REQUIRED_ERROR)
    .matches(PROPOSAL_TITLE_REGEX, PROPOSAL_TITLE_FORMAT_ERROR)
    .max(PROPOSAL_TITLE_MAX_LENGTH, PROPOSAL_TITLE_MAX_ERROR),
  summary: Yup.string().trim().optional().required(PROPOSAL_SUMMARY_REQUIRED_ERROR),
  transactions: Yup.array().min(1, 'Minimum one transaction required'),
})
