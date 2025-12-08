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
    <>
      <Link
        direction="row"
        w={'100%'}
        align="center"
        borderStyle={'solid'}
        borderRadius={'curved'}
        borderWidth={'normal'}
        py={'x2'}
        px={'x3'}
        position={'relative'}
        link={getProposalLink?.(chainId, collectionAddress, proposalNumber)}
        className={proposalCardVariants[displayWarning ? 'warning' : 'default']}
      >
        <Text
          fontSize={14}
          fontWeight="label"
          color={'text4'}
          mr={'x3'}
          style={{ flexShrink: 0 }}
        >
          #{proposalNumber}
        </Text>
        <Text
          fontSize={14}
          fontWeight="label"
          mr="x3"
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Text>
        <Flex align="center" gap="x2" style={{ flexShrink: 0 }}>
          <Box style={{ fontSize: '12px' }}>
            <ProposalStatus {...proposal} />
          </Box>
          <NeedsVote
            userAddress={userAddress}
            proposalState={state}
            votes={votes}
            hasWarning={!!displayWarning}
          />
        </Flex>
      </Link>
      {displayWarning && (
        <Flex w="100%" color="warning" align="center" mb="x2" px="x3">
          <Icon fill="warning" id="warning" mr="x2" size="sm" />
          <Text fontSize={12}>{displayWarning}</Text>
        </Flex>
      )}
    </>
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
