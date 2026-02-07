import { BUILDER_TREASURY_ADDRESS } from '@buildeross/constants'
import { useClankerTokenPrice, useClankerTokens } from '@buildeross/hooks'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID, TransactionType } from '@buildeross/types'
import { CoinFormFields, coinFormSchema, type CoinFormValues } from '@buildeross/ui'
import { createContentPoolConfigWithClankerTokenAsCurrency } from '@buildeross/utils'
import { Box, Button, Stack, Text } from '@buildeross/zord'
import { createMetadataBuilder } from '@zoralabs/coins-sdk'
import {
  coinFactoryAddress,
  coinFactoryConfig,
  encodeMultiCurvePoolConfig,
} from '@zoralabs/protocol-deployments'
import { Form, Formik, type FormikHelpers, useFormikContext } from 'formik'
import React, { useEffect, useMemo, useState } from 'react'
import { type Address, encodeFunctionData, zeroAddress, zeroHash } from 'viem'

import { ContentCoinPreviewDisplay } from './ContentCoinPreviewDisplay'
import { IPFSUploader } from './ipfsUploader'

// Supported chain IDs from Zora's deployment
const SUPPORTED_CHAIN_IDS = [CHAIN_ID.BASE, CHAIN_ID.BASE_SEPOLIA]

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

export interface ContentCoinProps {
  initialValues?: Partial<CoinFormValues>
  onSubmitSuccess?: () => void
  showMediaUpload?: boolean
  showProperties?: boolean
}

