import {
  BUILDER_TREASURY_ADDRESS,
  COIN_DEPLOYMENT_DISCLAIMER,
} from '@buildeross/constants'
import { COIN_SUPPORTED_CHAINS } from '@buildeross/constants/chains'
import { useClankerTokenPrice } from '@buildeross/hooks'
import { uploadFile } from '@buildeross/ipfs-service'
import { awaitSubgraphSync, ClankerTokenFragment } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import {
  CoinFormFields,
  coinFormSchema,
  type CoinFormValues,
  LaunchEconomicsPreview,
} from '@buildeross/ui'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import {
  createContentPoolConfigWithClankerTokenAsCurrency,
  DEFAULT_CLANKER_TOTAL_SUPPLY,
  DEFAULT_ZORA_TICK_SPACING,
  DEFAULT_ZORA_TOTAL_SUPPLY,
  estimateTargetFdvUsd,
  getChainNamesString,
  isChainIdSupportedByCoining,
} from '@buildeross/utils'
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
import { type Address, decodeEventLog, zeroAddress, zeroHash } from 'viem'
import { useAccount, useConfig, useReadContract } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

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

type CurrencyOption = {
  value: AddressType
  label: string
  disabled?: boolean
}

interface CreateContentCoinEconomicsPreviewProps {
  factoryAddress: Address
  chainId: number
  latestClankerToken: ClankerTokenFragment
  clankerTokenPriceUsd: number | undefined
}

const CreateContentCoinEconomicsPreview: React.FC<
  CreateContentCoinEconomicsPreviewProps
