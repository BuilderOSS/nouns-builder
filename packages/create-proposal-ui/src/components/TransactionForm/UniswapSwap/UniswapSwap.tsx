import { PERMIT2_ADDRESS } from '@buildeross/constants/addresses'
import { useDebounce, useUniswapSwap } from '@buildeross/hooks'
import { erc20Abi, governorAbi, permit2Abi, treasuryAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import type { AddressType, Duration } from '@buildeross/types'
import { TransactionType } from '@buildeross/types'
import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { formatDuration } from '@buildeross/utils'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { isNativeEth } from '@buildeross/utils/sablier'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import type { FormikHelpers } from 'formik'
import { Form, Formik, useFormikContext } from 'formik'
import { useEffect, useState } from 'react'
import { encodeFunctionData, formatUnits, getAddress, parseUnits } from 'viem'
import { useReadContracts } from 'wagmi'

import { TokenSelectionForm, useTransactionComposer } from '../../shared'
import { DeadlineSelector } from './components/DeadlineSelector'
import { OutputTokenSelector } from './components/OutputTokenSelector'
import { QuoteDisplay } from './components/QuoteDisplay'
import { RiskWarningBanner } from './components/RiskWarningBanner'
import { SlippageSelector } from './components/SlippageSelector'
import { SwapDirectionToggle } from './components/SwapDirectionToggle'
import type { UniswapSwapFormValues } from './UniswapSwap.schema'
import UniswapSwapSchema from './UniswapSwap.schema'

const DECIMAL_REGEX = /^(\d+\.?\d*|\.\d+)$/

/**
 * Convert a Duration object to total seconds
 */
const durationToSeconds = (duration: Duration): number => {
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = duration
  return days * 86400 + hours * 3600 + minutes * 60 + seconds
}

/**
 * Helper component to sync Formik values to component state using useEffect.
 * This runs outside the render cycle and follows React best practices.
 */
const FormikStateSyncer: React.FC<{
  setInputTokenAddress: (addr: AddressType | undefined) => void
  setOutputTokenAddress: (addr: AddressType | undefined) => void
  setAmountIn: (amount: string | undefined) => void
  setInputTokenDecimals: (decimals: number) => void
  setOutputTokenDecimals: (decimals: number) => void
  setSlippage: (slippage: number) => void
  setSwapType: (type: 'exactIn' | 'exactOut') => void
  setDeadline: (deadline: number) => void
  totalExecutionDelay?: number
}> = ({
  setInputTokenAddress,
  setOutputTokenAddress,
  setAmountIn,
  setInputTokenDecimals,
  setOutputTokenDecimals,
  setSlippage,
  setSwapType,
  setDeadline,
  totalExecutionDelay,
}) => {
  const { values } = useFormikContext<UniswapSwapFormValues>()

  // Sync input token address
  useEffect(() => {
    setInputTokenAddress(values.inputTokenMetadata?.address)
  }, [values.inputTokenMetadata?.address, setInputTokenAddress])

  // Sync output token address
  useEffect(() => {
    setOutputTokenAddress(values.outputTokenMetadata?.address)
  }, [values.outputTokenMetadata?.address, setOutputTokenAddress])

  // Sync amount input
  useEffect(() => {
    setAmountIn(values.amountIn)
  }, [values.amountIn, setAmountIn])

  // Sync input token decimals
  useEffect(() => {
    setInputTokenDecimals(values.inputTokenMetadata?.decimals ?? 18)
  }, [values.inputTokenMetadata?.decimals, setInputTokenDecimals])

  // Sync output token decimals
  useEffect(() => {
    setOutputTokenDecimals(values.outputTokenMetadata?.decimals ?? 18)
  }, [values.outputTokenMetadata?.decimals, setOutputTokenDecimals])

  // Sync slippage
  useEffect(() => {
    const slippageValue =
      values.slippageType === 'preset'
        ? (values.slippagePreset ?? 10) / 100
        : parseFloat(values.slippageCustom ?? '10') / 100
    setSlippage(slippageValue)
  }, [values.slippageType, values.slippagePreset, values.slippageCustom, setSlippage])

  // Sync swap type based on direction
  // buy = exactOut (specify output amount), sell = exactIn (specify input amount)
  useEffect(() => {
    setSwapType(values.swapDirection === 'buy' ? 'exactOut' : 'exactIn')
  }, [values.swapDirection, setSwapType])

  // The form stores a duration; the Uniswap API expects an absolute Unix timestamp.
  useEffect(() => {
    const totalDeadlineFromSubmission =
      (totalExecutionDelay ?? 0) + durationToSeconds(values.deadline)
    setDeadline(Math.floor(Date.now() / 1000) + totalDeadlineFromSubmission)
  }, [values.deadline, totalExecutionDelay, setDeadline])

  return null // This component doesn't render anything
}

export const UniswapSwap: React.FC = () => {
  const { id: chainId } = useChainStore((s) => s.chain)
  const { addTransaction, resetTransactionType } = useTransactionComposer()
  const addresses = useDaoStore((state) => state.addresses)

  // State for form values that API needs
  const [inputTokenAddress, setInputTokenAddress] = useState<AddressType | undefined>()
  const [outputTokenAddress, setOutputTokenAddress] = useState<AddressType | undefined>()
  const [amountIn, setAmountIn] = useState<string | undefined>()
  const [inputTokenDecimals, setInputTokenDecimals] = useState<number>(18)
  const [outputTokenDecimals, setOutputTokenDecimals] = useState<number>(18)
  const [slippage, setSlippage] = useState<number>(0.005) // 0.5% default
  const [swapType, setSwapType] = useState<'exactIn' | 'exactOut'>('exactIn')
  const [deadline, setDeadline] = useState<number>()

  // Debounce amount input to reduce API calls (500ms delay)
  const debouncedAmountIn = useDebounce(amountIn, 500)

  // Fetch governance configuration to calculate proposal execution timeline
  const { data: governanceConfigData } = useReadContracts({
    allowFailure: true,
    query: {
      enabled: !!addresses.governor && !!addresses.treasury,
    },
    contracts: [
      {
        abi: governorAbi,
        address: addresses.governor,
        chainId: chainId,
        functionName: 'votingDelay',
      },
      {
        abi: governorAbi,
        address: addresses.governor,
        chainId: chainId,
        functionName: 'votingPeriod',
      },
      {
        abi: treasuryAbi,
        address: addresses.treasury,
        chainId: chainId,
        functionName: 'delay',
      },
      {
        abi: governorAbi,
        address: addresses.governor,
        chainId: chainId,
        functionName: 'proposalUpdatablePeriod',
      },
    ] as const,
  })

  const [
    votingDelayResult,
    votingPeriodResult,
    timelockDelayResult,
    updatablePeriodResult,
  ] = unpackOptionalArray(governanceConfigData, 4)

  // Extract values from results (in seconds)
  const votingDelay =
    votingDelayResult && 'result' in votingDelayResult
      ? Number(votingDelayResult.result)
      : undefined
  const votingPeriod =
    votingPeriodResult && 'result' in votingPeriodResult
      ? Number(votingPeriodResult.result)
      : undefined
  const timelockDelay =
    timelockDelayResult && 'result' in timelockDelayResult
      ? Number(timelockDelayResult.result)
      : undefined
  // Extract updatable period (will be undefined/error for v2.x Governors)
  const updatablePeriod =
    updatablePeriodResult && 'result' in updatablePeriodResult
      ? Number(updatablePeriodResult.result)
      : undefined

  // Calculate total time from proposal submission to execution
  // Include updatable period if available (v3+ governors)
  const totalExecutionDelay =
    votingDelay !== undefined && votingPeriod !== undefined && timelockDelay !== undefined
      ? (updatablePeriod && updatablePeriod > 0 ? updatablePeriod : 0) +
        votingDelay +
        votingPeriod +
        timelockDelay
      : undefined

  // Convert to Duration type for formatting
  const executionDelayDuration: Duration | undefined = totalExecutionDelay
    ? {
        days: Math.floor(totalExecutionDelay / 86400),
        hours: Math.floor((totalExecutionDelay % 86400) / 3600),
        minutes: Math.floor((totalExecutionDelay % 3600) / 60),
        seconds: totalExecutionDelay % 60,
      }
    : undefined

  // Fetch swap transaction from Uniswap API
  // Use debounced amount to avoid excessive API calls while user is typing
  const swapEnabled =
    !!inputTokenAddress &&
    !!outputTokenAddress &&
    !!debouncedAmountIn &&
    debouncedAmountIn !== '0'

  const {
    swap: swapData,
    isLoading: isLoadingSwap,
    error: swapError,
  } = useUniswapSwap({
    chainId,
    tokenIn: inputTokenAddress,
    tokenOut: outputTokenAddress,
    amount: debouncedAmountIn, // Use debounced value for API calls
    inputTokenDecimals, // Pass decimals for wei conversion
    outputTokenDecimals, // Pass output decimals for wei conversion
    type: swapType, // Use dynamic swap type based on swapDirection
    slippageTolerance: (slippage * 100).toFixed(2),
    sender: addresses.treasury,
    deadline,
    enabled: swapEnabled,
  })

  // Format the execution delay for display
  const executionDelayText = executionDelayDuration
    ? formatDuration(executionDelayDuration)
    : undefined

  // Convert execution delay to hours for calculations
  const totalExecutionDelayHours = totalExecutionDelay
    ? totalExecutionDelay / 3600
    : undefined

  // Calculate default deadline duration to be in the "good" range
  // Good range is 0.25x to 0.5x of governance delay (added to the delay itself)
  // We set default to ~0.375x (middle of good range) for a balanced default
  const defaultDeadlineHours = totalExecutionDelayHours
    ? Math.ceil(totalExecutionDelayHours * 0.375) // 37.5% of governance delay
    : 168 // 7 days fallback if no governance delay calculated

  const initialValues: UniswapSwapFormValues = {
    swapDirection: 'buy',
    inputTokenAddress: undefined,
    inputTokenMetadata: undefined,
    outputTokenAddress: '',
    outputTokenMetadata: undefined,
    amountIn: '',
    slippageType: 'preset',
    slippagePreset: 10, // Default to 10% for governance
    slippageCustom: undefined,
    deadline: {
      days: Math.floor(defaultDeadlineHours / 24),
      hours: defaultDeadlineHours % 24,
      minutes: 0,
      seconds: 0,
    },
  }

  const handleSubmit = async (
    values: UniswapSwapFormValues,
    actions: FormikHelpers<UniswapSwapFormValues>
  ) => {
    if (!values.inputTokenMetadata || !values.outputTokenMetadata) {
      return
    }

    try {
      const inputSymbol = values.inputTokenMetadata.symbol
      const outputSymbol = values.outputTokenMetadata.symbol
      const inputTokenAddress = values.inputTokenMetadata.address

      if (!swapData) {
        throw new Error('Unable to get swap quote from Uniswap API')
      }

      if (swapError) {
        throw new Error(swapError.message || 'Failed to fetch swap data from Uniswap')
      }

      // Calculate slippage from form (for display purposes)
      const slippage =
        values.slippageType === 'preset'
          ? (values.slippagePreset ?? 10) / 100
          : parseFloat(values.slippageCustom ?? '10') / 100

      // Build transaction bundle
      const transactions = []

      // Check if input token is native ETH
      const isInputNativeEth = isNativeEth(inputTokenAddress)

      // Calculate amount and expiration for approvals
      // For exactIn (sell): approve the user-specified input amount
      // For exactOut (buy): approve the MAXIMUM input including slippage
      const amountToApprove =
        values.swapDirection === 'sell'
          ? parseUnits(values.amountIn, values.inputTokenMetadata.decimals)
          : // For buy mode, approve max input (quote + slippage buffer)
            BigInt(swapData.quote.amount) +
            (BigInt(swapData.quote.amount) * BigInt(Math.floor(slippage * 10000))) /
              10000n

      // Calculate Permit2 expiration: current time + execution delay + swap expiry window
      // If execution delay is not available, use a default of 7 days
      const executionDelaySeconds = totalExecutionDelay ?? 7 * 24 * 3600
      const totalDeadlineSeconds =
        executionDelaySeconds + durationToSeconds(values.deadline)
      const permit2Expiration = Math.floor(Date.now() / 1000) + totalDeadlineSeconds

      // Get Universal Router address from swap data
      const universalRouterAddress = getAddress(swapData.transaction.to)

      // TRANSACTION 1: ERC20 approve Permit2 (only for ERC20 tokens, not ETH)
      if (!isInputNativeEth) {
        const erc20ApprovalCalldata = encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [PERMIT2_ADDRESS, amountToApprove],
        })

        transactions.push({
          functionSignature: 'approve(address,uint256)',
          target: getAddress(inputTokenAddress),
          value: '0',
          calldata: erc20ApprovalCalldata,
        })
      }

      // TRANSACTION 2: Permit2 approve Universal Router (only for ERC20 tokens, not ETH)
      if (!isInputNativeEth) {
        // Permit2 uses uint160 for amount, so we need to ensure it fits
        // For most practical amounts this should be fine, but we cap at max uint160
        const maxUint160 = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
        const permit2Amount = amountToApprove > maxUint160 ? maxUint160 : amountToApprove

        const permit2ApprovalCalldata = encodeFunctionData({
          abi: permit2Abi,
          functionName: 'approve',
          args: [
            getAddress(inputTokenAddress), // token
            universalRouterAddress, // spender (Universal Router)
            permit2Amount, // amount (uint160)
            permit2Expiration, // expiration (uint48)
          ],
        })

        transactions.push({
          functionSignature: 'approve(address,address,uint160,uint48)',
          target: PERMIT2_ADDRESS,
          value: '0',
          calldata: permit2ApprovalCalldata,
        })
      }

      // TRANSACTION 3: Universal Router execute swap
      transactions.push({
        functionSignature: 'Uniswap Router Execute',
        target: universalRouterAddress,
        value: swapData.transaction.value || '0',
        calldata: swapData.transaction.data,
      })

      // Create summary for transaction
      const formattedAmount = formatCryptoVal(values.amountIn)
      const summary =
        values.swapDirection === 'buy'
          ? `Swap ${formattedAmount} ${inputSymbol} to buy ${outputSymbol} (${(slippage * 100).toFixed(1)}% slippage)`
          : `Sell ${formattedAmount} ${inputSymbol} for ${outputSymbol} (${(slippage * 100).toFixed(1)}% slippage)`

      addTransaction({
        type: TransactionType.UNISWAP_SWAP,
        title: 'Uniswap Swap',
        summary,
        transactions,
      })

      actions.resetForm()
      resetTransactionType()
    } catch (error) {
      console.error('Error creating swap transaction:', error)
      actions.setErrors({
        amountIn:
          error instanceof Error ? error.message : 'Failed to create swap transaction',
      })
    }
  }

  return (
    <Box w={'100%'}>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={UniswapSwapSchema()}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {(formik) => {
          const inputDecimals = formik.values.inputTokenMetadata?.decimals ?? 18
          const inputBalance = formik.values.inputTokenMetadata?.balance ?? 0n
          const inputSymbol = formik.values.inputTokenMetadata?.symbol ?? ''
          const outputSymbol = formik.values.outputTokenMetadata?.symbol ?? ''
          const outputDecimals = formik.values.outputTokenMetadata?.decimals ?? 18

          // Parse amount for validation and quote
          let amountInBigInt: bigint | null = null
          if (formik.values.amountIn && DECIMAL_REGEX.test(formik.values.amountIn)) {
            try {
              // For 'sell' (exactIn): amount is input token
              // For 'buy' (exactOut): amount is output token
              const decimalsToUse =
                formik.values.swapDirection === 'sell' ? inputDecimals : outputDecimals
              amountInBigInt = parseUnits(formik.values.amountIn, decimalsToUse)
            } catch {
              amountInBigInt = null
            }
          }

          // Calculate slippage for display
          const currentSlippage =
            formik.values.slippageType === 'preset'
              ? (formik.values.slippagePreset ?? 10) / 100
              : parseFloat(formik.values.slippageCustom ?? '10') / 100

          // For buy mode (exactOut), calculate maximum input including slippage
          // The quote gives us the expected input, but we might need to pay more due to slippage
          const maxInputForBuy = swapData?.quote?.amount
            ? BigInt(swapData.quote.amount) +
              (BigInt(swapData.quote.amount) *
                BigInt(Math.floor(currentSlippage * 10000))) /
                10000n
            : undefined

          // Balance validation
          // For 'sell' (exactIn): validate user's input amount against balance
          // For 'buy' (exactOut): validate maximum input (with slippage) against balance
          const hasInsufficientBalance =
            formik.values.swapDirection === 'sell'
              ? amountInBigInt !== null && inputBalance < amountInBigInt
              : maxInputForBuy
                ? inputBalance < maxInputForBuy
                : false

          const hasErrors =
            Object.keys(formik.errors).length > 0 || hasInsufficientBalance

          return (
            <>
              {/* Sync Formik values to component state using useEffect (best practice) */}
              <FormikStateSyncer
                setInputTokenAddress={setInputTokenAddress}
                setOutputTokenAddress={setOutputTokenAddress}
                setAmountIn={setAmountIn}
                setInputTokenDecimals={setInputTokenDecimals}
                setOutputTokenDecimals={setOutputTokenDecimals}
                setSlippage={setSlippage}
                setSwapType={setSwapType}
                setDeadline={setDeadline}
                totalExecutionDelay={totalExecutionDelay}
              />
              <Box
                data-testid="uniswap-v4-swap-form"
                as={'fieldset'}
                disabled={formik.isValidating || formik.isSubmitting}
                style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
              >
                <Form>
                  <Stack gap={'x5'}>
                    <RiskWarningBanner executionDelayText={executionDelayText} />

                    <SwapDirectionToggle formik={formik} />

                    {/* Buy mode: Show output token first (what you want), then input token (how you pay) */}
                    {/* Sell mode: Show input token first (what you're selling), then output token (what you get) */}
                    {formik.values.swapDirection === 'buy' ? (
                      <>
                        {/* Output Token First (Buy Mode) */}
                        <OutputTokenSelector
                          formik={formik}
                          excludeTokenAddress={formik.values.inputTokenAddress}
                        />

                        {/* Amount to Buy */}
                        {formik.values.outputTokenMetadata?.isValid && (
                          <Box>
                            <SmartInput
                              type={FIELD_TYPES.TEXT}
                              formik={formik}
                              {...formik.getFieldProps('amountIn')}
                              id="amountIn"
                              inputLabel="Amount to Buy"
                              placeholder="0.0"
                              helperText={`You want to acquire this amount of ${outputSymbol}`}
                              errorMessage={
                                formik.touched.amountIn
                                  ? (formik.errors.amountIn as string)
                                  : undefined
                              }
                            />
                          </Box>
                        )}

                        {/* Input Token Second (Buy Mode) */}
                        <Box>
                          <TokenSelectionForm
                            addressFieldName="inputTokenAddress"
                            metadataFieldName="inputTokenMetadata"
                            label="Payment Token"
                            placeholder="Select the token you want to pay with..."
                            excludeTokenAddress={formik.values.outputTokenAddress}
                          />
                          {formik.values.inputTokenMetadata?.isValid && (
                            <>
                              <Text fontSize="14" color="text3" mt="x2">
                                Treasury Balance:{' '}
                                {formatCryptoVal(
                                  formatUnits(inputBalance, inputDecimals)
                                )}{' '}
                                {inputSymbol}
                              </Text>
                              {hasInsufficientBalance && maxInputForBuy && (
                                <Text color="negative" fontSize="14" mt="x2">
                                  ⚠️ Insufficient balance. This purchase requires up to{' '}
                                  {formatCryptoVal(
                                    formatUnits(maxInputForBuy, inputDecimals)
                                  )}{' '}
                                  {inputSymbol} (including{' '}
                                  {(currentSlippage * 100).toFixed(1)}% slippage), but
                                  treasury only has{' '}
                                  {formatCryptoVal(
                                    formatUnits(inputBalance, inputDecimals)
                                  )}{' '}
                                  {inputSymbol}.
                                </Text>
                              )}
                            </>
                          )}
                        </Box>
                      </>
                    ) : (
                      <>
                        {/* Input Token First (Sell Mode) */}
                        <Box>
                          <TokenSelectionForm
                            addressFieldName="inputTokenAddress"
                            metadataFieldName="inputTokenMetadata"
                            label="Token to Sell"
                            placeholder="Select the token you want to sell..."
                            excludeTokenAddress={formik.values.outputTokenAddress}
                          />

                          {formik.values.inputTokenMetadata?.isValid && (
                            <Box mt="x3">
                              <Flex align="flex-end" gap="x2" position="relative">
                                <Box flex={1} style={{ marginRight: '88px' }}>
                                  <SmartInput
                                    type={FIELD_TYPES.TEXT}
                                    formik={formik}
                                    {...formik.getFieldProps('amountIn')}
                                    id="amountIn"
                                    inputLabel="Amount to Sell"
                                    placeholder="0.0"
                                    helperText={`Treasury Balance: ${formatCryptoVal(formatUnits(inputBalance, inputDecimals))} ${inputSymbol}`}
                                    errorMessage={
                                      formik.touched.amountIn
                                        ? (formik.errors.amountIn as string)
                                        : undefined
                                    }
                                  />
                                </Box>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const maxAmount = formatUnits(
                                      inputBalance,
                                      inputDecimals
                                    )
                                    formik.setFieldValue('amountIn', maxAmount)
                                  }}
                                  style={{
                                    top: '44px',
                                    right: '0px',
                                    position: 'absolute',
                                  }}
                                >
                                  MAX
                                </Button>
                              </Flex>
                              {hasInsufficientBalance && amountInBigInt && (
                                <Text color="negative" fontSize="14" mt="x2">
                                  ⚠️ Insufficient balance. You're selling{' '}
                                  {formik.values.amountIn} {inputSymbol} but treasury only
                                  has{' '}
                                  {formatCryptoVal(
                                    formatUnits(inputBalance, inputDecimals)
                                  )}{' '}
                                  {inputSymbol}.
                                </Text>
                              )}
                            </Box>
                          )}
                        </Box>

                        {/* Output Token Second (Sell Mode) */}
                        <OutputTokenSelector
                          formik={formik}
                          excludeTokenAddress={formik.values.inputTokenAddress}
                        />
                      </>
                    )}

                    <QuoteDisplay
                      chainId={chainId}
                      inputSymbol={inputSymbol}
                      inputDecimals={inputDecimals}
                      outputSymbol={outputSymbol}
                      outputDecimals={outputDecimals}
                      slippage={currentSlippage}
                      swapData={swapData}
                      isLoading={isLoadingSwap}
                      error={swapError}
                      swapDirection={formik.values.swapDirection}
                      maxInputForBuy={maxInputForBuy}
                      refetch={() => {
                        // Force refetch by updating state
                        const currentInputAddr = formik.values.inputTokenMetadata?.address
                        if (currentInputAddr) {
                          setInputTokenAddress(undefined)
                          queueMicrotask(() => setInputTokenAddress(currentInputAddr))
                        }
                      }}
                    />

                    <SlippageSelector
                      formik={formik}
                      executionDelayText={executionDelayText}
                    />

                    <DeadlineSelector
                      formik={formik}
                      executionDelayText={executionDelayText}
                      totalExecutionDelayHours={totalExecutionDelayHours}
                    />

                    {(() => {
                      // Helper function to get submit error message based on priority
                      const getSubmitErrorMessage = (): string | null => {
                        // 1. Loading states
                        if (formik.isSubmitting) return null // Button text already shows this
                        if (isLoadingSwap) return 'Fetching swap quote from Uniswap...'

                        // 2. Token validation errors (most critical)
                        if (!formik.values.inputTokenMetadata?.isValid) {
                          return formik.values.swapDirection === 'buy'
                            ? 'Please select a valid payment token'
                            : 'Please select a valid token to sell'
                        }
                        if (!formik.values.outputTokenMetadata?.isValid) {
                          return formik.values.swapDirection === 'buy'
                            ? 'Please select a valid token to buy'
                            : 'Please select a valid output token'
                        }

                        // 3. Amount validation
                        if (!formik.values.amountIn || formik.values.amountIn === '0') {
                          return formik.values.swapDirection === 'buy'
                            ? 'Please enter the amount you want to buy'
                            : 'Please enter the amount you want to sell'
                        }
                        if (formik.errors.amountIn && formik.touched.amountIn) {
                          return formik.errors.amountIn as string
                        }

                        // 4. Balance errors
                        if (hasInsufficientBalance) {
                          const symbol =
                            formik.values.inputTokenMetadata?.symbol ?? 'tokens'
                          return formik.values.swapDirection === 'buy'
                            ? `Insufficient ${symbol} balance to complete this purchase`
                            : `Insufficient ${symbol} balance to sell this amount`
                        }

                        // 5. Swap API errors
                        if (swapError) {
                          return `Unable to get swap quote: ${swapError.message}`
                        }
                        if (!swapData && swapEnabled) {
                          return 'Waiting for swap quote data...'
                        }

                        // 6. Other validation errors
                        if (formik.errors.inputTokenAddress) {
                          return formik.errors.inputTokenAddress as string
                        }
                        if (formik.errors.outputTokenAddress) {
                          return formik.errors.outputTokenAddress as string
                        }
                        if (formik.errors.slippageCustom) {
                          return formik.errors.slippageCustom as string
                        }
                        if (formik.errors.deadline) {
                          return typeof formik.errors.deadline === 'string'
                            ? formik.errors.deadline
                            : 'Please set a valid deadline'
                        }

                        // 7. Generic fallback
                        if (Object.keys(formik.errors).length > 0) {
                          return 'Please fix validation errors above'
                        }

                        return null
                      }

                      const errorMessage = getSubmitErrorMessage()

                      return (
                        <>
                          {errorMessage && (
                            <Text color="negative" fontSize="14" mt="x4" mb="x2">
                              {errorMessage}
                            </Text>
                          )}

                          <Button
                            mt={errorMessage ? 'x2' : 'x9'}
                            variant={'outline'}
                            borderRadius={'curved'}
                            type="submit"
                            disabled={
                              formik.isSubmitting ||
                              !formik.values.inputTokenMetadata?.isValid ||
                              !formik.values.outputTokenMetadata?.isValid ||
                              !swapData ||
                              swapError ||
                              isLoadingSwap ||
                              hasInsufficientBalance ||
                              hasErrors
                            }
                          >
                            {formik.isSubmitting
                              ? 'Adding Transaction to Queue...'
                              : 'Add Transaction to Queue'}
                          </Button>
                        </>
                      )
                    })()}
                  </Stack>
                </Form>
              </Box>
            </>
          )
        }}
      </Formik>
    </Box>
  )
}