export const ContentCoin: React.FC<ContentCoinProps> = ({
  initialValues: providedInitialValues,
  onSubmitSuccess,
  showMediaUpload = true,
  showProperties = true,
}) => {
  const { treasury, token } = useDaoStore((state) => state.addresses)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const { chain } = useChainStore()

  const [submitError, setSubmitError] = useState<string | undefined>()
  const [previewData, setPreviewData] = useState<CoinFormValues>({
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
    mediaUrl: '',
    mediaMimeType: '',
  })

  // Check if the current chain is supported
  const isChainSupported = SUPPORTED_CHAIN_IDS.includes(chain.id)
  const factoryAddress = isChainSupported
    ? (coinFactoryAddress[chain.id as keyof typeof coinFactoryAddress] as AddressType)
    : undefined

  // Fetch the latest ClankerToken for this DAO
  const { data: clankerTokens } = useClankerTokens({
    chainId: chain.id,
    collectionAddress: token,
    enabled: isChainSupported,
    first: 1, // Only fetch the latest token
  })

  // Get the latest ClankerToken (first item in array)
  const latestClankerToken = useMemo(() => {
    return clankerTokens && clankerTokens.length > 0 ? clankerTokens[0] : null
  }, [clankerTokens])

  // Fetch the ClankerToken price
  const {
    priceUsd: clankerTokenPriceUsd,
    isLoading: clankerTokenPriceLoading,
    error: clankerTokenPriceError,
  } = useClankerTokenPrice({
    clankerToken: latestClankerToken,
    chainId: chain.id,
    enabled: isChainSupported && !!latestClankerToken,
  })

  // Define currency options with only the latest ClankerToken
  const currencyOptions = useMemo(() => {
    if (!latestClankerToken) {
      return []
    }

    // Only show the latest ClankerToken as currency option
    return [
      {
        value: latestClankerToken.tokenAddress as AddressType,
        label: `${latestClankerToken.tokenSymbol} (${latestClankerToken.tokenName})`,
      },
    ]
  }, [latestClankerToken])

  // Initial values from props - automatically set currency if only one option
  const initialValues: CoinFormValues = useMemo(
    () => ({
      name: providedInitialValues?.name || '',
      symbol: providedInitialValues?.symbol || '',
      description: providedInitialValues?.description || '',
      imageUrl: providedInitialValues?.imageUrl || '',
      mediaUrl: providedInitialValues?.mediaUrl || '',
      mediaMimeType: providedInitialValues?.mediaMimeType || '',
      properties: providedInitialValues?.properties || {},
      currency: providedInitialValues?.currency || currencyOptions[0]?.value,
    }),
    [providedInitialValues, currencyOptions]
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
        `Content coins are only supported on Base and Base Sepolia. Current chain: ${chain.name}`
      )
      actions.setSubmitting(false)
      return
    }

    setSubmitError(undefined)

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

      // 3. Get token price for the selected currency (ClankerToken address)
      const currency = values.currency as AddressType

      // Use the ClankerToken price
      let quoteTokenUsd = clankerTokenPriceUsd

      // Handle price loading or error
      if (clankerTokenPriceLoading) {
        setSubmitError('Still loading token price. Please wait...')
        actions.setSubmitting(false)
        return
      }

      if (clankerTokenPriceError) {
        throw new Error(
          `Error fetching token price: ${clankerTokenPriceError.message}. Cannot create content coin without token price.`
        )
      }

      if (!quoteTokenUsd) {
        throw new Error(
          `Unable to get price for selected currency: ${currency}. Cannot create content coin without token price.`
        )
      }

      // 4. Create pool config using the utility with constant FDV
      const poolConfig = createContentPoolConfigWithClankerTokenAsCurrency({
        currency,
        quoteTokenUsd,
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
        BUILDER_TREASURY_ADDRESS[chain.id as keyof typeof BUILDER_TREASURY_ADDRESS] ||
        zeroAddress

      // 7. Encode the contract call using Zora's ABI with deploy function
      const calldata = encodeFunctionData({
        abi: coinFactoryConfig.abi,
        functionName: 'deploy',
        args: [
          treasury as Address, // payoutRecipient
          [treasury as Address], // owners array
          metadataUri, // uri
          values.name, // name
          values.symbol, // symbol
          encodedPoolConfig, // poolConfig
          builderTreasuryAddress as Address, // platformReferrer (Builder treasury for referral, or zero address)
          zeroAddress, // postDeployHook (no hook for content coins)
          '0x', // postDeployHookData (empty bytes)
          zeroHash, // coinSalt (can be customized if needed)
        ],
      })

      // 8. Create transaction object
      const transaction = {
        target: factoryAddress,
        functionSignature:
          'deploy(address,address[],string,string,string,bytes,address,address,bytes,bytes32)',
        calldata,
        value: '0',
      }

      // 9. Add transaction to proposal queue
      addTransaction({
        type: TransactionType.CONTENT_COIN,
        summary: `Create ${values.symbol} Content Coin`,
        transactions: [transaction],
      })

      // Reset form
      actions.resetForm()

      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (error) {
      console.error('Error creating content coin transaction:', error)
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create transaction'
      )
    } finally {
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
          backgroundColor="warning"
          style={{ opacity: 0.1 }}
        >
          <Stack gap="x2">
            <Text variant="heading-sm">Network Not Supported</Text>
            <Text variant="paragraph-md" color="text3">
              Content coins are currently only supported on Base and Base Sepolia
              networks. Please switch to a supported network to create a content coin.
            </Text>
          </Stack>
        </Box>
      </Box>
    )
  }

  // If no ClankerToken exists, show warning and don't render form
  if (!latestClankerToken) {
    return (
      <Box w="100%">
        <Box
          p="x6"
          borderRadius="curved"
          backgroundColor="warning"
          style={{ opacity: 0.1 }}
        >
          <Stack gap="x2">
            <Text variant="heading-sm">No Creator Coin Found</Text>
            <Text variant="paragraph-md" color="text3">
              This DAO needs to create a Creator Coin before publishing content coins.
              Creator Coins are used as the base currency for content posts. Please create
              a Creator Coin proposal first.
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
        enableReinitialize
      >
        {(formik) => {
          const isDisabled = formik.isSubmitting || formik.isValidating || !treasury

          return (
            <Box
              as="fieldset"
              disabled={isDisabled}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Form>
                {/* Observer to trigger preview updates */}
                <FormObserver onChange={setPreviewData} />

                <Stack gap="x6">
                  {/* Preview positioned absolutely on the right side (hidden on mobile) */}
                  <ContentCoinPreviewDisplay
                    previewData={previewData}
                    chainId={chain.id}
                  />

                  {/* Form header and fields */}
                  <Stack gap="x4">
                    <Text variant="heading-sm">Create Content Coin</Text>
                    <Text variant="paragraph-md" color="text3">
                      Configure your content coin metadata and add the transaction to the
                      proposal queue.
                    </Text>
                  </Stack>

                  <CoinFormFields
                    formik={formik}
                    initialValues={initialValues}
                    showMediaUpload={showMediaUpload}
                    showProperties={showProperties}
                    showTargetFdv={false}
                    showCurrencyInput={true}
                    currencyOptions={currencyOptions}
                  />

                  {submitError && (
                    <Box
                      p="x4"
                      borderRadius="curved"
                      backgroundColor="negative"
                      style={{ opacity: 0.1 }}
                    >
                      <Text variant="paragraph-sm" color="negative">
                        {submitError}
                      </Text>
                    </Box>
                  )}

                  {!treasury && (
                    <Box
                      p="x4"
                      borderRadius="curved"
                      backgroundColor="warning"
                      style={{ opacity: 0.1 }}
                    >
                      <Text variant="paragraph-sm" color="warning">
                        Treasury address not found. Please connect to a DAO.
                      </Text>
                    </Box>
                  )}

                  <Button
                    variant="outline"
                    borderRadius="curved"
                    w="100%"
                    type="submit"
                    disabled={isDisabled || !formik.isValid}
                  >
                    {formik.isSubmitting
                      ? 'Adding Transaction to Queue...'
                      : 'Add Transaction to Queue'}
                  </Button>
                </Stack>
              </Form>
            </Box>
          )
        }}
      </Formik>
    </Box>
  )
}
