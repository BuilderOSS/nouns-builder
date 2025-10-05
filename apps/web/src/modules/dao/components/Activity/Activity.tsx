import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { useDaoMembership } from '@buildeross/hooks/useDaoMembership'
import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useDelegate } from '@buildeross/hooks/useDelegate'
import { useVotes } from '@buildeross/hooks/useVotes'
import { getProposals, ProposalsResponse } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Countdown } from '@buildeross/ui/Countdown'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useRouter } from 'next/router'
import React from 'react'
import { ContractButton } from 'src/components/ContractButton'
import Pagination from 'src/components/Pagination'
import { Upgrade, useProposalStore } from 'src/modules/create-proposal'
import { ProposalCard } from 'src/modules/proposal'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { skeletonAnimation } from 'src/styles/animations.css'
import { sectionWrapperStyle } from 'src/styles/dao.css'
import { createProposalBtn, delegateBtn } from 'src/styles/Proposals.css'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import { CurrentDelegate } from './CurrentDelegate'
import { DelegateForm } from './DelegateForm'

export const Activity: React.FC = () => {
  const addresses = useDaoStore((state) => state.addresses)
  const { createProposal } = useProposalStore()
  const { address } = useAccount()
  const { query, isReady, push } = useRouter()
  const { openConnectModal } = useConnectModal()
  const chain = useChainStore((x) => x.chain)
  const LIMIT = 20

  const { data, error, isLoading } = useSWR<ProposalsResponse>(
    isReady && addresses?.token
      ? ([SWR_KEYS.PROPOSALS, chain.id, addresses?.token, query.page] as const)
      : null,
    ([_key, _chainId, _token, _page]) =>
      getProposals(_chainId as CHAIN_ID, _token as string, LIMIT, Number(_page))
  )

  const { data: membership } = useDaoMembership({
    chainId: chain.id,
    collectionAddress: addresses?.token as AddressType,
    signerAddress: address,
  })

  const { isOwner, isDelegating, hasThreshold, proposalVotesRequired } = useVotes({
    chainId: chain.id,
    governorAddress: addresses?.governor,
    signerAddress: address,
    collectionAddress: addresses?.token as AddressType,
  })

  const { isGovernanceDelayed, delayedUntilTimestamp } = useDelayedGovernance({
    tokenAddress: addresses?.token,
    governorAddress: addresses?.governor,
    chainId: chain.id,
  })

  const [
    { viewCurrentDelegate, viewDelegateForm, viewSuccessfulDelegate, newDelegate },
    { view, edit, update, close },
  ] = useDelegate({
    viewCurrentDelegate: false,
    viewDelegateForm: false,
    viewSuccessfulDelegate: false,
  })

  const handleProposalCreation = () => {
    createProposal({
      title: undefined,
      summary: undefined,
      disabled: false,
      transactions: [],
    })
    push(`/dao/${query.network}/${addresses?.token}/proposal/create`)
  }

  if (!data && !error && !isLoading) {
    return null
  }

  if (error) {
    return (
      <Flex direction={'column'} className={sectionWrapperStyle['proposals']} mx={'auto'}>
        <Flex width={'100%'} justify={'space-between'} align={'center'}>
          <Text variant="heading-sm" style={{ fontWeight: 800 }}>
            Proposals
          </Text>
        </Flex>
        <Flex
          width={'100%'}
          mt={'x4'}
          p={'x4'}
          justify={'center'}
          borderColor={'border'}
          borderStyle={'solid'}
          borderRadius={'curved'}
          borderWidth={'normal'}
        >
          <Text color="negative">Failed to load proposals. Please try again.</Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <>
      <Flex direction={'column'} className={sectionWrapperStyle['proposals']} mx={'auto'}>
        <Flex width={'100%'} justify={'space-between'} align={'center'}>
          <Text variant="heading-sm" style={{ fontWeight: 800 }}>
            Proposals
          </Text>

          <Flex
            justify={'center'}
            align={'center'}
            display={{ '@initial': 'none', '@768': 'flex' }}
          >
            {address && !isDelegating && !isOwner && (
              <Flex mr={'x4'} color={'tertiary'}>
                You have no votes.
              </Flex>
            )}
            {isDelegating && (
              <Flex mr={'x4'} color={'tertiary'}>
                Your votes are delegated.
              </Flex>
            )}
            {isOwner && !hasThreshold && (
              <Flex mr={'x4'} color={'tertiary'}>
                {Number(proposalVotesRequired)} votes required to propose.
              </Flex>
            )}
            {(isOwner || isDelegating) && (
              <ContractButton
                className={delegateBtn}
                borderColor="border"
                borderStyle="solid"
                borderWidth="normal"
                handleClick={view}
                mr="x2"
              >
                Delegate
              </ContractButton>
            )}
            <Button
              className={createProposalBtn}
              onClick={address ? handleProposalCreation : openConnectModal}
              disabled={isGovernanceDelayed ? true : address ? !hasThreshold : false}
              color={'tertiary'}
            >
              Create proposal
            </Button>
          </Flex>
          <Flex
            justify={'center'}
            align={'center'}
            display={{ '@initial': 'flex', '@768': 'none' }}
          >
            {(isOwner || isDelegating) && (
              <ContractButton
                className={delegateBtn}
                borderColor="border"
                borderStyle="solid"
                borderWidth="normal"
                handleClick={view}
                mr="x2"
              >
                Delegate
              </ContractButton>
            )}
            <Button
              className={createProposalBtn}
              onClick={address ? handleProposalCreation : openConnectModal}
              disabled={isGovernanceDelayed ? true : address ? !hasThreshold : false}
              color={'tertiary'}
            >
              Create
            </Button>
          </Flex>
        </Flex>
        {addresses && (
          <Upgrade
            collection={addresses?.token as string}
            hasThreshold={hasThreshold}
            addresses={addresses}
          />
        )}
        <Flex direction={'column'} mt={'x6'}>
          {isGovernanceDelayed ? (
            <Flex
              width={'100%'}
              mt={'x4'}
              p={'x4'}
              justify={'center'}
              align={'center'}
              borderColor={'border'}
              borderStyle={'solid'}
              borderRadius={'curved'}
              borderWidth={'normal'}
            >
              <Flex textAlign={'center'} align={'center'}>
                <Text
                  color={'text3'}
                  variant={'paragraph-md'}
                  ml={{ '@initial': 'x0', '@768': 'x3' }}
                >
                  Time remaining before proposals can be submitted:
                </Text>
              </Flex>
              <Flex
                w={{ '@initial': '100%', '@768': 'auto' }}
                justify={'center'}
                align={'center'}
                px={'x2'}
                py={'x4'}
              >
                <Text
                  fontWeight={'display'}
                  ml="x1"
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    fontFeatureSettings: 'tnum',
                  }}
                >
                  <Countdown
                    end={Number(delayedUntilTimestamp)}
                    onEnd={() => {}}
                    style={{ fontWeight: 'bold' }}
                  />
                </Text>
              </Flex>
            </Flex>
          ) : isLoading && !data?.proposals?.length ? (
            <Flex direction="column" gap="x4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Box
                  key={index}
                  width="100%"
                  height="x16"
                  borderRadius="curved"
                  backgroundColor="background2"
                  style={{ animation: skeletonAnimation }}
                />
              ))}
            </Flex>
          ) : data?.proposals?.length ? (
            data?.proposals?.map((proposal, index: number) => (
              <ProposalCard key={index} collection={addresses?.token} {...proposal} />
            ))
          ) : (
            <Flex
              width={'100%'}
              mt={'x4'}
              p={'x4'}
              justify={'center'}
              borderColor={'border'}
              borderStyle={'solid'}
              borderRadius={'curved'}
              borderWidth={'normal'}
            >
              <Text>No proposals yet.</Text>
            </Flex>
          )}

          {!isLoading && <Pagination hasNextPage={data?.pageInfo?.hasNextPage} />}
        </Flex>
      </Flex>

      {!!membership && (
        <AnimatedModal open={viewCurrentDelegate} size={'auto'} close={close}>
          <CurrentDelegate toggleIsEditing={edit} membership={membership} />
        </AnimatedModal>
      )}

      <AnimatedModal open={viewDelegateForm} size={'auto'} close={close}>
        <DelegateForm handleBack={view} handleUpdate={update} />
      </AnimatedModal>

      <AnimatedModal open={viewSuccessfulDelegate} close={close}>
        <SuccessModalContent
          success
          title="Delegate updated"
          subtitle="Your votes have been successfully delegated to"
          content={walletSnippet(newDelegate)}
        />
      </AnimatedModal>
    </>
  )
}
