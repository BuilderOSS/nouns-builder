import { Address } from 'wagmi'
import * as Yup from 'yup'

import { CHAIN_ID } from 'src/typings'
import { isValidAddress } from 'src/utils/ens'
import { getProvider } from 'src/utils/provider'

const validateAddress = async (
  value: string | undefined,
  ctx: Yup.TestContext<any>,
  errorMessage?: string
): Promise<boolean | Yup.ValidationError> => {
  if (!value) return false

  try {
    const { data: isValid, error } = await isValidAddress(
      value as Address,
      getProvider(CHAIN_ID.ETHEREUM),
      errorMessage
    )

    if (!isValid || error) {
      return ctx.createError({ message: error || errorMessage || 'Invalid address' })
    }

    return true
  } catch {
    return ctx.createError({ message: errorMessage || 'Invalid address' })
  }
}

export const addressValidationSchema = Yup.string()
  .required('*')
  .test('is-valid-address', '*', function (value) {
    return validateAddress(value, this)
  })

export const addressValidationSchemaWithError = (
  invalidErrorMessage: string,
  requiredErrorMessage: string
) =>
  Yup.string()
    .required(requiredErrorMessage)
    .test('is-valid-address', invalidErrorMessage, function (value) {
      return validateAddress(value, this, invalidErrorMessage)
    })

export const addressValidationOptionalSchema = Yup.string().test(
  'is-valid-address-optional',
  'Invalid address',
  function (value) {
    if (!value) return true
    return validateAddress(value, this)
  }
)
