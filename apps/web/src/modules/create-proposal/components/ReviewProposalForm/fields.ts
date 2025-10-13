import { BuilderTransaction } from '@buildeross/types'
import * as Yup from 'yup'

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
    .required('Proposal title is required')
    .matches(/^[A-Za-z0-9 _.-]*[A-Za-z0-9][A-Za-z0-9 _.-]*$/, 'only numbers or letters')
    .max(5000, '< 256 characters'),
  summary: Yup.string().optional().required('Summary is required'),
  transactions: Yup.array().min(1, 'Minimum one transaction required'),
})
