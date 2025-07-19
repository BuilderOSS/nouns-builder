import { auctionAbi } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { Box, Button, Paragraph } from '@buildeross/zord'
import { useState } from 'react'
import { encodeFunctionData } from 'viem'
import { useReadContract } from 'wagmi'

import { TransactionType } from 'src/modules/create-proposal/constants'
import { useProposalStore } from 'src/modules/create-proposal/stores'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'

export const ResumeAuctions = () => {
  const { auction } = useDaoStore((state) => state.addresses)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const chain = useChainStore((x) => x.chain)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: auction,
    chainId: chain.id,
    functionName: 'paused',
  })

  const handleResumeAuctionsTransaction = async () => {
    setIsSubmitting(true)
    try {
      const pause = {
        target: auction as AddressType,
        functionSignature: 'unpause()',
        calldata: encodeFunctionData({
          abi: auctionAbi,
          functionName: 'unpause',
        }),
        value: '',
      }

      addTransaction({
        type: TransactionType.RESUME_AUCTIONS,
        summary: 'Resume auctions',
        transactions: [pause],
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box w={'100%'}>
      {!paused ? (
        <Box mb={'x8'}>
          <Paragraph size="md" color="negative">
            It looks like auctions are already resumed for this DAO.
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
        onClick={handleResumeAuctionsTransaction}
        disabled={!paused || isSubmitting}
      >
        {isSubmitting ? 'Adding Transaction to Queue...' : 'Add Transaction to Queue'}
      </Button>
    </Box>
  )
}
