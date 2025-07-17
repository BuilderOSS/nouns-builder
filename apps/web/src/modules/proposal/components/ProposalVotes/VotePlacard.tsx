import { walletSnippet } from '@buildeross/utils/helpers'
import { Flex, Grid, Text, atoms } from '@buildeross/zord'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

import { Avatar } from 'src/components/Avatar'
import {
  ProposalVoteFragment,
  ProposalVoteSupport,
} from 'src/data/subgraph/sdk.generated'
import { useEnsData } from 'src/hooks'
import { useLayoutStore } from 'src/stores'

const variants = {
  inital: {
    height: 0,
    overflow: 'hidden',
    transition: {
      animate: 'easeInOut',
    },
  },
  animate: {
    height: 'auto',
    transition: {
      animate: 'easeInOut',
    },
  },
}

export interface VotePlacardProps {
  vote: ProposalVoteFragment
  totalVotes: number
}

export const VotePlacard: React.FC<VotePlacardProps> = ({ vote, totalVotes }) => {
  const { ensName, ensAvatar } = useEnsData(vote.voter)
  const [open, setOpen] = useState(true)
  const { isMobile } = useLayoutStore()

  const supportStyle = useMemo(() => {
    const base = atoms({
      borderStyle: 'solid',
      borderRadius: 'phat',
      borderWidth: 'thin',
      py: 'x1',
      px: 'x3',
      mr: 'x2',
    })

    switch (vote.support) {
      case ProposalVoteSupport.For:
        return [base, atoms({ color: 'positive', borderColor: 'positiveDisabled' })]
      case ProposalVoteSupport.Against:
        return [base, atoms({ color: 'negative', borderColor: 'negativeDisabled' })]
      case ProposalVoteSupport.Abstain:
        return [base, atoms({ color: 'text3', borderColor: 'border' })]
    }
  }, [vote.support])

  const votePercentage = ((100 * vote.weight) / totalVotes).toFixed(2)

  return (
    <Grid
      as="button"
      onClick={() => (vote.reason ? setOpen((x) => !x) : null)}
      columns={7}
      gap={isMobile ? 'x1' : 'x0'}
      backgroundColor="background1"
      cursor={vote.reason ? 'pointer' : 'auto'}
      align={'center'}
      mb="x2"
      px={isMobile ? 'x2' : 'x6'}
      py="x6"
      mt="x4"
      color="text1"
      borderStyle="solid"
      borderColor="border"
      borderRadius="curved"
      w="100%"
    >
      <Text
        fontSize={isMobile ? 12 : 14}
        style={{ width: 'max-content', fontWeight: 600 }}
        className={supportStyle}
      >
        {vote.support}
      </Text>
      <Flex align={'center'} style={{ gridColumn: 'span 4 / span 4' }}>
        <Avatar address={vote.voter} src={ensAvatar} size={isMobile ? '24' : '32'} />
        <Text variant={isMobile ? 'label-sm' : 'label-md'} ml="x2">
          {ensName || walletSnippet(vote.voter)}
        </Text>
      </Flex>

      <Flex
        align={'center'}
        style={{ gridColumn: 'span 2 / span 2', justifyContent: 'end' }}
      >
        <Text variant={isMobile ? 'label-sm' : 'label-md'} mr={isMobile ? 'x2' : 'x6'}>
          {vote.weight} {vote.weight === 1 ? 'Vote' : 'Votes'}
        </Text>
        {!isMobile && (
          <Text
            style={{ fontWeight: 500 }}
            fontSize={12}
            borderStyle="solid"
            borderColor="border"
            color="text4"
            borderRadius="phat"
            py="x1"
            px="x2"
          >
            {votePercentage}%
          </Text>
        )}
      </Flex>

      <AnimatePresence initial={false}>
        {open && vote.reason && (
          <motion.div
            variants={variants}
            initial={'inital'}
            animate={'animate'}
            exit={'inital'}
            style={{
              gridColumn: isMobile ? 'span 7 / span 7' : '2 / span 6',
            }}
          >
            <Text
              variant={isMobile ? 'paragraph-sm' : 'paragraph-md'}
              borderRadius="curved"
              mt="x4"
              p="x6"
              textAlign={'left'}
              style={{
                fontWeight: 400,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                minWidth: '80%',
                backgroundColor: '#F9F9F9',
              }}
            >
              {vote.reason}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </Grid>
  )
}
