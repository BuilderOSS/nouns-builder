import { BASE_URL } from '@buildeross/constants/baseUrl'
import { useEnsData, useMediaType } from '@buildeross/hooks'
import { type ZoraDropFragment } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { ContractLink } from '@buildeross/ui/ContractLink'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { ShareButton } from '@buildeross/ui/ShareButton'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Flex, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import { Address, formatEther } from 'viem'

import { dropHeader, dropImageContainer, onlyDesktop } from './DropDetail.css'

interface DropInfoProps {
  drop: ZoraDropFragment
  daoAddress: Address | null
  daoName: string | null
  chainId: number
  chainSlug: string
}

export const DropInfo = ({
  drop,
  daoAddress,
  daoName,
  chainId,
  chainSlug,
}: DropInfoProps) => {
  const { getDropLink } = useLinks()

  // Fetch creator ENS data
  const { displayName: creatorDisplayName, ensAvatar: creatorAvatar } = useEnsData(
    drop.creator as Address
  )

  // Get media type for animation_url if present
  const {
    mediaType,
    fetchableUrl: animationFetchableUrl,
    isLoading: isMediaTypeLoading,
  } = useMediaType(drop.animationURI, null)

  // Determine what media to show - prefer animation_url over image
  const shouldUseMediaPreview =
    drop.animationURI && mediaType && animationFetchableUrl && !isMediaTypeLoading

  const shareUrl = useMemo(() => {
    const link = getDropLink(chainId as CHAIN_ID, drop.id as Address)
    return link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`
  }, [chainId, drop.id, getDropLink])

  const priceEth = formatEther(BigInt(drop.publicSalePrice))

  return (
    <Box>
      {/* Media Display */}
      {shouldUseMediaPreview ? (
        <Box w="100%" mb="x3" borderRadius="curved" overflow="hidden">
          <MediaPreview
            mediaUrl={animationFetchableUrl}
            mediaType={mediaType}
            coverUrl={drop.imageURI}
            width="100%"
          />
        </Box>
      ) : drop.imageURI ? (
        <Box mb="x3" borderRadius="curved" overflow="hidden">
          <FallbackImage src={drop.imageURI} alt={drop.name} style={{ width: '100%' }} />
        </Box>
      ) : null}

      {/* Header with image and basic info */}
      <Flex gap="x6" align="flex-start" className={dropHeader}>
        {drop.imageURI && shouldUseMediaPreview && (
          <Box className={dropImageContainer}>
            <FallbackImage
              src={drop.imageURI}
              alt={drop.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        )}

        <Flex direction="column" gap="x2" flex={1}>
          <Flex align="center" gap="x2" justify="space-between">
            <Text variant="heading-md">{drop.name}</Text>
            <ShareButton
              url={shareUrl}
              size="md"
              variant="ghost"
              className={onlyDesktop}
            />
          </Flex>
          <Flex align="center" gap="x2">
            <Text variant="heading-xs" color="text3">
              {drop.symbol}
            </Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Creator */}
      <Box mb="x3">
        <Text variant="label-sm" color="text3" mb="x2">
          Created by
        </Text>
        <Flex align="center">
          <Avatar address={drop.creator as Address} src={creatorAvatar} size="28" />
          <Text fontWeight="display" ml="x2">
            {creatorDisplayName || walletSnippet(drop.creator as Address)}
          </Text>
        </Flex>
      </Box>

      {/* Price */}
      <Box mb="x3">
        <Text variant="label-sm" color="text3" mb="x2">
          Price
        </Text>
        <Text variant="heading-sm">
          {Number(priceEth) === 0 ? 'Free' : `${priceEth} ETH`}
        </Text>
      </Box>

      {/* Funds Recipient */}
      <Box mb="x3">
        <Text variant="label-sm" color="text3" mb="x2">
          Funds Recipient
        </Text>
        <ContractLink
          address={drop.fundsRecipient as Address}
          chainId={chainId as CHAIN_ID}
          size="sm"
        />
      </Box>

      {/* Contract */}
      <Box mb="x3">
        <Text variant="label-sm" color="text3" mb="x2">
          Drop Contract
        </Text>
        <ContractLink
          address={drop.id as Address}
          chainId={chainId as CHAIN_ID}
          size="sm"
        />
      </Box>

      {/* Metadata Renderer */}
      <Box mb="x3">
        <Text variant="label-sm" color="text3" mb="x2">
          Metadata Renderer
        </Text>
        <ContractLink
          address={drop.metadataRenderer as Address}
          chainId={chainId as CHAIN_ID}
          size="sm"
        />
      </Box>

      {/* DAO */}
      {daoAddress && daoName && (
        <>
          <Box mb="x3">
            <Text variant="label-sm" color="text3" mb="x2">
              DAO
            </Text>
            <Link link={`/dao/${chainSlug}/${daoAddress}`}>
              <Text variant="paragraph-md" color="accent">
                {daoName}
              </Text>
            </Link>
          </Box>
        </>
      )}

      {/* Description */}
      {drop.description && (
        <>
          <Box mb="x3">
            <Text variant="label-sm" color="text3" mb="x2">
              Description
            </Text>
            <Text variant="paragraph-md" color="text1">
              {drop.description}
            </Text>
          </Box>
        </>
      )}

      {/* Royalty */}
      <Box mb="x3">
        <Text variant="label-sm" color="text3" mb="x2">
          Royalty
        </Text>
        <Text variant="paragraph-md" color="text1">
          {drop.royaltyBPS / 100}%
        </Text>
      </Box>

      {/* Created Date */}
      <Box mb="x3">
        <Text variant="label-sm" color="text3" mb="x2">
          Created
        </Text>
        <Text variant="paragraph-md" color="text1">
          {new Date(parseInt(drop.createdAt) * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </Box>
    </Box>
  )
}
