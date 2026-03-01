import { BASE_URL } from '@buildeross/constants/baseUrl'
import type { GalleryItem } from '@buildeross/hooks/useGalleryItems'
import { useNowSeconds } from '@buildeross/hooks/useNowSeconds'
import { CHAIN_ID } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { ShareButton } from '@buildeross/ui/ShareButton'
import { StatBadge } from '@buildeross/ui/StatBadge'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import { useMemo } from 'react'

import { card, coinImage, tradeButtonContainer, typeBadge } from './Cards.css'

type DropItem = Extract<GalleryItem, { itemType: 'drop' }>

interface DropCardProps {
  drop: DropItem
  chainId: CHAIN_ID
  showTypeBadge?: boolean
  onMintClick: (drop: DropItem) => void
}

export const DropCard = ({
  drop,
  chainId,
  showTypeBadge = false,
  onMintClick,
}: DropCardProps) => {
  const { getDropLink } = useLinks()

  const shareUrl = useMemo(() => {
    const link = getDropLink(chainId, drop.id as `0x${string}`)
    return link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`
  }, [chainId, drop.id, getDropLink])

  // Check if drop is new (less than 7 days old)
  const isNew = drop.createdAt
    ? Date.now() / 1000 - parseInt(drop.createdAt) < 7 * 24 * 60 * 60
    : false

  const handleMintClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onMintClick?.(drop)
  }

  const now = useNowSeconds(true)

  const saleStartNum = Number(drop.publicSaleStart)
  const saleEndNum = Number(drop.publicSaleEnd)
  const saleStart = Number.isFinite(saleStartNum) ? saleStartNum : 0
  const saleEnd = Number.isFinite(saleEndNum) ? saleEndNum : 0
  const saleNotStarted = saleStart > 0 && saleStart > now
  const saleEnded = saleEnd > 0 && saleEnd < now
  const saleActive = !saleNotStarted && !saleEnded

  const getButtonText = () => {
    if (saleEnded) {
      return 'Sale Ended'
    }
    if (saleNotStarted) {
      return 'Sale Not Started'
    }
    return 'Mint'
  }

  const mintButtonText = getButtonText()

  return (
    <Flex
      direction="column"
      borderRadius={'curved'}
      height={'100%'}
      overflow={'hidden'}
      className={card}
    >
      <Link
        direction="column"
        link={getDropLink(chainId, drop.id as `0x${string}`)}
        style={{ cursor: 'pointer' }}
      >
        <Box
          backgroundColor="background2"
          width={'100%'}
          height={'auto'}
          aspectRatio={1 / 1}
          position="relative"
          overflow={'hidden'}
        >
          <Box w="100%" h="100%" aspectRatio={1 / 1} className={coinImage}>
            {drop.imageURI ? (
              <FallbackImage
                src={drop.imageURI}
                sizes="100vw"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt={`${drop.name} image`}
              />
            ) : (
              <Box backgroundColor="background2" w="100%" h="100%" />
            )}
          </Box>

          {/* New Badge */}
          {isNew && (
            <Box position="absolute" top="x3" left="x3">
              <StatBadge variant="positive">New</StatBadge>
            </Box>
          )}

          {/* Type Badge */}
          {showTypeBadge && (
            <Box className={typeBadge}>
              <StatBadge variant="default">Drop</StatBadge>
            </Box>
          )}
        </Box>

        <Box py="x2" px="x4" position={'relative'}>
          <Flex justify={'space-between'} align={'center'} gap="x2" w="100%">
            <Text
              variant="label-md"
              color="text1"
              style={{
                flex: 1,
                minWidth: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {drop.name}
            </Text>
          </Flex>
        </Box>
      </Link>

      <Flex
        className={tradeButtonContainer}
        direction="row"
        align="center"
        w="100%"
        justify="space-between"
        gap="x1"
        px="x4"
        pb="x2"
      >
        {shareUrl && <ShareButton url={shareUrl} size="sm" variant="ghost" />}
        <Button
          size="sm"
          variant="primary"
          style={{ flex: 1 }}
          onClick={handleMintClick}
          disabled={!saleActive}
        >
          {mintButtonText}
        </Button>
      </Flex>
    </Flex>
  )
}
