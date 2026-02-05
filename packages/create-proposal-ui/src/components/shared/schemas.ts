import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import * as yup from 'yup'

/**
 * Shared yup schema for token metadata validation
 * Used across SendTokens, StreamTokens, MilestonePayments, and other token-related forms
 *
 * Note: The balance field is a BigInt object (not a string) populated from blockchain data,
 * so we validate its type directly rather than using string-based validation.
 */
export const TokenMetadataSchema = yup.object({
  name: yup.string().required('Token name is required.'),
  symbol: yup.string().required('Token symbol is required.'),
  decimals: yup.number().required('Token decimals is required.'),
  balance: yup
    .mixed()
    .required('Token balance is required.')
    .test(
      'is-bigint',
      'Token balance must be a BigInt',
      (value) => typeof value === 'bigint'
    ),
  isValid: yup.boolean().required('Token is valid is required.'),
  address: addressValidationSchemaWithError(
    'Token address is invalid.',
    'Token address is required.'
  ),
})
