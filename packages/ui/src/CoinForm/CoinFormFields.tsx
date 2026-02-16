import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import NumberInput from '../Fields/NumberInput'
import TextArea from '../Fields/TextArea'
import TextInput from '../Fields/TextInput'
import { SingleMediaUpload } from '../SingleMediaUpload/SingleMediaUpload'
import { Toggle } from '../Toggle'
import type { CoinFormFieldsProps } from './types'

export const CoinFormFields: React.FC<CoinFormFieldsProps> = ({
  formik,
  mediaType = 'all',
  showProperties = false,
  showTargetFdv = false,
  showCurrencyInput = true,
  currencyOptions,
}) => {
  const [showAdvancedFdv, setShowAdvancedFdv] = React.useState(false)
  const [showPropertiesSection, setShowPropertiesSection] = React.useState(false)

  // Handle media upload to store mime type
  const handleMediaUploadStart = React.useCallback(
    (file: File) => {
      formik.setFieldValue('mediaMimeType', file.type)
    },
    [formik]
  )

  // Check if uploaded media is an image
  const isMediaImage = formik.values.mediaMimeType?.startsWith('image/')
  const showThumbnailUpload =
    mediaType === 'all' && formik.values.mediaMimeType && !isMediaImage

  return (
    <Stack gap="x4">
      {/* Media Upload - Primary Field */}
      <SingleMediaUpload
        formik={formik}
        id="mediaUrl"
        inputLabel={mediaType === 'image' ? 'Image' : 'Media'}
        helperText={
          mediaType === 'image'
            ? 'Upload an image for your coin (JPG, PNG, WebP, SVG)'
            : 'Upload media for your coin (images, videos, or audio)'
        }
        value={formik.values.mediaUrl || ''}
        onUploadStart={handleMediaUploadStart}
        uploadType={mediaType === 'image' ? 'image' : 'media'}
      />

      {/* Conditional Thumbnail Upload - Only for non-image media in 'all' mode */}
      {showThumbnailUpload && (
        <SingleMediaUpload
          formik={formik}
          id="imageUrl"
          inputLabel="Thumbnail Image"
          helperText="Upload a thumbnail image for your video/audio content (JPG, PNG, WebP, SVG)"
          value={formik.values.imageUrl || ''}
          uploadType="image"
        />
      )}

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
        inputLabel="Name"
        placeholder="My Coin"
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
      {showCurrencyInput && currencyOptions.length > 0 && (
        <Box>
          <Text as="label" htmlFor="currency" variant="label-md" mb="x2">
            Base Currency
          </Text>
          {currencyOptions.length === 1 ? (
            // Single option: Show as read-only display
            <>
              <Text variant="paragraph-sm" color="text3" mb="x2">
                Your content coin will be paired with this creator coin
              </Text>
              <Box
                p="x4"
                borderRadius="curved"
                borderStyle="solid"
                borderWidth="normal"
                borderColor="border"
                backgroundColor="background2"
              >
                <Text variant="label-md">{currencyOptions[0].label}</Text>
                <Text variant="paragraph-sm" color="text3" mt="x2">
                  {currencyOptions[0].value}
                </Text>
              </Box>
            </>
          ) : (
            // Multiple options: Show as dropdown
            <>
              <Text variant="paragraph-sm" color="text3" mb="x2">
                Select the currency for the creator coin pool
              </Text>
              <Box
                as="select"
                id="currency"
                value={formik.values.currency}
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
            </>
          )}
        </Box>
      )}

      {/* Optional Properties/Attributes */}
      {showProperties && (
        <Box mt="x4">
          <Flex justify="space-between" align="center" mb="x4">
            <Box>
              <Text as="h3" variant="heading-sm">
                Custom Properties (Optional)
              </Text>
              <Text variant="paragraph-sm" color="text3" mt="x2">
                Add custom key-value pairs as metadata attributes
              </Text>
            </Box>
            <Toggle
              on={showPropertiesSection}
              onToggle={() => setShowPropertiesSection(!showPropertiesSection)}
            />
          </Flex>

          {showPropertiesSection && (
            <Flex direction="column" gap="x2">
              {Object.entries(formik.values.properties || {}).map(
                ([key, value], index) => (
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
                )
              )}
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
          )}
        </Box>
      )}

      {/* Advanced Pool Settings Section */}
      {showTargetFdv && (
        <Box mt="x8">
          <Flex justify="space-between" align="center" mb="x4">
            <Text as="h3" variant="heading-sm">
              Advanced Pool Settings
            </Text>
            <Toggle
              on={showAdvancedFdv}
              onToggle={() => setShowAdvancedFdv(!showAdvancedFdv)}
            />
          </Flex>

          {showAdvancedFdv && (
            <Stack gap="x4">
              <Text variant="paragraph-sm" color="text3" mb="x2">
                Configure the target market cap for your token's liquidity pool. The pool
                will distribute liquidity geometrically around this central value.
              </Text>

              {/* Target FDV */}
              <Box>
                <Text as="label" htmlFor="targetFdvUsd" variant="label-md" mb="x2">
                  Target Market Cap (USD)
                </Text>
                <Text variant="paragraph-sm" color="text3" mb="x2">
                  The geometric center for liquidity distribution. Default: $6,364,000
                  (spreads to $27K-$1.5B range)
                </Text>
                <NumberInput
                  id="targetFdvUsd"
                  value={formik.values.targetFdvUsd ?? 6364000}
                  onChange={formik.handleChange}
                  placeholder="6364000"
                  step="100000"
                  min="1000"
                  useTextInput={true}
                  errorMessage={
                    formik.touched.targetFdvUsd && formik.errors.targetFdvUsd
                      ? formik.errors.targetFdvUsd
                      : undefined
                  }
                  hasError={!!(formik.touched.targetFdvUsd && formik.errors.targetFdvUsd)}
                />

                {/* Display calculated range */}
                {formik.values.targetFdvUsd && (
                  <Box mt="x2">
                    <Text variant="paragraph-sm" color="text3">
                      Liquidity Range: $
                      {Math.round(
                        (formik.values.targetFdvUsd ?? 6364000) / 235.7
                      ).toLocaleString('en-US')}{' '}
                      - $
                      {Math.round(
                        (formik.values.targetFdvUsd ?? 6364000) * 235.7
                      ).toLocaleString('en-US')}
                    </Text>
                  </Box>
                )}
              </Box>
            </Stack>
          )}
        </Box>
      )}
    </Stack>
  )
}
