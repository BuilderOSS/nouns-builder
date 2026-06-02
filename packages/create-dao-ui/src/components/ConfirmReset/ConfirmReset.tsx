import { Button, Flex, Icon } from '@buildeross/zord'
import React from 'react'

import {
  confirmResetButton,
  confirmResetCloseButton,
  confirmResetHeadingStyle,
  confirmResetHelperStyle,
  dismissResetButton,
} from './ConfirmReset.css'

interface ConfirmResetProps {
  handleReset: () => void
  onDismiss: () => void
  heading?: string
  helperText?: string
  confirmLabel?: string
}

export const ConfirmReset: React.FC<ConfirmResetProps> = ({
  handleReset,
  onDismiss,
  heading = 'Reset all DAO setup?',
  helperText = 'This will clear all saved settings across every step, including artwork, auction settings, rewards, and allocations. This cannot be undone.',
  confirmLabel = 'Reset all setup',
}) => {
  return (
    <Flex direction={'column'} w={'100%'} gap={'x2'}>
      <Flex align="center" justify="space-between" w={'100%'}>
        <Flex className={confirmResetHeadingStyle}>{heading}</Flex>
        <Button
          variant={'ghost'}
          onClick={onDismiss}
          aria-label="Close"
          className={confirmResetCloseButton}
        >
          <Icon id="cross" />
        </Button>
      </Flex>
      <Flex className={confirmResetHelperStyle}>{helperText}</Flex>
      <Flex direction={'column'} align={'stretch'} w={'100%'} mt={'x2'}>
        <Button className={confirmResetButton} onClick={handleReset}>
          {confirmLabel}
        </Button>
        <Button className={dismissResetButton} onClick={onDismiss}>
          Cancel
        </Button>
      </Flex>
    </Flex>
  )
}
