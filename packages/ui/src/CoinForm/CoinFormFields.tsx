import {
  ETH_ADDRESS,
  TEST0_ADDRESS,
  TEST1_ADDRESS,
  ZORA_ADDRESS,
} from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import TextArea from '../Fields/TextArea'
import TextInput from '../Fields/TextInput'
import { SingleImageUpload } from '../SingleImageUpload/SingleImageUpload'
import { SingleMediaUpload } from '../SingleMediaUpload/SingleMediaUpload'
import type { CoinFormFieldsProps, CurrencyOption } from './types'

// Currency options based on chain
const BASE_MAINNET_CHAIN_ID = CHAIN_ID.BASE
const BASE_SEPOLIA_CHAIN_ID = CHAIN_ID.BASE_SEPOLIA

export const CoinFormFields: React.FC<CoinFormFieldsProps> = ({
  formik,
  showMediaUpload = false,
  showProperties = false,
  chainId,
  showCurrencyInput = true,
  currencyOptions: defaultCurrencyOptions,
}) => {
  // Determine available currency options based on chain
  const isBaseSepolia = chainId === BASE_SEPOLIA_CHAIN_ID
  const isBaseMainnet = chainId === BASE_MAINNET_CHAIN_ID

  const currencyOptions: CurrencyOption[] = React.useMemo(() => {
    if (defaultCurrencyOptions) {
      return defaultCurrencyOptions
    }
    if (isBaseSepolia) {
      return [{ value: ETH_ADDRESS, label: 'ETH' }]
    }
    if (isBaseMainnet) {
      return [
        { value: ETH_ADDRESS, label: 'ETH' },
        { value: ZORA_ADDRESS, label: 'ZORA' },
        { value: TEST0_ADDRESS, label: 'TEST0' },
        { value: TEST1_ADDRESS, label: 'TEST1' },
      ]
    }
    return [{ value: ETH_ADDRESS, label: 'ETH' }]
  }, [isBaseSepolia, isBaseMainnet, defaultCurrencyOptions])

  // Handle media upload to store mime type
  const handleMediaUploadStart = React.useCallback(
    (file: File) => {
      formik.setFieldValue('mediaMimeType', file.type)
    },
    [formik]
  )

  return (
    <Stack gap="x4">
      {/* Name Field */}
      <TextInput
        id="name"
        value={formik.values.name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const name = e.target.value
          formik.handleChange(e)

          // Auto-generate symbol if it's empty or hasn't been manually touched
          if (!formik.touched.symbol || !formik.values.symbol) {
            const generatedSymbol = `$${name
              .toUpperCase()
              .replace(/[AEIOU\s]/g, '')
              .slice(0, 4)}`
            formik.setFieldValue('symbol', generatedSymbol)
          }
        }}
        inputLabel="Coin Name"
        placeholder="My Creator Coin"
        helperText="The display name for your coin (1-100 characters)"
        errorMessage={
          formik.touched.name && formik.errors.name ? formik.errors.name : undefined
        }
        formik={formik}
      />

      {/* Symbol Field */}
      <TextInput
        id="symbol"
        value={formik.values.symbol}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value.toUpperCase()
          formik.setFieldValue('symbol', value)
        }}
        inputLabel="Symbol"
        placeholder="COIN"
        helperText="A short ticker symbol for your coin (1-10 uppercase letters/numbers). Auto-generated from name but you can customize it."
        errorMessage={
          formik.touched.symbol && formik.errors.symbol ? formik.errors.symbol : undefined
        }
        formik={formik}
      />

      {/* Description Field */}
      <TextArea
        id="description"
        value={formik.values.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        inputLabel="Description"
        placeholder="Describe your creator coin..."
        helperText="Provide a detailed description of your creator coin"
        errorMessage={
          formik.touched.description && formik.errors.description
            ? formik.errors.description
            : undefined
        }
        formik={formik}
      />

      {/* Currency Selection */}
      {showCurrencyInput && (
        <Stack gap="x4">
          <Box>
            <Text as="label" htmlFor="currency" variant="label-md" mb="x2">
              Base Currency
            </Text>
            <Text variant="paragraph-sm" color="text3" mb="x2">
              Select the currency for the creator coin pool
            </Text>
            <Box
              as="select"
              id="currency"
              value={formik.values.currency || ETH_ADDRESS}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                formik.setFieldValue('currency', e.target.value)
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
              }}
            >
              {currencyOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
            </Box>
          </Box>

          {/* Custom Currency Address Input - show when "custom" is selected */}
          {formik.values.currency === '0xcustom' && (
            <Box>
              <TextInput
                id="customCurrency"
                value={formik.values.customCurrency || ''}
                onChange={formik.handleChange}
                inputLabel="Custom Token Address"
                placeholder="0x..."
                helperText="Enter the ERC20 token contract address to use as base currency"
                errorMessage={
                  formik.touched.customCurrency && formik.errors.customCurrency
                    ? formik.errors.customCurrency
                    : undefined
                }
                formik={formik}
              />
            </Box>
          )}
        </Stack>
      )}

      {/* Minimum FDV Input */}
      <TextInput
        id="minFdvUsd"
        value={formik.values.minFdvUsd || ''}
        onChange={formik.handleChange}
        inputLabel="Initial Market Cap (USD)"
        placeholder="10000"
        helperText="The minimum fully diluted valuation in USD. This determines the initial price curve. Default: $10,000"
        errorMessage={
          formik.touched.minFdvUsd && formik.errors.minFdvUsd
            ? formik.errors.minFdvUsd
            : undefined
        }
        formik={formik}
      />

      {/* Image Upload */}
      <SingleImageUpload
        formik={formik}
        id="imageUrl"
        inputLabel="Coin Image"
        helperText="Upload an image for your coin (JPG, PNG, SVG, WebP)"
        value={formik.values.imageUrl}
        size="lg"
      />

      {/* Optional Media Upload */}
      {showMediaUpload && (
        <SingleMediaUpload
          formik={formik}
          id="mediaUrl"
          inputLabel="Media (Optional)"
          helperText="Upload additional media content (video, audio, etc.)"
          value={formik.values.mediaUrl || ''}
          onUploadStart={handleMediaUploadStart}
        />
      )}

      {/* Optional Properties/Attributes */}
      {showProperties && (
        <Box>
          <Text as="label" variant="label-md" mb="x2">
            Custom Properties (Optional)
          </Text>
          <Text variant="paragraph-sm" color="text3" mb="x2">
            Add custom key-value pairs as metadata attributes
          </Text>
          <Flex direction="column" gap="x2">
            {Object.entries(formik.values.properties || {}).map(([key, value], index) => (
              <Flex key={index} gap="x2">
                <TextInput
                  id={`property-key-${index}`}
                  value={key}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newProps = { ...formik.values.properties }
                    delete newProps[key]
                    newProps[e.target.value] = value as string
                    formik.setFieldValue('properties', newProps)
                  }}
                  placeholder="Key"
                  formik={formik}
                />
                <TextInput
                  id={`property-value-${index}`}
                  value={value as string}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newProps = { ...formik.values.properties }
                    newProps[key] = e.target.value
                    formik.setFieldValue('properties', newProps)
                  }}
                  placeholder="Value"
                  formik={formik}
                />
              </Flex>
            ))}
            <Box
              as="button"
              type="button"
              onClick={() => {
                const newProps = { ...formik.values.properties, '': '' }
                formik.setFieldValue('properties', newProps)
              }}
              style={{
                padding: '8px',
                border: '1px dashed #e5e5e5',
                borderRadius: '8px',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              + Add Property
            </Box>
          </Flex>
        </Box>
      )}
    </Stack>
  )
}
