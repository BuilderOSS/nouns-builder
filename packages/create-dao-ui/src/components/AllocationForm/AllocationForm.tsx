import { PUBLIC_MANAGER_ADDRESS } from '@buildeross/constants/addresses'
import { managerAbi } from '@buildeross/sdk/contract'
import { useChainStore } from '@buildeross/stores'
import { CHAIN_ID, type TokenAllocation } from '@buildeross/types'
import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import {
  defaultBackButton,
  defaultFormAdvancedToggle,
  defaultFormAdvancedWrapper,
  defaultFormButtonWithPrev,
} from '@buildeross/ui/styles'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Button, Flex, Heading, Icon, Paragraph } from '@buildeross/zord'
import { FieldArray, Form, Formik, FormikProps } from 'formik'
import { motion } from 'framer-motion'
import sum from 'lodash/sum'
import React, { BaseSyntheticEvent, useRef, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { useShallow } from 'zustand/shallow'

import { useFormStore } from '../../stores'
import { validationSchemaAllocations } from './AllocationForm.schema'
import { ContributionAllocation } from './ContributionAllocation'
import { FounderAllocationFields } from './FounderAllocationFields'
import { FounderRewardsFields } from './FounderRewardsFields'

export type { TokenAllocation }

interface AllocationFormProps {
  title: string
}

const animation = {
  init: {
    height: 0,
  },
  open: {
    height: 'auto',
  },
}

export interface FounderAllocationFormValues {
  founderAllocation: TokenAllocation[]
  founderRewardRecipient: string
  founderRewardBps: number
  reservedUntilTokenId: string
}

export const AllocationForm: React.FC<AllocationFormProps> = ({ title }) => {
  const formRef = useRef<FormikProps<FounderAllocationFormValues>>(null)
  const [allocationError, setAllocationError] = useState(false)
  const chain = useChainStore((x) => x.chain)
  const [showAdvanced, setShowAdvanced] = React.useState<boolean>(false)
  const { data: version, isLoading: isVersionLoading } = useReadContract({
    abi: managerAbi,
    address: PUBLIC_MANAGER_ADDRESS[chain.id],
    functionName: 'contractVersion',
    chainId: chain.id,
  })
  const {
    founderAllocation,
    contributionAllocation,
    setFounderAllocation,
    setActiveSection,
    activeSection,
    setFulfilledSections,
    vetoPower,
    vetoerAddress,
    auctionSettings: { auctionDuration },
    founderRewardRecipient,
    founderRewardBps,
    setFounderRewardRecipient,
    setFounderRewardBps,
    reservedUntilTokenId,
    setReservedUntilTokenId,
  } = useFormStore(
    useShallow((state) => ({
      founderAllocation: state.founderAllocation,
      setFounderAllocation: state.setFounderAllocation,
      contributionAllocation: state.contributionAllocation,
      setActiveSection: state.setActiveSection,
      activeSection: state.activeSection,
      setFulfilledSections: state.setFulfilledSections,
      vetoPower: state.vetoPower,
      vetoerAddress: state.vetoerAddress,
      auctionSettings: state.auctionSettings,
      founderRewardRecipient: state.founderRewardRecipient,
      founderRewardBps: state.founderRewardBps,
      setFounderRewardRecipient: state.setFounderRewardRecipient,
      setFounderRewardBps: state.setFounderRewardBps,
      reservedUntilTokenId: state.reservedUntilTokenId,
      setReservedUntilTokenId: state.setReservedUntilTokenId,
    }))
  )

  const { address } = useAccount()

  // should always default to the current signer address given this field is disabled
  const initialFounderValues =
    founderAllocation.length === 0
      ? [
          {
            founderAddress: address || '',
            allocationPercentage: '',
            endDate: '',
            admin: true,
          },
        ]
      : [
          {
            founderAddress: address || '',
            allocationPercentage: founderAllocation[0].allocationPercentage,
            endDate: founderAllocation[0].endDate,
            admin: true,
          },
          ...founderAllocation.slice(1),
        ]

  const handlePrev = () => {
    setActiveSection(activeSection - 1)
  }

  const handleSubmit = async ({
    founderAllocation,
    founderRewardRecipient,
    founderRewardBps,
    reservedUntilTokenId,
  }: FounderAllocationFormValues) => {
    setAllocationError(false)

    const totalAllocation = sum(
      [...founderAllocation, ...contributionAllocation].map(
        ({ allocationPercentage: allocation }) => Number(allocation)
      )
    )
    if (totalAllocation > 99) {
      setAllocationError(true)
      return
    }

    const foundAllocationPromises = founderAllocation.map((allocation) =>
      getEnsAddress(allocation.founderAddress)
    )
    const founderAllocationAddresses = await Promise.all(foundAllocationPromises)
    setFounderAllocation(
      founderAllocation.map((allocation, idx) => ({
        ...allocation,
        admin: undefined,
        founderAddress: founderAllocationAddresses[idx],
      }))
    )

    // Process founder reward with ENS resolution if recipient is provided
    const trimmedRecipient = (founderRewardRecipient ?? '').trim()
    if (trimmedRecipient) {
      const resolvedRewardRecipient = await getEnsAddress(trimmedRecipient)
      setFounderRewardRecipient(resolvedRewardRecipient)
    } else {
      setFounderRewardRecipient('')
    }
    setFounderRewardBps(
      Number.isFinite(Number(founderRewardBps)) ? Number(founderRewardBps) : 0
    )
    setReservedUntilTokenId(reservedUntilTokenId)

    setFulfilledSections(title)
    setActiveSection(activeSection + 1)
  }

  if (!address) return null

  return (
    <>
      <Formik<FounderAllocationFormValues>
        initialValues={{
          founderAllocation: initialFounderValues,
          founderRewardRecipient: founderRewardRecipient || '',
          founderRewardBps: founderRewardBps || 0,
          reservedUntilTokenId: reservedUntilTokenId ?? '0',
        }}
        enableReinitialize
        validateOnBlur={false}
        innerRef={formRef}
        validateOnMount={true}
        validateOnChange={true}
        validationSchema={validationSchemaAllocations(address)}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form>
            <FounderRewardsFields
              founderRewardRecipient={formik.values.founderRewardRecipient}
              founderRewardBps={formik.values.founderRewardBps}
              setFounderRewardRecipient={(value) =>
                formik.setFieldValue('founderRewardRecipient', (value ?? '').trim())
              }
              setFounderRewardBps={(value) =>
                formik.setFieldValue(
                  'founderRewardBps',
                  Number.isFinite(Number(value)) ? Number(value) : 0
                )
              }
              recipientErrorMessage={formik.errors.founderRewardRecipient}
              clearRewardError={() =>
                formik.setFieldError('founderRewardRecipient', undefined)
              }
            />

            <FieldArray name="founderAllocation">
              {({ remove, push }) => (
                <FounderAllocationFields
                  formik={formik}
                  auctionDuration={auctionDuration!}
                  vetoPower={vetoPower}
                  vetoerAddress={vetoerAddress}
                  touched={formik.touched}
                  values={formik.values}
                  errors={formik.errors}
                  removeFounderAddress={remove}
                  addFounderAddress={() =>
                    push({ founderAddress: '', allocation: '', endDate: '' })
                  }
                />
              )}
            </FieldArray>
            {!isVersionLoading && version?.startsWith('2') && (
              <>
                <Flex w="100%" align={'center'} justify={'center'}>
                  <Button
                    align={'center'}
                    justify={'center'}
                    alignSelf={'center'}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={defaultFormAdvancedToggle}
                    gap={'x3'}
                    py={'x3'}
                    mt={'x8'}
                    mb={'x8'}
                  >
                    Advanced Settings
                    <Icon id={showAdvanced ? 'chevronUp' : 'chevronDown'} />
                  </Button>
                </Flex>
                <motion.div
                  className={defaultFormAdvancedWrapper}
                  variants={animation}
                  initial={'init'}
                  animate={showAdvanced ? 'open' : 'init'}
                >
                  <Heading size="xs">Reserve Tokens for Airdrops or Manual Mints</Heading>
                  <Paragraph color="text3" mb={'x6'}>
                    Token IDs below this number are reserved for DAO minting. Auctions
                    start at this ID. Cannot be lowered after minting begins.
                  </Paragraph>
                  <SmartInput
                    {...formik.getFieldProps('reservedUntilTokenId')}
                    inputLabel={'Reserve Tokens Until'}
                    type={FIELD_TYPES.NUMBER}
                    formik={formik}
                    id={'reservedUntilTokenId'}
                    onChange={({ target }: BaseSyntheticEvent) => {
                      formik.setFieldValue('reservedUntilTokenId', target.value)
                    }}
                    onBlur={formik.handleBlur}
                    errorMessage={
                      formik.touched['reservedUntilTokenId'] &&
                      formik.errors['reservedUntilTokenId']
                        ? formik.errors['reservedUntilTokenId']
                        : undefined
                    }
                  />
                </motion.div>
              </>
            )}
          </Form>
        )}
      </Formik>

      {chain.id === CHAIN_ID.ETHEREUM && <ContributionAllocation />}

      {allocationError && (
        <Flex mt={'x4'} color="negative">
          Oops, total allocation must be less than 100%. Please double check the total of
          the allocation shares.
        </Flex>
      )}

      <Flex justify={'space-between'} mt={'x8'}>
        <Button
          justify={'center'}
          align={'center'}
          h={'x15'}
          minH={'x15'}
          minW={'x15'}
          type="button"
          onClick={handlePrev}
          className={defaultBackButton}
          aria-label="Back"
        >
          <Icon id="arrowLeft" />
        </Button>
        <Button
          flex={1}
          width={'auto'}
          ml={'x2'}
          minH={'x15'}
          className={defaultFormButtonWithPrev}
          disabled={isVersionLoading}
          type="submit"
          onClick={() => formRef.current?.handleSubmit()}
        >
          Continue
        </Button>
      </Flex>
    </>
  )
}
