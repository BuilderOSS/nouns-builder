import { VoteModal } from '@buildeross/proposal-ui'
import type { BytesType, CHAIN_ID, RequiredDaoContractAddresses } from '@buildeross/types'
import React from 'react'

export interface VoteModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  proposalId: BytesType
  proposalNumber: string
  proposalTitle: string
  chainId: CHAIN_ID
  addresses: RequiredDaoContractAddresses
  votesAvailable: number
}

export const VoteModalWrapper: React.FC<VoteModalWrapperProps> = ({
  isOpen,
  onClose,
  proposalId,
  proposalTitle,
  chainId,
  addresses,
  votesAvailable,
}) => {
  return (
    <VoteModal
      title={proposalTitle}
      proposalId={proposalId}
      votesAvailable={votesAvailable}
      showVoteModal={isOpen}
      setShowVoteModal={onClose}
      addresses={addresses}
      chainId={chainId}
      onSuccess={onClose}
    />
  )
}
