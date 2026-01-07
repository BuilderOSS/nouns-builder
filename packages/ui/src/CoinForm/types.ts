import type { AddressType } from '@buildeross/types'

export type CoinFormValues = {
  name: string
  symbol: string
  description: string
  imageUrl?: string
  mediaFile?: File
  mediaUrl?: string
  mediaMimeType?: string
  properties?: Record<string, string>
  currency?: string
  customCurrency?: string // Custom ERC20 token address when currency is "custom"
  minFdvUsd?: number
  // Clanker-specific fields
  poolConfig?: string
  feeConfig?: string
  vaultPercentage?: number
  lockupDuration?: number // in days
  vestingDuration?: number // in days
  vaultRecipient?: string
  devBuyEthAmount?: number
}

export type CurrencyOption = {
  value: AddressType
  label: string
  disabled?: boolean
}

export type CoinFormFieldsProps = {
  formik: any // FormikProps<CoinFormValues>
  showMediaUpload?: boolean
  showProperties?: boolean
  initialValues?: Partial<CoinFormValues>
  chainId?: number
  showCurrencyInput?: boolean
  currencyOptions?: CurrencyOption[]
}
