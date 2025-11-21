import { ProposalForStatus, ProposalStatus } from '@buildeross/proposal-ui'
import { ProposalState } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { getProposalWarning } from '@buildeross/utils/warnings'
import { Box, Flex, Icon, PopUp, Text } from '@buildeross/zord'
import { useMemo, useState } from 'react'
import { useBalance } from 'wagmi'

import { proposalCardVariants } from './dashboard.css'

type DaoProposalCardProps = ProposalForStatus & {
  chainId: CHAIN_ID
  collectionAddress: AddressType
  treasuryAddress: AddressType
  daoName: string
  userAddress?: AddressType
  votes: {
    voter: string
  }[]
}

export const DaoProposalCard = ({
  userAddress,
  votes,
  chainId,
  collectionAddress,
  daoName,
  treasuryAddress,
  ...proposal
}: DaoProposalCardProps) => {
  const { proposalNumber, title, state, proposer, values } = proposal
  const { getProposalLink } = useLinks()

  const { data: balance } = useBalance({
    address: treasuryAddress,
    chainId: chainId,
  })

  const displayWarning = useMemo(
    () =>
      getProposalWarning({
        proposer: proposer,
        proposalState: state,
        proposalValues: values,
        treasuryBalance: balance?.value,
        daoName: daoName,
      }),

    [proposer, state, values, balance, daoName]
  )

  return (
    <Link
      mb={'x4'}
      direction="column"
      w={'100%'}
      align={{ '@initial': 'flex-start', '@768': 'center', '@1024': 'flex-start' }}
      borderStyle={'solid'}
      borderRadius={'curved'}
      borderWidth={'normal'}
      py={{ '@initial': 'x3', '@768': 'x6', '@1024': 'x3' }}
      px={{ '@initial': 'x6', '@768': 'x3', '@1024': 'x6' }}
      position={'relative'}
      link={getProposalLink?.(chainId, collectionAddress, proposalNumber)}
      className={proposalCardVariants[displayWarning ? 'warning' : 'default']}
    >
      <Flex
        direction={{
          '@initial': 'column-reverse',
          '@768': 'row',
          '@1024': 'column-reverse',
        }}
        w={'100%'}
        align={{ '@initial': 'flex-start', '@768': 'center', '@1024': 'flex-start' }}
        position={'relative'}
      >
        <Flex align="center">
          <Text
            fontSize={18}
            fontWeight="label"
            color={'text4'}
            mr={'x4'}
            display={{ '@initial': 'none', '@768': 'flex', '@1024': 'none' }}
          >
            {proposalNumber}
          </Text>
        </Flex>
        <Flex
          mr={'auto'}
          align="center"
          mb={{ '@initial': 'x2', '@768': 'x0', '@1024': 'x2' }}
          width={{ '@initial': '100%', '@768': 'auto', '@1024': '100%' }}
          justify={{
            '@initial': 'space-between',
            '@768': 'flex-start',
            '@1024': 'space-between',
          }}
        >
          <Text fontSize={18} fontWeight="label" mr="x3">
            {title}
          </Text>
          <NeedsVote
            userAddress={userAddress}
            proposalState={state}
            votes={votes}
            hasWarning={!!displayWarning}
          />
        </Flex>
        <Flex
          justify={'space-between'}
          width={{ '@initial': '100%', '@768': 'unset', '@1024': '100%' }}
          align={'center'}
          mb={{ '@initial': 'x3', '@768': 'x0', '@1024': 'x3' }}
        >
          <Box style={{ width: '225px' }}>
            <ProposalStatus {...proposal} flipped showTime />
          </Box>
          <Flex display={{ '@initial': 'flex', '@768': 'none', '@1024': 'flex' }}>
            <Text fontSize={18} fontWeight="label" color={'text4'}>
              {proposalNumber}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      {displayWarning && (
        <Flex w="100%" color="warning" align="center" mt="x2">
          <Icon fill="warning" id="warning" mr="x4" size="sm" />
          <Box fontWeight="heading">{displayWarning}</Box>
        </Flex>
      )}
    </Link>
  )
}

type NeedsVoteProps = {
  userAddress?: AddressType
  proposalState: ProposalState
  votes: { voter: string }[]
  hasWarning?: boolean
}
const NeedsVote = ({
  userAddress,
  proposalState,
  votes,
  hasWarning = false,
}: NeedsVoteProps) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const hasVoted: null | boolean = useMemo(() => {
    if (proposalState !== ProposalState.Active) return null

    return votes.some((vote) => vote.voter === userAddress?.toLowerCase())
  }, [proposalState, votes, userAddress])

  if (hasVoted === null || hasWarning) return null

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
