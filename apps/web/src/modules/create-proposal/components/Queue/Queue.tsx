import { AnimatedModal } from '@buildeross/ui'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { TransactionCard, useProposalStore } from 'src/modules/create-proposal'

import { TransactionType } from '../../constants'
import { ConfirmRemove } from './ConfirmRemove'

interface QueueProps {
  setQueueModalOpen: (value: boolean) => void
}

export const Queue: React.FC<QueueProps> = ({ setQueueModalOpen }) => {
  const transactions = useProposalStore((state) => state.transactions)
  const removeTransaction = useProposalStore((state) => state.removeTransaction)
  const removeAllTransactions = useProposalStore((state) => state.removeAllTransactions)

  const [openConfirm, setOpenConfirm] = React.useState<boolean>(false)
  const [removeIndex, setRemoveIndex] = React.useState<number | null>(null)

  const confirmRemoveTransaction = (index: number) => {
    setOpenConfirm(true)
    setRemoveIndex(index)
  }

  const handleRemoveTransaction = () => {
    if (removeIndex === null) return

    if (transactions.length >= 1) {
      removeTransaction(removeIndex)
    }
    setOpenConfirm(false)
  }

  const handleClearAll = () => {
    removeAllTransactions()
  }

  return (
    <Stack style={{ maxWidth: 500, borderRadius: 16 }}>
      <Flex justify={'space-between'}>
        <Text fontWeight={'label'} fontSize={20} style={{ lineHeight: '32px' }} mb={'x6'}>
          Review Queue
        </Text>
        <Box
          as="button"
          onClick={() => setQueueModalOpen(false)}
          backgroundColor="transparent"
          borderColor="transparent"
          cursor={'pointer'}
        >
          <Icon id="cross-16" />
        </Box>
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
        />
      </AnimatedModal>
    </Stack>
  )
}
