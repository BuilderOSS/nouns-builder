import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { useIpfsMetadata, useMediaType } from '@buildeross/hooks'
import { CHAIN_ID } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { Box, Flex, Text } from '@buildeross/zord'
import { Address } from 'viem'

import { card, coinImage, coinInfo } from './Coins.css'

interface CoinCardProps {
  chainId: CHAIN_ID
  coinAddress: Address
  name: string
  symbol: string
  image?: string // This is the IPFS URI
  price?: string
  priceUsd?: string
}

export const CoinCard = ({
  chainId,
  coinAddress,
  name,
  symbol,
  image,
  price,
  priceUsd,
}: CoinCardProps) => {
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

  return (
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

        {price && (
          <Flex justify={'space-between'} align={'center'}>
            <Text variant="paragraph-sm" color="text3">
              Price
            </Text>
            <Text variant="paragraph-sm" color="text1">
              {price}
            </Text>
          </Flex>
        )}

        {priceUsd && (
          <Text variant="paragraph-sm" color="text3">
            ${priceUsd}
          </Text>
        )}
      </Box>
    </Link>
  )
}
