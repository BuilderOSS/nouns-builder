import { PropDateForm, type PropDateReplyTo } from '@buildeross/proposal-ui'
import type { BytesType, CHAIN_ID, RequiredDaoContractAddresses } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui/Modal'
import React from 'react'

export interface PropdateModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  proposalId: BytesType
  proposalNumber: string
  chainId: CHAIN_ID
  addresses: RequiredDaoContractAddresses
  replyTo?: PropDateReplyTo
}

export const PropdateModalWrapper: React.FC<PropdateModalWrapperProps> = ({
  isOpen,
  onClose,
  proposalId,
  chainId,
  addresses,
  replyTo,
}) => {
  return (
    <AnimatedModal open={isOpen} close={onClose} size="large">
      <PropDateForm
        proposalId={proposalId as string}
        chainId={chainId}
        addresses={addresses}
        replyTo={replyTo}
        closeForm={onClose}
        onSuccess={onClose}
        insideModal
      />
    </AnimatedModal>
  )
}
