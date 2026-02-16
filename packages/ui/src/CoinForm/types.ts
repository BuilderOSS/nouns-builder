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
  currency?: AddressType
  targetFdvUsd?: number // Target fully diluted valuation for pool configuration
  // Clanker-specific fields
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
  mediaType?: 'image' | 'all' // 'image' = image-only, 'all' = all media types
  showProperties?: boolean
  showTargetFdv?: boolean
  initialValues?: Partial<CoinFormValues>
  showCurrencyInput?: boolean
  currencyOptions: CurrencyOption[]
}
