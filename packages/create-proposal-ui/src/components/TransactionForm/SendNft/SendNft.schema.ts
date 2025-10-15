import * as yup from 'yup'

export interface SendNftValues {
  contractAddress: string
  tokenId: string
  recipientAddress: string
  amount: number // For ERC1155
}

const sendNftSchema = yup.object().shape({
  contractAddress: yup
    .string()
    .required('Contract address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid Ethereum address'),
  tokenId: yup
    .string()
    .required('Token ID is required')
    .matches(/^\d+$/, 'Must be a valid token ID'),
  recipientAddress: yup
    .string()
    .required('Recipient address is required')
    .test('valid-address', 'Must be a valid Ethereum address', function (value) {
      if (!value) return false
      return /^0x[a-fA-F0-9]{40}$/.test(value) || /^.+\.eth$/.test(value)
    }),
  amount: yup
    .number()
    .min(1, 'Amount must be at least 1')
    .integer('Amount must be a whole number')
    .required('Amount is required'),
})

export default sendNftSchema
