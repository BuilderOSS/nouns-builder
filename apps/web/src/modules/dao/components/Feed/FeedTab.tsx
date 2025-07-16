import { Box, Flex, Text } from '@buildeross/zord'
import Link from 'next/link'
import React, { ReactNode } from 'react'

import { feed } from './Feed.css'

export const FeedTab = ({ children }: { isMobile: boolean; children?: ReactNode }) => (
  <Box className={feed}>
    <Flex direction={'column'}>
      <Box mb={{ '@initial': 'x4', '@768': 'x8' }}>
        <Text
          mb={{ '@initial': 'x4', '@768': 'x6' }}
          fontSize={28}
          fontWeight={'display'}
        >
          DAO Feed
        </Text>
        <Text mb="x3">
          This feed is a read-only, alpha feature for DAOs that have a{' '}
          <Link href="https://github.com/farcasterxyz/protocol/discussions/71">
            Farcaster channel
          </Link>
        </Text>
        <Text mb="x3">
          Please leave any feedback or feature requests on this{' '}
          <Link href="https://github.com/ourzora/nouns-builder/issues/270">
            Github issue
          </Link>
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
