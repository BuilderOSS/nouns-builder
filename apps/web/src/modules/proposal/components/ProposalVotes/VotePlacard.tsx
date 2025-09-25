import { useEnsData } from '@buildeross/hooks/useEnsData'
import { ProposalVoteFragment, ProposalVoteSupport } from '@buildeross/sdk/subgraph'
import { Avatar } from '@buildeross/ui/Avatar'
import { walletSnippet } from '@buildeross/utils/helpers'
import { atoms, Flex, Grid, Text } from '@buildeross/zord'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'

import { votePlacardReason } from './VoterParticipation.css'

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
      columns={7}
      backgroundColor="background1"
      align={'center'}
      mb="x2"
      px={{ '@initial': 'x2', '@768': 'x6' }}
      gap={{ '@initial': 'x1', '@768': 'x0' }}
      py="x6"
      mt="x4"
      color="text1"
      borderStyle="solid"
      borderColor="border"
      borderRadius="curved"
      w="100%"
      style={{
        cursor: 'auto',
        userSelect: 'text',
      }}
    >
      <Text
        fontSize={{ '@initial': 12, '@768': 14 }}
        style={{ width: 'max-content', fontWeight: 600 }}
        className={supportStyle}
      >
        {vote.support}
      </Text>
      <Flex align={'center'} style={{ gridColumn: 'span 4 / span 4' }}>
        <Avatar address={vote.voter} src={ensAvatar} size="28" />
        <Text fontWeight="display" ml="x2">
          {ensName || walletSnippet(vote.voter)}
        </Text>
      </Flex>

      <Flex
        align={'center'}
        style={{ gridColumn: 'span 2 / span 2', justifyContent: 'end' }}
      >
        <Text fontWeight="label" mr={{ '@initial': 'x2', '@768': 'x6' }}>
          {vote.weight} {vote.weight === 1 ? 'Vote' : 'Votes'}
        </Text>
        <Text
          fontSize={12}
          borderStyle="solid"
          borderColor="border"
          color="text4"
          borderRadius="phat"
          py="x1"
          px="x2"
          fontWeight="label"
          display={{ '@initial': 'none', '@768': 'block' }}
        >
          {votePercentage}%
        </Text>
      </Flex>

      <AnimatePresence initial={false}>
        {vote.reason && (
          <motion.div
            variants={variants}
            initial={'inital'}
            animate={'animate'}
            exit={'inital'}
            className={votePlacardReason}
          >
            <Text
              variant={'paragraph-sm'}
              fontSize={{ '@initial': 14, '@768': 16 }}
              borderRadius="curved"
              mt="x4"
              p="x6"
              textAlign={'left'}
              style={{
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
