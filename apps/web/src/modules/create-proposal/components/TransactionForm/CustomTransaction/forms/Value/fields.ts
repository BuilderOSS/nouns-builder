import { NUMBER } from 'src/components/Fields/types'
import * as Yup from 'yup'

export const transactionValueFields = [
  {
    name: 'transactionValue',
    inputLabel: 'Value',
    type: NUMBER,
    perma: 'ETH',
    helperText: 'Optional',
    step: 'any',
  },
]

export const validateTransactionValue = Yup.object().shape({
  transactionValues: Yup.string(),
})

export {}
