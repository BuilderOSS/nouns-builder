import {
  BUILDER_TREASURY_ADDRESS,
  ETH_ADDRESS,
  ZORA_ADDRESS,
} from '@buildeross/constants'
import {
  getTokenPriceByAddress,
  getTokenPriceFromMap,
  useTokenPrices,
} from '@buildeross/hooks'
import { uploadFile } from '@buildeross/ipfs-service'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { CoinFormFields, coinFormSchema, type CoinFormValues } from '@buildeross/ui'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { createCreatorPoolConfigFromMinFdv } from '@buildeross/utils'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import * as Sentry from '@sentry/nextjs'
import type { Uploader, UploadResult } from '@zoralabs/coins-sdk'
import { createMetadataBuilder } from '@zoralabs/coins-sdk'
import {
  coinFactoryAddress,
  coinFactoryConfig,
  encodeMultiCurvePoolConfig,
} from '@zoralabs/protocol-deployments'
import { Form, Formik, type FormikHelpers, useFormikContext } from 'formik'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import { type Address, zeroAddress, zeroHash } from 'viem'
import { useAccount, useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

// Supported chain IDs from Zora's deployment
const SUPPORTED_CHAIN_IDS = [CHAIN_ID.BASE, CHAIN_ID.BASE_SEPOLIA]

// Default minimum Fully Diluted Valuation (FDV) in USD for pool config calculations
const DEFAULT_MIN_FDV_USD = 10000 // $10k minimum FDV

/**
 * FormObserver component to watch form values and trigger callback
 */
interface FormObserverProps {
  onChange: (values: CoinFormValues) => void
}

const FormObserver: React.FC<FormObserverProps> = ({ onChange }) => {
  const { values } = useFormikContext<CoinFormValues>()

  useEffect(() => {
    onChange(values)
  }, [values, onChange])

  return null
}

/**
 * Custom IPFS uploader that wraps uploadFile from ipfs-service
 * and implements the Uploader interface from @zoralabs/coins-sdk
 */
class IPFSUploader implements Uploader {
  async upload(file: File): Promise<UploadResult> {
    const result = await uploadFile(file)

    return {
      url: result.uri as `ipfs://${string}`,
      size: file.size,
      mimeType: file.type || undefined,
    }
  }
}

export interface CreateContentCoinFormProps {
  chainId: CHAIN_ID
  treasury: AddressType
  onFormChange?: (values: CoinFormValues) => void
}

export const CreateContentCoinForm: React.FC<CreateContentCoinFormProps> = ({
  chainId,
  treasury,
  onFormChange,
}) => {
  const router = useRouter()
  const config = useConfig()
  const { address: userAddress } = useAccount()
  const [submitError, setSubmitError] = useState<string | undefined>()
  const [isDeploying, setIsDeploying] = useState(false)

  // Check if the current chain is supported
  const isChainSupported = SUPPORTED_CHAIN_IDS.includes(chainId)
  const factoryAddress = isChainSupported
    ? (coinFactoryAddress[chainId as keyof typeof coinFactoryAddress] as AddressType)
    : undefined

  // Determine which currencies to fetch prices for based on chain
  const currenciesToFetch = isChainSupported
    ? chainId === CHAIN_ID.BASE_SEPOLIA
      ? [ETH_ADDRESS as `0x${string}`] // Base Sepolia only supports ETH
      : [ETH_ADDRESS as `0x${string}`, ZORA_ADDRESS as `0x${string}`] // Base mainnet supports ETH and ZORA
    : undefined

  // Fetch token prices for available currencies
  const { prices: tokenPrices } = useTokenPrices(
    isChainSupported ? chainId : undefined,
    currenciesToFetch
  )

  // Initial values
  const initialValues: CoinFormValues = {
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
    mediaUrl: '',
    mediaMimeType: '',
    properties: {},
    currency: ETH_ADDRESS,
    minFdvUsd: DEFAULT_MIN_FDV_USD,
  }

  const handleDeploy = useCallback(
    async (
      values: CoinFormValues,
      metadataUri: string,
      encodedPoolConfig: `0x${string}`,
      builderTreasuryAddress: Address
    ) => {
      if (!factoryAddress) {
        throw new Error('Factory address not found')
      }

      if (!userAddress) {
        throw new Error('User wallet not connected')
      }

      // Create owners array with both user and treasury
      const owners = [userAddress as Address, treasury as Address]

      // Simulate the contract call
      const simulation = await simulateContract(config, {
        abi: coinFactoryConfig.abi,
        address: factoryAddress as Address,
        functionName: 'deploy',
        args: [
          userAddress as Address, // payoutRecipient (user's address)
          owners, // owners array (user and treasury)
          metadataUri, // uri
          values.name, // name
          values.symbol, // symbol
          encodedPoolConfig, // poolConfig
          builderTreasuryAddress, // platformReferrer
          zeroAddress, // postDeployHook
          '0x', // postDeployHookData
          zeroHash, // coinSalt
        ],
      })

      // Execute the transaction
      const txHash = await writeContract(config, simulation.request)

      // Wait for confirmation
      if (txHash) {
        await waitForTransactionReceipt(config, { hash: txHash, chainId })
      }

      return txHash
    },
    [config, factoryAddress, userAddress, treasury, chainId]
  )

  const handleSubmit = async (
    values: CoinFormValues,
    actions: FormikHelpers<CoinFormValues>
  ) => {
    if (!treasury) {
      setSubmitError('Treasury address not found')
      actions.setSubmitting(false)
      return
    }

    if (!factoryAddress) {
      setSubmitError(
        `Posts are only supported on Base and Base Sepolia. Current chain ID: ${chainId}`
      )
      actions.setSubmitting(false)
      return
    }

    setSubmitError(undefined)
    setIsDeploying(true)

    try {
      // 1. Create metadata builder and configure metadata
      const metadataBuilder = createMetadataBuilder()
        .withName(values.name)
        .withSymbol(values.symbol)
        .withDescription(values.description)

      // Set image URI (already uploaded to IPFS via SingleImageUpload)
      if (values.imageUrl) {
        metadataBuilder.withImageURI(values.imageUrl)
      }

      // Set media URI if provided (already uploaded to IPFS via handleMediaUpload)
      if (values.mediaUrl) {
        metadataBuilder.withMediaURI(values.mediaUrl, values.mediaMimeType)
      }

      // Add custom properties if any
      if (values.properties && Object.keys(values.properties).length > 0) {
        metadataBuilder.withProperties(values.properties)
      }

      // 2. Upload metadata and all files to IPFS using our custom uploader
      const uploader = new IPFSUploader()
      const { url: metadataUri } = await metadataBuilder.upload(uploader)

      // 3. Get token price for the selected currency
      const currency = (values.currency || ETH_ADDRESS) as AddressType

      // Try to get price from fetched data first, fallback to placeholder
      let quoteTokenUsd = getTokenPriceFromMap(tokenPrices, currency)

      if (!quoteTokenUsd) {
        // Fallback to placeholder prices
        quoteTokenUsd = getTokenPriceByAddress(currency)
      }

      if (!quoteTokenUsd) {
        throw new Error(`Unable to get price for selected currency: ${currency}`)
      }

      // 4. Create pool config using the utility with form values
      const poolConfig = createCreatorPoolConfigFromMinFdv({
        currency,
        quoteTokenUsd,
        minFdvUsd: values.minFdvUsd || DEFAULT_MIN_FDV_USD,
      })

      // 5. Encode pool config using Zora's function
      const encodedPoolConfig = encodeMultiCurvePoolConfig({
        currency: poolConfig.currency,
        tickLower: poolConfig.lowerTicks,
        tickUpper: poolConfig.upperTicks,
        numDiscoveryPositions: poolConfig.numDiscoveryPositions,
        maxDiscoverySupplyShare: poolConfig.maxDiscoverySupplyShares,
      })

      // 6. Get Builder treasury address for platformReferrer, fallback to zero address
      const builderTreasuryAddress =
        (BUILDER_TREASURY_ADDRESS[
          chainId as keyof typeof BUILDER_TREASURY_ADDRESS
        ] as Address) || zeroAddress

      // 7. Deploy the content coin
      const txHash = await handleDeploy(
        values,
        metadataUri,
        encodedPoolConfig,
        builderTreasuryAddress
      )

      // Success! Navigate back or show success message
      if (txHash) {
        // Reset form
        actions.resetForm()
        // Navigate back to DAO page
        router.back()
      }
    } catch (error) {
      console.error('Error publishing post:', error)
      Sentry.captureException(error)
      await Sentry.flush(2000)
      setSubmitError(error instanceof Error ? error.message : 'Failed to publish post')
    } finally {
      setIsDeploying(false)
      actions.setSubmitting(false)
    }
  }

  // If chain is not supported, show message and don't render form
  if (!isChainSupported) {
    return (
      <Box w="100%">
        <Box
          p="x6"
          borderRadius="curved"
          borderStyle="solid"
          borderWidth="normal"
          borderColor="warning"
          backgroundColor="background2"
        >
          <Stack gap="x2">
            <Text fontSize="16" fontWeight="label">
              Network Not Supported
            </Text>
            <Text fontSize="14" color="text3">
              Publishing posts is currently only supported on Base and Base Sepolia
              networks. Please switch to a supported network to publish your post.
            </Text>
          </Stack>
        </Box>
      </Box>
    )
  }

  return (
    <Box w="100%">
      <Formik
        initialValues={initialValues}
        validationSchema={coinFormSchema}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {(formik) => {
          const isDisabled =
            formik.isSubmitting || formik.isValidating || !treasury || !userAddress

          return (
            <Box
              as="fieldset"
              disabled={isDisabled}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Flex as={Form} direction="column" gap="x6">
                {/* Observer to trigger onFormChange callback */}
                {onFormChange && <FormObserver onChange={onFormChange} />}

                <CoinFormFields
                  formik={formik}
                  showMediaUpload={true}
                  showProperties={true}
                  initialValues={initialValues}
                  chainId={chainId}
                  showCurrencyInput={true}
                />

                {submitError && (
                  <Box
                    p="x4"
                    borderRadius="curved"
                    borderStyle="solid"
                    borderWidth="normal"
                    borderColor="negative"
                    backgroundColor="background2"
                  >
                    <Text fontSize="14" color="negative">
                      {submitError}
                    </Text>
                  </Box>
                )}

                {!treasury && (
                  <Box
                    p="x4"
                    borderRadius="curved"
                    borderStyle="solid"
                    borderWidth="normal"
                    borderColor="warning"
                    backgroundColor="background2"
                  >
                    <Text fontSize="14" color="warning">
                      Treasury address not found. Please ensure DAO is properly
                      configured.
                    </Text>
                  </Box>
                )}

                {!userAddress && (
                  <Box
                    p="x4"
                    borderRadius="curved"
                    borderStyle="solid"
                    borderWidth="normal"
                    borderColor="warning"
                    backgroundColor="background2"
                  >
                    <Text fontSize="14" color="warning">
                      Please connect your wallet to publish a post.
                    </Text>
                  </Box>
                )}

                <Flex gap="x3" justify="flex-end">
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    type="button"
                    disabled={isDeploying}
                  >
                    Cancel
                  </Button>
                  <ContractButton
                    variant="outline"
                    borderRadius="curved"
                    disabled={isDisabled || !formik.isValid}
                    loading={isDeploying}
                    handleClick={formik.handleSubmit}
                    chainId={chainId}
                  >
                    {isDeploying ? 'Publishing...' : 'Publish Post'}
                  </ContractButton>
                </Flex>
              </Flex>
            </Box>
          )
        }}
      </Formik>
    </Box>
  )
}
