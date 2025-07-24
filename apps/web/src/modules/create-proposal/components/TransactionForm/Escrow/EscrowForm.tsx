import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import type { FormikHelpers } from 'formik'
import { FieldArray, Form, Formik } from 'formik'
import { useFormikContext } from 'formik'
import { truncate } from 'lodash'
import React, { useCallback, useState } from 'react'
import DatePicker from 'src/components/Fields/Date'
import SmartInput from 'src/components/Fields/SmartInput'
import { NUMBER, TEXT, TEXTAREA } from 'src/components/Fields/types'
import Accordion from 'src/components/Home/accordian'
import { Icon } from 'src/components/Icon'
import SingleMediaUpload from 'src/components/SingleMediaUpload/SingleMediaUpload'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { formatEther } from 'viem'
import { useBalance } from 'wagmi'

import EscrowDetailsDisplay from './EscrowDetailsDisplay'
import {
  EscrowFormProps,
  EscrowFormSchema,
  EscrowFormValues,
  MilestoneFormValues,
} from './EscrowForm.schema'
import { useEscrowFormStore } from './EscrowUtils'

const MilestoneForm: React.FC<{
  index: number
  setIsMediaUploading: React.Dispatch<React.SetStateAction<boolean>>
  removeMilestone: () => void
}> = ({ index, removeMilestone, setIsMediaUploading }) => {
  const formik = useFormikContext<EscrowFormValues>()

  const handleRemoveMilestone = () => {
    removeMilestone()
  }

  const handleMediaUploadStart = useCallback(
    (media: File) => {
      formik.setFieldValue(`milestones.${index}.mediaType`, media.type)
      formik.setFieldValue(`milestones.${index}.mediaFileName`, media.name)
      setIsMediaUploading(true)
    },
    [formik, index, setIsMediaUploading]
  )

  return (
    <Stack gap={'x4'}>
      <SmartInput
        {...formik.getFieldProps(`milestones.${index}.amount`)}
        inputLabel="Amount"
        id={`milestones.${index}.amount`}
        type={NUMBER}
        placeholder={'1.0 ETH'}
        errorMessage={
          (formik.touched?.milestones as any)?.[index]?.amount &&
          (formik.errors?.milestones as any)?.[index]?.amount
            ? (formik.errors?.milestones as any)?.[index]?.amount
            : undefined
        }
      />
      <SmartInput
        {...formik.getFieldProps(`milestones.${index}.title`)}
        id={`milestones.${index}.title`}
        inputLabel="Title"
        type={'text'}
        placeholder={'Milestone Title'}
        errorMessage={(formik.errors?.milestones as any)?.[index]?.title ?? undefined}
      />

      <SmartInput
        {...formik.getFieldProps(`milestones.${index}.description`)}
        type={TEXTAREA}
        formik={formik}
        id={`milestones.${index}.description`}
        value={formik.values?.milestones[index]?.description}
        inputLabel="Description"
        placeholder={'Milestone description is highly encouraged'}
      />

      <DatePicker
        {...formik.getFieldProps(`milestones.${index}.endDate`)}
        formik={formik}
        id={`milestones.${index}.endDate`}
        inputLabel={'Delivery Date'}
        placeholder={'yyyy-mm-dd'}
        dateFormat="Y-m-d"
        errorMessage={(formik.errors?.milestones as any)?.[index]?.endDate ?? undefined}
      />

      <SingleMediaUpload
        {...formik.getFieldProps('media')}
        formik={formik}
        value={formik.values.milestones[index].mediaFileName}
        id={`milestones.${index}.mediaUrl`}
        inputLabel={'Media'}
        onUploadStart={handleMediaUploadStart}
        onUploadSettled={() => setIsMediaUploading(false)}
      />

      <Flex
        style={{
          justifyContent: 'flex-end',
        }}
      >
        {formik.values.milestones.length > 1 && (
          <Button variant="outline" width={'auto'} onClick={handleRemoveMilestone}>
            <Icon id="trash" />
          </Button>
        )}
      </Flex>
    </Stack>
  )
}

const EscrowForm: React.FC<EscrowFormProps> = ({ onSubmit, isSubmitting }) => {
  const [isMediaUploading, setIsMediaUploading] = useState(false)

  const { formValues, setFormValues } = useEscrowFormStore()
  const {
    addresses: { escrowDelegate, treasury },
  } = useDaoStore()

  const handleSubmit = useCallback(
    (values: EscrowFormValues, actions: FormikHelpers<EscrowFormValues>) => {
      setFormValues(values)
      onSubmit?.(values, actions)
    },
    [onSubmit, setFormValues]
  )

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

  const chain = useChainStore((x) => x.chain)

  const { data: treasuryBalance } = useBalance({
    address: treasury,
    chainId: chain.id,
  })

  return (
    <Box>
      <Formik
        initialValues={{
          ...formValues,
          clientAddress: escrowDelegate || treasury || '',
        }}
        validationSchema={EscrowFormSchema}
        onSubmit={handleSubmit}
        validateOnMount={false}
        validateOnChange={false}
        validateOnBlur={true}
      >
        {(formik) => {
          const totalEscrowAmount = formik.values?.milestones
            .map((x) => x.amount)
            .reduce((acc, x) => acc + x, 0)

          const isTreasuryBalanceEnough =
            Number(totalEscrowAmount) <= Number(formatEther(treasuryBalance?.value ?? 0n))
          const escrowAmountError = isTreasuryBalanceEnough
            ? undefined
            : 'Escrow amount exceeding treasury balance.'

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
                  <EscrowDetailsDisplay />
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
                                    formik.values.milestones.length != 1 && remove(index)
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
                  <Button
                    mt={'x9'}
                    variant={'outline'}
                    borderRadius={'curved'}
                    type="submit"
                    disabled={
                      isSubmitting ||
                      isMediaUploading ||
                      formik.values?.milestones?.length === 0
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
