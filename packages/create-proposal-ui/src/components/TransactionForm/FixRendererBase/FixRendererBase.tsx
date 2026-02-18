import { useRendererBaseFix } from '@buildeross/hooks/useRendererBaseFix'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { Box, Button, Paragraph } from '@buildeross/zord'

import { type FormComponent } from '../types'

export const FixRendererBase: FormComponent = ({ resetTransactionType }) => {
  const addresses = useDaoStore((state) => state.addresses)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const chain = useChainStore((x) => x.chain)

  const { shouldFix, transaction } = useRendererBaseFix({
    chainId: chain.id,
    addresses,
  })

  return (
    <Box w={'100%'}>
      {!shouldFix ? (
        <Box mb={'x8'}>
          <Paragraph size="md" color="negative">
            It looks like metadata renderer base is already set correctly for this DAO.
          </Paragraph>
        </Box>
      ) : (
        <Box mb={'x8'}>
          <Paragraph size="md" color="text1">
            No further input required for this transaction.
          </Paragraph>
        </Box>
      )}
      <Button
        variant={'outline'}
        borderRadius={'curved'}
        w={'100%'}
        type="button"
        onClick={() => {
          if (transaction) {
            addTransaction(transaction)
            resetTransactionType()
          }
        }}
        disabled={!shouldFix}
      >
        Add Transaction to Queue
      </Button>
    </Box>
  )
}
