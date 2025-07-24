import { addressValidationSchema } from '@buildeross/utils/yup'
import { TEXT } from 'src/components/Fields/types'
import * as Yup from 'yup'

export const contractAddressFields = [
  {
    name: 'transactionContractAddress',
    inputLabel: 'Address',
    type: TEXT,
    helperText: 'Callee or Recipient',
    placeholder: '0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7',
    isAddress: true,
  },
]

export const validateContractAddress = Yup.object().shape({
  transactionContractAddress: addressValidationSchema,
})
