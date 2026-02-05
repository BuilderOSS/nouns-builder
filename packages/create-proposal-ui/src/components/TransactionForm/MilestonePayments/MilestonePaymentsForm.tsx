import { useEscrowDelegate } from '@buildeross/hooks/useEscrowDelegate'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { Accordion } from '@buildeross/ui/Accordion'
import { DatePicker, FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { FieldArray, Form, Formik } from 'formik'
import { truncate } from 'lodash'
import { useCallback, useState } from 'react'
import { formatUnits, parseUnits } from 'viem'

import { TokenSelectionForm } from '../../shared'
import { MilestoneForm } from './MilestoneForm'
import {
  getInitialMilestonePaymentsFormState,
  MilestoneFormValues,
  MilestonePaymentsFormProps,
  MilestonePaymentsFormSchema,
} from './MilestonePayments.schema'
import { MilestonePaymentsDetailsDisplay } from './MilestonePaymentsDetailsDisplay'

const MilestonePaymentsForm: React.FC<MilestonePaymentsFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [isMediaUploading, setIsMediaUploading] = useState(false)

  const {
    addresses: { token, treasury },
  } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const { escrowDelegate } = useEscrowDelegate({
    chainId: chain.id,
    tokenAddress: token,
    treasuryAddress: treasury,
  })

  const handleAddMilestone = useCallback(
    (
      push: (obj: MilestoneFormValues) => void,
      previousMilestone: MilestoneFormValues,
      newMilestoneIndex: number
    ) => {
      push({
        amount: 0.5,
        title: 'Milestone ' + newMilestoneIndex,
        endDate: new Date(new Date(previousMilestone.endDate).getTime() + 864000000)
          .toISOString()
          .slice(0, 10) as never, // adds 10 days to previous milestone
        mediaUrl: '',
        mediaType: undefined,
        mediaFileName: '',
        description: '',
      })
    },
    []
  )

  return (
    <Box>
      <Formik
        initialValues={{
          ...getInitialMilestonePaymentsFormState(),
          clientAddress: escrowDelegate || treasury || '',
        }}
        enableReinitialize={true}
        validationSchema={MilestonePaymentsFormSchema}
        onSubmit={onSubmit}
        validateOnMount={false}
        validateOnChange={false}
        validateOnBlur={true}
      >
        {(formik) => {
          const decimals = formik.values.tokenMetadata?.decimals ?? 18
          const balance = formik.values.tokenMetadata?.balance ?? 0n
          const isValid = formik.values.tokenMetadata?.isValid ?? false
          const symbol = formik.values.tokenMetadata?.symbol ?? ''

          // Normalize amount to prevent parseUnits errors
          const normalizeAmount = (amount: any): string => {
            if (!amount || amount === '' || amount === null || amount === undefined) {
              return '0'
            }
            const str = amount.toString()
            // Check for scientific notation and convert to fixed decimal
            if (str.includes('e') || str.includes('E')) {
              const num = Number(str)
              if (isNaN(num)) return '0'
              return num.toFixed(decimals)
            }
            return str
          }

          const totalInUnits = formik.values.milestones
            .map((x) => parseUnits(normalizeAmount(x.amount), decimals))
            .reduce((acc, x) => acc + x, 0n)

          const totalAmountString = isValid
            ? `${formatCryptoVal(formatUnits(totalInUnits, decimals))} ${symbol}`
            : undefined

          const balanceString = isValid
            ? `${formatCryptoVal(formatUnits(balance, decimals))} ${symbol}`
            : undefined

          const escrowAmountError =
            isValid && balance < totalInUnits
              ? `Escrow amount exceeds treasury balance of ${balanceString}.`
              : undefined

          const allErrors = escrowAmountError
            ? {
                ...formik.errors,
                escrowAmount: escrowAmountError,
              }
            : formik.errors

          return (
            <Box
              data-testid="Escrow-form"
              as={'fieldset'}
              disabled={formik.isValidating || isSubmitting}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Form>
                <Stack gap={'x5'}>
                  <MilestonePaymentsDetailsDisplay
                    escrowAmountError={escrowAmountError}
                    totalEscrowAmountWithSymbol={totalAmountString}
                    milestoneCount={formik.values.milestones.length}
                  />

                  <Text variant="paragraph-sm" color="text3">
                    Create milestone-based payments with Smart Invoice. Lock tokens in
                    escrow and release them as deliverables are completed.
                  </Text>

                  <TokenSelectionForm />
                  <SmartInput
                    type={FIELD_TYPES.TEXT}
                    formik={formik}
                    {...formik.getFieldProps('recipientAddress')}
                    id="recipientAddress"
                    inputLabel={'Recipient'}
                    placeholder={'0x...'}
                    isAddress={true}
                    errorMessage={
                      formik.touched.recipientAddress && formik.errors.recipientAddress
                        ? formik.errors.recipientAddress
                        : undefined
                    }
                    helperText={`The wallet address that will receive funds when milestones are completed.`}
                  />
                  <SmartInput
                    type={FIELD_TYPES.TEXT}
                    formik={formik}
                    {...formik.getFieldProps('clientAddress')}
                    id="clientAddress"
                    inputLabel={'Delegate'}
                    placeholder={'0x... or .eth'}
                    isAddress={true}
                    errorMessage={
                      formik.touched.clientAddress && formik.errors.clientAddress
                        ? formik.errors.clientAddress
                        : undefined
                    }
                    helperText={`This wallet will control the escrow and release milestone funds. It can be your DAO's treasury or a working group's multisig`}
                  />

                  <DatePicker
                    {...formik.getFieldProps('safetyValveDate')}
                    formik={formik}
                    id="safetyValveDate"
                    inputLabel={'Safety Valve Date'}
                    placeholder={'yyyy-mm-dd'}
                    dateFormat="Y-m-d"
                    errorMessage={
                      formik.touched.safetyValveDate && formik.errors.safetyValveDate
                        ? formik.errors.safetyValveDate
                        : undefined
                    }
                    helperText={`The date after which the DAO or multisig can reclaim funds from escrow.`}
                  />
                  {formik.values.tokenMetadata?.isValid && (
                    <Box mt={'x5'}>
                      <FieldArray name="milestones">
                        {({ push, remove }) => (
                          <>
                            <Accordion
                              items={formik.values.milestones.map((milestone, index) => {
                                // Normalize amount to prevent parseUnits errors
                                const normalizeAmount = (amount: any): string => {
                                  if (
                                    !amount ||
                                    amount === '' ||
                                    amount === null ||
                                    amount === undefined
                                  ) {
                                    return '0'
                                  }
                                  const str = amount.toString()
                                  // Check for scientific notation and convert to fixed decimal
                                  if (str.includes('e') || str.includes('E')) {
                                    const num = Number(str)
                                    if (isNaN(num)) return '0'
                                    return num.toFixed(decimals)
                                  }
                                  return str
                                }

                                const normalizedAmount = normalizeAmount(milestone.amount)
                                const amountInUnits = parseUnits(
                                  normalizedAmount,
                                  decimals
                                )
                                const amountDisplay =
                                  normalizedAmount && normalizedAmount !== '0'
                                    ? `${formatCryptoVal(formatUnits(amountInUnits, decimals))} ${symbol}`
                                    : '0 ' + symbol
                                const titlePart = truncate(milestone.title, {
                                  length: 24,
                                  separator: '…',
                                  omission: '…',
                                })
                                return {
                                  title: `${titlePart}: ${amountDisplay}`,
                                  titleFontSize: 20,
                                  description: (
                                    <MilestoneForm
                                      key={index}
                                      index={index}
                                      setIsMediaUploading={setIsMediaUploading}
                                      removeMilestone={() =>
                                        formik.values.milestones.length !== 1 &&
                                        remove(index)
                                      }
                                    />
                                  ),
                                }
                              })}
                            />
                            <Flex align="center" justify="center">
                              <Button
                                variant="secondary"
                                width={'auto'}
                                onClick={() =>
                                  handleAddMilestone(
                                    push,
                                    formik.values?.milestones[
                                      formik.values?.milestones.length - 1
                                    ],
                                    formik.values?.milestones.length + 1
                                  )
                                }
                              >
                                <Icon id="plus" />
                                Create Milestone
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
                      isSubmitting ||
                      isMediaUploading ||
                      formik.values?.milestones?.length === 0 ||
                      !formik.values.tokenMetadata?.isValid ||
                      !formik.values.tokenAddress ||
                      !!escrowAmountError
                    }
                  >
                    {isSubmitting
                      ? 'Adding Transaction to Queue'
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
                        } else if (key === 'milestones' && Array.isArray(error)) {
                          return error.flatMap((milestoneError, index) => {
                            if (
                              typeof milestoneError === 'object' &&
                              milestoneError !== null
                            ) {
                              return Object.entries(milestoneError).map(
                                ([field, msg]) => (
                                  <Text
                                    key={`milestone-${index}-${field}`}
                                    color="negative"
                                    textAlign="left"
                                  >
                                    - Milestone {index + 1} {field}: {msg}
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

export default MilestonePaymentsForm
