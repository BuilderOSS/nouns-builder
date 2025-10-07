import { CHAIN_ID } from '@buildeross/types'
import { defaultBackButton, defaultFormButtonWithPrev } from '@buildeross/ui/styles'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Button, Flex, Icon } from '@buildeross/zord'
import { FieldArray, Form, Formik, FormikProps } from 'formik'
import sum from 'lodash/sum'
import React, { useRef, useState } from 'react'
import { useChainStore } from 'src/stores'
import { useAccount } from 'wagmi'
import { useShallow } from 'zustand/shallow'

import { useFormStore } from '../../stores'
import { validationSchemaFounderAllocation } from './AllocationForm.schema'
import { ContributionAllocation } from './ContributionAllocation'
import { FounderAllocationFields } from './FounderAllocationFields'

interface AllocationFormProps {
  title: string
}

export interface TokenAllocation {
  allocationPercentage: number | string
  founderAddress: string
  endDate: string
  admin?: boolean
}

export interface FounderAllocationFormValues {
  founderAllocation: TokenAllocation[]
}

export const AllocationForm: React.FC<AllocationFormProps> = ({ title }) => {
  const formRef = useRef<FormikProps<FounderAllocationFormValues>>(null)
  const [allocationError, setAllocationError] = useState(false)
  const chain = useChainStore((x) => x.chain)
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

  const handleSubmit = async ({ founderAllocation }: FounderAllocationFormValues) => {
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

    setFulfilledSections(title)
    setActiveSection(activeSection + 1)
  }

  if (!address) return null

  return (
    <>
      <Formik<FounderAllocationFormValues>
        initialValues={{ founderAllocation: initialFounderValues }}
        enableReinitialize
        validateOnBlur={false}
        innerRef={formRef}
        validateOnMount={true}
        validateOnChange={true}
        validationSchema={validationSchemaFounderAllocation(address)}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form>
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
          type="submit"
          onClick={() => formRef.current?.handleSubmit()}
        >
          Continue
        </Button>
      </Flex>
    </>
  )
}
