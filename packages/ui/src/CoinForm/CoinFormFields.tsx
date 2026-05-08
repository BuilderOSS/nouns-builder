import { DEFAULT_CLANKER_TARGET_FDV } from '@buildeross/utils'
import { Box, Button, Flex, Icon, Stack, Text, vars } from '@buildeross/zord'
import React from 'react'

import FieldError from '../Fields/FieldError'
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
  const propertyRowIdRef = React.useRef(0)
  const [propertyRows, setPropertyRows] = React.useState<
    Array<{
      id: number
      key: string
      value: string
    }>
  >([])

  const getRowsFromProperties = React.useCallback(
    (properties?: Record<string, string>) => {
      const rows = Object.entries(properties || {}).map(([key, value]) => ({
        id: propertyRowIdRef.current++,
        key,
        value,
      }))

      if (rows.length === 0) {
        return [{ id: propertyRowIdRef.current++, key: '', value: '' }]
      }

      return rows
    },
    []
  )

  const validatePropertyRows = React.useCallback(
    (rows: Array<{ id: number; key: string; value: string }>) => {
      const keySet = new Set<string>()

      for (const row of rows) {
        const key = row.key.trim()
        const value = row.value.trim()

        if (!key && !value) {
          continue
        }

        if (!key || !value) {
          return 'Each custom property needs both a key and a value.'
        }

        const normalizedKey = key.toLowerCase()
        if (keySet.has(normalizedKey)) {
          return 'Custom property keys must be unique.'
        }

        keySet.add(normalizedKey)
      }

      return undefined
    },
    []
  )

  const rowsToProperties = React.useCallback(
    (rows: Array<{ id: number; key: string; value: string }>) =>
      rows.reduce<Record<string, string>>((acc, row) => {
        const key = row.key.trim()
        const value = row.value.trim()
        if (key && value) {
          acc[key] = value
        }

        return acc
      }, {}),
    []
  )

  const arePropertiesEqual = React.useCallback(
    (left: Record<string, string>, right: Record<string, string>) => {
      const leftKeys = Object.keys(left)
      const rightKeys = Object.keys(right)

      if (leftKeys.length !== rightKeys.length) {
        return false
      }

      return leftKeys.every((key) => left[key] === right[key])
    },
    []
  )

  const syncPropertyRows = React.useCallback(
    (rows: Array<{ id: number; key: string; value: string }>) => {
      setPropertyRows(rows)

      const properties = rowsToProperties(rows)

      formik.setFieldTouched('properties', true, false)
      formik.setFieldValue('properties', properties, false)
      formik.setFieldError('properties', validatePropertyRows(rows))
    },
    [formik, rowsToProperties, validatePropertyRows]
  )

  const propertiesError =
    formik.touched.properties && typeof formik.errors.properties === 'string'
      ? formik.errors.properties
      : undefined

  React.useEffect(() => {
    const formikProperties = formik.values.properties || {}
    const currentProperties = rowsToProperties(propertyRows)

    if (!arePropertiesEqual(formikProperties, currentProperties)) {
      setPropertyRows(getRowsFromProperties(formikProperties))
    }
  }, [
    arePropertiesEqual,
    formik.values.properties,
    getRowsFromProperties,
    propertyRows,
    rowsToProperties,
  ])

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
                  border: `1px solid ${vars.color.border}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: vars.color.background1,
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
              <Text variant="label-md">Custom Properties (Optional)</Text>
              <Text variant="paragraph-sm" color="text3" mt="x2">
                Add custom key-value pairs as metadata attributes
              </Text>
            </Box>
            <Toggle
              on={showPropertiesSection}
              onToggle={() => {
                const next = !showPropertiesSection
                if (!next) {
                  setPropertyRows([])
                  formik.setFieldTouched('properties', false, false)
                  formik.setFieldValue('properties', {}, false)
                  formik.setFieldError('properties', undefined)
                }
                if (next && propertyRows.length === 0) {
                  setPropertyRows(getRowsFromProperties(formik.values.properties))
                }
                setShowPropertiesSection(next)
              }}
            />
          </Flex>

          {showPropertiesSection && (
            <Flex direction="column" gap="x2">
              {propertyRows.map((row, index) => (
                <Flex key={row.id} gap="x2" align="center">
                  <Box flex={1} style={{ marginBottom: '-32px' }}>
                    <TextInput
                      id={`property-key-${index}`}
                      value={row.key}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const nextRows = propertyRows.map((item) =>
                          item.id === row.id ? { ...item, key: e.target.value } : item
                        )

                        syncPropertyRows(nextRows)
                      }}
                      placeholder="Key"
                      formik={formik}
                    />
                  </Box>
                  <Box flex={1} style={{ marginBottom: '-32px' }}>
                    <TextInput
                      id={`property-value-${index}`}
                      value={row.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const nextRows = propertyRows.map((item) =>
                          item.id === row.id ? { ...item, value: e.target.value } : item
                        )

                        syncPropertyRows(nextRows)
                      }}
                      placeholder="Value"
                      formik={formik}
                    />
                  </Box>
                  {propertyRows.length > 1 && (
                    <Flex align="center" justify="center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const nextRows = propertyRows.filter(
                            (item) => item.id !== row.id
                          )
                          syncPropertyRows(nextRows)
                        }}
                        style={{
                          minWidth: '32px',
                          paddingLeft: '4px',
                          paddingRight: '4px',
                        }}
                        aria-label={`Remove property ${index + 1}`}
                      >
                        <Icon id="cross" />
                      </Button>
                    </Flex>
                  )}
                </Flex>
              ))}
              <Box
                as="button"
                type="button"
                onClick={() => {
                  syncPropertyRows([
                    ...propertyRows,
                    { id: propertyRowIdRef.current++, key: '', value: '' },
                  ])
                }}
                style={{
                  padding: '8px',
                  border: `1px dashed ${vars.color.border}`,
                  borderRadius: '8px',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                + Add Property
              </Box>
              {propertiesError && <FieldError message={propertiesError} />}
            </Flex>
          )}
        </Box>
      )}

      {/* Advanced Pool Settings Section */}
      {showTargetFdv && (
        <Box mt="x8">
          <Flex justify="space-between" align="center" mb="x4">
            <Text variant="label-md">Advanced Pool Settings</Text>
            <Toggle
              on={showAdvancedFdv}
              onToggle={() => {
                const next = !showAdvancedFdv
                if (!next)
                  formik.setFieldValue('targetFdvUsd', DEFAULT_CLANKER_TARGET_FDV)
                setShowAdvancedFdv(next)
              }}
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
