import type { AddressType } from '@buildeross/types'

export interface CoinFormValues {
  name: string
  symbol: string
  description: string
  imageUrl?: string
  mediaUrl?: string
  mediaMimeType?: string
  properties?: Record<string, string>
  currency?: string
  minFdvUsd?: number
}

export interface CoinFormFieldsProps {
  formik: any // FormikProps<CoinFormValues>
  showMediaUpload?: boolean
  showProperties?: boolean
  initialValues?: Partial<CoinFormValues>
  chainId?: number
  showCurrencyInput?: boolean
  currencyOptions?: {
    value: AddressType
    label: string
    disabled?: boolean
  }[]
}
