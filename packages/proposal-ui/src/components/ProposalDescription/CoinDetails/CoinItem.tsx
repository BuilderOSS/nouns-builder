import { type CoinInstanceData } from '@buildeross/hooks/useCoinData'
import { useIpfsMetadata } from '@buildeross/hooks/useIpfsMetadata'
import { useMediaType } from '@buildeross/hooks/useMediaType'
import { type CHAIN_ID } from '@buildeross/types'
import { AccordionItem } from '@buildeross/ui/Accordion'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { Box, Button, Icon, Stack, Text } from '@buildeross/zord'
import { useMemo } from 'react'

import { linkStyle } from './CoinItem.css'

interface CoinItemProps {
  coin: CoinInstanceData
  index: number
  isExecuted: boolean
  chainId: CHAIN_ID
}

export const CoinItem = ({ coin, index, isExecuted, chainId }: CoinItemProps) => {
  const { getCoinLink } = useLinks()

  // Fetch metadata from IPFS if available (Content Coins)
  const {
    metadata: ipfsMetadata,
    imageUrl: ipfsImageUrl,
    animationUrl: ipfsAnimationUrl,
  } = useIpfsMetadata(
    coin.isContentCoin && coin.metadataUri ? coin.metadataUri : undefined
  )

  // Combine metadata from different sources
  const metadata = useMemo(() => {
    return {
      name: coin.name,
      symbol: coin.symbol,
      description: coin.description || ipfsMetadata?.description,
      imageUrl: coin.imageUrl || ipfsImageUrl,
      animationUrl: ipfsAnimationUrl,
    }
  }, [
    coin.name,
    coin.symbol,
    coin.description,
    coin.imageUrl,
    ipfsMetadata?.description,
    ipfsImageUrl,
    ipfsAnimationUrl,
  ])

  // Get media type for animation_url if present
  const {
    mediaType,
    fetchableUrl: animationFetchableUrl,
    isLoading: isMediaTypeLoading,
  } = useMediaType(metadata.animationUrl, ipfsMetadata)

  // Determine what media to show - prefer animation_url over image
  const shouldUseMediaPreview =
    metadata.animationUrl && mediaType && animationFetchableUrl
  const displayImageUrl = metadata.imageUrl

  const coinType = coin.isContentCoin ? 'Content Coin' : 'Creator Coin'
  const coinLink = coin.address ? getCoinLink(chainId, coin.address) : null

  const title = (
    <Stack direction="row" align="center" gap="x2" flexWrap="wrap">
      <Text>
        {coinType} {index + 1}: {metadata.symbol}
      </Text>
    </Stack>
  )

  const description = (
    <Stack gap="x3">
      {/* Media Preview Row */}
      {(shouldUseMediaPreview || displayImageUrl) && !isMediaTypeLoading && (
        <Box
          w="100%"
          borderRadius="curved"
          backgroundColor="background2"
          overflow="hidden"
          style={shouldUseMediaPreview ? { maxHeight: '400px' } : { aspectRatio: '1/1' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {shouldUseMediaPreview ? (
            <MediaPreview
              mediaUrl={animationFetchableUrl}
              mediaType={mediaType}
              coverUrl={displayImageUrl || undefined}
              width="100%"
              height="100%"
            />
          ) : displayImageUrl ? (
            <FallbackImage
              src={displayImageUrl}
              alt={metadata.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                maxHeight: '400px',
              }}
            />
          ) : null}
        </Box>
      )}

      {/* Coin Information */}
      <Stack gap="x2">
        <Stack direction="row" align="center" gap="x2">
          <Text variant="label-sm" color="tertiary">
            Name:
          </Text>
          <Text variant="label-sm">
            {metadata.name} ({metadata.symbol})
          </Text>
        </Stack>

        {metadata.description && (
          <Stack direction="column" gap="x1">
            <Text variant="label-sm" color="tertiary">
              Description:
            </Text>
            <Text variant="paragraph-sm">{metadata.description}</Text>
          </Stack>
        )}
      </Stack>

      {/* Executed state: Show link to coin page */}
      {isExecuted && coinLink && (
        <a href={coinLink.href} className={linkStyle} target="_blank" rel="noreferrer">
          <Button variant="secondary" size="sm">
            View Coin Page
            <Icon id="arrowTopRight" />
          </Button>
        </a>
      )}

      {/* Pending state: Show creation message */}
      {!isExecuted && (
        <Box
          p="x3"
          borderRadius="curved"
          backgroundColor="background2"
          borderWidth="normal"
          borderStyle="solid"
          borderColor="border"
        >
          <Text variant="label-sm" color="tertiary">
            This {coinType.toLowerCase()} will be created when the proposal is executed
          </Text>
        </Box>
      )}
    </Stack>
  )

  return <AccordionItem title={title} description={description} />
}
