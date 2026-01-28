import { useEscrowDelegate } from '@buildeross/hooks/useEscrowDelegate'
import { erc20Abi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { TransactionType } from '@buildeross/types'
import { Accordion } from '@buildeross/ui/Accordion'
import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { getEnsAddress } from '@buildeross/utils/ens'
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
import { useCallback, useEffect, useState } from 'react'
import { Address, encodeFunctionData, formatUnits, getAddress, parseUnits } from 'viem'

import { TokenSelectionForm } from '../../shared'
import sablierStreamSchema, {
  SablierStreamValues,
  StreamFormValues,
} from './SablierStream.schema'
import { StreamForm } from './StreamForm'

const SECONDS_PER_DAY = 86400

export const SablierStream = () => {
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const [contractAddresses, setContractAddresses] = useState<{
    batchLockup: Address | null
    lockupLinear: Address | null
  }>({ batchLockup: null, lockupLinear: null })

  const chainSupported = isSablierSupported(chain.id)

  // Fetch Sablier contract addresses on mount
  useEffect(() => {
    if (chainSupported) {
      getSablierContracts(chain.id).then(setContractAddresses)
    }
  }, [chain.id, chainSupported])

  const { escrowDelegate } = useEscrowDelegate({
    chainId: chain.id,
    tokenAddress: addresses.token,
    treasuryAddress: addresses.treasury,
  })

  const initialValues: SablierStreamValues = {
    senderAddress: escrowDelegate || addresses.treasury || '',
    tokenAddress: undefined,
    tokenMetadata: undefined,
    streams: [
      {
        recipientAddress: '',
        amount: 0,
        durationType: 'days',
        durationDays: 30,
        cliffDays: 0,
      },
    ],
  }

  const handleAddStream = useCallback((push: (obj: StreamFormValues) => void) => {
    push({
      recipientAddress: '',
      amount: 0,
      durationType: 'days',
      durationDays: 30,
      cliffDays: 0,
    })
  }, [])

  const handleSubmit = async (
    values: SablierStreamValues,
    actions: FormikHelpers<SablierStreamValues>
  ) => {
    if (!values.tokenMetadata || !values.streams.length) {
      return
    }

    if (!contractAddresses.batchLockup || !contractAddresses.lockupLinear) {
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
        alert('WETH is not available on this network')
        return
      }
    }

    // Resolve ENS names
    const senderAddress = await getEnsAddress(values.senderAddress, getProvider(chain.id))

    // Determine if we're using durations or timestamps
    const useDurations = values.streams[0].durationType === 'days'

    const now = Math.floor(Date.now() / 1000)

    // Build batch parameters and validate
    const batchParams = await Promise.all(
      values.streams.map(async (stream) => {
        const recipientAddress = await getEnsAddress(
          stream.recipientAddress,
          getProvider(chain.id)
        )
        const depositAmount = parseUnits(stream.amount.toString(), tokenDecimals)

        if (useDurations) {
          // Days from now
          const cliffDuration = (stream.cliffDays || 0) * SECONDS_PER_DAY
          const totalDuration = (stream.durationDays || 0) * SECONDS_PER_DAY

          return {
            sender: getAddress(senderAddress) as Address,
            recipient: getAddress(recipientAddress) as Address,
            depositAmount,
            cliffDuration,
            totalDuration,
            // For validation
            startTime: now,
            endTime: now + totalDuration,
            cliffTime: cliffDuration > 0 ? now + cliffDuration : 0,
          }
        } else {
          // Start/end dates
          const startTime = Math.floor(new Date(stream.startDate!).getTime() / 1000)
          const endTime = Math.floor(new Date(stream.endDate!).getTime() / 1000)
          const cliffDuration = (stream.cliffDays || 0) * SECONDS_PER_DAY
          const cliffTime = cliffDuration > 0 ? startTime + cliffDuration : 0

          return {
            sender: getAddress(senderAddress) as Address,
            recipient: getAddress(recipientAddress) as Address,
            depositAmount,
            startTime,
            endTime,
            cliffTime,
          }
        }
      })
    )

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
      alert('Stream validation failed:\n' + validationResult.errors.join('\n'))
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
    let calldata: string
    if (useDurations) {
      calldata = encodeCreateWithDurationsLL(
        contractAddresses.lockupLinear,
        getAddress(tokenAddress),
        batchParams.map((params) => ({
          sender: params.sender,
          recipient: params.recipient,
          depositAmount: params.depositAmount,
          cliffDuration: params.cliffDuration!,
          totalDuration: params.totalDuration!,
        }))
      )
    } else {
      calldata = encodeCreateWithTimestampsLL(
        contractAddresses.lockupLinear,
        getAddress(tokenAddress),
        batchParams.map((params) => ({
          sender: params.sender,
          recipient: params.recipient,
          depositAmount: params.depositAmount,
          startTime: params.startTime,
          cliffTime: params.cliffTime,
          endTime: params.endTime,
        }))
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
        type: TransactionType.SABLIER_STREAM,
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
        validationSchema={sablierStreamSchema()}
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
            .map((stream) => parseUnits(stream.amount.toString(), decimals))
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
              data-testid="sablier-stream-form"
              as={'fieldset'}
              disabled={formik.isValidating || formik.isSubmitting}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Form>
                <Stack gap={'x5'}>
                  <Text variant="paragraph-sm" color="text3">
                    Create token streams using Sablier protocol. All streams will be
                    cancelable and non-transferable.
                  </Text>

                  {isValid && totalAmountString && (
                    <Box
                      p={'x4'}
                      backgroundColor={balanceError ? 'negative' : 'background2'}
                      borderRadius={'curved'}
                      borderWidth={'normal'}
                      borderStyle={'solid'}
                      borderColor={balanceError ? 'negative' : 'border'}
                    >
                      <Flex direction={'column'} gap={'x1'}>
                        <Text fontSize={14} fontWeight={'label'}>
                          Total Stream Amount: {totalAmountString}
                        </Text>
                        {balanceError && (
                          <Text fontSize={14} color="negative">
                            {balanceError}
                          </Text>
                        )}
                      </Flex>
                    </Box>
                  )}

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
                    <Box mt={'x5'}>
                      <FieldArray name="streams">
                        {({ push, remove }) => (
                          <>
                            <Accordion
                              items={formik.values.streams.map((stream, index) => ({
                                title: `Stream #${index + 1}${stream.recipientAddress ? ` - ${truncate(stream.recipientAddress, { length: 20 })}` : ''}`,
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
                              >
                                <Icon id="plus" />
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
                      !formik.isValid ||
                      formik.isSubmitting ||
                      !formik.values.tokenMetadata?.isValid ||
                      formik.values.streams.length === 0 ||
                      !!balanceError ||
                      !contractAddresses.batchLockup ||
                      !contractAddresses.lockupLinear
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
