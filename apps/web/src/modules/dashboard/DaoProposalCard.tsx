import { Box, Flex, PopUp, Text } from '@buildeross/zord'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { Icon } from 'src/components/Icon'
import { ProposalState } from 'src/data/contract/requests/getProposalState'
import { AddressType, CHAIN_ID } from 'src/typings'

import { ProposalForStatus, ProposalStatus } from '../proposal/components/ProposalStatus'

type DaoProposalCardProps = ProposalForStatus & {
  chainId: CHAIN_ID
  tokenAddress: AddressType
  currentChainSlug?: string
  userAddress?: AddressType
  votes: {
    voter: string
  }[]
}

export const DaoProposalCard = ({
  tokenAddress,
  currentChainSlug,
  userAddress,
  votes,
  ...proposal
}: DaoProposalCardProps) => {
  const { proposalNumber, title, state } = proposal
  return (
    <Link
      href={`/dao/${currentChainSlug}/${tokenAddress}/vote/${proposalNumber}`}
      passHref
    >
      <Flex
        mb={'x4'}
        direction={{ '@initial': 'column-reverse', '@768': 'row' }}
        w={'100%'}
        align={{ '@initial': 'flex-start', '@768': 'center' }}
        borderColor={'border'}
        borderStyle={'solid'}
        borderRadius={'curved'}
        borderWidth={'normal'}
        cursor={'pointer'}
        py={{ '@initial': 'x3', '@768': 'x6' }}
        px={{ '@initial': 'x6', '@768': 'x3' }}
        position={'relative'}
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
    </Link>
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
