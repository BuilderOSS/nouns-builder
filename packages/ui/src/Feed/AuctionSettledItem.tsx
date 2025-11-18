import type { AuctionSettledFeedItem } from '@buildeross/types'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'

import { FallbackImage } from '../FallbackImage'
import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import { feedItemMeta, feedItemSubtitle, feedItemTitle, tokenImage } from './Feed.css'

interface AuctionSettledItemProps {
  item: AuctionSettledFeedItem
}

export const AuctionSettledItem: React.FC<AuctionSettledItemProps> = ({ item }) => {
  const { getAuctionLink } = useLinks()

  return (
    <LinkWrapper
      link={getAuctionLink(item.chainId, item.daoId, item.tokenId)}
      gap="x4"
      align="flex-start"
    >
      <Box className={tokenImage}>
        <FallbackImage src={item.tokenImage} alt={item.tokenName} />
      </Box>
      <Stack gap="x2">
        <Text className={feedItemTitle}>Auction Settled</Text>
        <Text className={feedItemSubtitle}>{item.tokenName}</Text>
        <Flex align="center" gap="x1">
          <Text className={feedItemMeta}>Winning bid:</Text>
          <img
            src="/chains/ethereum.svg"
            alt="ETH"
            loading="lazy"
            decoding="async"
            width="12px"
            height="12px"
            style={{ maxWidth: '12px', maxHeight: '12px', objectFit: 'contain' }}
          />
          <Text className={feedItemMeta}>
            {formatCryptoVal(formatEther(BigInt(item.amount)))} ETH
          </Text>
        </Flex>
      </Stack>
    </LinkWrapper>
  )
}
