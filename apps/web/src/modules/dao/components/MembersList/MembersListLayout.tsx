import { Box, Flex, Grid, Text } from '@buildeross/zord'
import React, { ReactNode } from 'react'

import { cardSkeleton, row } from './MembersList.css'

export const MembersPanel = ({
  children,
  tableRuler = true,
  exportButton,
}: {
  children: ReactNode
  tableRuler?: boolean
  exportButton?: ReactNode
}) => {
  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        mb={{ '@initial': 'x4', '@768': 'x6' }}
        mt={{ '@initial': 'x4', '@768': 'x10' }}
      >
        <Text variant="heading-xs" style={{ fontWeight: 800 }}>
          Delegates
        </Text>
        {exportButton}
      </Flex>
      <Box
        borderRadius={'phat'}
        borderStyle={'solid'}
        borderWidth={'normal'}
        borderColor={'border'}
        pt={'x8'}
        p={{ '@initial': 'x3', '@768': 'x6' }}
      >
        {tableRuler && <TableHeader />}
        {children}
      </Box>
    </>
  )
}

const TableHeader = () => {
  return (
    <Flex
      className={row}
      mb={{ '@initial': 'x4', '@768': 'x12' }}
      display={{ '@initial': 'none', '@768': 'flex' }}
    >
      <Text fontWeight={'label'} style={{ width: '35%' }}>
        Delegate
      </Text>

      <Grid columns="1fr 1fr 1fr" flex={1}>
        <Text fontWeight={'label'}>Votes</Text>
        <Text fontWeight={'label'}>Vote %</Text>
        <Text fontWeight={'label'}>Joined</Text>
      </Grid>
    </Flex>
  )
}

export const MemberCardSkeleton = () => {
  return (
    <Flex
      className={cardSkeleton}
      borderRadius="normal"
      backgroundColor="background2"
      mb={{ '@initial': 'x14', '@768': 'x10' }}
    />
  )
}
