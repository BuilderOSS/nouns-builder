import { type DropInstanceData } from '@buildeross/hooks/useDropData'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useMediaType } from '@buildeross/hooks/useMediaType'
import { type CHAIN_ID } from '@buildeross/types'
import { AccordionItem } from '@buildeross/ui/Accordion'
import { Avatar } from '@buildeross/ui/Avatar'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { walletSnippet } from '@buildeross/utils/helpers'
import { atoms, Box, Button, Icon, Stack, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import { formatEther, maxUint32, maxUint64 } from 'viem'

import { linkStyle } from './DropItem.css'

interface DropItemProps {
  drop: DropInstanceData
  index: number
  isExecuted: boolean
  chainId: CHAIN_ID
}

const UINT_64_MAX = maxUint64
const UINT_32_MAX = maxUint32

export const DropItem = ({ drop, index, isExecuted, chainId }: DropItemProps) => {
  const { getDropLink } = useLinks()

  const { displayName: fundsRecipientName, ensAvatar: fundsRecipientAvatar } = useEnsData(
    drop.fundsRecipient
  )
  const dropLink = drop.address ? getDropLink(chainId, drop.address) : null

  // Get media type for animation_url if present
  const {
    mediaType,
    fetchableUrl: animationFetchableUrl,
    isLoading: isMediaTypeLoading,
  } = useMediaType(drop.animationUri, null)

  // Determine what media to show - prefer animation_url over image
  const shouldUseMediaPreview = drop.animationUri && mediaType && animationFetchableUrl
  const displayImageUrl = drop.imageUri

  // Format edition size
  const editionSizeDisplay = useMemo(() => {
    if (drop.editionSize === UINT_64_MAX) {
      return 'Unlimited'
    }
    return drop.editionSize.toString()
  }, [drop.editionSize])

  // Format max purchase per address
  const maxPurchaseDisplay = useMemo(() => {
    if (drop.maxSalePurchasePerAddress >= Number(UINT_32_MAX)) {
      return 'Unlimited'
    }
    return drop.maxSalePurchasePerAddress.toString()
  }, [drop.maxSalePurchasePerAddress])

  // Format sale dates
  const saleStartDate = useMemo(() => {
    return new Date(Number(drop.publicSaleStart) * 1000).toLocaleDateString('en-US')
  }, [drop.publicSaleStart])

  const saleEndDate = useMemo(() => {
    if (drop.publicSaleEnd >= UINT_64_MAX) {
      return 'Never'
    }
    return new Date(Number(drop.publicSaleEnd) * 1000).toLocaleDateString('en-US')
  }, [drop.publicSaleEnd])

  const fundsRecipientDisplay = fundsRecipientName || walletSnippet(drop.fundsRecipient)
  const title = (
    <Stack direction="row" align="center" gap="x2" wrap>
      <Text>
        Drop {index + 1}: {drop.symbol}
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
              alt={drop.name}
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

      {/* Drop Information */}
      <Stack gap="x2">
        <Stack direction="row" align="center" justify="space-between" wrap gap="x2">
          <Stack direction="row" align="center" gap="x2" flexShrink={0}>
            <Text variant="label-sm" color="tertiary">
              Name:
            </Text>
            <Text variant="label-sm">
              {drop.name} ({drop.symbol})
            </Text>
          </Stack>
          <Stack direction="row" align="center" gap="x2" flexShrink={0}>
            <Text variant="label-sm" color="tertiary">
              Funds Recipient:
            </Text>
            <Avatar address={drop.fundsRecipient} src={fundsRecipientAvatar} size="24" />
            <Box className={atoms({ textDecoration: 'underline' })}>
              <a href={`/profile/${drop.fundsRecipient}`}>
                <Text variant="label-sm">{fundsRecipientDisplay}</Text>
              </a>
            </Box>
          </Stack>
        </Stack>

        {drop.description && (
          <Stack direction="column" gap="x1">
            <Text variant="label-sm" color="tertiary">
              Description:
            </Text>
            <Text variant="paragraph-sm">{drop.description}</Text>
          </Stack>
        )}

        <Stack direction="row" align="center" justify="space-between" wrap gap="x2">
          <Stack direction="row" align="center" gap="x2" flexShrink={0}>
            <Text variant="label-sm" color="tertiary">
              Max Per Address:
            </Text>
            <Text variant="label-sm">{maxPurchaseDisplay}</Text>
          </Stack>
          <Stack direction="row" align="center" gap="x2" flexShrink={0}>
            <Text variant="label-sm" color="tertiary">
              Edition Size:
            </Text>
            <Text variant="label-sm">{editionSizeDisplay}</Text>
          </Stack>
        </Stack>
        <Stack direction="row" align="center" justify="space-between" wrap gap="x2">
          <Stack direction="row" align="center" gap="x2" flexShrink={0}>
            <Text variant="label-sm" color="tertiary">
              Price:
            </Text>
            <Text variant="label-sm">{formatEther(drop.publicSalePrice)} ETH</Text>
          </Stack>
          <Stack direction="row" align="center" gap="x2" flexShrink={0}>
            <Text variant="label-sm" color="tertiary">
              Royalty:
            </Text>
            <Text variant="label-sm">{(drop.royaltyBPS / 100).toFixed(2)}%</Text>
          </Stack>
        </Stack>

        <Stack direction="row" align="center" justify="space-between" wrap gap="x2">
          <Stack direction="row" align="center" gap="x2" flexShrink={0}>
            <Text variant="label-sm" color="tertiary">
              Sale Start:
            </Text>
            <Text variant="label-sm">{saleStartDate}</Text>
          </Stack>
          <Stack direction="row" align="center" gap="x2" flexShrink={0}>
            <Text variant="label-sm" color="tertiary">
              Sale End:
            </Text>
            <Text variant="label-sm">{saleEndDate}</Text>
          </Stack>
        </Stack>
      </Stack>

      {/* Executed state: Show link to drop page */}
      {isExecuted && dropLink && (
        <a href={dropLink.href} className={linkStyle} target="_blank" rel="noreferrer">
          <Button variant="secondary" size="sm">
            View Drop Page
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
            This drop will be created when the proposal is executed
          </Text>
        </Box>
      )}
    </Stack>
  )

  return <AccordionItem title={title} description={description} />
}
