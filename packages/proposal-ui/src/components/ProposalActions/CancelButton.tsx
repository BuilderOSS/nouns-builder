import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import React, { useState } from 'react'

import { GovernorContractButton } from '../GovernorContractButton'
import { proposalActionButtonVariants } from './ProposalActions.css'

interface CancelButtonProps {
  proposalId: string
  showCancel?: boolean
  showVeto?: boolean
}

export const CancelButton: React.FC<CancelButtonProps> = ({ proposalId }) => {
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [modalContent, setModalContent] = useState({ title: '', subtitle: '' })

  const onSuccessModalClose = () => {
    setShowSuccessModal(false)
    setModalContent({ title: '', subtitle: '' })
  }

  const onActionSuccess = (modalContent: { title: string; subtitle: string }) => {
    setModalContent(modalContent)
    setShowSuccessModal(true)
  }

  return (
    <>
      <GovernorContractButton
        functionName="cancel"
        args={[proposalId as `0x${string}`]}
        buttonText="Cancel Proposal"
        buttonClassName={proposalActionButtonVariants['cancel']}
        proposalId={proposalId}
        onSuccess={() =>
          onActionSuccess({
            title: 'Proposal Canceled',
            subtitle: 'You’ve successfully canceled this proposal',
          })
        }
      />

      <AnimatedModal size={'small'} open={showSuccessModal} close={onSuccessModalClose}>
        <SuccessModalContent
          success={true}
          title={modalContent.title}
          subtitle={modalContent.subtitle}
        />
      </AnimatedModal>
    </>
  )
}
