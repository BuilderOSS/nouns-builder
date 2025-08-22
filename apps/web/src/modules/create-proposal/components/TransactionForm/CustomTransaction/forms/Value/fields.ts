import { FIELD_TYPES } from '@buildeross/ui'
import * as Yup from 'yup'

export const transactionValueFields = [
  {
    name: 'transactionValue',
    inputLabel: 'Value',
    type: FIELD_TYPES.NUMBER,
    perma: 'ETH',
    helperText: 'Optional',
    step: 'any',
  },
]

export const validateTransactionValue = Yup.object().shape({
  transactionValues: Yup.string(),
})

export {}
