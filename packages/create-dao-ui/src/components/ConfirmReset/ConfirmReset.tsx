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
}

export const ConfirmReset: React.FC<ConfirmResetProps> = ({ handleReset, onDismiss }) => {
  return (
    <Flex direction={'column'} w={'100%'} gap={'x2'}>
      <Flex align="center" justify="space-between" w={'100%'}>
        <Flex className={confirmResetHeadingStyle}>Reset form?</Flex>
        <Button
          variant={'ghost'}
          onClick={onDismiss}
          aria-label="Close"
          className={confirmResetCloseButton}
        >
          <Icon id="cross" />
        </Button>
      </Flex>
      <Flex className={confirmResetHelperStyle}>
        This will clear all your DAO settings and start over.
      </Flex>
      <Flex direction={'column'} align={'stretch'} w={'100%'} mt={'x2'}>
        <Button className={confirmResetButton} onClick={handleReset}>
          Reset
        </Button>
        <Button className={dismissResetButton} onClick={onDismiss}>
          Cancel
        </Button>
      </Flex>
    </Flex>
  )
}
