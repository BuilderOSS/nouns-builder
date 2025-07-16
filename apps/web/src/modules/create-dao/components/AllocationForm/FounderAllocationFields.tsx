import { Button, Flex, Heading, Paragraph, Stack, Text } from '@buildeross/zord'
import { FormikErrors, FormikProps, FormikTouched } from 'formik'
import React from 'react'

import DatePicker from 'src/components/Fields/Date'
import SmartInput from 'src/components/Fields/SmartInput'
import { Icon } from 'src/components/Icon'
import {
  FounderAllocationFormValues,
  calculateMaxAllocation,
} from 'src/modules/create-dao'
import { Duration } from 'src/typings'

import { TokenAllocation } from '../AllocationForm'

interface FounderAllocationFieldsProps {
  values: FounderAllocationFormValues
  auctionDuration: Duration
  vetoPower?: boolean
  vetoerAddress: string
  errors?: FormikErrors<FounderAllocationFormValues>
  touched: FormikTouched<FounderAllocationFormValues>
  formik: FormikProps<FounderAllocationFormValues>
  removeFounderAddress: (index: number) => void
  addFounderAddress: () => void
}

export const FounderAllocationFields = ({
  values,
  vetoPower,
  vetoerAddress,
  auctionDuration,
  errors,
  touched,
  formik,
  removeFounderAddress,
  addFounderAddress,
}: FounderAllocationFieldsProps) => {
  return (
    <Flex position={'relative'} direction={'column'} w={'100%'}>
      <Heading size="xs">Token Allocation</Heading>

      <Paragraph color="text3" mb={'x6'}>
        A Founder Address will receive x% of tokens until the specified end date.
      </Paragraph>

      <Stack>
        {values.founderAllocation.map((founder, index) => {
          const isFounder = index === 0
          const isVetoer = vetoPower && vetoerAddress === founder.founderAddress

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
                    inputLabel={
                      isFounder
                        ? 'Admin founder address'
                        : 'Additional founder allocations'
                    }
                    id={`founderAllocation.${index}.founderAddress`}
                    value={founder.founderAddress}
                    type={'text'}
                    formik={formik}
                    placeholder={'0x... or .eth'}
                    disabled={isFounder}
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
                {!isFounder && (
                  <Button
                    type="button"
                    variant="unset"
                    onClick={() => removeFounderAddress(index)}
                  >
                    <Icon id="trash" />
                  </Button>
                )}

                {isVetoer && (
                  <Flex
                    align={'center'}
                    ml={isFounder ? undefined : 'x2'}
                    color="warning"
                  >
                    <Icon size="sm" id="warning-16" fill="warning" />
                    <Flex fontWeight={'display'} ml={'x2'}>
                      This address has proposal veto power
                    </Flex>
                  </Flex>
                )}

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
