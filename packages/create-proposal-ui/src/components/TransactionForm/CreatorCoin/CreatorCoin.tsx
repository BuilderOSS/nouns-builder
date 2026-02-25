import {
  BUILDER_COLLECTION_ADDRESS,
  COIN_DEPLOYMENT_DISCLAIMER,
  WETH_ADDRESS,
} from '@buildeross/constants'
import {
  EAS_CONTRACT_ADDRESS,
  easAbi,
  TREASURY_ASSET_PIN_SCHEMA,
  TREASURY_ASSET_PIN_SCHEMA_UID,
} from '@buildeross/constants/eas'
import { useClankerTokenPrice, useClankerTokens, useEthUsdPrice } from '@buildeross/hooks'
import { ClankerTokenFragment } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { type AddressType, TransactionType } from '@buildeross/types'
import {
  ClankerCoinFormFields,
  coinFormSchema,
  type CoinFormValues,
  LaunchEconomicsPreview,
} from '@buildeross/ui'
import {
  convertDaysToSeconds,
  createClankerPoolPositionsFromTargetFdv,
  DEFAULT_CLANKER_TARGET_FDV,
  DEFAULT_CLANKER_TICK_SPACING,
  DEFAULT_CLANKER_TOTAL_SUPPLY,
  DEFAULT_LOCKUP_DAYS,
  DEFAULT_VAULT_PERCENTAGE,
  DEFAULT_VESTING_DAYS,
  DYNAMIC_FEE_FLAG,
  FEE_CONFIGS,
  isChainIdSupportedByCoining,
} from '@buildeross/utils'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { type ClankerTokenV4, FEE_CONFIGS as SDK_FEE_CONFIGS } from 'clanker-sdk'
import { Clanker } from 'clanker-sdk/v4'
import { Form, Formik, type FormikHelpers, useFormikContext } from 'formik'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type Address,
  encodeFunctionData,
  formatEther,
  getAddress,
  type Hex,
  isAddressEqual,
  parseEther,
  zeroHash,
} from 'viem'
import { useBalance } from 'wagmi'
import { ZodError } from 'zod'

import { CreatorCoinPreviewDisplay } from './CreatorCoinPreviewDisplay'

const schemaEncoder = new SchemaEncoder(TREASURY_ASSET_PIN_SCHEMA)

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
 * Parse error into a user-friendly message
 * Handles ZodError, Error objects, and other error types
 */
function parseErrorMessage(error: unknown): string {
  // Handle ZodError
  if (error instanceof ZodError) {
    const issues = error.issues.map((issue) => {
      const path = issue.path.join('.')
      return `${path}: ${issue.message}`
    })
    return issues.length > 0
      ? `Validation error: ${issues.join(', ')}`
      : 'Validation error occurred'
  }

  // Handle standard Error
  if (error instanceof Error) {
    return error.message
  }

  // Handle error objects with message property
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  // Try toString() as fallback
  try {
    const stringified = String(error)
    if (stringified && stringified !== '[object Object]') {
      return stringified
    }
  } catch {
    // ignore
  }

  // Last resort
  return 'Failed to create transaction'
}

interface CreatorCoinEconomicsPreviewProps {
  clanker: Clanker | null
  treasury: Address
  ethUsdPrice: number
  latestBuilderClankerToken: ClankerTokenFragment | null
  chainId: number
}

