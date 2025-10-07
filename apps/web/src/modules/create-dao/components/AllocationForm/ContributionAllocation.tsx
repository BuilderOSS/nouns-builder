import {
  PUBLIC_BUILDER_ADDRESS,
  PUBLIC_NOUNS_ADDRESS,
} from '@buildeross/constants/addresses'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Button, Flex, Heading, Stack, Text } from '@buildeross/zord'
import React, { useState } from 'react'
import { useChainStore } from 'src/stores'

import { useFormStore } from '../../stores'
import { TokenAllocation } from '../AllocationForm'
import { Contribution } from './Contribution'
import {
  ContributionAllocationForm,
  ContributionAllocationFormValues,
} from './ContributionAllocationForm'
import { DaoCopyAddress } from './DaoCopyAddress'

export type ContributionChain = 1

export const ContributionAllocation = () => {
  const [open, setOpen] = useState(false)
  const contributionAllocation = useFormStore((state) => state.contributionAllocation)
  const setContributionAllocation = useFormStore(
    (state) => state.setContributionAllocation
  )
  const chain = useChainStore((x) => x.chain)
  const chainId = chain.id as ContributionChain

  const { displayName: builderDisplayName } = useEnsData(PUBLIC_BUILDER_ADDRESS[chainId])
  const { displayName: nounsDisplayName } = useEnsData(PUBLIC_NOUNS_ADDRESS[chainId])

  const builderAllocationValue = contributionAllocation.find(
    (allocation) => allocation.founderAddress === PUBLIC_BUILDER_ADDRESS[chainId]
  )
  const nounsAllocationValue = contributionAllocation.find(
    (allocation) => allocation.founderAddress === PUBLIC_NOUNS_ADDRESS[chainId]
  )

  const handleSubmit = async ({
    nounsAllocation,
    builderAllocation,
  }: ContributionAllocationFormValues) => {
    const contributionAllocation = [builderAllocation, nounsAllocation].filter(
      Boolean
    ) as TokenAllocation[]
    const contributionAllocationPromises = contributionAllocation.map((allocation) =>
      getEnsAddress(allocation.founderAddress)
    )

    const contributionAllocationAddresses = await Promise.all(
      contributionAllocationPromises
    )

    setContributionAllocation(
      contributionAllocation.map((allocation, idx) => ({
        ...allocation,
        founderAddress: contributionAllocationAddresses[idx],
      }))
    )
    setOpen(false)
  }

  return (
    <>
      <Stack>
        <Heading size="xs" mt={'x8'} mb={'x6'}>
          Contributions
        </Heading>

        <Flex
          direction={'column'}
          pt={'x4'}
          px={'x6'}
          borderWidth={'normal'}
          borderStyle={'solid'}
          borderColor={'border'}
          borderRadius={'curved'}
        >
          <Flex direction={'row'}>
            <Text fontWeight={'display'} style={{ width: '50%' }}>
              Address
            </Text>
            <Text fontWeight={'display'} style={{ width: '25%' }}>
              Percentage
            </Text>
            <Text fontWeight={'display'} style={{ width: '25%' }}>
              End date
            </Text>
          </Flex>
          {builderAllocationValue || nounsAllocationValue ? (
            <>
              {builderAllocationValue && (
                <Contribution
                  allocation={builderAllocationValue?.allocationPercentage}
                  endDate={builderAllocationValue?.endDate}
                  address={
                    <DaoCopyAddress
                      name="Builder"
                      image="/builder-avatar-circle.png"
                      ens={builderDisplayName}
                      address={PUBLIC_BUILDER_ADDRESS[chainId]}
                    />
                  }
                />
              )}

              {nounsAllocationValue && (
                <Contribution
                  allocation={nounsAllocationValue?.allocationPercentage}
                  endDate={nounsAllocationValue?.endDate}
                  address={
                    <DaoCopyAddress
                      name="Nouns"
                      image="/nouns-avatar-circle.png"
                      ens={nounsDisplayName}
                      address={PUBLIC_NOUNS_ADDRESS[chainId]}
                    />
                  }
                />
              )}
            </>
          ) : (
            <Text align={'center'} py={'x4'}>
              No Contributions
            </Text>
          )}
        </Flex>

        <Flex align={'center'} justify={'center'}>
          <Button
            borderRadius={'curved'}
            mt={'x4'}
            type="button"
            variant="ghost"
            onClick={() => setOpen(true)}
          >
            Change Contributions
          </Button>
        </Flex>
      </Stack>

      <AnimatedModal open={open} size={'auto'} close={() => setOpen(false)}>
        <ContributionAllocationForm
          initialValues={{
            builderAllocation: builderAllocationValue,
            nounsAllocation: nounsAllocationValue,
          }}
          handleSubmit={handleSubmit}
        />
      </AnimatedModal>
    </>
  )
}

export default ContributionAllocation
