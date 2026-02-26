import { BASE_URL } from '@buildeross/constants/baseUrl'
import { CHAIN_ID } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { ShareButton } from '@buildeross/ui/ShareButton'
import { StatBadge } from '@buildeross/ui/StatBadge'
import { Box, Flex, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import { Address } from 'viem'

import { card, coinImage, typeBadge } from './Cards.css'

interface DropCardProps {
  chainId: CHAIN_ID
  dropAddress: Address
  name: string
  symbol: string
  imageURI?: string
  editionSize?: string
  createdAt?: string
  showTypeBadge?: boolean
}

export const DropCard = ({
  chainId,
  dropAddress,
  name,
  // symbol,
  imageURI,
  createdAt,
  showTypeBadge = false,
}: DropCardProps) => {
  const { getDropLink } = useLinks()

  const shareUrl = useMemo(() => {
    const link = getDropLink(chainId, dropAddress)
    return link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`
  }, [chainId, dropAddress, getDropLink])

  // Check if drop is new (less than 7 days old)
  const isNew = createdAt
    ? Date.now() / 1000 - parseInt(createdAt) < 7 * 24 * 60 * 60
    : false

  return (
    <Link
      direction="column"
      link={getDropLink(chainId, dropAddress)}
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
        {imageURI ? (
          <FallbackImage
            src={imageURI}
            sizes="100vw"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt={`${name} image`}
          />
        ) : (
          <Box backgroundColor="background2" w="100%" h="100%" />
        )}

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

      <Box py="x2" px="x4" position={'relative'} overflow={'hidden'}>
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
            {name}
          </Text>
          {shareUrl && <ShareButton url={shareUrl} size="sm" variant="ghost" />}
        </Flex>
      </Box>
    </Link>
  )
}
