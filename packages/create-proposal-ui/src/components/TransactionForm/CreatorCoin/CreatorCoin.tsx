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
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID, TransactionType } from '@buildeross/types'
import { CoinFormFields, coinFormSchema, type CoinFormValues } from '@buildeross/ui'
import { createCreatorPoolConfigFromMinFdv } from '@buildeross/utils'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { createMetadataBuilder } from '@zoralabs/coins-sdk'
import {
  coinFactoryConfig,
  encodeMultiCurvePoolConfig,
} from '@zoralabs/protocol-deployments'
import { Form, Formik, type FormikHelpers } from 'formik'
import { useState } from 'react'
import { type Address, encodeFunctionData, zeroAddress, zeroHash } from 'viem'

import { IPFSUploader } from './ipfsUploader'

//export const coinFactoryAddress = {
//  8453: '0x777777751622c0d3258f214F9DF38E35BF45baF3',
//  84532: '0xaF88840cb637F2684A9E460316b1678AD6245e4a',
//} as const

// The following are custom factories deployed by BuilderDAO to deploy creator coins based on ANY currency
export const coinFactoryAddress = {
  8453: '0x8227b9868e00B8eE951F17B480D369b84Cd17c20',
  84532: '0x200Cde9047f4D94BE4f9143af637F3808F121E20',
}

// Supported chain IDs from Zora's deployment
const SUPPORTED_CHAIN_IDS = [CHAIN_ID.BASE, CHAIN_ID.BASE_SEPOLIA]

// Default minimum Fully Diluted Valuation (FDV) in USD for pool config calculations
const DEFAULT_MIN_FDV_USD = 10000 // $10k minimum FDV

export interface CreatorCoinProps {
  initialValues?: Partial<CoinFormValues>
  onSubmitSuccess?: () => void
  showMediaUpload?: boolean
  showProperties?: boolean
}

export const CreatorCoin: React.FC<CreatorCoinProps> = ({
  initialValues: providedInitialValues,
  onSubmitSuccess,
  showMediaUpload = false,
  showProperties = false,
}) => {
  const { treasury } = useDaoStore((state) => state.addresses)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const { chain } = useChainStore()

  const [submitError, setSubmitError] = useState<string | undefined>()

  // Check if the current chain is supported
  const isChainSupported = SUPPORTED_CHAIN_IDS.includes(chain.id)
  const factoryAddress = isChainSupported
    ? (coinFactoryAddress[chain.id as keyof typeof coinFactoryAddress] as AddressType)
    : undefined

  // Determine which currencies to fetch prices for based on chain
  const currenciesToFetch = isChainSupported
    ? chain.id === CHAIN_ID.BASE_SEPOLIA
      ? [ETH_ADDRESS as `0x${string}`] // Base Sepolia only supports ETH
      : [ETH_ADDRESS as `0x${string}`, ZORA_ADDRESS as `0x${string}`] // Base mainnet supports ETH and ZORA
    : undefined

  // Fetch token prices for available currencies
  const { prices: tokenPrices } = useTokenPrices(
    isChainSupported ? chain.id : undefined,
    currenciesToFetch
  )

  // Initial values from props only
  const initialValues: CoinFormValues = {
    name: providedInitialValues?.name || '',
    symbol: providedInitialValues?.symbol || '',
    description: providedInitialValues?.description || '',
    imageUrl: providedInitialValues?.imageUrl || '',
    mediaUrl: providedInitialValues?.mediaUrl || '',
    mediaMimeType: providedInitialValues?.mediaMimeType || '',
    properties: providedInitialValues?.properties || {},
    currency: providedInitialValues?.currency || ETH_ADDRESS,
    minFdvUsd: providedInitialValues?.minFdvUsd || DEFAULT_MIN_FDV_USD,
  }

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
        `Creator coins are only supported on Base and Base Sepolia. Current chain: ${chain.name}`
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
        BUILDER_TREASURY_ADDRESS[chain.id as keyof typeof BUILDER_TREASURY_ADDRESS] ||
        zeroAddress

      // 7. Encode the contract call using Zora's ABI
      const calldata = encodeFunctionData({
        abi: coinFactoryConfig.abi,
        functionName: 'deployCreatorCoin',
        args: [
          treasury as Address, // payoutRecipient
          [treasury as Address], // owners array
          metadataUri, // uri
          values.name, // name
          values.symbol, // symbol
          encodedPoolConfig, // poolConfig
          builderTreasuryAddress as Address, // platformReferrer (Builder treasury for referral, or zero address)
          zeroHash, // coinSalt (can be customized if needed)
        ],
      })

      // 8. Create transaction object
      const transaction = {
        target: factoryAddress,
        functionSignature:
          'deployCreatorCoin(address,address[],string,string,string,bytes,address,bytes32)',
        calldata,
        value: '0',
      }

      // 9. Add transaction to proposal queue
      addTransaction({
        type: TransactionType.CREATOR_COIN,
        summary: `Create ${values.symbol} Creator Coin`,
        transactions: [transaction],
      })

      // Reset form
      actions.resetForm()

      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (error) {
      console.error('Error creating creator coin transaction:', error)
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
              Creator coins are currently only supported on Base and Base Sepolia
              networks. Please switch to a supported network to create a creator coin.
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
              <Flex as={Form} direction="column" gap="x6">
                <Stack gap="x4">
                  <Text variant="heading-sm">Create Creator Coin</Text>
                  <Text variant="paragraph-md" color="text3">
                    Configure your creator coin metadata and add the transaction to the
                    proposal queue.
                  </Text>
                </Stack>

                <CoinFormFields
                  formik={formik}
                  showMediaUpload={showMediaUpload}
                  showProperties={showProperties}
                  initialValues={initialValues}
                  chainId={chain.id}
                  showCurrencyInput={true}
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
              </Flex>
            </Box>
          )
        }}
      </Formik>
    </Box>
  )
}
