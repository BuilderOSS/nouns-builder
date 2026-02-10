import { useMediaType } from '@buildeross/hooks'
import { type IpfsMetadata } from '@buildeross/ipfs-service'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { Box, Flex, Text } from '@buildeross/zord'
import { Address } from 'viem'

import { coinHeader, coinImageContainer, stat } from './CoinDetail.css'

interface CoinInfoProps {
  name: string
  symbol: string
  image: string | null
  coinAddress: Address
  daoAddress: Address | null
  daoName: string | null
  chainSlug: string
  // Pool info
  pairedToken: Address | null
  pairedTokenSymbol: string | null
  poolFee: string | null
  // Metadata
  description: string | null
  uri: string | null
  metadata: IpfsMetadata | null
  createdAt: string | null
}

export const CoinInfo = ({
  name,
  symbol,
  image,
  coinAddress,
  daoAddress,
  daoName,
  chainSlug,
  pairedToken,
  pairedTokenSymbol,
  poolFee,
  description,
  uri,
  metadata,
  createdAt,
}: CoinInfoProps) => {
  // Get media type for animation_url if present
  const animationUrl = metadata?.animation_url
  const {
    mediaType,
    fetchableUrl: animationFetchableUrl,
    isLoading: isMediaTypeLoading,
  } = useMediaType(animationUrl, metadata)

  // Determine what media to show - prefer animation_url over image
  const shouldUseMediaPreview =
    animationUrl && mediaType && animationFetchableUrl && !isMediaTypeLoading

  return (
    <Box>
      {shouldUseMediaPreview ? (
        <Box w="100%" mb="x6">
          <MediaPreview
            mediaUrl={animationFetchableUrl}
            mediaType={mediaType}
            width="100%"
          />
        </Box>
      ) : image ? (
        <FallbackImage src={image} alt={name} style={{ width: '100%' }} />
      ) : null}
      {/* Header with image and basic info */}
      <Flex gap="x6" align="flex-start" className={coinHeader}>
        {image && shouldUseMediaPreview && (
          <Box className={coinImageContainer}>
            {image ? (
              <FallbackImage
                src={image}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : null}
          </Box>
        )}

        <Flex direction="column" gap="x2" flex={1}>
          <Text variant="heading-md">{name}</Text>
          <Text variant="heading-xs" color="text3">
            {symbol}
          </Text>
          <Text variant="paragraph-sm" color="text4" fontFamily="mono">
            {coinAddress.slice(0, 6)}...{coinAddress.slice(-4)}
          </Text>
        </Flex>
      </Flex>

      {/* DAO Link */}
      {daoAddress && daoName && (
        <Box className={stat}>
          <Text variant="label-sm" color="text3" mb="x1">
            Created by
          </Text>
          <Link link={`/dao/${chainSlug}/${daoAddress}`}>
            <Text variant="paragraph-md" color="accent">
              {daoName}
            </Text>
          </Link>
        </Box>
      )}

      {/* Description */}
      {description && (
        <Box className={stat}>
          <Text variant="label-sm" color="text3" mb="x1">
            Description
          </Text>
          <Text variant="paragraph-md" color="text1">
            {description}
          </Text>
        </Box>
      )}

      {/* Pool Information */}
      <Box className={stat}>
        <Text variant="label-md" mb="x3">
          Pool Information
        </Text>

        {pairedToken && (
          <Box mb="x3">
            <Text variant="label-sm" color="text3" mb="x1">
              Paired Token
            </Text>
            <Text variant="paragraph-sm" color="text1" fontFamily="mono">
              {pairedTokenSymbol || pairedToken}
            </Text>
          </Box>
        )}

        {poolFee && (
          <Box mb="x3">
            <Text variant="label-sm" color="text3" mb="x1">
              Pool Fee
            </Text>
            <Text variant="paragraph-sm" color="text1">
              {poolFee}
            </Text>
          </Box>
        )}

        <Box mb="x3">
          <Text variant="label-sm" color="text3" mb="x1">
            Contract Address
          </Text>
          <Text variant="paragraph-sm" color="text1" fontFamily="mono">
            {coinAddress}
          </Text>
        </Box>
      </Box>

      {/* Metadata */}
      {(uri || createdAt) && (
        <Box className={stat}>
          <Text variant="label-md" mb="x3">
            Metadata
          </Text>

          {uri && (
            <Box mb="x3">
              <Text variant="label-sm" color="text3" mb="x1">
                IPFS URI
              </Text>
              <Text
                variant="paragraph-sm"
                color="text1"
                style={{ wordBreak: 'break-all' }}
              >
                {uri}
              </Text>
            </Box>
          )}

          {createdAt && (
            <Box>
              <Text variant="label-sm" color="text3" mb="x1">
                Created
              </Text>
              <Text variant="paragraph-sm" color="text1">
                {new Date(parseInt(createdAt) * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
