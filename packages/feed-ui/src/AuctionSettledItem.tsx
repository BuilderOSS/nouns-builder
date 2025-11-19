import type { AuctionSettledFeedItem } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'

import { feedItemImage, feedItemSubtitle, feedItemTitle } from './Feed.css'
import { ImageSkeleton } from './FeedSkeleton'

interface AuctionSettledItemProps {
  item: AuctionSettledFeedItem
}

export const AuctionSettledItem: React.FC<AuctionSettledItemProps> = ({ item }) => {
  const { getAuctionLink } = useLinks()

  return (
    <LinkWrapper link={getAuctionLink(item.chainId, item.daoId, item.tokenId)}>
      <Stack gap="x3" w="100%">
        {/* Full-width image */}
        <Box className={feedItemImage}>
          <FallbackImage
            src={item.tokenImage}
            alt={item.tokenName}
            loadingPlaceholder={<ImageSkeleton />}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>

        {/* Content below image */}
        <Stack gap="x2">
          <Text className={feedItemTitle}>{item.tokenName} - Auction Settled</Text>
          <Flex align="center" gap="x1">
            <Text className={feedItemSubtitle}>Winning bid:</Text>
            <img
              src="/chains/ethereum.svg"
              alt="ETH"
              loading="lazy"
              decoding="async"
              width={12}
              height={12}
              style={{ maxWidth: '12px', maxHeight: '12px', objectFit: 'contain' }}
            />
            <Text className={feedItemSubtitle}>
              {formatCryptoVal(formatEther(BigInt(item.amount)))} ETH
            </Text>
          </Flex>
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}