const createClankerTokenConfig = (
  chainId: number,
  treasury: Address,
  quoteTokenUsdPrice: number,
  isWethSelected: boolean,
  latestBuilderClankerToken: ClankerTokenFragment | null,
  values: CoinFormValues
): ClankerTokenV4 => {
  let clankerPoolKey: NonNullable<ClankerTokenV4['devBuy']>['poolKey'] | undefined =
    undefined

  if (!isWethSelected && latestBuilderClankerToken) {
    // Normalize paired token address once
    const normalizedAddress = getAddress(latestBuilderClankerToken.tokenAddress)
    const pairedTokenAddress = getAddress(latestBuilderClankerToken.pairedToken)

    // Determine token order in the pool using lowercase string comparison
    const isToken0 = normalizedAddress.toLowerCase() < pairedTokenAddress.toLowerCase()

    clankerPoolKey = {
      currency0: isToken0 ? normalizedAddress : pairedTokenAddress,
      currency1: isToken0 ? pairedTokenAddress : normalizedAddress,
      fee: DYNAMIC_FEE_FLAG,
      tickSpacing: DEFAULT_CLANKER_TICK_SPACING,
      hooks: latestBuilderClankerToken.poolHook,
    }
  }
  const positions = createClankerPoolPositionsFromTargetFdv({
    targetFdvUsd: values.targetFdvUsd || DEFAULT_CLANKER_TARGET_FDV,
    quoteTokenUsd: quoteTokenUsdPrice,
  })
  const tickIfToken0IsClanker = positions.length > 0 ? positions[0].tickLower : 0
  return {
    name: values.name,
    chainId: chainId as ClankerTokenV4['chainId'],
    symbol: values.symbol,
    tokenAdmin: treasury,
    image: values.mediaUrl || '', // mediaUrl contains the image in image-only mode
    metadata: {
      description: values.description,
    },
    context: {
      interface: 'Builder DAO Proposal',
    },
    pool: {
      tickIfToken0IsClanker: tickIfToken0IsClanker,
      pairedToken: values.currency as AddressType,
      tickSpacing: DEFAULT_CLANKER_TICK_SPACING,
      positions: positions,
    },
    fees:
      SDK_FEE_CONFIGS[values.feeConfig as keyof typeof SDK_FEE_CONFIGS] ||
      SDK_FEE_CONFIGS.DynamicBasic,
    rewards: {
      recipients: [
        {
          recipient: treasury,
          admin: treasury,
          bps: 10000,
          token: 'Paired' as const,
        },
      ],
    },
    vault: {
      percentage: values.vaultPercentage ?? DEFAULT_VAULT_PERCENTAGE,
      lockupDuration: convertDaysToSeconds(values.lockupDuration ?? DEFAULT_LOCKUP_DAYS),
      vestingDuration: convertDaysToSeconds(
        values.vestingDuration ?? DEFAULT_VESTING_DAYS
      ),
      recipient: values.vaultRecipient as Address | undefined,
    },
    ...(values.devBuyEthAmount && Number(values.devBuyEthAmount) > 0
      ? {
          devBuy: {
            ethAmount: Number(values.devBuyEthAmount),
            recipient: treasury as Address,
            poolKey: clankerPoolKey,
          },
        }
      : {}),
  }
}

