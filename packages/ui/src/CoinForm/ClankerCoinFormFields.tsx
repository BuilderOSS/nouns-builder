import { FEE_CONFIG_OPTIONS, POOL_POSITION_OPTIONS } from '@buildeross/utils'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import SmartInput from '../Fields/SmartInput'
import TextInput from '../Fields/TextInput'
import { FIELD_TYPES } from '../Fields/types'
import { Toggle } from '../Toggle'
import { CoinFormFields } from './CoinFormFields'
import type { CoinFormFieldsProps } from './types'

/**
 * Extended coin form fields for Clanker deployment
 * Includes all standard fields plus Clanker-specific configuration
 */
export const ClankerCoinFormFields: React.FC<CoinFormFieldsProps> = ({
  formik,
  showMediaUpload = false,
  showProperties = false,
  chainId,
  showCurrencyInput = true,
  currencyOptions,
}) => {
  const [showVaultSettings, setShowVaultSettings] = React.useState(false)

  return (
    <Stack gap="x4">
      {/* Reuse existing coin form fields */}
      <CoinFormFields
        formik={formik}
        showMediaUpload={showMediaUpload}
        showProperties={showProperties}
        chainId={chainId}
        showCurrencyInput={showCurrencyInput}
        currencyOptions={currencyOptions}
      />

      {/* Clanker-specific configuration */}
      <Box mt="x8">
        <Text as="h3" variant="heading-sm" mb="x4">
          Pool Configuration
        </Text>

        {/* Pool Configuration Dropdown */}
        <Box mb="x6">
          <Text as="label" htmlFor="poolConfig" variant="label-md" mb="x2">
            Pool Type
          </Text>
          <Text variant="paragraph-sm" color="text3" mb="x2">
            Choose a preset pool configuration or customize based on market cap. Project
            pools are optimized for long-term projects.
          </Text>
          <Box
            as="select"
            id="poolConfig"
            value={formik.values.poolConfig || POOL_POSITION_OPTIONS[0].value}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              formik.setFieldValue('poolConfig', e.target.value)
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
            {POOL_POSITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </Box>
        </Box>

        {/* Fee Configuration Dropdown */}
        <Box mb="x6">
          <Text as="label" htmlFor="feeConfig" variant="label-md" mb="x2">
            Fee Configuration
          </Text>
          <Text variant="paragraph-sm" color="text3" mb="x2">
            Fee structure for trading. DynamicBasic adjusts fees based on trading volume.
          </Text>
          <Box
            as="select"
            id="feeConfig"
            value={formik.values.feeConfig || FEE_CONFIG_OPTIONS[0].value}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              formik.setFieldValue('feeConfig', e.target.value)
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
            {FEE_CONFIG_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </Box>
        </Box>

        {/* Dev Buy Amount */}
        <TextInput
          id="devBuyEthAmount"
          value={formik.values.devBuyEthAmount || ''}
          onChange={formik.handleChange}
          inputLabel="Initial Purchase (ETH)"
          placeholder="0.1"
          helperText="Optional: Amount of ETH to automatically purchase on deployment (e.g., 0.1 ETH)"
          errorMessage={
            formik.touched.devBuyEthAmount && formik.errors.devBuyEthAmount
              ? formik.errors.devBuyEthAmount
              : undefined
          }
          formik={formik}
        />
      </Box>

      {/* Vault Settings Section */}
      <Box mt="x8">
        <Flex justify="space-between" align="center" mb="x4">
          <Text as="h3" variant="heading-sm">
            Vault Settings
          </Text>
          <Toggle
            on={showVaultSettings}
            onToggle={() => setShowVaultSettings(!showVaultSettings)}
          />
        </Flex>

        {showVaultSettings && (
          <Stack gap="x4">
            <Text variant="paragraph-sm" color="text3" mb="x2">
              Configure token lockup and vesting for the DAO treasury
            </Text>

            {/* Vault Percentage */}
            <TextInput
              id="vaultPercentage"
              value={formik.values.vaultPercentage ?? 10}
              onChange={formik.handleChange}
              inputLabel="Vault Allocation (%)"
              placeholder="10"
              helperText="Percentage of token supply locked in vault for the DAO (1-90%). Default: 10%"
              errorMessage={
                formik.touched.vaultPercentage && formik.errors.vaultPercentage
                  ? formik.errors.vaultPercentage
                  : undefined
              }
              formik={formik}
            />

            {/* Lockup Duration */}
            <TextInput
              id="lockupDuration"
              value={formik.values.lockupDuration ?? 30}
              onChange={formik.handleChange}
              inputLabel="Lockup Period (days)"
              placeholder="30"
              helperText="How long tokens are locked before vesting begins (minimum 7 days). Default: 30 days"
              errorMessage={
                formik.touched.lockupDuration && formik.errors.lockupDuration
                  ? formik.errors.lockupDuration
                  : undefined
              }
              formik={formik}
            />

            {/* Vesting Duration */}
            <TextInput
              id="vestingDuration"
              value={formik.values.vestingDuration ?? 30}
              onChange={formik.handleChange}
              inputLabel="Vesting Period (days)"
              placeholder="30"
              helperText="How long tokens take to fully vest after lockup (can be 0 for instant). Default: 30 days"
              errorMessage={
                formik.touched.vestingDuration && formik.errors.vestingDuration
                  ? formik.errors.vestingDuration
                  : undefined
              }
              formik={formik}
            />

            {/* Vault Recipient (Optional) */}
            <SmartInput
              id="vaultRecipient"
              type={FIELD_TYPES.TEXT}
              value={formik.values.vaultRecipient || ''}
              onChange={formik.handleChange}
              inputLabel="Vault Recipient Address (Optional)"
              placeholder="0x..."
              helperText="Custom address to receive vaulted tokens. Defaults to DAO treasury if not specified."
              isAddress={true}
              errorMessage={
                formik.touched.vaultRecipient && formik.errors.vaultRecipient
                  ? formik.errors.vaultRecipient
                  : undefined
              }
              formik={formik}
            />
          </Stack>
        )}
      </Box>
    </Stack>
  )
}
