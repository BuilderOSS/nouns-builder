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
}

export const ConfirmRemove: React.FC<ConfrimRemoveProps> = ({
  handleRemoveTransaction,
  setOpenConfirm,
}) => {
  return (
    <Flex direction={'column'} align={'center'}>
      <Flex className={confirmRemoveHeadingStyle}>Are you sure?</Flex>
      <Flex className={confirmRemoveHelper}>
        This will remove the transaction from your proposal.
      </Flex>
      <Button className={confirmButton} onClick={() => handleRemoveTransaction()}>
        Yes
      </Button>
      <Button className={dismissButton} onClick={() => setOpenConfirm(false)}>
        Dismiss
      </Button>
    </Flex>
  )
}