> = ({ factoryAddress, chainId, latestClankerToken, clankerTokenPriceUsd }) => {
  const formik = useFormikContext<CoinFormValues>()
  const { address: userAddress } = useAccount()

  // Prepare arguments for coinAddress call
  const { encodedPoolConfig, shouldFetch } = React.useMemo(() => {
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
    address: factoryAddress,
    abi: coinFactoryConfig.abi,
    functionName: 'coinAddress',
    args:
      shouldFetch && encodedPoolConfig
        ? [
            userAddress as Address,
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
    const targetFdvUsd = estimateTargetFdvUsd({ creatorFdvUsd })

    // Find the absolute lowest and highest ticks across all bands
    const lowestTick = Math.min(...poolConfig.lowerTicks)
    const highestTick = Math.max(...poolConfig.upperTicks)

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
        lowerTick={lowestTick}
        upperTick={highestTick}
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

export interface CreateContentCoinFormProps {
  chainId: CHAIN_ID
  treasury: AddressType
  latestClankerToken: ClankerTokenFragment | null
  onFormChange?: (values: CoinFormValues) => void
  onCoinCreated: (coinAddress: AddressType | null) => void
}

export const CreateContentCoinForm: React.FC<CreateContentCoinFormProps> = ({
  chainId,
  treasury,
  latestClankerToken,
  onFormChange,
  onCoinCreated,
}) => {
  const router = useRouter()
  const config = useConfig()
  const { address: userAddress } = useAccount()
  const [submitError, setSubmitError] = useState<string | undefined>()
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)

  // Check if the current chain is supported
  const isChainSupported = isChainIdSupportedByCoining(chainId)
  const factoryAddress = isChainSupported
    ? (coinFactoryAddress[chainId as keyof typeof coinFactoryAddress] as AddressType)
    : undefined

  // Fetch the ClankerToken price
  const {
    priceUsd: clankerTokenPriceUsd,
    isLoading: clankerTokenPriceLoading,
    error: clankerTokenPriceError,
  } = useClankerTokenPrice({
    clankerToken: latestClankerToken,
    chainId,
    enabled: isChainSupported && !!latestClankerToken,
  })

  // Define currency options with only the latest ClankerToken
  const currencyOptions: CurrencyOption[] = React.useMemo(() => {
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

  // Initial values - automatically set currency if only one option
  const initialValues: CoinFormValues = React.useMemo(
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
        `Posts are only supported on ${chainNamesString}. Current chain ID: ${chainId}`
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
        setIsDeploying(false)
        return
      }

      if (clankerTokenPriceError) {
        const warningMessage = `Error fetching token price: ${clankerTokenPriceError.message}. Cannot create content coin without token price.`
        setSubmitError(warningMessage)
        actions.setSubmitting(false)
        setIsDeploying(false)
        return
      }

      if (!clankerTokenPriceUsd) {
        const warningMessage = `No price data available for token ${currency}. Cannot create content coin without token price.`
        setSubmitError(warningMessage)
        actions.setSubmitting(false)
        setIsDeploying(false)
        return
      }

      // 4. Create pool config using the utility with form values
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

      // Success! Parse transaction and navigate to coin page
      if (txHash) {
        try {
          // Wait for transaction receipt to get logs
          const receipt = await waitForTransactionReceipt(config, {
            hash: txHash,
            chainId,
          })

          await awaitSubgraphSync(chainId, receipt.blockNumber)

          // Parse logs to find the coin address from CoinCreatedV4 event
          let coinAddress: Address | null = null

          for (const log of receipt.logs) {
            try {
              // Decode the log using the coinFactory ABI
              const decodedLog = decodeEventLog({
                abi: coinFactoryConfig.abi,
                data: log.data,
                topics: log.topics,
              })

              // Check if this is the CoinCreatedV4 event
              if (decodedLog.eventName === 'CoinCreatedV4') {
                // Extract the coin address from the event args
                // The event structure should have the coin address in args
                const args = decodedLog.args as any
                if (args.coin) {
                  coinAddress = args.coin as Address
                  break
                }
              }
            } catch (e) {
              // Continue to next log if parsing fails (might be a different event)
              continue
            }
          }

          // Reset form
          actions.resetForm()

          onCoinCreated(coinAddress)
        } catch (error) {
          console.error('Error parsing transaction or navigating:', error)
          // Fallback: navigate back on error
          actions.resetForm()
          router.back()
        }
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
              Publishing posts is currently only supported on {chainNamesString}. Please
              switch to a supported network to publish your post.
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
          borderStyle="solid"
          borderWidth="normal"
          borderColor="warning"
          backgroundColor="background2"
        >
          <Stack gap="x2">
            <Text fontSize="16" fontWeight="label">
              No Creator Coin Found
            </Text>
            <Text fontSize="14" color="text3">
              This DAO needs to create a Creator Coin before publishing posts. Creator
              Coins are used as the base currency for content posts. Please create a
              Creator Coin proposal first.
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
                  mediaType="all"
                  showProperties={true}
                  initialValues={initialValues}
                  showCurrencyInput={true}
                  currencyOptions={currencyOptions}
                  showTargetFdv={false}
                />

                {/* Launch Economics Preview */}
                {clankerTokenPriceUsd &&
                  latestClankerToken &&
                  formik.values.currency &&
                  !isDisabled &&
                  factoryAddress && (
                    <CreateContentCoinEconomicsPreview
                      factoryAddress={factoryAddress}
                      chainId={chainId}
                      latestClankerToken={latestClankerToken}
                      clankerTokenPriceUsd={clankerTokenPriceUsd}
                    />
                  )}

                {submitError && (
                  <Box
                    p="x4"
                    borderRadius="curved"
                    borderStyle="solid"
                    borderWidth="normal"
                    borderColor="negative"
                    backgroundColor="background2"
                    fontSize="14"
                    color="negative"
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {submitError}
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
                    <Text fontSize="14" color="text3">
                      {COIN_DEPLOYMENT_DISCLAIMER}
                    </Text>
                  </label>
                </Box>

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
                    disabled={isDisabled || !formik.isValid || !disclaimerAccepted}
                    loading={isDeploying}
                    handleClick={formik.handleSubmit}
                    chainId={chainId}
                  >
                    {'Publish Post'}
                  </ContractButton>
                </Flex>
              </Flex>
            </Box>
          )
        }}
      </Formik>
      <AnimatedModal open={isDeploying}>
        <SuccessModalContent
          title={'Publishing post'}
          subtitle={'Your post is being published'}
          pending
        />
      </AnimatedModal>
    </Box>
  )
}
