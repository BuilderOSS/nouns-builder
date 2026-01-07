import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { CHAIN_ID, TransactionType } from '@buildeross/types'
import {
  ClankerCoinFormFields,
  coinFormSchema,
  type CoinFormValues,
} from '@buildeross/ui'
import { convertDaysToSeconds, FEE_CONFIGS, POOL_POSITIONS } from '@buildeross/utils'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import {
  type ClankerTokenV4,
  FEE_CONFIGS as SDK_FEE_CONFIGS,
  POOL_POSITIONS as SDK_POOL_POSITIONS,
} from 'clanker-sdk'
import { Clanker } from 'clanker-sdk/v4'
import { Form, Formik, type FormikHelpers } from 'formik'
import { useMemo, useState } from 'react'
import { type Address, encodeFunctionData } from 'viem'
import { ZodError } from 'zod'

// Supported chain IDs for Clanker deployment
const SUPPORTED_CHAIN_IDS = [CHAIN_ID.BASE, CHAIN_ID.BASE_SEPOLIA]

// Default values for Clanker deployment
const DEFAULT_MIN_FDV_USD = 10000 // $10k minimum FDV
const DEFAULT_VAULT_PERCENTAGE = 10 // 10% of supply
const DEFAULT_LOCKUP_DAYS = 30 // 30 days
const DEFAULT_VESTING_DAYS = 30 // 30 days

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

  // Create Clanker SDK instance
  const clanker = useMemo(() => {
    if (!isChainSupported) return null
    return new Clanker()
  }, [isChainSupported])

  // Initial values from props with Clanker defaults
  const initialValues: CoinFormValues = {
    name: providedInitialValues?.name || '',
    symbol: providedInitialValues?.symbol || '',
    description: providedInitialValues?.description || '',
    imageUrl: providedInitialValues?.imageUrl || '',
    mediaUrl: providedInitialValues?.mediaUrl || '',
    mediaMimeType: providedInitialValues?.mediaMimeType || '',
    properties: providedInitialValues?.properties || {},
    currency: providedInitialValues?.currency || 'WETH',
    minFdvUsd: providedInitialValues?.minFdvUsd || DEFAULT_MIN_FDV_USD,
    // Clanker-specific defaults
    poolConfig: providedInitialValues?.poolConfig || POOL_POSITIONS.Project,
    feeConfig: providedInitialValues?.feeConfig || FEE_CONFIGS.DynamicBasic,
    vaultPercentage: providedInitialValues?.vaultPercentage ?? DEFAULT_VAULT_PERCENTAGE,
    lockupDuration: providedInitialValues?.lockupDuration ?? DEFAULT_LOCKUP_DAYS,
    vestingDuration: providedInitialValues?.vestingDuration ?? DEFAULT_VESTING_DAYS,
    vaultRecipient: providedInitialValues?.vaultRecipient || undefined,
    devBuyEthAmount: providedInitialValues?.devBuyEthAmount || undefined,
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

    if (!isChainSupported || !clanker) {
      setSubmitError(
        `Creator coins are only supported on Base and Base Sepolia. Current chain: ${chain.name}`
      )
      actions.setSubmitting(false)
      return
    }

    setSubmitError(undefined)

    try {
      // Prepare Clanker token configuration for SDK
      const tokenConfig: ClankerTokenV4 = {
        name: values.name,
        chainId: chain.id as ClankerTokenV4['chainId'],
        symbol: values.symbol,
        tokenAdmin: treasury as Address,
        image: values.imageUrl || '',
        metadata: {
          description: values.description,
        },
        context: {
          interface: 'Builder DAO Proposal',
        },
        pool: {
          positions:
            values.poolConfig === 'Custom'
              ? SDK_POOL_POSITIONS.Project
              : SDK_POOL_POSITIONS[
                  values.poolConfig as keyof typeof SDK_POOL_POSITIONS
                ] || SDK_POOL_POSITIONS.Project,
        },
        fees:
          SDK_FEE_CONFIGS[values.feeConfig as keyof typeof SDK_FEE_CONFIGS] ||
          SDK_FEE_CONFIGS.DynamicBasic,
        rewards: {
          recipients: [
            {
              recipient: treasury as Address,
              admin: treasury as Address,
              bps: 10000, // 100% to DAO treasury
              token: 'Paired' as const,
            },
          ],
        },
        vault: {
          percentage: values.vaultPercentage ?? DEFAULT_VAULT_PERCENTAGE,
          lockupDuration: convertDaysToSeconds(
            values.lockupDuration ?? DEFAULT_LOCKUP_DAYS
          ),
          vestingDuration: convertDaysToSeconds(
            values.vestingDuration ?? DEFAULT_VESTING_DAYS
          ),
          recipient: values.vaultRecipient as Address | undefined,
        },
        ...(values.devBuyEthAmount && Number(values.devBuyEthAmount) > 0
          ? {
              devBuy: {
                ethAmount: Number(values.devBuyEthAmount),
              },
            }
          : {}),
      }

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

      // Reset form
      actions.resetForm()

      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (error) {
      console.error('Error creating creator coin transaction:', error)
      setSubmitError(parseErrorMessage(error))
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

                <ClankerCoinFormFields
                  formik={formik}
                  showMediaUpload={showMediaUpload}
                  showProperties={showProperties}
                  initialValues={initialValues}
                  chainId={chain.id}
                  showCurrencyInput={false}
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
