import { FIELD_TYPES } from '@buildeross/ui/Fields'
import * as Yup from 'yup'

export const transactionFunctionFields = [
  {
    name: 'transactionFunction',
    inputLabel: 'Function',
    type: FIELD_TYPES.SELECT,
    helperText: 'Optional',
  },
]

export const validateTransactionFunction = Yup.object().shape({
  transactionFunction: Yup.object(),
})
