import React from 'react'
import Form from 'src/components/Fields/Form'
import { founderFields, validateFounder } from 'src/components/Fields/fields/founder'
import { useLayoutStore } from 'src/stores'
import { useFormStore } from 'src/stores/useFormStore'
import { CreateLayout } from 'src/modules/create/layouts'
import { allocationProps } from 'src/typings'
import { useRouter } from 'next/router'
import { shallow } from 'zustand/shallow'
import { getEnsAddress } from 'src/utils/ens'

interface allocationFormProps {
  founderAllocation: allocationProps[]
  contributionAllocation: allocationProps[]
}

interface AllocationFormValues {
  founderAllocation: allocationProps[]
  contributionAllocation: allocationProps[]
}

const Allocation = () => {
  const router = useRouter()
  const {
    founderAllocation,
    setFounderAllocation,
    contributionAllocation,
    setContributionAllocation,
  } = useFormStore(
    (state) => ({
      founderAllocation: state.founderAllocation,
      setFounderAllocation: state.setFounderAllocation,
      contributionAllocation: state.contributionAllocation,
      setContributionAllocation: state.setContributionAllocation,
    }),
    shallow
  )

  const { signerAddress, provider } = useLayoutStore(
    (state) => ({
      signerAddress: state.signerAddress,
      provider: state.provider,
    }),
    shallow
  )

  const initialValues: allocationFormProps = {
    founderAllocation: founderAllocation || [],
    contributionAllocation: contributionAllocation || [],
  }

  const handlePrev = () => {
    router.push({
      pathname: '/create/veto',
    })
  }

  const handleSubmitCallback = async ({
    founderAllocation,
    contributionAllocation,
  }: AllocationFormValues) => {
    const foundAllocationPromises = founderAllocation.map((allocation) =>
      getEnsAddress(allocation.founderAddress)
    )

    const contributionAllocationPromises = contributionAllocation.map((allocation) =>
      getEnsAddress(allocation.founderAddress)
    )

    const founderAllocationAddresses = await Promise.all(foundAllocationPromises)

    const contributionAllocationAddresses = await Promise.all(
      contributionAllocationPromises
    )

    setFounderAllocation(
      founderAllocation.map((allocation, idx) => ({
        ...allocation,
        founderAddress: founderAllocationAddresses[idx],
      }))
    )

    setContributionAllocation(
      contributionAllocation.map((allocation, idx) => ({
        ...allocation,
        founderAddress: contributionAllocationAddresses[idx],
      }))
    )

    router.push({
      pathname: '/create/artwork',
    })
  }

  return (
    <CreateLayout title={'Allocation'}>
      <Form
        fields={founderFields}
        initialValues={initialValues}
        validationSchema={
          signerAddress ? validateFounder(signerAddress, provider) : undefined
        }
        buttonText={'Continue'}
        submitCallback={handleSubmitCallback}
        handlePrev={handlePrev}
      />
    </CreateLayout>
  )
}

export default Allocation
