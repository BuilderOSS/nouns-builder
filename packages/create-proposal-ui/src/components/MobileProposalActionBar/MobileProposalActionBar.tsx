import { useProposalStore } from '@buildeross/stores'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Button, Icon, Text } from '@buildeross/zord'
import React, { useState } from 'react'

import { Queue } from '../Queue'
import { ResetConfirmationModal } from '../ResetConfirmationModal'
import {
  mobileActionPrimary,
  mobileProposalActionBar,
} from './MobileProposalActionBar.css'

type MobileProposalActionBarProps = {
  showBack?: boolean
  onBack?: () => void
  backDisabled?: boolean
  showQueue?: boolean
  showReset?: boolean
  onReset?: () => void
  showContinue?: boolean
  onContinue?: () => void
  continueDisabled?: boolean
  continueLoading?: boolean
  continueLabel?: string
}

export const MobileProposalActionBar: React.FC<MobileProposalActionBarProps> = ({
  showBack = true,
  onBack,
  backDisabled = false,
  showQueue = false,
  showReset = false,
  onReset,
  showContinue = true,
  onContinue,
  continueDisabled = false,
  continueLoading = false,
  continueLabel = 'Continue',
}) => {
  const transactions = useProposalStore((state) => state.transactions)
  const [queueModalOpen, setQueueModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)

  return (
    <>
      <div className={mobileProposalActionBar}>
        {showBack && onBack && (
          <Button
            variant="secondary"
            aria-label="Back"
            disabled={backDisabled}
            onClick={onBack}
          >
            <Icon id="arrowLeft" />
          </Button>
        )}

        {showQueue && transactions.length > 0 && (
          <Button
            variant="secondary"
            aria-label={`Open queue with ${transactions.length} transactions`}
            onClick={() => setQueueModalOpen(true)}
          >
            <Icon id="queue" />
            <Text ml={'x1'}>{transactions.length}</Text>
          </Button>
        )}

        {showReset && onReset && (
          <Button
            variant="secondary"
            aria-label="Reset proposal"
            onClick={() => setResetModalOpen(true)}
          >
            <Icon id="trash" />
          </Button>
        )}

        {showContinue && onContinue && (
          <Button
            className={mobileActionPrimary}
            disabled={continueDisabled}
            loading={continueLoading}
            onClick={onContinue}
          >
            {continueLabel}
          </Button>
        )}
      </div>

      <AnimatedModal close={() => setQueueModalOpen(false)} open={queueModalOpen}>
        <Queue setQueueModalOpen={setQueueModalOpen} />
      </AnimatedModal>

      {showReset && onReset && (
        <ResetConfirmationModal
          open={resetModalOpen}
          onConfirm={() => {
            onReset()
            setResetModalOpen(false)
          }}
          onCancel={() => setResetModalOpen(false)}
        />
      )}
    </>
  )
}
