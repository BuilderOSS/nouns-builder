import { maxUint256 } from 'viem'
import * as Yup from 'yup'

const validateBigIntString = (
  value: string | undefined,
  ctx: Yup.TestContext<any>,
  errorMessage?: string
): boolean | Yup.ValidationError => {
  if (!value) return false

  try {
    const bigIntValue = BigInt(value)

    if (bigIntValue < 0n) {
      return ctx.createError({
        message: errorMessage || 'Value must be greater than or equal to 0',
      })
    }

    if (bigIntValue > maxUint256) {
      return ctx.createError({
        message: errorMessage || 'Value exceeds maximum uint256 value',
      })
    }

    return true
  } catch {
    return ctx.createError({
      message: errorMessage || 'Invalid number format',
    })
  }
}

export const bigIntStringValidationSchema = Yup.string()
  .required('*')
  .test('is-valid-bigint', 'Invalid number format', function (value) {
    return validateBigIntString(value, this)
  })

export const bigIntStringValidationSchemaWithError = (
  invalidErrorMessage: string,
  requiredErrorMessage: string
) =>
  Yup.string()
    .required(requiredErrorMessage)
    .test('is-valid-bigint', invalidErrorMessage, function (value) {
      return validateBigIntString(value, this, invalidErrorMessage)
    })

export const bigIntStringValidationOptionalSchema = Yup.string().test(
  'is-valid-bigint-optional',
  'Invalid number format',
  function (value) {
    if (!value) return true
    return validateBigIntString(value, this)
  }
)
