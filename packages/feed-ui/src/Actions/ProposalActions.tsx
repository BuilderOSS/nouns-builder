import { BASE_URL } from '@buildeross/constants/baseUrl'
import { usePropdateMessage } from '@buildeross/hooks/usePropdateMessage'
import { useProposalState } from '@buildeross/hooks/useProposalState'
import { PropDateReplyTo } from '@buildeross/proposal-ui'
import type {
  AddressType,
  BytesType,
  CHAIN_ID,
  ProposalUpdatePostedFeedItem,
  RequiredDaoContractAddresses,
} from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { ShareButton } from '@buildeross/ui/ShareButton'
import { Button, Flex, Text } from '@buildeross/zord'
import React, { useCallback, useMemo } from 'react'
import { Hex, zeroHash } from 'viem'

import type { OnOpenPropdateModal, OnOpenVoteModal } from '../types/modalStates'

interface ProposalActionsProps {
  chainId: CHAIN_ID
  proposalId: BytesType
  proposalNumber: string
  proposalTitle: string
  proposalTimeCreated: string
  addresses: RequiredDaoContractAddresses
  daoName: string
  daoImage: string
  isExecuted: boolean
  updateItem?: ProposalUpdatePostedFeedItem
  onOpenVoteModal: OnOpenVoteModal
  onOpenPropdateModal: OnOpenPropdateModal
}

export const ProposalActions: React.FC<ProposalActionsProps> = ({
  chainId,
  addresses,
  proposalId,
  proposalNumber,
  proposalTitle,
  proposalTimeCreated,
  daoName,
  daoImage,
  isExecuted,
  updateItem,
  onOpenVoteModal,
  onOpenPropdateModal,
}) => {
  const { getProposalLink } = useLinks()
  const daoId = addresses.token

  const { isActive, isLoading: isLoadingState } = useProposalState({
    chainId,
    governorAddress: addresses.governor as AddressType,
    proposalId,
  })

  const { parsedContent, isLoading: isLoadingContent } = usePropdateMessage(
    updateItem?.messageType,
    updateItem?.message
  )

  const isLoading = isLoadingState || Boolean(!!updateItem && isLoadingContent)

  // Construct replyTo object from updateItem when responding
  const replyTo = useMemo<PropDateReplyTo | undefined>(() => {
    if (!updateItem) return undefined

    return {
      id: (updateItem.originalMessageId !== zeroHash
        ? updateItem.originalMessageId
        : updateItem.id) as Hex,
      creator: updateItem.actor as Hex,
      message: parsedContent ?? updateItem.message,
    }
  }, [updateItem, parsedContent])

  const shareUrl = useMemo(() => {
    const link = getProposalLink(chainId, daoId, proposalNumber, 'details')
    return link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`
  }, [chainId, daoId, proposalNumber, getProposalLink])

  const handleOpenVote = useCallback(() => {
    onOpenVoteModal({
      proposalId,
      proposalTitle,
      proposalTimeCreated,
      chainId,
      addresses,
      daoName,
      daoImage,
    })
  }, [
    onOpenVoteModal,
    proposalId,
    proposalTitle,
    proposalTimeCreated,
    chainId,
    addresses,
    daoName,
    daoImage,
  ])

  const handleOpenPropdate = useCallback(() => {
    onOpenPropdateModal({
      proposalId,
      chainId,
      addresses,
      replyTo,
      proposalTitle,
      daoName,
      daoImage,
    })
  }, [
    onOpenPropdateModal,
    proposalId,
    chainId,
    addresses,
    replyTo,
    proposalTitle,
    daoName,
    daoImage,
  ])

  if (isLoading) {
    return (
      <Flex gap="x2" align="center">
        <Text fontSize="14" color="text3">
          Loading...
        </Text>
      </Flex>
    )
  }

  // Executed proposals just show view details
  if (isExecuted) {
    return (
      <Flex gap="x2" align="center" wrap="wrap">
        <LinkWrapper
          link={getProposalLink(chainId, daoId, proposalNumber, 'details')}
          isExternal
        >
          <Button size="sm" px="x3" variant="secondary">
            View Proposal
          </Button>
        </LinkWrapper>
        <ShareButton url={shareUrl} size="sm" variant="secondary" />
      </Flex>
    )
  }

  const isUpdate = updateItem !== undefined

  return (
    <Flex gap="x2" align="center" wrap="wrap">
      {/* Active proposals show vote option */}
      {isActive && (
        <ContractButton
          size="sm"
          px="x3"
          variant="outline"
          chainId={chainId}
          handleClick={handleOpenVote}
        >
          Vote
        </ContractButton>
      )}
      <ContractButton
        size="sm"
        px="x3"
        variant="outline"
        chainId={chainId}
        handleClick={handleOpenPropdate}
      >
        {isUpdate ? 'Respond' : 'Add Update'}
      </ContractButton>

      <LinkWrapper
        link={getProposalLink(
          chainId,
          daoId,
          proposalNumber,
          isUpdate ? 'propdates' : 'details'
        )}
        isExternal
      >
        <Button size="sm" px="x3" variant="secondary">
          {isUpdate ? 'View Updates' : 'View Proposal'}
        </Button>
      </LinkWrapper>
      <ShareButton url={shareUrl} size="sm" variant="secondary" />
    </Flex>
  )
}
