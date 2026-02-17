import { Button, Flex } from '@buildeross/zord'
import React from 'react'

import {
  confirmButton,
  confirmRemoveHeadingStyle,
  confirmRemoveHelper,
  dismissButton,
} from './Queue.css'

interface ConfrimRemoveProps {
  handleRemoveTransaction: () => void
  setOpenConfirm: (boolean: boolean) => void
  isBulkRemove?: boolean
}

export const ConfirmRemove: React.FC<ConfrimRemoveProps> = ({
  handleRemoveTransaction,
  setOpenConfirm,
  isBulkRemove = false,
}) => {
  const heading = isBulkRemove ? 'Clear entire queue?' : 'Are you sure?'
  const helperText = isBulkRemove
    ? 'This will remove all transactions from your proposal.'
    : 'This will remove the transaction from your proposal.'

  return (
    <Flex direction={'column'} align={'center'} gap={'x2'}>
      <Flex className={confirmRemoveHeadingStyle}>{heading}</Flex>
      <Flex className={confirmRemoveHelper}>{helperText}</Flex>
      <Flex direction={'column'} align={'stretch'} w={'100%'}>
        <Button className={confirmButton} onClick={() => handleRemoveTransaction()}>
          Yes
        </Button>
        <Button className={dismissButton} onClick={() => setOpenConfirm(false)}>
          Dismiss
        </Button>
      </Flex>
    </Flex>
  )
}
