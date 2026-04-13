import { useEnsData } from '@buildeross/hooks/useEnsData'
import { Avatar } from '@buildeross/ui/Avatar'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Flex, Text } from '@buildeross/zord'
import React from 'react'

import { recentBidder } from '../Auction.css'
import { AuctionWalletProfilePreview } from '../AuctionWalletProfilePreview'

interface BidderProps {
  address: string
}

export const Bidder: React.FC<BidderProps> = ({ address }) => {
  const { displayName, ensAvatar } = useEnsData(address)
  const resolvedDisplayName = displayName || walletSnippet(address as `0x${string}`)

  return (
    <AuctionWalletProfilePreview
      address={address as `0x${string}`}
      displayName={displayName}
      avatarSrc={ensAvatar}
    >
      <Flex align="center">
        <Box mr="x2">
          <Avatar address={address} src={ensAvatar} size="32" />
        </Box>
        <Text className={recentBidder} variant="paragraph-md">
          <a href={`/profile/${address}`} target="_blank" rel="noopener noreferrer">
            {resolvedDisplayName}
          </a>
        </Text>
      </Flex>
    </AuctionWalletProfilePreview>
  )
}
