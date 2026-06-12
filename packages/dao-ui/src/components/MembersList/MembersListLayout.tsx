import { Box, Flex, Grid, Text } from '@buildeross/zord'
import React, { ReactNode } from 'react'

import { cardSkeleton, identityColumn, row } from './MembersList.css'

export const MembersPanel = ({
  children,
  tableRuler = true,
  exportButton,
  filterControl,
}: {
  children: ReactNode
  tableRuler?: boolean
  exportButton?: ReactNode
  filterControl?: ReactNode
}) => {
  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap="x2"
        mb={{ '@initial': 'x4', '@768': 'x6' }}
        mt={{ '@initial': 'x4', '@768': 'x10' }}
      >
        <Text variant="heading-xs" style={{ fontWeight: 800 }}>
          Delegates
        </Text>
        <Flex align="center" gap="x2">
          {filterControl}
          {exportButton}
        </Flex>
      </Flex>
      <Box
        borderRadius={'phat'}
        borderStyle={'solid'}
        borderWidth={'normal'}
        borderColor={'border'}
        style={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Box pt={'x8'} p={{ '@initial': 'x3', '@768': 'x6' }}>
          {tableRuler && <TableHeader />}
          {children}
        </Box>
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
      <Text fontWeight={'label'} className={identityColumn}>
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
