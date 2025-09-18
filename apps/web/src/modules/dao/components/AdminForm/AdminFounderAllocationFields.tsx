import { Duration } from '@buildeross/types'
import { DatePicker, SmartInput } from '@buildeross/ui/Fields'
import { Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { FormikErrors, FormikProps, FormikTouched } from 'formik'
import React from 'react'
import { calculateMaxAllocation, TokenAllocation } from 'src/modules/create-dao'

import { AdminFormValues } from './AdminForm.schema'

interface AdminFounderAllocationFieldsProps {
  values: AdminFormValues
  auctionDuration: Duration
  vetoPower?: boolean
  errors?: FormikErrors<AdminFormValues>
  touched: FormikTouched<AdminFormValues>
  formik: FormikProps<AdminFormValues>
  removeFounderAddress: (index: number) => void
  addFounderAddress: () => void
}

export const AdminFounderAllocationFields = ({
  values,
  auctionDuration,
  errors,
  touched,
  formik,
  removeFounderAddress,
  addFounderAddress,
}: AdminFounderAllocationFieldsProps) => {
  return (
    <Flex position={'relative'} direction={'column'} w={'100%'}>
      <Stack>
        {values.founderAllocation.map((founder, index) => {
          const error =
            typeof errors?.founderAllocation === 'object'
              ? (errors?.founderAllocation?.[index] as FormikErrors<TokenAllocation>)
              : undefined

          const touchedField = touched?.founderAllocation?.[index]

          return (
            <Flex key={`founder-${index}`} direction="column" mb={'x4'}>
              <Flex>
                <Flex style={{ flex: '2 1 0' }}>
                  <SmartInput
                    inputLabel="Founder allocations"
                    id={`founderAllocation.${index}.founderAddress`}
                    value={founder.founderAddress}
                    type={'text'}
                    formik={formik}
                    placeholder={'0x... or .eth'}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    autoSubmit={false}
                    isAddress={true}
                    errorMessage={
                      error?.founderAddress && touchedField?.founderAddress
                        ? error?.founderAddress
                        : undefined
                    }
                  />
                </Flex>

                <Flex style={{ flex: '1 1 0' }}>
                  <SmartInput
                    inputLabel={'Percentage'}
                    id={`founderAllocation.${index}.allocationPercentage`}
                    value={founder.allocationPercentage}
                    type={'number'}
                    formik={formik}
                    disabled={false}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    perma={'%'}
                    autoSubmit={false}
                    isAddress={false}
                    errorMessage={
                      error?.allocationPercentage && touchedField?.allocationPercentage
                        ? error?.allocationPercentage
                        : undefined
                    }
                  />
                </Flex>

                <Flex style={{ flex: '1 1 0' }}>
                  <DatePicker
                    id={`founderAllocation.${index}.endDate`}
                    value={founder.endDate}
                    placeholder={'yyyy-mm-dd'}
                    inputLabel={'End date'}
                    formik={formik}
                    autoSubmit={false}
                    disabled={false}
                    errorMessage={
                      error?.endDate && touchedField?.endDate ? error?.endDate : undefined
                    }
                  />
                </Flex>
              </Flex>

              <Flex align={'center'} justify={'space-between'} style={{ marginTop: -24 }}>
                <Button
                  type="button"
                  variant="unset"
                  onClick={() => removeFounderAddress(index)}
                >
                  <Icon id="trash" />
                </Button>

                {founder?.allocationPercentage && founder?.endDate ? (
                  <Text variant="eyebrow" ml={'auto'}>
                    ~{' '}
                    {calculateMaxAllocation(
                      founder?.allocationPercentage,
                      founder?.endDate,
                      auctionDuration
                    )}{' '}
                    Tokens
                  </Text>
                ) : null}
              </Flex>
            </Flex>
          )
        })}
      </Stack>

      <Flex justify={'center'}>
        <Button
          variant={'ghost'}
          borderRadius={'curved'}
          type={'button'}
          onClick={addFounderAddress}
        >
          <Icon id="plus" />
          <Flex>Add Address</Flex>
        </Button>
      </Flex>

      {typeof errors?.founderAllocation === 'string' && (
        <Flex mt={'x8'}>
          <Text color="negative">{errors?.founderAllocation}</Text>
        </Flex>
      )}
    </Flex>
  )
}
