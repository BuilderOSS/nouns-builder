import { useProposalStore } from '@buildeross/stores'
import { TransactionType } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { TransactionCard } from '../TransactionCard'
import { ConfirmRemove } from './ConfirmRemove'

interface QueueProps {
  setQueueModalOpen?: (value: boolean) => void
  embedded?: boolean
}

export const Queue: React.FC<QueueProps> = ({ setQueueModalOpen, embedded = false }) => {
  const transactions = useProposalStore((state) => state.transactions)
  const removeTransaction = useProposalStore((state) => state.removeTransaction)
  const removeAllTransactions = useProposalStore((state) => state.removeAllTransactions)

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
    <Stack style={{ maxWidth: 500, borderRadius: 16 }}>
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
        {transactions
          ? transactions.map((transaction, i) => (
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
          : null}
      </Stack>
      <Stack
        borderWidth={'thin'}
        borderStyle={'solid'}
        borderColor={'ghostHover'}
        mt={'x6'}
        mb={'x8'}
      />
      <Button variant="outline" onClick={handleClearAll}>
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
