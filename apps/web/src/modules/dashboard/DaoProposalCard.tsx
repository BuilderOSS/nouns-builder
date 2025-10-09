import { ProposalState } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { Box, Flex, Icon, PopUp, Text } from '@buildeross/zord'
import { useMemo, useState } from 'react'

import { ProposalForStatus, ProposalStatus } from '../proposal/components/ProposalStatus'

type DaoProposalCardProps = ProposalForStatus & {
  userAddress?: AddressType
  votes: {
    voter: string
  }[]
  onClick?: () => void
}

export const DaoProposalCard = ({
  userAddress,
  votes,
  onClick,
  ...proposal
}: DaoProposalCardProps) => {
  const { proposalNumber, title, state } = proposal
  return (
    <Flex
      mb={'x4'}
      direction={{ '@initial': 'column-reverse', '@768': 'row' }}
      w={'100%'}
      align={{ '@initial': 'flex-start', '@768': 'center' }}
      borderColor={'border'}
      borderStyle={'solid'}
      borderRadius={'curved'}
      borderWidth={'normal'}
      py={{ '@initial': 'x3', '@768': 'x6' }}
      px={{ '@initial': 'x6', '@768': 'x3' }}
      position={'relative'}
      onClick={onClick}
      cursor={onClick ? 'pointer' : 'default'}
    >
      <Text
        fontSize={18}
        fontWeight="label"
        color={'text4'}
        mr={'x4'}
        display={{ '@initial': 'none', '@768': 'flex' }}
      >
        {proposalNumber}
      </Text>
      <Flex
        mr={'auto'}
        align="center"
        mb={{ '@initial': 'x2', '@768': 'x0' }}
        w="100%"
        justify={{ '@initial': 'space-between' }}
      >
        <Text fontSize={18} fontWeight="label" mr="x3">
          {title}
        </Text>
        <NeedsVote userAddress={userAddress} proposalState={state} votes={votes} />
      </Flex>
      <Flex
        justify={'space-between'}
        width={{ '@initial': '100%', '@768': 'unset' }}
        align={'center'}
        mb={{ '@initial': 'x3', '@768': 'x0' }}
      >
        <Box style={{ width: '225px' }}>
          <ProposalStatus {...proposal} flipped showTime />
        </Box>
        <Flex display={{ '@initial': 'flex', '@768': 'none' }}>
          <Text fontSize={18} fontWeight="label" color={'text4'}>
            {proposalNumber}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

type NeedsVoteProps = {
  userAddress?: AddressType
  proposalState: ProposalState
  votes: { voter: string }[]
}
const NeedsVote = ({ userAddress, proposalState, votes }: NeedsVoteProps) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const hasVoted = useMemo(() => {
    if (proposalState !== ProposalState.Active) return undefined

    return votes.some((vote) => vote.voter === userAddress?.toLowerCase())
  }, [proposalState, votes, userAddress])

  if (hasVoted == null) return null

  return (
    <Flex>
      <Box
        cursor="pointer"
        style={{ zIndex: 102 }}
        onMouseOver={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Icon
          id={hasVoted ? 'checkInCircle' : 'warning-16'}
          fill={hasVoted ? 'positive' : 'warning'}
          style={{
            transform: hasVoted ? 'scale(0.8)' : 'scale(1)',
          }}
          size={hasVoted ? 'md' : 'sm'}
        />
      </Box>

      <PopUp open={showTooltip} trigger={<></>} placement="right">
        <Text>{hasVoted ? 'Vote Submitted' : 'Vote Needed'}</Text>
      </PopUp>
    </Flex>
  )
}
