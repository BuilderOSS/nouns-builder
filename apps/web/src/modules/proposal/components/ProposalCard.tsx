import { useIsMounted } from '@buildeross/hooks/useIsMounted'
import { Box, Flex, Label, Paragraph } from '@buildeross/zord'
import dayjs from 'dayjs'
import Link from 'next/link'
import React from 'react'
import { useChainStore } from 'src/stores'

import { statusStyle, titleStyle } from './ProposalCard.css'
import { ProposalForStatus, ProposalStatus } from './ProposalStatus'

type ProposalCardProps = ProposalForStatus & {
  collection?: string
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  collection,
  ...proposal
}) => {
  const { title, proposalNumber, timeCreated } = proposal
  const chain = useChainStore((x) => x.chain)
  const isMounted = useIsMounted()

  if (!isMounted) return null

  return (
    <Link
      href={collection ? `/dao/${chain.slug}/${collection}/vote/${proposalNumber}` : ''}
      passHref
    >
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
