import type { AddressType } from '@buildeross/types'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import * as yup from 'yup'

export interface PinTreasuryAssetValues {
  tokenType: 0 | 1 | 2 // 0=ERC20, 1=ERC721, 2=ERC1155
  tokenAddress: string | AddressType
  isCollection: boolean
  tokenId: string
}

export const pinTreasuryAssetSchema = () =>
  yup.object({
    tokenType: yup
      .number()
      .oneOf([0, 1, 2], 'Token type must be ERC20 (0), ERC721 (1), or ERC1155 (2)')
      .required('Token type is required'),
    tokenAddress: addressValidationSchemaWithError(
      'Token address is invalid.',
      'Token address is required.'
    ).test(
      'not-zero-address',
      'Cannot use zero address',
      (value) => value !== '0x0000000000000000000000000000000000000000'
    ),
    isCollection: yup.boolean().required(),
    tokenId: yup
      .string()
      .test('tokenId-rules', 'Invalid tokenId for token type', function (value) {
        const { tokenType, isCollection } = this.parent

        // ERC20: tokenId must be 0
        if (tokenType === 0) {
          return value === '0' || value === ''
        }

        // ERC721/ERC1155: if collection, tokenId must be 0
        if ((tokenType === 1 || tokenType === 2) && isCollection) {
          return value === '0' || value === ''
        }

        // ERC721/ERC1155: if not collection, tokenId can be any valid number
        if ((tokenType === 1 || tokenType === 2) && !isCollection) {
          return /^\d+$/.test(value || '0')
        }

        return true
      }),
  })
