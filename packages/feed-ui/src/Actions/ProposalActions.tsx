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
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { Button, Flex, Text } from '@buildeross/zord'
import React, { useMemo, useState } from 'react'
import { Hex, zeroHash } from 'viem'

import { PropdateModalWrapper } from '../Modals/PropdateModalWrapper'
import { VoteModalWrapper } from '../Modals/VoteModalWrapper'

interface ProposalActionsProps {
  chainId: CHAIN_ID
  proposalId: BytesType
  proposalNumber: string
  proposalTitle: string
  addresses: RequiredDaoContractAddresses
  isExecuted?: boolean
  updateItem?: ProposalUpdatePostedFeedItem
}

export const ProposalActions: React.FC<ProposalActionsProps> = ({
  chainId,
  addresses,
  proposalId,
  proposalNumber,
  proposalTitle,
  isExecuted,
  updateItem,
}) => {
  const { getProposalLink } = useLinks()
  const daoId = addresses.token

  const [showVoteModal, setShowVoteModal] = useState(false)
  const [showPropdateModal, setShowPropdateModal] = useState(false)

  const {
    isActive,
    isPending,
    isLoading: isLoadingState,
  } = useProposalState({
    chainId,
    governorAddress: addresses.governor as AddressType,
    proposalId,
  })

  const { parsedContent, isLoading: isLoadingContent } = usePropdateMessage(
    updateItem?.messageType,
    updateItem?.message
  )

  const isLoading = isLoadingState || isLoadingContent

  // Construct replyTo object from updateItem when responding
  const replyTo = useMemo<PropDateReplyTo | undefined>(() => {
    if (!updateItem) return undefined

    return {
      id: (updateItem.originalMessageId !== zeroHash
        ? updateItem.originalMessageId
        : updateItem.id) as Hex,
      creator: updateItem.actor as Hex,
      message: parsedContent || updateItem.message,
    }
  }, [updateItem, parsedContent])

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
        <LinkWrapper link={getProposalLink(chainId, daoId, proposalNumber, 'details')}>
          <Button size="sm" px="x3" variant="secondary">
            View Details
          </Button>
        </LinkWrapper>
      </Flex>
    )
  }

  const isUpdate = updateItem !== undefined

  return (
    <>
      <Flex gap="x2" align="center" wrap="wrap">
        {/* Active or pending proposals show vote option */}
        {(isActive || isPending) && (
          <Button
            size="sm"
            px="x3"
            variant="outline"
            onClick={() => setShowVoteModal(true)}
          >
            Vote
          </Button>
        )}
        <Button
          size="sm"
          px="x3"
          variant="outline"
          onClick={() => setShowPropdateModal(true)}
        >
          {isUpdate ? 'Respond' : 'Add Update'}
        </Button>

        <LinkWrapper
          link={getProposalLink(
            chainId,
            daoId,
            proposalNumber,
            isUpdate ? 'propdates' : 'details'
          )}
        >
          <Button size="sm" px="x3" variant="secondary">
            View Details
          </Button>
        </LinkWrapper>
      </Flex>

      {/* Vote Modal */}
      <VoteModalWrapper
        isOpen={showVoteModal}
        onClose={() => setShowVoteModal(false)}
        proposalId={proposalId}
        proposalNumber={proposalNumber}
        proposalTitle={proposalTitle}
        chainId={chainId}
        addresses={addresses}
      />

      {/* Propdate Modal */}
      <PropdateModalWrapper
        isOpen={showPropdateModal}
        onClose={() => setShowPropdateModal(false)}
        proposalId={proposalId}
        proposalNumber={proposalNumber}
        chainId={chainId}
        addresses={addresses}
        replyTo={replyTo}
      />
    </>
  )
}
