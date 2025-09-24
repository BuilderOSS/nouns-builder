import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { Box } from '@buildeross/zord'
import React, { useState } from 'react'
import {
  cancelButtonBorder,
  proposalActionButtonVariants,
} from 'src/styles/Proposals.css'
import { Address } from 'viem'

import { GovernorContractButton } from '../GovernorContractButton'

interface CancelButtonProps {
  proposalId: string
  showCancel?: boolean
  showVeto?: boolean
}

const Cancel: React.FC<{
  proposalId: string
  onSuccess: () => void
}> = (props) => {
  return (
    <GovernorContractButton
      functionName="cancel"
      args={[props.proposalId as Address]}
      buttonText="Cancel Proposal"
      buttonClassName={proposalActionButtonVariants['cancel']}
      w={'100%'}
      {...props}
    />
  )
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
      <Box
        w={{ '@initial': '100%', '@768': 'auto' }}
        pt={{ '@initial': 'x3', '@768': 'x0' }}
        className={cancelButtonBorder}
      >
        <Cancel
          proposalId={proposalId}
          onSuccess={() =>
            onActionSuccess({
              title: 'Proposal Canceled',
              subtitle: 'You’ve successfully canceled this proposal',
            })
          }
        />
      </Box>

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
