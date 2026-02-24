import {
  BUILDER_TREASURY_ADDRESS,
  COIN_DEPLOYMENT_DISCLAIMER,
  COIN_SUPPORTED_CHAINS,
  ZORA_COIN_FACTORY_ADDRESS,
} from '@buildeross/constants'
import { useClankerTokenPrice, useClankerTokens } from '@buildeross/hooks'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType, TransactionType } from '@buildeross/types'
import {
  CoinFormFields,
  coinFormSchema,
  type CoinFormValues,
  LaunchEconomicsPreview,
} from '@buildeross/ui'
import {
  createContentPoolConfigWithClankerTokenAsCurrency,
  DEFAULT_CLANKER_TOTAL_SUPPLY,
  DEFAULT_ZORA_TICK_SPACING,
  DEFAULT_ZORA_TOTAL_SUPPLY,
  estimateTargetFdvUsd,
  getChainNamesString,
  isChainIdSupportedByCoining,
} from '@buildeross/utils'
import { Box, Button, Stack, Text } from '@buildeross/zord'
import { createMetadataBuilder } from '@zoralabs/coins-sdk'
import {
  coinFactoryConfig,
  encodeMultiCurvePoolConfig,
} from '@zoralabs/protocol-deployments'
import { Form, Formik, type FormikHelpers, useFormikContext } from 'formik'
import React, { useEffect, useMemo, useState } from 'react'
import { type Address, encodeFunctionData, zeroAddress, zeroHash } from 'viem'
import { useReadContract } from 'wagmi'

import { ContentCoinPreviewDisplay } from './ContentCoinPreviewDisplay'
import { IPFSUploader } from './ipfsUploader'

const chainNamesString = getChainNamesString(COIN_SUPPORTED_CHAINS)

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

interface ContentCoinEconomicsPreviewProps {
  treasury: Address
  chainId: number
  latestClankerToken: any
  clankerTokenPriceUsd: number | undefined
}

const ContentCoinEconomicsPreview: React.FC<ContentCoinEconomicsPreviewProps> = ({
  treasury,
  chainId,
  latestClankerToken,
  clankerTokenPriceUsd,
}) => {
  const formik = useFormikContext<CoinFormValues>()

  // Prepare arguments for coinAddress call
  const { encodedPoolConfig, shouldFetch } = useMemo(() => {
    if (
      !formik.values.name ||
      !formik.values.symbol ||
      !formik.values.currency ||
      !clankerTokenPriceUsd
    ) {
      return { encodedPoolConfig: null, shouldFetch: false }
    }

    try {
      const currency = formik.values.currency as AddressType
      const poolConfig = createContentPoolConfigWithClankerTokenAsCurrency({
        currency,
        clankerTokenPriceUsd,
      })

      const encoded = encodeMultiCurvePoolConfig({
        currency: poolConfig.currency,
        tickLower: poolConfig.lowerTicks,
        tickUpper: poolConfig.upperTicks,
        numDiscoveryPositions: poolConfig.numDiscoveryPositions,
        maxDiscoverySupplyShare: poolConfig.maxDiscoverySupplyShares,
      })

      return { encodedPoolConfig: encoded, shouldFetch: true }
    } catch (error) {
      console.warn('Could not encode pool config:', error)
      return { encodedPoolConfig: null, shouldFetch: false }
    }
  }, [
    formik.values.name,
    formik.values.symbol,
    formik.values.currency,
    clankerTokenPriceUsd,
  ])

  const builderTreasuryAddress =
    BUILDER_TREASURY_ADDRESS[chainId as keyof typeof BUILDER_TREASURY_ADDRESS]

  // Call coinAddress view function on ZoraFactory
  const { data: predictedAddress } = useReadContract({
    address: ZORA_COIN_FACTORY_ADDRESS,
    abi: coinFactoryConfig.abi,
    functionName: 'coinAddress',
    args:
      shouldFetch && encodedPoolConfig
        ? [
            treasury,
            formik.values.name!,
            formik.values.symbol!,
            encodedPoolConfig,
            builderTreasuryAddress as Address,
            zeroHash,
          ]
        : undefined,
    chainId,
    query: {
      enabled: shouldFetch && !!encodedPoolConfig,
    },
  })

  if (!predictedAddress || !latestClankerToken || !clankerTokenPriceUsd) {
    return null
  }

  try {
    const currency = formik.values.currency as AddressType
    const poolConfig = createContentPoolConfigWithClankerTokenAsCurrency({
      currency,
      clankerTokenPriceUsd,
    })

    const creatorFdvUsd = clankerTokenPriceUsd * DEFAULT_CLANKER_TOTAL_SUPPLY
    const targetFdvUsd = estimateTargetFdvUsd({
      creatorFdvUsd,
    })

    const lowerTick = Math.min(...poolConfig.lowerTicks)
    const upperTick = Math.max(...poolConfig.upperTicks)

    const totalSupplyBigInt = BigInt(DEFAULT_ZORA_TOTAL_SUPPLY) * 10n ** 18n

    return (
      <LaunchEconomicsPreview
        chainId={chainId}
        totalSupply={totalSupplyBigInt}
        baseTokenAddress={predictedAddress}
        baseTokenSymbol={formik.values.symbol || 'CONTENT'}
        baseTokenDecimals={18}
        quoteTokenAddress={formik.values.currency as AddressType}
        quoteTokenSymbol={latestClankerToken.tokenSymbol}
        quoteTokenDecimals={18}
        lowerTick={lowerTick}
        upperTick={upperTick}
        tickSpacing={DEFAULT_ZORA_TICK_SPACING}
        targetMarketCapUsd={targetFdvUsd}
        quoteTokenUsdPrice={clankerTokenPriceUsd}
      />
    )
  } catch (error) {
    console.error('Error rendering LaunchEconomicsPreview:', error)
    return null
  }
}

