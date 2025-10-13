import { useIsMounted } from '@buildeross/hooks/useIsMounted'
import { ProposalLinkHandler } from '@buildeross/types'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { Box, Flex, Label, Paragraph } from '@buildeross/zord'
import dayjs from 'dayjs'
import React from 'react'
import { useChainStore, useDaoStore } from 'src/stores'

import { ProposalForStatus, ProposalStatus } from '../ProposalStatus'
import { statusStyle, titleStyle } from './ProposalCard.css'

type ProposalCardProps = ProposalForStatus & {
  getProposalLink?: ProposalLinkHandler
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  getProposalLink,
  ...proposal
}) => {
  const { title, proposalNumber, timeCreated } = proposal
  const isMounted = useIsMounted()
  const { token } = useDaoStore((state) => state.addresses)
  const { id: chainId } = useChainStore((state) => state.chain)

  if (!isMounted || !token) return null

  return (
    <Link w="100%" link={getProposalLink?.(chainId, token, proposalNumber)}>
      <Flex
        direction={{ '@initial': 'column', '@768': 'row' }}
        my={'x2'}
        borderColor={'border'}
        borderStyle={'solid'}
        borderRadius={'curved'}
        borderWidth={'normal'}
        cursor={'pointer'}
        wrap="nowrap"
        p={{ '@initial': 'x4', '@768': 'x6' }}
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
    </Link>
  )
}
