import { TransactionType } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { useTransactionComposer } from '../shared'
import { TransactionCard } from '../TransactionCard'
import { ConfirmRemove } from './ConfirmRemove'
import { queueInfoBox, queueInfoIcon, queueInfoText } from './Queue.css'

interface QueueProps {
  setQueueModalOpen?: (value: boolean) => void
  embedded?: boolean
}

export const Queue: React.FC<QueueProps> = ({ setQueueModalOpen, embedded = false }) => {
  const { transactions, removeTransaction, removeAllTransactions } =
    useTransactionComposer()

  const [openConfirm, setOpenConfirm] = React.useState<boolean>(false)
  const [removeIndex, setRemoveIndex] = React.useState<number | null>(null)
  const [isBulkRemove, setIsBulkRemove] = React.useState<boolean>(false)

  const confirmRemoveTransaction = (index: number) => {
    setRemoveIndex(index)
    setIsBulkRemove(false)
    setOpenConfirm(true)
  }

  const handleRemoveTransaction = () => {
    if (isBulkRemove) {
      removeAllTransactions()
      setOpenConfirm(false)
      setQueueModalOpen?.(false)
    } else {
      if (removeIndex === null) return

      if (transactions.length >= 1) {
        removeTransaction(removeIndex)
        // Close queue modal if no transactions left
        if (transactions.length === 1) {
          setOpenConfirm(false)
          setQueueModalOpen?.(false)
          return
        }
      }
      setOpenConfirm(false)
    }
  }

  const handleClearAll = () => {
    setRemoveIndex(null)
    setIsBulkRemove(true)
    setOpenConfirm(true)
  }

  return (
    <Stack style={{ borderRadius: 16 }}>
      <Flex justify={'space-between'} mb={embedded ? 'x5' : 'x6'}>
        <Text
          variant={embedded ? 'heading-xs' : undefined}
          fontWeight={embedded ? undefined : 'label'}
          fontSize={embedded ? undefined : 20}
        >
          Review Transaction Queue
        </Text>
        {!embedded && (
          <Box
            as="button"
            onClick={() => setQueueModalOpen?.(false)}
            backgroundColor="transparent"
            borderColor="transparent"
            cursor={'pointer'}
          >
            <Icon id="cross-16" />
          </Box>
        )}
      </Flex>

      <Stack gap={'x4'}>
        {transactions?.length > 0 ? (
          transactions.map((transaction, i) => (
            <TransactionCard
              key={`${transaction.type}-${i}`}
              handleRemove={() => confirmRemoveTransaction(i)}
              disabled={
                transaction.type === TransactionType.UPGRADE ||
                transaction.type === TransactionType.UPDATE_MINTER
              }
              transaction={transaction}
            />
          ))
        ) : (
          <Text size="sm" color="text3">
            No transactions in queue
          </Text>
        )}
      </Stack>
      <Stack
        borderWidth={'thin'}
        borderStyle={'solid'}
        borderColor={'ghostHover'}
        mt={'x6'}
        mb={'x8'}
      />
      {transactions.length > 0 && (
        <Flex className={queueInfoBox} align="center" gap="x2">
          <Icon id="question" size="sm" fill="text3" className={queueInfoIcon} />
          <Text color="text3" className={queueInfoText}>
            Queued transactions can&apos;t be edited. Remove one and add a replacement
            instead.
          </Text>
        </Flex>
      )}
      <Button
        variant="outline"
        onClick={handleClearAll}
        disabled={transactions.length === 0}
      >
        Clear queue
      </Button>
      <AnimatedModal close={() => setOpenConfirm(false)} open={openConfirm}>
        <ConfirmRemove
          handleRemoveTransaction={handleRemoveTransaction}
          setOpenConfirm={setOpenConfirm}
          isBulkRemove={isBulkRemove}
        />
      </AnimatedModal>
    </Stack>
  )
}
