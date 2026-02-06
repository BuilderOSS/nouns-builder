import { erc20Abi } from '@buildeross/sdk/contract'
import { useChainStore, useProposalStore } from '@buildeross/stores'
import { TransactionType } from '@buildeross/types'
import { Accordion } from '@buildeross/ui/Accordion'
import { getEnsAddress } from '@buildeross/utils/ens'
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { getProvider } from '@buildeross/utils/provider'
import { isNativeEth } from '@buildeross/utils/sablier'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import type { FormikHelpers, FormikProps } from 'formik'
import { FieldArray, Form, Formik } from 'formik'
import { useCallback, useState } from 'react'
import {
  Address,
  encodeFunctionData,
  formatUnits,
  getAddress,
  isAddress,
  parseEther,
  parseUnits,
} from 'viem'

import { CsvRecord, CsvUpload, TokenSelectionForm } from '../../shared'
import { RecipientForm } from './RecipientForm'
import sendTokensSchema, {
  RecipientFormValues,
  SendTokensValues,
} from './SendTokens.schema'
import { SendTokensDetailsDisplay } from './SendTokensDetailsDisplay'

const DECIMAL_REGEX = /^(\d+\.?\d*|\.\d+)$/

const truncateAddress = (addr: string) => {
  const snippet = isAddress(addr, { strict: false }) ? walletSnippet(addr) : addr
  return snippet
}

