import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { useIpfsMetadata, useMediaType } from '@buildeross/hooks'
import { CHAIN_ID } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { ShareButton } from '@buildeross/ui/ShareButton'
import { StatBadge } from '@buildeross/ui/StatBadge'
import { formatMarketCap, formatPrice } from '@buildeross/utils/formatMarketCap'
import { isCoinSupportedChain } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Spinner, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'
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
  onTradeClick?: (coinAddress: Address, symbol: string) => void
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
  onTradeClick,
}: CoinCardProps) => {
  const { getCoinLink } = useLinks()
  const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)
  const coinHref = chain ? `/coin/${chain.slug}/${coinAddress}` : '#'

  const shareUrl = useMemo(() => {
    const link = getCoinLink(chainId, coinAddress)
    return typeof link === 'string' ? link : link.href
  }, [chainId, coinAddress, getCoinLink])

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
  const showTradeButton = isCoinSupportedChain(chainId)

  const handleTradeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onTradeClick?.(coinAddress, symbol)
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
            <Flex align="center" gap="x2">
              <Text variant="paragraph-sm" color="text3">
                {symbol}
              </Text>
            </Flex>
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
            <Flex
              className={tradeButtonContainer}
              direction="row"
              align="center"
              w="100%"
              justify="space-between"
            >
              {shareUrl && <ShareButton url={shareUrl} size="sm" variant="ghost" />}
              <Button
                size="sm"
                variant="primary"
                style={{ flex: 1 }}
                onClick={handleTradeClick}
              >
                Trade
              </Button>
            </Flex>
          )}
        </Box>
      </Link>
    </>
  )
}
