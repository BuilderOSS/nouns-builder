import { useIsMounted } from '@buildeross/hooks/useIsMounted'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { getProposalWarning } from '@buildeross/utils/warnings'
import { Box, Flex, Icon, Label, Paragraph } from '@buildeross/zord'
import dayjs from 'dayjs'
import React, { useMemo } from 'react'
import { useBalance } from 'wagmi'

import { ProposalForStatus, ProposalStatus } from '../ProposalStatus'
import { statusStyle, titleStyle } from './ProposalCard.css'

type ProposalCardProps = ProposalForStatus & {
  treasuryAddress: `0x${string}`
  daoName?: string
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  treasuryAddress,
  daoName,
  ...proposal
}) => {
  const { getProposalLink } = useLinks()
  const { title, proposalNumber, timeCreated, state, proposer, values } = proposal
  const isMounted = useIsMounted()
  const { token } = useDaoStore((state) => state.addresses)
  const { id: chainId } = useChainStore((state) => state.chain)

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

  if (!isMounted || !token) return null

  return (
    <Link
      w="100%"
      link={getProposalLink?.(chainId, token, proposalNumber)}
      direction="column"
      borderColor={displayWarning ? 'warning' : 'border'}
      borderStyle={'solid'}
      borderRadius={'curved'}
      borderWidth={'normal'}
      p={{ '@initial': 'x4', '@768': 'x6' }}
      my={'x2'}
    >
      <Flex
        direction={{ '@initial': 'column', '@768': 'row' }}
        wrap="nowrap"
        gap="x1"
        w="100%"
      >
        <Box display={{ '@initial': 'none', '@768': 'flex' }} w={'x8'} mr={'x2'}>
          <Label size="lg" color={'text4'}>
            {proposalNumber}
          </Label>
        </Box>
        <Box
          mr="auto"
          mt={{ '@initial': 'x2', '@768': 'x0' }}
          className={titleStyle}
          style={{ order: 2 }}
        >
          <Label size="lg">{title}</Label>
          <Paragraph color="tertiary" mt={'x1'}>
            {dayjs(dayjs.unix(timeCreated)).format('MMM DD, YYYY')}
          </Paragraph>
        </Box>

        <Flex className={statusStyle} align={'center'} style={{ flexShrink: 0 }}>
          <ProposalStatus {...proposal} flipped showTime />
        </Flex>
        <Flex
          display={{ '@initial': 'flex', '@768': 'none' }}
          justify={'flex-end'}
          h={'x0'}
        >
          <Label size="lg" color={'text4'}>
            {proposalNumber}
          </Label>
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