export const SendTokens = () => {
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const chain = useChainStore((x) => x.chain)
  const [csvError, setCsvError] = useState<string>('')

  const initialValues: SendTokensValues = {
    tokenAddress: undefined,
    tokenMetadata: undefined,
    recipients: [
      {
        recipientAddress: '',
        amount: '',
      },
    ],
  }

  const handleCsvParsed = useCallback(
    (records: CsvRecord[], formik: FormikProps<SendTokensValues>) => {
      setCsvError('')
      const recipients = records.map((record) => ({
        recipientAddress: record.address,
        amount: record.amount,
      }))
      formik.setFieldValue('recipients', recipients)
    },
    []
  )

  const handleCsvError = useCallback((error: string) => {
    setCsvError(error)
  }, [])

  const handleAddRecipient = useCallback((push: (obj: RecipientFormValues) => void) => {
    push({
      recipientAddress: '',
      amount: '',
    })
  }, [])

  const handleSubmit = async (
    values: SendTokensValues,
    actions: FormikHelpers<SendTokensValues>
  ) => {
    if (!values.tokenMetadata || !values.recipients.length) {
      return
    }

    const tokenSymbol = values.tokenMetadata.symbol
    const tokenDecimals = values.tokenMetadata.decimals
    const tokenAddress = values.tokenMetadata.address

    // Check if user selected native ETH
    const isEth = isNativeEth(tokenAddress)

    // Resolve all recipient ENS names with error handling
    const resolvedRecipients: Array<{
      address: Address
      amount: bigint
    }> = []

    try {
      for (let i = 0; i < values.recipients.length; i++) {
        const recipient = values.recipients[i]

        // Resolve recipient ENS name
        let recipientAddress: string
        try {
          const resolved = await getEnsAddress(
            recipient.recipientAddress,
            getProvider(chain.id)
          )
          // Validate that the resolved value is actually a valid address
          if (!resolved || !isAddress(resolved, { strict: false })) {
            actions.setErrors({
              recipients: `Recipient #${i + 1}: Could not resolve address. Please enter a valid address or ENS name.`,
            } as any)
            return
          }
          recipientAddress = resolved
        } catch (error) {
          console.error(
            `Error resolving recipient address for recipient #${i + 1}:`,
            error
          )
          actions.setErrors({
            recipients: `Recipient #${i + 1}: Failed to resolve address. Please check your network connection and try again.`,
          } as any)
          return
        }

        // Validate recipient address
        let normalizedRecipient: Address
        try {
          normalizedRecipient = getAddress(recipientAddress) as Address
        } catch (error) {
          console.error(`Invalid recipient address for recipient #${i + 1}:`, error)
          actions.setErrors({
            recipients: `Recipient #${i + 1}: Invalid address format.`,
          } as any)
          return
        }

        // Parse amount
        let amount: bigint
        try {
          amount = isEth
            ? parseEther(recipient.amount)
            : parseUnits(recipient.amount, tokenDecimals)
        } catch (error) {
          console.error(`Error parsing amount for recipient #${i + 1}:`, error)
          actions.setErrors({
            recipients: `Recipient #${i + 1}: Invalid amount format.`,
          } as any)
          return
        }

        resolvedRecipients.push({
          address: normalizedRecipient,
          amount,
        })
      }
    } catch (error) {
      console.error('Error processing recipients:', error)
      actions.setErrors({
        recipients:
          'Failed to process recipient data. Please check all fields and try again.',
      } as any)
      return
    }

    // Calculate total amount for summary
    const totalAmount = resolvedRecipients.reduce((sum, r) => sum + r.amount, 0n)
    const formattedTotal = formatCryptoVal(formatUnits(totalAmount, tokenDecimals))

    // Build transactions based on token type
    const transactions = []

    if (isEth) {
      // ETH: Create one transaction per recipient
      for (const recipient of resolvedRecipients) {
        transactions.push({
          functionSignature: 'sendEth(address)',
          target: recipient.address,
          value: recipient.amount.toString(),
          calldata: '0x',
        })
      }
    } else {
      // ERC20: Create transfer() call for each recipient
      for (const recipient of resolvedRecipients) {
        const calldata = encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: [recipient.address, recipient.amount],
        })

        transactions.push({
          functionSignature: 'transfer(address,uint256)',
          target: getAddress(tokenAddress),
          value: '0',
          calldata,
        })
      }
    }

    // Create summary
    const recipientCount = values.recipients.length
    const summary =
      recipientCount === 1
        ? `Send ${formattedTotal} ${tokenSymbol} to ${walletSnippet(resolvedRecipients[0].address)}`
        : `Send ${formattedTotal} ${tokenSymbol} to ${recipientCount} recipients`

    try {
      addTransaction({
        type: TransactionType.SEND_TOKENS,
        summary,
        transactions,
      })
      actions.resetForm()
    } catch (err) {
      console.error('Error adding transaction:', err)
    }
  }

  return (
    <Box w={'100%'}>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={sendTokensSchema()}
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

          // Calculate total amount across all recipients
          const totalInUnits = formik.values.recipients
            .map((recipient) => {
              // Guard against empty/invalid amounts during typing
              const amount = recipient.amount
              if (!amount || typeof amount !== 'string' || amount.trim() === '') {
                return 0n
              }

              // Validate decimal format (reject scientific notation)
              if (!DECIMAL_REGEX.test(amount)) {
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
              ? `Total amount exceeds treasury balance of ${balanceString}.`
              : undefined

          const allErrors = balanceError
            ? {
                ...formik.errors,
                totalAmount: balanceError,
              }
            : formik.errors

          return (
            <Box
              data-testid="send-tokens-form"
              as={'fieldset'}
              disabled={formik.isValidating || formik.isSubmitting}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Form>
                <Stack gap={'x5'}>
                  <SendTokensDetailsDisplay
                    balanceError={balanceError}
                    totalAmountWithSymbol={totalAmountString}
                    recipientCount={formik.values.recipients.length}
                  />

                  <Text variant="paragraph-sm" color="text3">
                    Send ETH or ERC20 tokens from the treasury to one or more recipients.
                  </Text>

                  <TokenSelectionForm />

                  {formik.values.tokenMetadata?.isValid && (
                    <Box mt={'x5'}>
                      {/* CSV Upload Section */}
                      <CsvUpload
                        onCsvParsed={(records) => handleCsvParsed(records, formik)}
                        onError={handleCsvError}
                        disabled={formik.isValidating || formik.isSubmitting}
                        templateFilename="send_tokens_template.csv"
                        templateContent="address,amount&#10;0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e,10.5&#10;0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe,25.75"
                        maxRecords={100}
                        validateAmount={(amount, rowIndex) => {
                          if (!amount) {
                            return `Row ${rowIndex + 1}: Missing amount`
                          }
                          // Allow decimal format, reject scientific notation
                          if (!DECIMAL_REGEX.test(amount)) {
                            return `Row ${rowIndex + 1}: Invalid amount format (use decimal, no scientific notation)`
                          }
                          const num = parseFloat(amount)
                          if (isNaN(num) || num <= 0) {
                            return `Row ${rowIndex + 1}: Amount must be greater than 0`
                          }
                          return null
                        }}
                      />

                      {csvError && (
                        <Box
                          mt="x3"
                          p="x3"
                          backgroundColor="negative"
                          borderRadius="curved"
                        >
                          <Text
                            color="onNegative"
                            fontSize="14"
                            style={{ whiteSpace: 'pre-line' }}
                          >
                            {csvError}
                          </Text>
                        </Box>
                      )}

                      <FieldArray name="recipients">
                        {({ push, remove }) => (
                          <>
                            <Box mt="x6">
                              <Flex justify="space-between" align="center" mb="x4">
                                <Text fontWeight="display">Recipients</Text>
                                <Text fontSize="14" color="text3">
                                  {formik.values.recipients.length} recipient
                                  {formik.values.recipients.length === 1 ? '' : 's'}
                                </Text>
                              </Flex>
                              <Accordion
                                items={formik.values.recipients.map(
                                  (recipient, index) => {
                                    let amountDisplay = '0 ' + symbol
                                    if (
                                      recipient.amount &&
                                      recipient.amount.trim() !== ''
                                    ) {
                                      try {
                                        const amountInUnits = parseUnits(
                                          recipient.amount,
                                          decimals
                                        )
                                        amountDisplay = `${formatCryptoVal(formatUnits(amountInUnits, decimals))} ${symbol}`
                                      } catch {
                                        amountDisplay = recipient.amount + ' ' + symbol
                                      }
                                    }
                                    const recipientPart = recipient.recipientAddress
                                      ? ` - ${truncateAddress(recipient.recipientAddress)}`
                                      : ''

                                    return {
                                      title: `Recipient #${index + 1}: ${amountDisplay}${recipientPart}`,
                                      titleFontSize: 20,
                                      description: (
                                        <RecipientForm
                                          key={index}
                                          index={index}
                                          removeRecipient={() =>
                                            formik.values.recipients.length !== 1 &&
                                            remove(index)
                                          }
                                        />
                                      ),
                                    }
                                  }
                                )}
                              />
                              <Flex align="center" justify="center" mt="x4">
                                <Button
                                  variant="secondary"
                                  width={'auto'}
                                  onClick={() => handleAddRecipient(push)}
                                  icon="plus"
                                >
                                  Add Recipient
                                </Button>
                              </Flex>
                            </Box>
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
                      formik.values.recipients.length === 0 ||
                      !!balanceError ||
                      !!csvError ||
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
                        } else if (key === 'recipients' && Array.isArray(error)) {
                          return error.flatMap((recipientError, index) => {
                            if (
                              typeof recipientError === 'object' &&
                              recipientError !== null
                            ) {
                              return Object.entries(recipientError).map(
                                ([field, msg]) => (
                                  <Text
                                    key={`recipient-${index}-${field}`}
                                    color="negative"
                                    textAlign="left"
                                  >
                                    - Recipient {index + 1} {field}: {msg}
                                  </Text>
                                )
                              )
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
