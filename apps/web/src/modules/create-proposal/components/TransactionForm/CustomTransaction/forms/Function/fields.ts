import { SELECT } from 'src/components/Fields/types'
import * as Yup from 'yup'

export const transactionFunctionFields = [
  {
    name: 'transactionFunction',
    inputLabel: 'Function',
    type: SELECT,
    helperText: 'Optional',
  },
]

export const validateTransactionFunction = Yup.object().shape({
  transactionFunction: Yup.object(),
})
