import SWR_KEYS from '@buildeross/constants/swrKeys'
import { useVotes } from '@buildeross/hooks'
import { useDaoMembership } from '@buildeross/hooks/useDaoMembership'
import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useDelegate } from '@buildeross/hooks/useDelegate'
import { getProposals, ProposalsResponse } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { AnimatedModal, Countdown, SuccessModalContent } from '@buildeross/ui'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Button, Flex, Text } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useRouter } from 'next/router'
import React from 'react'
import { ContractButton } from 'src/components/ContractButton'
import Pagination from 'src/components/Pagination'
import { usePagination } from 'src/hooks'
import { Upgrade, useProposalStore } from 'src/modules/create-proposal'
import { ProposalCard } from 'src/modules/proposal'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { sectionWrapperStyle } from 'src/styles/dao.css'
import {
  createProposalBtn,
  delegateBtn,
  selectDelegateBtn,
} from 'src/styles/Proposals.css'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import { CurrentDelegate } from './CurrentDelegate'
import { DelegateForm } from './DelegateForm'
import { MobileMenu } from './MobileMenu'

export const Activity: React.FC = () => {
  const addresses = useDaoStore((state) => state.addresses)
  const { createProposal } = useProposalStore()
  const { address } = useAccount()
  const { query, isReady, push } = useRouter()
  const { isMobile } = useLayoutStore()
  const { openConnectModal } = useConnectModal()
  const chain = useChainStore((x) => x.chain)
  const LIMIT = 20

  const { token } = addresses

  const { data, error } = useSWR<ProposalsResponse>(
    isReady ? [SWR_KEYS.PROPOSALS, chain.id, query.token, query.page] : null,
    ([_key, chainId, token, page]) =>
      getProposals(chainId as CHAIN_ID, token as string, LIMIT, Number(page))
  )

  const { handlePageBack, handlePageForward } = usePagination(data?.pageInfo?.hasNextPage)
  const { data: membership } = useDaoMembership({
    chainId: chain.id,
    collectionAddress: query?.token as AddressType,
    signerAddress: address,
  })

  const { isOwner, isDelegating, hasThreshold, proposalVotesRequired } = useVotes({
    chainId: chain.id,
    governorAddress: addresses?.governor,
    signerAddress: address,
    collectionAddress: query?.token as AddressType,
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
    push(`/dao/${query.network}/${query.token}/proposal/create`)
  }

  if (!data && !error) {
    return null
  }

  return (
    <>
      <Flex direction={'column'} className={sectionWrapperStyle['proposals']} mx={'auto'}>
        <Flex width={'100%'} justify={'space-between'} align={'center'}>
          <Text variant="heading-sm" style={{ fontWeight: 800 }}>
            Proposals
          </Text>

          <Flex justify={'center'} align={'center'}>
            {address && !isDelegating && !isOwner && !isMobile && (
              <Flex mr={'x4'} color={'tertiary'}>
                You have no votes.
              </Flex>
            )}
            {isDelegating && !isMobile && (
              <Flex mr={'x4'} color={'tertiary'}>
                Your votes are delegated.
              </Flex>
            )}
            {isOwner && !hasThreshold && !isMobile && (
              <Flex mr={'x4'} color={'tertiary'}>
                {Number(proposalVotesRequired)} votes required to propose.
              </Flex>
            )}
            {isOwner || isDelegating ? (
              <>
                {!isMobile ? (
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
                ) : (
                  <MobileMenu>
                    <ContractButton
                      className={selectDelegateBtn}
                      style={{ backgroundColor: '#FFF', color: '#000' }}
                      handleClick={view}
                    >
                      Delegate
                    </ContractButton>
                  </MobileMenu>
                )}
              </>
            ) : null}
            {!address ? (
              <Button
                className={createProposalBtn}
                onClick={openConnectModal}
                color={'tertiary'}
              >
                Create {!isMobile ? 'proposal' : null}
              </Button>
            ) : (
              <Button
                className={createProposalBtn}
                onClick={address ? handleProposalCreation : openConnectModal}
                disabled={isGovernanceDelayed ? true : address ? !hasThreshold : false}
                color={'tertiary'}
              >
                Create {!isMobile ? 'proposal' : null}
              </Button>
            )}
          </Flex>
        </Flex>
        {addresses && (
          <Upgrade
            collection={query.token as string}
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
          ) : data?.proposals?.length ? (
            data?.proposals?.map((proposal, index: number) => (
              <ProposalCard key={index} collection={token} {...proposal} />
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

          <Pagination
            onNext={handlePageForward}
            onPrev={handlePageBack}
            isLast={!data?.pageInfo?.hasNextPage}
            isFirst={!query.page}
          />
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
