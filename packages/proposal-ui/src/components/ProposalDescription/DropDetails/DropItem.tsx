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
import { atoms, Box, Button, Grid, Icon, Stack, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import { formatEther } from 'viem'

import { gridStyle, linkStyle } from './DropItem.css'

interface DropItemProps {
  drop: DropInstanceData
  index: number
  isExecuted: boolean
  chainId: CHAIN_ID
}

const UINT_64_MAX = BigInt('18446744073709551615')
const UINT_32_MAX = BigInt('4294967295')

export const DropItem = ({ drop, index, isExecuted, chainId }: DropItemProps) => {
  const { getDropLink } = useLinks()

  const { displayName: fundsRecipientName, ensAvatar: fundsRecipientAvatar } = useEnsData(
    drop.fundsRecipient
  )
  const { displayName: adminName, ensAvatar: adminAvatar } = useEnsData(drop.defaultAdmin)

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
    return new Date(Number(drop.publicSaleEnd) * 1000).toLocaleDateString('en-US')
  }, [drop.publicSaleEnd])

  const fundsRecipientDisplay = fundsRecipientName || walletSnippet(drop.fundsRecipient)
  const adminDisplay = adminName || walletSnippet(drop.defaultAdmin)

  const title = (
    <Stack direction="row" align="center" gap="x2" flexWrap="wrap">
      <Text>
        Zora Drop {index + 1}: {drop.symbol}
      </Text>
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
    </Stack>
  )

  const description = (
    <Stack gap="x3">
      <Grid gap="x3" className={gridStyle}>
        {/* Left column: Drop Information */}
        <Stack gap="x2" flex="1">
          <Stack direction="row" align="center" gap="x2">
            <Text variant="label-sm" color="tertiary">
              Name:
            </Text>
            <Text variant="label-sm">{drop.name}</Text>
          </Stack>

          <Stack direction="row" align="center" gap="x2">
            <Text variant="label-sm" color="tertiary">
              Symbol:
            </Text>
            <Text variant="label-sm">{drop.symbol}</Text>
          </Stack>

          {drop.description && (
            <Stack direction="column" gap="x1">
              <Text variant="label-sm" color="tertiary">
                Description:
              </Text>
              <Text variant="paragraph-sm">{drop.description}</Text>
            </Stack>
          )}

          <Stack direction="row" align="center" gap="x2">
            <Text variant="label-sm" color="tertiary">
              Edition Size:
            </Text>
            <Text variant="label-sm">{editionSizeDisplay}</Text>
          </Stack>

          <Stack direction="row" align="center" gap="x2">
            <Text variant="label-sm" color="tertiary">
              Royalty:
            </Text>
            <Text variant="label-sm">{(drop.royaltyBPS / 100).toFixed(2)}%</Text>
          </Stack>

          <Stack direction="row" align="center" gap="x2">
            <Text variant="label-sm" color="tertiary">
              Price:
            </Text>
            <Text variant="label-sm">{formatEther(drop.publicSalePrice)} ETH</Text>
          </Stack>

          <Stack direction="row" align="center" gap="x2">
            <Text variant="label-sm" color="tertiary">
              Max Per Address:
            </Text>
            <Text variant="label-sm">{maxPurchaseDisplay}</Text>
          </Stack>

          <Stack direction="row" align="center" justify="space-between" flexWrap="wrap">
            <Stack direction="row" align="center" gap="x2">
              <Text variant="label-sm" color="tertiary">
                Sale Start:
              </Text>
              <Text variant="label-sm">{saleStartDate}</Text>
            </Stack>
            <Stack direction="row" align="center" gap="x2">
              <Text variant="label-sm" color="tertiary">
                Sale End:
              </Text>
              <Text variant="label-sm">{saleEndDate}</Text>
            </Stack>
          </Stack>

          <Stack direction="column" gap="x2">
            <Stack direction="row" align="center" gap="x2">
              <Text variant="label-sm" color="tertiary">
                Funds Recipient:
              </Text>
              <Avatar
                address={drop.fundsRecipient}
                src={fundsRecipientAvatar}
                size="24"
              />
              <Box className={atoms({ textDecoration: 'underline' })}>
                <a href={`/profile/${drop.fundsRecipient}`}>
                  <Text variant="label-sm">{fundsRecipientDisplay}</Text>
                </a>
              </Box>
            </Stack>

            <Stack direction="row" align="center" gap="x2">
              <Text variant="label-sm" color="tertiary">
                Admin:
              </Text>
              <Avatar address={drop.defaultAdmin} src={adminAvatar} size="24" />
              <Box className={atoms({ textDecoration: 'underline' })}>
                <a href={`/profile/${drop.defaultAdmin}`}>
                  <Text variant="label-sm">{adminDisplay}</Text>
                </a>
              </Box>
            </Stack>
          </Stack>

          {isExecuted && drop.address && (
            <Stack direction="row" align="center" gap="x2">
              <Text variant="label-sm" color="tertiary">
                Address:
              </Text>
              <Text variant="label-sm" style={{ wordBreak: 'break-all' }}>
                {drop.address}
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
                alt={drop.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : null}
          </Box>
        )}
      </Grid>

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
