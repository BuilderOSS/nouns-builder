import * as Yup from 'yup'

export interface ERC721RedeemMinterFormValues {
  mintStart: Date | string | number
  mintEnd: Date | string | number
  pricePerToken: number
  redeemToken: string
}

export const erc721RedeemMinterValidationSchema = Yup.object().shape({
  mintStart: Yup.date().required('Mint start date is required'),
  mintEnd: Yup.date()
    .required('Mint end date is required')
    .test('is-after-start', 'Mint end must be after mint start', function (value) {
      const { mintStart } = this.parent
      if (!value || !mintStart) return false
      const endDate = new Date(value)
      const startDate = new Date(mintStart)
      return endDate > startDate
    }),
  pricePerToken: Yup.number()
    .required('Price per token is required')
    .min(0, 'Price must be greater than or equal to 0')
    .test('is-valid-number', 'Price must be a valid number', (value) => {
      return value !== undefined && !isNaN(value) && isFinite(value)
    }),
  redeemToken: Yup.string()
    .required('Redeem token address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid Ethereum address'),
})
