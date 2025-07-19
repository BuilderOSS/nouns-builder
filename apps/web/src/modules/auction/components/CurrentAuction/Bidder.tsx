import { useEnsData } from '@buildeross/hooks/useEnsData'
import { Box, Flex, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import { Avatar } from 'src/components/Avatar'

import { recentBidder } from '../Auction.css'

interface BidderProps {
  address: string
}

export const Bidder: React.FC<BidderProps> = ({ address }) => {
  const { displayName, ensAvatar } = useEnsData(address)

  return (
    <Flex align="center">
      <Box mr="x2">
        <Avatar address={address} src={ensAvatar} size="32" />
      </Box>
      <Text className={recentBidder} variant="paragraph-md">
        <Link href={`/profile/${address}`} passHref>
          <a>{displayName}</a>
        </Link>
      </Text>
    </Flex>
  )
}