export const ContentCoin: React.FC = () => {
  const { treasury, token } = useDaoStore((state) => state.addresses)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const resetTransactionType = useProposalStore((state) => state.resetTransactionType)
  const { chain } = useChainStore()

  const [submitError, setSubmitError] = useState<string | undefined>()
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [previewData, setPreviewData] = useState<CoinFormValues>({
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
    mediaUrl: '',
    mediaMimeType: '',
  })

  // Check if the current chain is supported
  const isChainSupported = isChainIdSupportedByCoining(chain.id)

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
      name: '',
      symbol: '',
      description: '',
      imageUrl: '',
      mediaUrl: '',
      mediaMimeType: '',
      properties: {},
      currency: currencyOptions[0]?.value,
    }),
    [currencyOptions]
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

    if (!isChainSupported) {
      setSubmitError(
        `Content coins are only supported on ${chainNamesString}. Current chain: ${chain.name}`
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

      // Handle media based on type (image vs video/audio)
      const isMediaImage = values.mediaMimeType?.startsWith('image/')

      if (isMediaImage) {
        // Image-only mode: mediaUrl contains the primary image
        if (values.mediaUrl) {
          metadataBuilder.withImageURI(values.mediaUrl)
        }
      } else {
        // All-media mode: imageUrl is thumbnail, mediaUrl is video/audio
        if (values.imageUrl) {
          metadataBuilder.withImageURI(values.imageUrl)
        }
        if (values.mediaUrl) {
          metadataBuilder.withMediaURI(values.mediaUrl, values.mediaMimeType)
        }
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

      if (!clankerTokenPriceUsd) {
        throw new Error(
          `Unable to get price for selected currency: ${currency}. Cannot create content coin without token price.`
        )
      }

      // 4. Create pool config using the utility with constant FDV
      const poolConfig = createContentPoolConfigWithClankerTokenAsCurrency({
        currency,
        clankerTokenPriceUsd,
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
        target: ZORA_COIN_FACTORY_ADDRESS,
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

      resetTransactionType()
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
          style={{ backgroundColor: 'rgba(255, 213, 79, 0.1)' }}
        >
          <Stack gap="x2">
            <Text variant="heading-sm">Network Not Supported</Text>
            <Text variant="paragraph-md" color="text3">
              Content coins are currently only supported on {chainNamesString}. Please
              switch to a supported network to create a content coin.
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
          style={{ backgroundColor: 'rgba(255, 213, 79, 0.1)' }}
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
                    mediaType={'all'}
                    showProperties={true}
                    showTargetFdv={false}
                    showCurrencyInput={true}
                    currencyOptions={currencyOptions}
                  />

                  {/* Launch Economics Preview */}
                  {clankerTokenPriceUsd &&
                    latestClankerToken &&
                    formik.values.currency &&
                    !isDisabled &&
                    treasury && (
                      <ContentCoinEconomicsPreview
                        treasury={treasury}
                        chainId={chain.id}
                        latestClankerToken={latestClankerToken}
                        clankerTokenPriceUsd={clankerTokenPriceUsd}
                      />
                    )}

                  {submitError && (
                    <Box
                      p="x4"
                      borderRadius="curved"
                      style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)' }}
                    >
                      <Text
                        variant="paragraph-sm"
                        color="negative"
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {submitError}
                      </Text>
                    </Box>
                  )}

                  {!treasury && (
                    <Box
                      p="x4"
                      borderRadius="curved"
                      style={{ backgroundColor: 'rgba(255, 213, 79, 0.1)' }}
                    >
                      <Text variant="paragraph-sm" color="warning">
                        Treasury address not found. Please connect to a DAO.
                      </Text>
                    </Box>
                  )}

                  {/* Disclaimer Checkbox */}
                  <Box
                    p="x4"
                    borderRadius="curved"
                    borderStyle="solid"
                    borderWidth="normal"
                    borderColor="border"
                    backgroundColor="background2"
                  >
                    <label
                      style={{
                        display: 'flex',
                        gap: '12px',
                        cursor: 'pointer',
                        alignItems: 'flex-start',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={disclaimerAccepted}
                        onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                        style={{ marginTop: '4px', flexShrink: 0 }}
                      />
                      <Text variant="paragraph-sm" color="text3">
                        {COIN_DEPLOYMENT_DISCLAIMER}
                      </Text>
                    </label>
                  </Box>

                  <Button
                    variant="outline"
                    borderRadius="curved"
                    w="100%"
                    type="submit"
                    disabled={isDisabled || !formik.isValid || !disclaimerAccepted}
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
