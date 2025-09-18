import { useEnsData } from '@buildeross/hooks/useEnsData'
import { Avatar } from '@buildeross/ui/Avatar'
import { Box, Flex, Text } from '@buildeross/zord'
import React from 'react'

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
        <a href={`/profile/${address}`} target="_blank" rel="noopener noreferrer">
          {displayName}
        </a>
      </Text>
    </Flex>
  )
}