const CreatorCoinEconomicsPreview: React.FC<CreatorCoinEconomicsPreviewProps> = ({
  clanker,
  treasury,
  ethUsdPrice,
  latestBuilderClankerToken,
  chainId,
}) => {
  const formik = useFormikContext<CoinFormValues>()
  const [predictedAddress, setPredictedAddress] = useState<AddressType | null>(null)

  // Get Clanker token price if Builder token is selected as currency
  const { priceUsd: clankerTokenPriceUsd, isLoading: clankerPriceLoading } =
    useClankerTokenPrice({
      clankerToken: latestBuilderClankerToken,
      chainId,
      enabled:
        !!latestBuilderClankerToken &&
        !!formik.values.currency &&
        !isAddressEqual(
          formik.values.currency,
          WETH_ADDRESS[chainId as keyof typeof WETH_ADDRESS] || ''
        ),
    })

  // Determine quote token price for address prediction
  const wethAddress = WETH_ADDRESS[chainId as keyof typeof WETH_ADDRESS]
  const isWethSelected =
    !!formik.values.currency && isAddressEqual(formik.values.currency, wethAddress)
  const quoteTokenUsdPrice = isWethSelected ? ethUsdPrice : clankerTokenPriceUsd

  // Compute predicted address when fields that affect the CREATE2 address change
  // Metadata (image, description) affects CREATE2 address since it's part of constructor args
  // Only show preview once essential fields are filled out to avoid constant recomputation
  // Debounce by 500ms and handle race conditions
  React.useEffect(() => {
    // Require essential fields before showing preview
    // This ensures accurate prediction and avoids API spam during typing
    if (
      !clanker ||
      !formik.values.name ||
      !formik.values.symbol ||
      !formik.values.currency ||
      !formik.values.imageUrl || // Image is part of constructor args, affects CREATE2
      !quoteTokenUsdPrice // Need price to calculate positions
    ) {
      setPredictedAddress(null)
      return
    }

    let cancelled = false

    const timeoutId = setTimeout(async () => {
      try {
        const tokenConfig: ClankerTokenV4 = createClankerTokenConfig(
          chainId,
          treasury,
          quoteTokenUsdPrice,
          isWethSelected,
          latestBuilderClankerToken,
          formik.values
        )

        if (!cancelled) setPredictedAddress(null)

        const txData = await clanker.getDeployTransaction(tokenConfig)

        // Only update if this request hasn't been cancelled
        if (!cancelled && txData.expectedAddress) {
          setPredictedAddress(txData.expectedAddress)
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Could not predict token address:', error)
        }
      }
    }, 500) // 500ms debounce

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [
    // All fields that affect the CREATE2 address
    // Image, description, and context are part of constructor args
    clanker,
    formik.values,
    treasury,
    chainId,
    latestBuilderClankerToken,
    quoteTokenUsdPrice,
    isWethSelected,
  ])

  if (!predictedAddress || !formik.values.currency) {
    return null
  }

  // Don't show preview while Clanker token price is loading
  if (!isWethSelected && clankerPriceLoading) {
    return null
  }

  // Don't show preview if we don't have a quote token price
  if (!quoteTokenUsdPrice) {
    return null
  }

  try {
    const targetFdvUsd = formik.values.targetFdvUsd || DEFAULT_CLANKER_TARGET_FDV

    const quoteTokenAddress = formik.values.currency
    const quoteTokenSymbol = isWethSelected
      ? 'WETH'
      : latestBuilderClankerToken?.tokenSymbol || 'TOKEN'
    const quoteTokenDecimals = 18

    const positions = createClankerPoolPositionsFromTargetFdv({
      targetFdvUsd,
      quoteTokenUsd: quoteTokenUsdPrice,
    })

    const lowestTick = Math.min(...positions.map((p) => p.tickLower))
    const highestTick = Math.max(...positions.map((p) => p.tickUpper))

    const totalSupplyBigInt = BigInt(DEFAULT_CLANKER_TOTAL_SUPPLY) * 10n ** 18n

    return (
      <LaunchEconomicsPreview
        chainId={chainId}
        totalSupply={totalSupplyBigInt}
        baseTokenAddress={predictedAddress}
        baseTokenSymbol={formik.values.symbol || 'TOKEN'}
        baseTokenDecimals={18}
        quoteTokenAddress={quoteTokenAddress}
        quoteTokenSymbol={quoteTokenSymbol}
        quoteTokenDecimals={quoteTokenDecimals}
        lowerTick={lowestTick}
        upperTick={highestTick}
        tickSpacing={DEFAULT_CLANKER_TICK_SPACING}
        targetMarketCapUsd={targetFdvUsd}
        quoteTokenUsdPrice={quoteTokenUsdPrice}
      />
    )
  } catch (error) {
    console.error('Error rendering LaunchEconomicsPreview:', error)
    return null
  }
}

export const CreatorCoin: React.FC = () => {
  const { treasury, token: daoTokenAddress } = useDaoStore((state) => state.addresses)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const resetTransactionType = useProposalStore((state) => state.resetTransactionType)
  const { chain } = useChainStore()

  const [submitError, setSubmitError] = useState<string | undefined>()
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [pinToTreasury, setPinToTreasury] = useState(false)

  const isEasSupported = !!EAS_CONTRACT_ADDRESS[chain.id]

  // Fetch current ETH/USD price
  const {
    price: ethUsdPrice,
    isLoading: isPriceLoading,
    error: priceError,
  } = useEthUsdPrice()

  // Check if the current chain is supported
  const isChainSupported = isChainIdSupportedByCoining(chain.id)

  // Fetch the latest ClankerToken for Builder DAO
  const builderCollectionAddress =
    BUILDER_COLLECTION_ADDRESS[chain.id as keyof typeof BUILDER_COLLECTION_ADDRESS]
  const { data: builderClankerTokens } = useClankerTokens({
    chainId: chain.id,
    collectionAddress: builderCollectionAddress as AddressType,
    enabled: isChainSupported && !!builderCollectionAddress,
    first: 1,
  })

  // Get the latest Builder ClankerToken (first item in array)
  const latestBuilderClankerToken = useMemo(() => {
    return builderClankerTokens && builderClankerTokens.length > 0
      ? builderClankerTokens[0]
      : null
  }, [builderClankerTokens])

  // Get Clanker token price for submission (separate from preview component)
  const { priceUsd: clankerTokenPriceUsd, isLoading: clankerPriceLoading } =
    useClankerTokenPrice({
      clankerToken: latestBuilderClankerToken,
      chainId: chain.id,
      enabled: !!latestBuilderClankerToken && isChainSupported,
    })

  // Create Clanker SDK instance
  const clanker = useMemo(() => {
    if (!isChainSupported) return null
    return new Clanker()
  }, [isChainSupported])

  // Fetch treasury ETH balance to validate dev buy amount
  const { data: treasuryBalance } = useBalance({
    address: treasury as Address | undefined,
    chainId: chain.id,
  })

  // Initial values from props with Clanker defaults
  const initialValues: CoinFormValues = useMemo(() => {
    const wethAddress = WETH_ADDRESS[chain.id as keyof typeof WETH_ADDRESS]
    // Prefer Builder token, fallback to WETH
    const defaultCurrency = latestBuilderClankerToken
      ? (latestBuilderClankerToken.tokenAddress as AddressType)
      : wethAddress
    return {
      name: '',
      symbol: '',
      description: '',
      imageUrl: '',
      mediaUrl: '',
      mediaMimeType: '',
      properties: {},
      currency: defaultCurrency,
      targetFdvUsd: DEFAULT_CLANKER_TARGET_FDV,
      // Clanker-specific defaults
      feeConfig: FEE_CONFIGS.StaticBasic,
      vaultPercentage: DEFAULT_VAULT_PERCENTAGE,
      lockupDuration: DEFAULT_LOCKUP_DAYS,
      vestingDuration: DEFAULT_VESTING_DAYS,
      vaultRecipient: undefined,
      devBuyEthAmount: undefined,
    }
  }, [chain.id, latestBuilderClankerToken])

  const [previewData, setPreviewData] = useState<CoinFormValues>(initialValues)

  const handlePreviewChange = useCallback((values: CoinFormValues) => {
    setPreviewData(values)
  }, [])

  const handleSubmit = async (
    values: CoinFormValues,
    actions: FormikHelpers<CoinFormValues>
  ) => {
    if (!treasury) {
      setSubmitError('Treasury address not found')
      actions.setSubmitting(false)
      return
    }

    if (!isChainSupported || !clanker) {
      setSubmitError(`Creator coins are not supported on ${chain.name}.`)
      actions.setSubmitting(false)
      return
    }

    if (!ethUsdPrice) {
      setSubmitError('Unable to fetch ETH/USD price. Please try again.')
      actions.setSubmitting(false)
      return
    }

    if (!values.currency) {
      setSubmitError('Please select a currency')
      actions.setSubmitting(false)
      return
    }

    const wethAddress = WETH_ADDRESS[chain.id as keyof typeof WETH_ADDRESS]
    const isWethSelected = isAddressEqual(values.currency, wethAddress)

    if (
      !latestBuilderClankerToken ||
      (!isWethSelected &&
        !isAddressEqual(values.currency, latestBuilderClankerToken.tokenAddress))
    ) {
      setSubmitError('Please select a valid currency')
      actions.setSubmitting(false)
      return
    }

    // Get the correct quote token price based on selected currency
    const quoteTokenUsdPrice = isWethSelected ? ethUsdPrice : clankerTokenPriceUsd

    // Validate that we have the price we need
    if (!quoteTokenUsdPrice) {
      setSubmitError(
        `Unable to fetch ${isWethSelected ? 'ETH' : 'Builder token'} price. Please try again.`
      )
      actions.setSubmitting(false)
      return
    }

    setSubmitError(undefined)

    try {
      const tokenConfig: ClankerTokenV4 = createClankerTokenConfig(
        chain.id,
        treasury as Address,
        quoteTokenUsdPrice,
        isWethSelected,
        latestBuilderClankerToken,
        values
      )
      // Use Clanker SDK to get the properly formatted transaction data
      const txData = await clanker.getDeployTransaction(tokenConfig)

      const calldata = encodeFunctionData({
        abi: txData.abi,
        functionName: txData.functionName,
        args: txData.args,
      })

      // Create transaction for DAO proposal
      const transaction = {
        target: txData.address,
        functionSignature: calldata.substring(0, 10),
        calldata: calldata,
        value: txData.value ? txData.value.toString() : '0',
      }

      // Add transaction to proposal queue
      addTransaction({
        type: TransactionType.CREATOR_COIN,
        summary: `Create ${values.symbol} Creator Coin via Clanker`,
        transactions: [transaction],
      })

      // Optionally add a PIN_TREASURY_ASSET transaction as the last step
      if (pinToTreasury && txData.expectedAddress && daoTokenAddress) {
        const easContractAddress = EAS_CONTRACT_ADDRESS[chain.id]
        if (easContractAddress) {
          const coinAddress = getAddress(txData.expectedAddress)
          const encodedData = schemaEncoder.encodeData([
            { name: 'tokenType', type: 'uint8', value: 0 },
            { name: 'token', type: 'address', value: coinAddress },
            { name: 'isCollection', type: 'bool', value: true },
            { name: 'tokenId', type: 'uint256', value: 0n },
          ]) as Hex

          const pinCalldata = encodeFunctionData({
            abi: easAbi,
            functionName: 'attest',
            args: [
              {
                schema: TREASURY_ASSET_PIN_SCHEMA_UID as `0x${string}`,
                data: {
                  recipient: getAddress(daoTokenAddress),
                  expirationTime: 0n,
                  revocable: true,
                  refUID: zeroHash,
                  data: encodedData,
                  value: 0n,
                },
              },
            ],
          })

          addTransaction({
            type: TransactionType.PIN_TREASURY_ASSET,
            summary: `Pin ${values.symbol} creator coin to treasury`,
            transactions: [
              {
                functionSignature:
                  'attest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)))',
                target: easContractAddress,
                value: '0',
                calldata: pinCalldata,
              },
            ],
          })
        }
      }

      // Reset form
      actions.resetForm()

      resetTransactionType()
    } catch (error) {
      console.error('Error creating creator coin transaction:', error)
      setSubmitError(parseErrorMessage(error))
    } finally {
      actions.setSubmitting(false)
    }
  }

  // Define currency options: Builder ClankerToken first, then WETH
  const currencyOptions = useMemo(() => {
    const options = []

    // Add latest Builder ClankerToken first if available
    if (latestBuilderClankerToken) {
      options.push({
        value: latestBuilderClankerToken.tokenAddress as AddressType,
        label: `${latestBuilderClankerToken.tokenSymbol} (${latestBuilderClankerToken.tokenName}) - Builder DAO`,
      })
    }

    // Add WETH as second option
    const wethAddress = WETH_ADDRESS[chain.id as keyof typeof WETH_ADDRESS]
    if (wethAddress) {
      options.push({
        value: wethAddress,
        label: `WETH (Wrapped Ether)`,
      })
    }

    return options
  }, [chain.id, latestBuilderClankerToken])

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
              Creator coins are not supported on ${chain.name}.
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
          // Check if Builder token is selected
          const isClankerTokenSelected =
            formik.values.currency &&
            latestBuilderClankerToken &&
            isAddressEqual(formik.values.currency, latestBuilderClankerToken.tokenAddress)

          // Disable if prices are still loading
          const isPricesLoading =
            isPriceLoading || (isClankerTokenSelected && clankerPriceLoading)

          const isDisabled =
            formik.isSubmitting || formik.isValidating || !treasury || isPricesLoading

          // Check dev buy amount against treasury ETH balance
          const devBuyAmount = formik.values.devBuyEthAmount
          const devBuyBalanceError = (() => {
            if (!devBuyAmount || Number(devBuyAmount) <= 0 || !treasuryBalance)
              return undefined
            try {
              const devBuyWei = parseEther(String(devBuyAmount))
              if (devBuyWei > treasuryBalance.value) {
                const balanceEth = parseFloat(formatEther(treasuryBalance.value)).toFixed(
                  4
                )
                return `Dev buy amount (${devBuyAmount} ETH) exceeds treasury ETH balance of ${balanceEth} ETH.`
              }
            } catch {
              // Invalid amount — let Formik validation handle it
            }
            return undefined
          })()

          return (
            <Box
              as="fieldset"
              disabled={isDisabled}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Flex as={Form} direction="column" gap="x6">
                {/* Observer to trigger preview updates */}
                <FormObserver onChange={handlePreviewChange} />

                {/* Preview positioned on the right side (hidden on mobile) */}
                <CreatorCoinPreviewDisplay previewData={previewData} chainId={chain.id} />

                <Stack gap="x4">
                  <Text variant="heading-sm">Create Creator Coin</Text>
                  <Text variant="paragraph-md" color="text3">
                    Configure your creator coin metadata and add the transaction to the
                    proposal queue.
                  </Text>
                </Stack>

                <ClankerCoinFormFields
                  formik={formik}
                  mediaType={'image'}
                  showProperties={false}
                  initialValues={initialValues}
                  showCurrencyInput={true}
                  showTargetFdv={true}
                  currencyOptions={currencyOptions}
                  treasuryEthBalance={treasuryBalance?.value}
                />

                {/* Dev Buy Balance Error */}
                {devBuyBalanceError && (
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
                      {devBuyBalanceError}
                    </Text>
                  </Box>
                )}

                {/* Launch Economics Preview */}
                {ethUsdPrice && formik.values.currency && !isDisabled && treasury && (
                  <CreatorCoinEconomicsPreview
                    clanker={clanker}
                    treasury={treasury}
                    ethUsdPrice={ethUsdPrice}
                    latestBuilderClankerToken={latestBuilderClankerToken}
                    chainId={chain.id}
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

                {/* Loading State */}
                {isPriceLoading && (
                  <Box
                    p="x4"
                    borderRadius="curved"
                    style={{ backgroundColor: 'rgba(255, 213, 79, 0.1)' }}
                  >
                    <Text variant="paragraph-sm" color="warning">
                      Fetching current ETH price...
                    </Text>
                  </Box>
                )}

                {/* Clanker Token Price Loading State */}
                {isClankerTokenSelected && clankerPriceLoading && (
                  <Box
                    p="x4"
                    borderRadius="curved"
                    style={{ backgroundColor: 'rgba(255, 213, 79, 0.1)' }}
                  >
                    <Text variant="paragraph-sm" color="warning">
                      Fetching Builder token price...
                    </Text>
                  </Box>
                )}

                {/* Price Error */}
                {priceError && (
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
                      Unable to fetch ETH price: {priceError.message}. Please refresh the
                      page.
                    </Text>
                  </Box>
                )}

                {/* Pin to Treasury Checkbox */}
                {isEasSupported && (
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
                        checked={pinToTreasury}
                        onChange={(e) => setPinToTreasury(e.target.checked)}
                        style={{ marginTop: '4px', flexShrink: 0 }}
                      />
                      <Text variant="paragraph-sm" color="text3">
                        Automatically pin creator coin to treasury
                      </Text>
                    </label>
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
                  disabled={
                    isDisabled ||
                    !formik.isValid ||
                    !disclaimerAccepted ||
                    !!devBuyBalanceError
                  }
                >
                  {formik.isSubmitting
                    ? 'Adding Transaction to Queue...'
                    : 'Add Transaction to Queue'}
                </Button>
              </Flex>
            </Box>
          )
        }}
      </Formik>
    </Box>
  )
}
