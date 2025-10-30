import { Box, Flex, Text } from '@buildeross/zord'
import React, { ReactNode } from 'react'

import { feed } from './Feed.css'

export const FeedTab = ({ children }: { children?: ReactNode }) => (
  <Box className={feed}>
    <Flex direction={'column'}>
      <Box mb={{ '@initial': 'x4', '@768': 'x8' }}>
        <Text
          mb={{ '@initial': 'x4', '@768': 'x6' }}
          fontSize={28}
          fontWeight={'display'}
        >
          Activity Feed
        </Text>
        <Text mb="x3" color="text3">
          View all recent activity for this DAO including auctions, proposals, and votes.
        </Text>
        <Flex
          direction={'column'}
          py={{ '@initial': 'x0', '@768': 'x4' }}
          mt={'x4'}
          mb={'x8'}
        >
          {children}
        </Flex>
      </Box>
    </Flex>
  </Box>
)
