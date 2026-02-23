import { type CoinInstanceData } from '@buildeross/hooks/useCoinData'
import { useIpfsMetadata } from '@buildeross/hooks/useIpfsMetadata'
import { useMediaType } from '@buildeross/hooks/useMediaType'
import { type CHAIN_ID } from '@buildeross/types'
import { AccordionItem } from '@buildeross/ui/Accordion'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { Box, Button, Grid, Icon, Stack, Text } from '@buildeross/zord'
import { useMemo } from 'react'

import { gridStyle, linkStyle } from './CoinItem.css'

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
  }, [coin, ipfsMetadata, ipfsImageUrl, ipfsAnimationUrl])

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
      {coin.isContentCoin && (
        <Box
          backgroundColor="accent"
          px="x2"
          py="x1"
          borderRadius="curved"
          display="inline-block"
        >
          <Text variant="label-sm" color="primary">
            Zora
          </Text>
        </Box>
      )}
      {!coin.isContentCoin && (
        <Box
          backgroundColor="secondary"
          px="x2"
          py="x1"
          borderRadius="curved"
          display="inline-block"
        >
          <Text variant="label-sm" color="primary">
            Clanker
          </Text>
        </Box>
      )}
    </Stack>
  )

  const description = (
    <Stack gap="x3">
      <Grid gap="x3" className={gridStyle}>
        {/* Left column: Coin Information */}
        <Stack gap="x2" flex="1">
          <Stack direction="row" align="center" gap="x2">
            <Text variant="label-sm" color="tertiary">
              Name:
            </Text>
            <Text variant="label-sm">{metadata.name}</Text>
          </Stack>

          <Stack direction="row" align="center" gap="x2">
            <Text variant="label-sm" color="tertiary">
              Symbol:
            </Text>
            <Text variant="label-sm">{metadata.symbol}</Text>
          </Stack>

          {metadata.description && (
            <Stack direction="column" gap="x1">
              <Text variant="label-sm" color="tertiary">
                Description:
              </Text>
              <Text variant="paragraph-sm">{metadata.description}</Text>
            </Stack>
          )}

          {isExecuted && coin.address && (
            <Stack direction="row" align="center" gap="x2">
              <Text variant="label-sm" color="tertiary">
                Address:
              </Text>
              <Text variant="label-sm" style={{ wordBreak: 'break-all' }}>
                {coin.address}
              </Text>
            </Stack>
          )}
        </Stack>

        {/* Right column: Media Preview */}
        {(shouldUseMediaPreview || displayImageUrl) && !isMediaTypeLoading && (
          <Box
            flex="1"
            borderRadius="curved"
            backgroundColor="background2"
            overflow="hidden"
            style={{ aspectRatio: '1/1' }}
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
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : null}
          </Box>
        )}
      </Grid>

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
