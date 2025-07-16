import { Box, Flex, Text } from '@zoralabs/zord'
import React, { ReactNode } from 'react'

export const DashboardLayout = ({
  auctionCards,
  daoProposals,
}: {
  auctionCards: ReactNode
  daoProposals?: ReactNode
}) => {
  return (
    <DashPage>
      <Box mb={'x12'}>
        <Text fontSize={28} fontWeight={'display'} mb={'x6'}>
          DAOs
        </Text>
        {auctionCards}
      </Box>
      <Box>
        <Text fontSize={28} fontWeight={'display'} mb={'x6'}>
          Proposals
        </Text>
        {daoProposals}
      </Box>
    </DashPage>
  )
}

export const DashPage = ({ children }: { children: ReactNode }) => {
  return (
    <Flex
      minH={'100vh'}
      py={{ '@initial': 'x6', '@480': 'x20' }}
      w={'100%'}
      justify="center"
    >
      <Box w="100%" style={{ maxWidth: 912 }}>
        <Text fontSize={35} fontWeight={'display'} mb={'x12'}>
          Dashboard
        </Text>
        {children}
      </Box>
    </Flex>
  )
}
