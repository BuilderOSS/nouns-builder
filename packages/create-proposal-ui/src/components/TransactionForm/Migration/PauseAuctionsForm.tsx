import { auctionAbi, governorAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType, TransactionType } from '@buildeross/types'
import { defaultHelperTextStyle } from '@buildeross/ui/styles'
import { toSeconds } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Icon, Paragraph, Text } from '@buildeross/zord'
import { useState } from 'react'
import { encodeFunctionData } from 'viem'
import { useReadContract } from 'wagmi'

import { checkboxStyleVariants } from '../ReplaceArtwork/ReplaceArtworkForm.css'

export const PauseAuctionsForm = () => {
  const { auction, governor } = useDaoStore((state) => state.addresses)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const chain = useChainStore((x) => x.chain)
  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: auction,
    chainId: chain.id,
    functionName: 'paused',
  })

  const [reduceDelay, setReduceDelay] = useState<boolean>(false)

  const handlePauseAuctionsTransaction = () => {
    const pause = {
      target: auction as AddressType,
      functionSignature: 'pause()',
      calldata: encodeFunctionData({
        abi: auctionAbi,
        functionName: 'pause',
      }),
      value: '',
    }

    addTransaction({
      type: TransactionType.PAUSE_AUCTIONS,
      summary: 'Pause auctions',
      transactions: [pause],
    })

    const votingPeriod = {
      target: governor as AddressType,
      functionSignature: 'updateVotingPeriod',
      calldata: encodeFunctionData({
        abi: governorAbi,
        functionName: 'updateVotingPeriod',
        args: [BigInt(toSeconds({ days: 2 }))],
      }),
      value: '',
    }

    const votingDelay = {
      target: governor as AddressType,
      functionSignature: 'updateVotingDelay',
      calldata: encodeFunctionData({
        abi: governorAbi,
        functionName: 'updateVotingDelay',
        args: [BigInt(toSeconds({ days: 2 }))],
      }),
      value: '',
    }

    if (reduceDelay) {
      addTransaction({
        type: TransactionType.CUSTOM,
        summary: 'Change Voting Period to 2 Days',
        transactions: [votingPeriod],
      })
      addTransaction({
        type: TransactionType.CUSTOM,
        summary: 'Change Voting Delay to 2 Days',
        transactions: [votingDelay],
      })
    }
  }

  return (
    <Box w={'100%'}>
      {paused ? (
        <Box mb={'x8'}>
          <Paragraph size="md" color="negative">
            It looks like auctions are already paused for this DAO.
          </Paragraph>
        </Box>
      ) : (
        <Text mb="x8" ml="x2" className={defaultHelperTextStyle}>
          In order to start the migration, you first need to pause auctions. In parallel,
          we also recommend reducing the voting delay and period so you can quickly start
          the bridging transaction after this proposal goes through.{' '}
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://app.charmverse.io/builderdao/l1-%25E2%2586%2592-l2-dao-migration-faq-24933900064389292"
          >
            Learn more
          </a>
        </Text>
      )}
      <Flex align={'center'} justify={'flex-start'} gap={'x4'} mt="x2" mb="x8">
        <Flex
          align={'center'}
          justify={'center'}
          className={checkboxStyleVariants[reduceDelay ? 'confirmed' : 'default']}
          onClick={() => setReduceDelay((bool) => !bool)}
        >
          {reduceDelay && <Icon fill="background1" id="check" />}
        </Flex>
        <Flex>(OPTIONAL) Reduce voting delay and voting period to 2 days each.</Flex>
      </Flex>
      <Button
        variant={'outline'}
        borderRadius={'curved'}
        w={'100%'}
        type="button"
        onClick={handlePauseAuctionsTransaction}
        disabled={paused}
      >
        Add Transaction to Queue
      </Button>
    </Box>
  )
}
