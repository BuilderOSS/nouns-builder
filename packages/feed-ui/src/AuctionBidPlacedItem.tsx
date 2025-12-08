import { useEnsData } from '@buildeross/hooks/useEnsData'
import type { AuctionBidPlacedFeedItem } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'

import {
  feedItemContentHorizontal,
  feedItemImage,
  feedItemSubtitle,
  feedItemTitle,
} from './Feed.css'
import { ImageSkeleton } from './FeedSkeleton'

interface AuctionBidPlacedItemProps {
  item: AuctionBidPlacedFeedItem
}

export const AuctionBidPlacedItem: React.FC<AuctionBidPlacedItemProps> = ({ item }) => {
  const { getAuctionLink } = useLinks()
  const { displayName } = useEnsData(item.bidder)

  const formattedAmount = formatCryptoVal(formatEther(BigInt(item.amount)))

  return (
    <LinkWrapper link={getAuctionLink(item.chainId, item.daoId, item.tokenId)}>
      <Stack gap="x3" w="100%" className={feedItemContentHorizontal}>
        {/* Image - full-width on mobile, fixed width on desktop */}
        <Box className={feedItemImage}>
          <FallbackImage
            src={item.tokenImage}
            alt={item.tokenName}
            loadingPlaceholder={<ImageSkeleton />}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>

        {/* Content - below image on mobile, to the right on desktop */}
        <Stack gap="x2" style={{ flex: 1 }}>
          <Text className={feedItemTitle}>
            {displayName} bid {formattedAmount} ETH
          </Text>
          <Text className={feedItemSubtitle}>{item.tokenName}</Text>
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}
