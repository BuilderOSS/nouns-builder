import { TEXTAREA } from 'src/components/Fields/types'
import * as Yup from 'yup'

export const fields = [
  {
    name: 'transactionCustomABI',
    inputLabel: 'Contract ABI',
    type: TEXTAREA,
    placeHolder: 'ABI',
    helperText: 'Optional',
  },
]

export const validateABI = () =>
  Yup.object().shape({
    transactionCustomABI: Yup.string().test(
      'isABI',
      'invalid ABI',
      (value: string | undefined) => {
        if (!value) return true

        let abi
        try {
          abi = JSON.parse(value)
        } catch (e) {
          return false
        }

        // ABI is an array with at least one object that has an inputs property
        return Array.isArray(abi) && !!abi[0]?.inputs
      }
    ),
  })
