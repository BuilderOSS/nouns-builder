import { Box, Flex } from '@buildeross/zord'
import { ReactNode } from 'react'

import { feed } from './Feed.css'

export const FeedTab = ({ children }: { children?: ReactNode }) => (
  <Box className={feed}>
    <Flex direction={'column'}>
      <Box mb={{ '@initial': 'x4', '@768': 'x8' }}>
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
