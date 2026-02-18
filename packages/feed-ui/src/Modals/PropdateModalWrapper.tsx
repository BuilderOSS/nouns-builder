import { PropDateForm, type PropDateReplyTo } from '@buildeross/proposal-ui'
import type { BytesType, CHAIN_ID, RequiredDaoContractAddresses } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Box } from '@buildeross/zord'
import React from 'react'

import { ModalHeader } from './ModalHeader'

export interface PropdateModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  proposalId: BytesType
  chainId: CHAIN_ID
  addresses: RequiredDaoContractAddresses
  replyTo?: PropDateReplyTo
  proposalTitle: string
  daoName: string
  daoImage: string
}

export const PropdateModalWrapper: React.FC<PropdateModalWrapperProps> = ({
  isOpen,
  onClose,
  proposalId,
  chainId,
  addresses,
  replyTo,
  proposalTitle,
  daoName,
  daoImage,
}) => {
  return (
    <AnimatedModal key="feed-propdate-modal" open={isOpen} close={onClose} size="medium">
      <Box w="100%">
        <ModalHeader
          daoName={daoName}
          daoImage={daoImage}
          title={replyTo ? 'Respond to Update' : 'Add Proposal Update'}
          subtitle={proposalTitle}
          onClose={onClose}
        />
        <PropDateForm
          proposalId={proposalId}
          chainId={chainId}
          addresses={addresses}
          replyTo={replyTo}
          closeForm={onClose}
          onSuccess={onClose}
          insideModal
          hideHeader
        />
      </Box>
    </AnimatedModal>
  )
}
