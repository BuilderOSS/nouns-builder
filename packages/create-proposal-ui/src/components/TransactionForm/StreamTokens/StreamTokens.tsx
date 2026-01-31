import { useEscrowDelegate } from '@buildeross/hooks/useEscrowDelegate'
import { erc20Abi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { TransactionType } from '@buildeross/types'
import { Accordion } from '@buildeross/ui/Accordion'
import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { getEnsAddress } from '@buildeross/utils/ens'
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { getProvider } from '@buildeross/utils/provider'
import {
  encodeCreateWithDurationsLL,
  encodeCreateWithTimestampsLL,
  getSablierContracts,
  getWrappedTokenAddress,
  isNativeEth,
  isSablierSupported,
  UNSUPPORTED_CHAIN_ERROR,
  validateBatchStreams,
  weth9Abi,
} from '@buildeross/utils/sablier'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import type { FormikHelpers } from 'formik'
import { FieldArray, Form, Formik } from 'formik'
import { truncate } from 'lodash'
import { useCallback, useMemo } from 'react'
import {
  Address,
  encodeFunctionData,
  formatUnits,
  getAddress,
  Hex,
  isAddress,
  parseUnits,
} from 'viem'

import { TokenSelectionForm } from '../../shared'
import { StreamForm } from './StreamForm'
import streamTokensSchema, {
  StreamFormValues,
  StreamTokensValues,
} from './StreamTokens.schema'
import { StreamTokensDetailsDisplay } from './StreamTokensDetailsDisplay'

const SECONDS_PER_DAY = 86400

const truncateAddress = (addr: string) => {
  const snippet = isAddress(addr, { strict: false }) ? walletSnippet(addr) : addr
  return truncate(snippet, { length: 20 })
}

export const StreamTokens = () => {
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)

  const chainSupported = isSablierSupported(chain.id)

  // Get Sablier contract addresses (synchronous)
  const contractAddresses = useMemo(
    () =>
      chainSupported
        ? getSablierContracts(chain.id)
        : { batchLockup: null, lockup: null },
    [chain.id, chainSupported]
  )

  const { escrowDelegate } = useEscrowDelegate({
    chainId: chain.id,
    tokenAddress: addresses.token,
    treasuryAddress: addresses.treasury,
  })

  const initialValues: StreamTokensValues = {
    senderAddress: escrowDelegate || addresses.treasury || '',
    tokenAddress: undefined,
    tokenMetadata: undefined,
    durationType: 'days',
    cancelable: true,
    transferable: false,
    streams: [
      {
        recipientAddress: '',
        amount: '',
        durationDays: 30,
        cliffDays: 0,
      },
    ],
  }

  const handleAddStream = useCallback((push: (obj: StreamFormValues) => void) => {
    push({
      recipientAddress: '',
      amount: '',
      durationDays: 30,
      cliffDays: 0,
    })
  }, [])

  const handleSubmit = async (
    values: StreamTokensValues,
    actions: FormikHelpers<StreamTokensValues>
  ) => {
    if (!values.tokenMetadata || !values.streams.length) {
      return
    }

    if (!contractAddresses.batchLockup || !contractAddresses.lockup) {
      console.error('Sablier contract addresses not loaded')
      return
    }

    const tokenSymbol = values.tokenMetadata.symbol
    const tokenDecimals = values.tokenMetadata.decimals
    let tokenAddress = values.tokenMetadata.address

    // Check if user selected native ETH - if so, we'll use WETH
    const isEth = isNativeEth(tokenAddress)
    if (isEth) {
      try {
        tokenAddress = getWrappedTokenAddress(chain.id)
      } catch (error) {
        console.error('WETH address not found for this chain:', error)
        actions.setFieldError('tokenAddress', 'WETH is not available on this network')
        return
      }
    }

    // Resolve sender ENS name with error handling
    let senderAddress: string
    try {
      const resolved = await getEnsAddress(values.senderAddress, getProvider(chain.id))
      if (!resolved) {
        actions.setFieldError(
          'senderAddress',
          'Could not resolve sender address. Please enter a valid address or ENS name.'
        )
        return
      }
      senderAddress = resolved
    } catch (error) {
      console.error('Error resolving sender address:', error)
      actions.setFieldError(
        'senderAddress',
        'Failed to resolve sender address. Please check your network connection and try again.'
      )
      return
    }

    // Validate sender address is valid Ethereum address
    let normalizedSender: Address
    try {
      normalizedSender = getAddress(senderAddress) as Address
    } catch (error) {
      console.error('Invalid sender address:', error)
      actions.setFieldError('senderAddress', 'Invalid sender address format.')
      return
    }

    // Determine if we're using durations or timestamps from form-level setting
    const useDurations = values.durationType === 'days'

    // Validate required fields based on duration type before processing
    if (!useDurations) {
      // Check all streams have valid start and end dates
      const missingDates = values.streams.some(
        (stream) => !stream.startDate || !stream.endDate
      )
      if (missingDates) {
        actions.setFieldError(
          'streams',
          'All streams must have start and end dates when using date-based duration'
        )
        return
      }
    }

    const now = Math.floor(Date.now() / 1000)

    // Build batch parameters with error handling for each stream
    const batchParams: Array<{
      sender: Address
      recipient: Address
      depositAmount: bigint
      cliffDuration?: number
      totalDuration?: number
      startTime: number
      endTime: number
      cliffTime: number
    }> = []

    try {
      for (let i = 0; i < values.streams.length; i++) {
        const stream = values.streams[i]

        // Resolve recipient ENS name
        let recipientAddress: string
        try {
          const resolved = await getEnsAddress(
            stream.recipientAddress,
            getProvider(chain.id)
          )
          if (!resolved) {
            actions.setFieldError(
              'streams',
              `Stream #${i + 1}: Could not resolve recipient address. Please enter a valid address or ENS name.`
            )
            return
          }
          recipientAddress = resolved
        } catch (error) {
          console.error(`Error resolving recipient address for stream #${i + 1}:`, error)
          actions.setFieldError(
            'streams',
            `Stream #${i + 1}: Failed to resolve recipient address. Please check your network connection and try again.`
          )
          return
        }

        // Validate recipient address
        let normalizedRecipient: Address
        try {
          normalizedRecipient = getAddress(recipientAddress) as Address
        } catch (error) {
          console.error(`Invalid recipient address for stream #${i + 1}:`, error)
          actions.setFieldError(
            'streams',
            `Stream #${i + 1}: Invalid recipient address format.`
          )
          return
        }

        // Validate amount before parsing
        // Guard against empty/invalid amounts
        if (
          !stream.amount ||
          typeof stream.amount !== 'string' ||
          stream.amount.trim() === ''
        ) {
          actions.setFieldError('streams', `Stream #${i + 1}: Amount is required.`)
          return
        }

        // Validate decimal format (reject scientific notation)
        const decimalRegex = /^(\d+\.?\d*|\.\d+)$/
        if (!decimalRegex.test(stream.amount)) {
          actions.setFieldError(
            'streams',
            `Stream #${i + 1}: Invalid amount format. Please use decimal notation.`
          )
          return
        }

        const num = parseFloat(stream.amount)
        if (isNaN(num) || !isFinite(num) || num <= 0) {
          actions.setFieldError(
            'streams',
            `Stream #${i + 1}: Amount must be a positive number.`
          )
          return
        }

        // Validate tokenDecimals is defined
        if (tokenDecimals === undefined) {
          actions.setFieldError(
            'tokenAddress',
            'Token decimals not available. Please select a valid token.'
          )
          return
        }

        // Parse amount with validation
        let depositAmount: bigint
        try {
          depositAmount = parseUnits(stream.amount, tokenDecimals)
        } catch (error) {
          console.error(`Failed to parse amount for stream #${i + 1}:`, error)
          actions.setFieldError('streams', `Stream #${i + 1}: Invalid amount format.`)
          return
        }

        if (useDurations) {
          // Days from now
          const cliffDuration = (stream.cliffDays || 0) * SECONDS_PER_DAY
          const totalDuration = (stream.durationDays || 0) * SECONDS_PER_DAY

          batchParams.push({
            sender: normalizedSender,
            recipient: normalizedRecipient,
            depositAmount,
            cliffDuration,
            totalDuration,
            // For validation
            startTime: now,
            endTime: now + totalDuration,
            cliffTime: cliffDuration > 0 ? now + cliffDuration : 0,
          })
        } else {
          // Start/end dates - safe to use non-null assertion after validation above
          const startMs = new Date(stream.startDate!).getTime()
          const endMs = new Date(stream.endDate!).getTime()
          if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
            actions.setFieldError(
              'streams',
              `Stream #${i + 1}: Invalid start or end date.`
            )
            return
          }
          const startTime = Math.floor(startMs / 1000)
          const endTime = Math.floor(endMs / 1000)
          if (endTime <= startTime) {
            actions.setFieldError(
              'streams',
              `Stream #${i + 1}: End date must be after start date.`
            )
            return
          }

          const cliffDuration = (stream.cliffDays || 0) * SECONDS_PER_DAY
          const cliffTime = cliffDuration > 0 ? startTime + cliffDuration : 0

          batchParams.push({
            sender: normalizedSender,
            recipient: normalizedRecipient,
            depositAmount,
            startTime,
            endTime,
            cliffTime,
          })
        }
      }
    } catch (error) {
      console.error('Error building batch parameters:', error)
      actions.setErrors({
        streams: 'Failed to process stream data. Please check all fields and try again.',
      } as any)
      return
    }

    // Validate all streams
    const validationParams = batchParams.map((params) => ({
      sender: params.sender,
      recipient: params.recipient,
      depositAmount: params.depositAmount,
      startTime: params.startTime,
      endTime: params.endTime,
      cliffTime: params.cliffTime,
      startUnlockAmount: 0n,
      cliffUnlockAmount: 0n,
      tokenAddress: getAddress(tokenAddress),
      shape: '', // Empty shape string (as per Sablier requirements)
    }))

    const validationResult = validateBatchStreams(validationParams)
    if (!validationResult.isValid) {
      console.error('Stream validation failed:', validationResult.errors)
      // Set form-level error for validation failures
      actions.setErrors({
        streams: validationResult.errors.join('; '),
      } as any)
      return
    }

    // Calculate total amount
    const totalAmount = batchParams.reduce(
      (sum, params) => sum + params.depositAmount,
      0n
    )

    // Prepare transactions
    const transactions = []

    // If using native ETH, wrap it to WETH first
    if (isEth) {
      const wrapTransaction = {
        target: getAddress(tokenAddress), // WETH address
        functionSignature: 'deposit()',
        calldata: encodeFunctionData({
          abi: weth9Abi,
          functionName: 'deposit',
          args: [],
        }),
        value: totalAmount.toString(), // Send ETH value
      }
      transactions.push(wrapTransaction)
    }

    // For all ERC20 tokens (including WETH), add approval transactions
    // Approve 0 first to avoid issues with tokens like USDT
    const approveZeroTransaction = {
      target: getAddress(tokenAddress),
      functionSignature: 'approve(address,uint256)',
      calldata: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [contractAddresses.batchLockup, 0n],
      }),
      value: '0',
    }
    transactions.push(approveZeroTransaction)

    // Approve the total amount
    const approveTransaction = {
      target: getAddress(tokenAddress),
      functionSignature: 'approve(address,uint256)',
      calldata: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [contractAddresses.batchLockup, totalAmount],
      }),
      value: '0',
    }
    transactions.push(approveTransaction)

    // Create the batch stream transaction
    let calldata: Hex
    if (useDurations) {
      calldata = encodeCreateWithDurationsLL(
        contractAddresses.lockup,
        getAddress(tokenAddress),
        batchParams.map((params) => ({
          sender: params.sender,
          recipient: params.recipient,
          depositAmount: params.depositAmount,
          cliffDuration: params.cliffDuration!,
          totalDuration: params.totalDuration!,
        })),
        values.cancelable,
        values.transferable
      )
    } else {
      calldata = encodeCreateWithTimestampsLL(
        contractAddresses.lockup,
        getAddress(tokenAddress),
        batchParams.map((params) => ({
          sender: params.sender,
          recipient: params.recipient,
          depositAmount: params.depositAmount,
          startTime: params.startTime,
          cliffTime: params.cliffTime,
          endTime: params.endTime,
        })),
        values.cancelable,
        values.transferable
      )
    }

    const batchStreamTransaction = {
      target: contractAddresses.batchLockup,
      functionSignature: useDurations
        ? 'createWithDurationsLL(address,address,tuple[])'
        : 'createWithTimestampsLL(address,address,tuple[])',
      calldata,
      value: '0',
    }
    transactions.push(batchStreamTransaction)

    // Create summary
    const streamCount = values.streams.length
    const formattedAmount = formatCryptoVal(formatUnits(totalAmount, tokenDecimals))
    const displaySymbol = isEth ? 'ETH (wrapped to WETH)' : tokenSymbol
    const summary = `Create ${streamCount} Sablier stream${streamCount > 1 ? 's' : ''} totaling ${formattedAmount} ${displaySymbol}`

    try {
      addTransaction({
        type: TransactionType.STREAM_TOKENS,
        summary,
        transactions,
      })
      actions.resetForm()
    } catch (err) {
      console.error('Error adding transaction:', err)
    }
  }

  // Show error if chain is not supported
  if (!chainSupported) {
    return (
      <Box w={'100%'}>
        <Box
          p={'x6'}
          backgroundColor={'negative'}
          borderRadius={'curved'}
          borderWidth={'normal'}
          borderStyle={'solid'}
          borderColor={'negative'}
        >
          <Flex direction={'column'} gap={'x2'} align={'center'}>
            <Icon id="warning" size="lg" />
            <Text
              fontWeight={'label'}
              fontSize={18}
              color={'background1'}
              textAlign="center"
            >
              Network Not Supported
            </Text>
            <Text fontSize={14} color={'background1'} textAlign="center">
              {UNSUPPORTED_CHAIN_ERROR}
            </Text>
          </Flex>
        </Box>
      </Box>
    )
  }

  return (
    <Box w={'100%'}>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={streamTokensSchema()}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {(formik) => {
          const decimals = formik.values.tokenMetadata?.decimals ?? 18
          const balance = formik.values.tokenMetadata?.balance ?? 0n
          const isValid = formik.values.tokenMetadata?.isValid ?? false
          const symbol = formik.values.tokenMetadata?.symbol ?? ''

          // Calculate total amount across all streams
          const totalInUnits = formik.values.streams
            .map((stream) => {
              // Guard against empty/invalid amounts during typing
              const amount = stream.amount
              if (!amount || typeof amount !== 'string' || amount.trim() === '') {
                return 0n
              }

              // Validate decimal format (reject scientific notation)
              const decimalRegex = /^(\d+\.?\d*|\.\d+)$/
              if (!decimalRegex.test(amount)) {
                return 0n
              }

              const num = parseFloat(amount)
              if (isNaN(num) || !isFinite(num) || num <= 0) {
                return 0n
              }

              try {
                return parseUnits(amount, decimals)
              } catch (error) {
                // If parseUnits fails, treat as 0
                return 0n
              }
            })
            .reduce((acc, x) => acc + x, 0n)

          const totalAmountString = isValid
            ? `${formatCryptoVal(formatUnits(totalInUnits, decimals))} ${symbol}`
            : undefined

          const balanceString = isValid
            ? `${formatCryptoVal(formatUnits(balance, decimals))} ${symbol}`
            : undefined

          const balanceError =
            isValid && balance < totalInUnits
              ? `Total stream amount exceeds treasury balance of ${balanceString}.`
              : undefined

          const allErrors = balanceError
            ? {
              ...formik.errors,
              totalAmount: balanceError,
            }
            : formik.errors

          return (
            <Box
              data-testid="stream-tokens-form"
              as={'fieldset'}
              disabled={formik.isValidating || formik.isSubmitting}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Form>
                <Stack gap={'x5'}>
                  <StreamTokensDetailsDisplay
                    balanceError={balanceError}
                    totalStreamAmountWithSymbol={totalAmountString}
                    streamCount={formik.values.streams.length}
                  />

                  <Text variant="paragraph-sm" color="text3">
                    Create token streams using Sablier protocol. Configure duration type,
                    cancelability, and transferability for all streams.
                  </Text>

                  <TokenSelectionForm />

                  <SmartInput
                    type={FIELD_TYPES.TEXT}
                    formik={formik}
                    {...formik.getFieldProps('senderAddress')}
                    id="senderAddress"
                    inputLabel={'Sender / Delegate'}
                    placeholder={'0x... or .eth'}
                    isAddress={true}
                    errorMessage={
                      formik.touched.senderAddress && formik.errors.senderAddress
                        ? formik.errors.senderAddress
                        : undefined
                    }
                    helperText="This wallet will control the streams and can cancel them. It can be your DAO's treasury or a working group's multisig"
                  />

                  {formik.values.tokenMetadata?.isValid && (
                    <Box>
                      <Text variant="label-sm" mb="x2">
                        Duration Type (applies to all streams)
                      </Text>
                      <Flex gap="x4" mb="x4">
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="durationType"
                            value="days"
                            checked={formik.values.durationType === 'days'}
                            onChange={() => formik.setFieldValue('durationType', 'days')}
                          />
                          <Text>Days from now</Text>
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="durationType"
                            value="dates"
                            checked={formik.values.durationType === 'dates'}
                            onChange={() => formik.setFieldValue('durationType', 'dates')}
                          />
                          <Text>Start & End Dates</Text>
                        </label>
                      </Flex>
                      <Text variant="paragraph-sm" color="text3" mb="x4">
                        {formik.values.durationType === 'days'
                          ? 'All streams will start now and last for a specified number of days.'
                          : 'All streams will use specific start and end dates.'}
                      </Text>
                    </Box>
                  )}

                  {formik.values.tokenMetadata?.isValid && (
                    <Box>
                      <Text variant="label-sm" mb="x2">
                        Stream Options (applies to all streams)
                      </Text>
                      <Stack gap="x3">
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formik.values.cancelable}
                            onChange={(e) =>
                              formik.setFieldValue('cancelable', e.target.checked)
                            }
                          />
                          <Box>
                            <Text fontWeight="label">Cancelable</Text>
                            <Text variant="paragraph-sm" color="text3">
                              Allow the sender to cancel streams and reclaim unstreamed
                              tokens
                            </Text>
                          </Box>
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formik.values.transferable}
                            onChange={(e) =>
                              formik.setFieldValue('transferable', e.target.checked)
                            }
                          />
                          <Box>
                            <Text fontWeight="label">Transferable</Text>
                            <Text variant="paragraph-sm" color="text3">
                              Allow recipients to transfer their stream NFT to another
                              address
                            </Text>
                          </Box>
                        </label>
                      </Stack>
                    </Box>
                  )}

                  {formik.values.tokenMetadata?.isValid && (
                    <Box mt={'x5'}>
                      <FieldArray name="streams">
                        {({ push, remove }) => (
                          <>
                            <Accordion
                              items={formik.values.streams.map((stream, index) => ({
                                title: `Stream #${index + 1}${stream.recipientAddress ? ` - ${truncateAddress(stream.recipientAddress)}` : ''}`,
                                titleFontSize: 20,
                                description: (
                                  <StreamForm
                                    key={index}
                                    index={index}
                                    removeStream={() =>
                                      formik.values.streams.length !== 1 && remove(index)
                                    }
                                  />
                                ),
                              }))}
                            />
                            <Flex align="center" justify="center" mt="x4">
                              <Button
                                variant="secondary"
                                width={'auto'}
                                onClick={() => handleAddStream(push)}
                                icon="plus"
                              >
                                Add New Stream
                              </Button>
                            </Flex>
                          </>
                        )}
                      </FieldArray>
                    </Box>
                  )}

                  <Button
                    mt={'x9'}
                    variant={'outline'}
                    borderRadius={'curved'}
                    type="submit"
                    disabled={
                      formik.isSubmitting ||
                      !formik.values.tokenMetadata?.isValid ||
                      formik.values.streams.length === 0 ||
                      !!balanceError ||
                      !contractAddresses.batchLockup ||
                      !contractAddresses.lockup ||
                      Object.keys(allErrors).length > 0
                    }
                  >
                    {formik.isSubmitting
                      ? 'Adding Transaction to Queue...'
                      : 'Add Transaction to Queue'}
                  </Button>

                  {!formik.isValidating && Object.keys(allErrors).length > 0 && (
                    <Stack mt="x2" gap="x1">
                      {Object.entries(allErrors).flatMap(([key, error]) => {
                        if (typeof error === 'string') {
                          return [
                            <Text key={key} color="negative" textAlign="left">
                              - {error}
                            </Text>,
                          ]
                        } else if (key === 'streams' && Array.isArray(error)) {
                          return error.flatMap((streamError, index) => {
                            if (typeof streamError === 'object' && streamError !== null) {
                              return Object.entries(streamError).map(([field, msg]) => (
                                <Text
                                  key={`stream-${index}-${field}`}
                                  color="negative"
                                  textAlign="left"
                                >
                                  - Stream {index + 1} {field}: {msg}
                                </Text>
                              ))
                            }
                            return []
                          })
                        }
                        return []
                      })}
                    </Stack>
                  )}
                </Stack>
              </Form>
            </Box>
          )
        }}
      </Formik>
    </Box>
  )
}
