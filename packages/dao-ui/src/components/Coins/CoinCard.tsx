import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { useIpfsMetadata, useMediaType } from '@buildeross/hooks'
import { CHAIN_ID } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { StatBadge } from '@buildeross/ui/StatBadge'
import { SwapWidget } from '@buildeross/ui/SwapWidget'
import { formatMarketCap, formatPrice } from '@buildeross/utils/formatMarketCap'
import { Box, Button, Flex, Spinner, Text } from '@buildeross/zord'
import React, { useState } from 'react'
import { Address } from 'viem'

import {
  card,
  coinImage,
  coinInfo,
  priceBadgeOverlay,
  tradeButtonContainer,
} from './Coins.css'

interface CoinCardProps {
  chainId: CHAIN_ID
  coinAddress: Address
  name: string
  symbol: string
  image?: string // This is the IPFS URI
  priceUsd?: number | null
  marketCap?: number | null
  isLoadingPrice?: boolean
  createdAt?: string
  isClankerToken?: boolean
}

export const CoinCard = ({
  chainId,
  coinAddress,
  name,
  symbol,
  image,
  priceUsd,
  marketCap,
  isLoadingPrice,
  createdAt,
}: CoinCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)
  const coinHref = chain ? `/coin/${chain.slug}/${coinAddress}` : '#'

  // Fetch IPFS metadata to get image and animation_url
  const { metadata, imageUrl, animationUrl, isLoading } = useIpfsMetadata(image)

  // Get media type for animation_url if present
  const {
    mediaType,
    fetchableUrl: animationFetchableUrl,
    isLoading: isMediaTypeLoading,
  } = useMediaType(animationUrl, metadata)

  // Determine what media to show - prefer animation_url over image
  const shouldUseMediaPreview = animationUrl && mediaType && animationFetchableUrl
  const displayImageUrl = imageUrl

  // Check if coin is new (less than 7 days old)
  const isNew = createdAt
    ? Date.now() / 1000 - parseInt(createdAt) < 7 * 24 * 60 * 60
    : false

  // Only show Trade button for Base chains
  const showTradeButton = chainId === CHAIN_ID.BASE || chainId === CHAIN_ID.BASE_SEPOLIA

  const handleTradeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsModalOpen(true)
  }

  return (
    <>
      <Link
        direction="column"
        link={{ href: coinHref }}
        borderRadius={'curved'}
        height={'100%'}
        overflow={'hidden'}
        className={card}
      >
        <Box
          backgroundColor="background2"
          width={'100%'}
          height={'auto'}
          aspectRatio={1 / 1}
          position="relative"
          overflow={'hidden'}
          className={coinImage}
        >
          {isLoading ||
          isMediaTypeLoading ||
          (!shouldUseMediaPreview && !displayImageUrl) ? (
            <Box backgroundColor="background2" w="100%" h="100%" />
          ) : shouldUseMediaPreview ? (
            <MediaPreview
              mediaUrl={animationFetchableUrl}
              mediaType={mediaType}
              coverUrl={displayImageUrl || undefined}
              width="100%"
              height="100%"
              aspectRatio={1}
            />
          ) : (
            <FallbackImage
              src={displayImageUrl!}
              sizes="100vw"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              alt={`${name} image`}
            />
          )}

          {/* Price Badge Overlay */}
          {(priceUsd !== null && priceUsd !== undefined) || isLoadingPrice ? (
            <Box className={priceBadgeOverlay}>
              {isLoadingPrice ? (
                <StatBadge variant="default">
                  <Spinner size="sm" />
                </StatBadge>
              ) : (
                <StatBadge variant="accent">{formatPrice(priceUsd)}</StatBadge>
              )}
            </Box>
          ) : null}

          {/* New Badge */}
          {isNew && (
            <Box position="absolute" top="x3" left="x3">
              <StatBadge variant="positive">New</StatBadge>
            </Box>
          )}
        </Box>

        <Box pt="x4" position={'relative'} overflow={'hidden'} className={coinInfo}>
          <Flex justify={'space-between'} align={'center'} pb="x2">
            <Text variant="label-md" color="text1">
              {name}
            </Text>
            <Text variant="paragraph-sm" color="text3">
              {symbol}
            </Text>
          </Flex>

          {/* Market Cap */}
          {(marketCap !== null && marketCap !== undefined) || isLoadingPrice ? (
            <Flex justify={'space-between'} align={'center'} pb="x3">
              <Text variant="paragraph-sm" color="text3">
                Market Cap
              </Text>
              <Text variant="paragraph-sm" color="text1">
                {isLoadingPrice ? <Spinner size="sm" /> : formatMarketCap(marketCap)}
              </Text>
            </Flex>
          ) : null}

          {/* Trade Button */}
          {showTradeButton && (
            <Box className={tradeButtonContainer}>
              <Button
                size="sm"
                variant="primary"
                style={{ width: '100%' }}
                onClick={handleTradeClick}
              >
                Trade
              </Button>
            </Box>
          )}
        </Box>
      </Link>

      {/* Trade Modal */}
      {showTradeButton && (
        <AnimatedModal
          open={isModalOpen}
          close={() => setIsModalOpen(false)}
          size="medium"
        >
          <Box p="x6">
            <Text variant="heading-md" mb="x4">
              Trade {symbol}
            </Text>
            <SwapWidget
              coinAddress={coinAddress}
              symbol={symbol}
              chainId={chainId as CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA}
            />
          </Box>
        </AnimatedModal>
      )}
    </>
  )
}
