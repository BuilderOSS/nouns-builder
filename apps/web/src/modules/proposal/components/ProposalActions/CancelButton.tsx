import { Box } from '@zoralabs/zord'
import React, { useState } from 'react'
import { Address } from 'viem'

import AnimatedModal from 'src/components/Modal/AnimatedModal'
import { SuccessModalContent } from 'src/components/Modal/SuccessModalContent'
import { useLayoutStore } from 'src/stores'
import { proposalActionButtonVariants } from 'src/styles/Proposals.css'

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
  const isMobile = useLayoutStore((state) => state.isMobile)

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
        style={{
          borderTop: isMobile ? '2px solid #F2F2F2' : 'none',
        }}
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
