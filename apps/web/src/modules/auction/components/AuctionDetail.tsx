import { Box, Flex } from '@buildeross/zord'
import { ReactNode } from 'react'

import { auctionTextVariants } from './Auction.css'

export const AuctionDetail = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <Flex direction={'column'} style={{ flexBasis: '50%', flexGrow: 0 }}>
    <Box className={auctionTextVariants['tertiary']}>{title}</Box>
    <Box
      className={auctionTextVariants['secondary']}
      mt={{ '@initial': 'x1', '@768': 'x2' }}
    >
      {children}
    </Box>
  </Flex>
)
