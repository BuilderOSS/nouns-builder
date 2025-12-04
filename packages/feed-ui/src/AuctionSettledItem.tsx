import { useEnsData } from '@buildeross/hooks/useEnsData'
import type { AuctionSettledFeedItem } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'

import { feedItemContentHorizontal, feedItemImage, feedItemTitle } from './Feed.css'
import { ImageSkeleton } from './FeedSkeleton'

interface AuctionSettledItemProps {
  item: AuctionSettledFeedItem
}

export const AuctionSettledItem: React.FC<AuctionSettledItemProps> = ({ item }) => {
  const { getAuctionLink } = useLinks()
  const { displayName } = useEnsData(item.winner)

  const formattedAmount =
    BigInt(item.amount) > 0n ? formatCryptoVal(formatEther(BigInt(item.amount))) : null

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
            {displayName} won {item.tokenName}{' '}
            {formattedAmount && `for ${formattedAmount} ETH`}
          </Text>
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}
