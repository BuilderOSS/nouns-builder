import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { FieldArray, Form, Formik } from 'formik'
import { truncate } from 'lodash'
import React, { useCallback, useState } from 'react'
import DatePicker from 'src/components/Fields/Date'
import SmartInput from 'src/components/Fields/SmartInput'
import { TEXT } from 'src/components/Fields/types'
import Accordion from 'src/components/Home/accordian'
import { Icon } from 'src/components/Icon'
import { useDaoStore } from 'src/stores/useDaoStore'
import { formatUnits, parseUnits } from 'viem'

import { EscrowDetailsDisplay } from './EscrowDetailsDisplay'
import {
  EscrowFormProps,
  EscrowFormSchema,
  MilestoneFormValues,
} from './EscrowForm.schema'
import { INITIAL_ESCROW_FORM_STATE } from './EscrowUtils'
import { MilestoneForm } from './MilestoneForm'
import { TokenSelectionForm } from './TokenSelectionForm'

const EscrowForm: React.FC<EscrowFormProps> = ({ onSubmit, isSubmitting }) => {
  const [isMediaUploading, setIsMediaUploading] = useState(false)

  const {
    addresses: { escrowDelegate, treasury },
  } = useDaoStore()

  const handleAddMilestone = useCallback(
    (
      push: (obj: MilestoneFormValues) => void,
      previousMilestone: MilestoneFormValues,
      newMilestoneIndex: number
    ) => {
      push({
        amount: 0.5,
        title: 'Milestone ' + newMilestoneIndex,
        endDate: new Date(Date.parse(previousMilestone?.endDate) + 864000000)
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
          ...INITIAL_ESCROW_FORM_STATE,
          clientAddress: escrowDelegate || treasury || '',
        }}
        validationSchema={EscrowFormSchema}
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

          const totalInUnits = formik.values.milestones
            .map((x) => parseUnits(x.amount.toString(), decimals))
            .reduce((acc, x) => acc + x, 0n)

          const totalAmountString = isValid
            ? `${formatCryptoVal(formatUnits(totalInUnits, decimals))} ${symbol}.`
            : undefined

          const balanceString = isValid
            ? `${formatCryptoVal(formatUnits(balance, decimals))} ${symbol}.`
            : undefined

          const escrowAmountError =
            isValid && balance < totalInUnits
              ? `Escrow amount exceeds treasury balance of ${balanceString}.`
              : undefined

          const allErrors = {
            ...formik.errors,
            escrowAmount: escrowAmountError,
          }

          return (
            <Box
              data-testid="Escrow-form"
              as={'fieldset'}
              disabled={formik.isValidating || isSubmitting}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Form>
                <Stack gap={'x5'}>
                  <EscrowDetailsDisplay
                    escrowAmountError={escrowAmountError}
                    totalEscrowAmount={totalAmountString}
                  />
                  <TokenSelectionForm />
                  <SmartInput
                    type={TEXT}
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
                    type={TEXT}
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
                    helperText={`This wallet will control the escrow and release funds. It can be your DAO’s treasury or a working group’s multisig`}
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
                              items={formik.values.milestones.map((_, index) => ({
                                title: truncate(formik.values.milestones[index].title, {
                                  length: 32,
                                  separator: '...',
                                }),
                                description: (
                                  <MilestoneForm
                                    key={index}
                                    index={index}
                                    setIsMediaUploading={setIsMediaUploading}
                                    removeMilestone={() =>
                                      formik.values.milestones.length != 1 &&
                                      remove(index)
                                    }
                                  />
                                ),
                              }))}
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
                      !formik.values.tokenAddress
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

export default EscrowForm
