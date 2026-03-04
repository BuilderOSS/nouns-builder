import { AnimatedModal } from '@buildeross/ui/Modal'
import { Button, Flex } from '@buildeross/zord'
import React from 'react'

type ResetConfirmationModalProps = {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
}

export const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({
  open,
  onConfirm,
  onCancel,
  title = 'Reset proposal?',
  description = 'This will clear your title, summary, and queued transactions.',
  confirmLabel = 'Reset',
  cancelLabel = 'Cancel',
}) => {
  return (
    <AnimatedModal close={onCancel} open={open}>
      <Flex direction={'column'} align={'center'} gap={'x2'} w={'100%'}>
        <Flex fontSize={28} fontWeight={'display'} mb="x2">
          {title}
        </Flex>
        <Flex color={'text3'} mb="x2">
          {description}
        </Flex>
        <Flex direction={'column'} align={'stretch'} w={'100%'}>
          <Button onClick={onConfirm} mb="x2">
            {confirmLabel}
          </Button>
          <Button variant={'secondary'} onClick={onCancel}>
            {cancelLabel}
          </Button>
        </Flex>
      </Flex>
    </AnimatedModal>
  )
}
