import { Box, Flex, Text } from '@zoralabs/zord'
import React, { ReactNode } from 'react'

import { cardSkeleton, firstRowItem, lastRowItem, row, rowItem } from './MembersList.css'

export const MembersPanel = ({
  children,
  isMobile,
  tableRuler = true,
}: {
  children: ReactNode
  isMobile: boolean
  tableRuler?: boolean
}) => {
  return (
    <>
      <Text
        mb={{ '@initial': 'x4', '@768': 'x6' }}
        mt={{ '@initial': 'x4', '@768': 'x10' }}
        variant="heading-xs"
        style={{ fontWeight: 800 }}
      >
        Delegates
      </Text>
      <Box
        borderRadius={'phat'}
        borderStyle={'solid'}
        borderWidth={'normal'}
        borderColor={'border'}
        pt={'x8'}
        p={{ '@initial': 'x3', '@768': 'x6' }}
      >
        {!isMobile && tableRuler && <TableHeader />}
        {children}
      </Box>
    </>
  )
}

const TableHeader = () => {
  return (
    <Flex className={row} mb={{ '@initial': 'x4', '@768': 'x12' }}>
      <Text fontWeight={'label'} className={firstRowItem}>
        Delegate
      </Text>
      <Text fontWeight={'label'} className={rowItem}>
        Votes
      </Text>
      <Text fontWeight={'label'} className={rowItem}>
        Vote %
      </Text>
      <Text fontWeight={'label'} className={lastRowItem}>
        Joined
      </Text>
    </Flex>
  )
}

export const MemberCardSkeleton = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <Flex
      className={cardSkeleton}
      borderRadius="normal"
      backgroundColor="background2"
      mb={isMobile ? 'x14' : 'x10'}
    />
  )
}
