import {
  useClankerTokenWithPrice,
  useEnsData,
  useMediaType,
  useZoraCoinWithPrice,
} from '@buildeross/hooks'
import { type IpfsMetadata } from '@buildeross/ipfs-service'
import {
  type ClankerTokenFragment,
  type ZoraCoinFragment,
} from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { ContractLink } from '@buildeross/ui/ContractLink'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { StatBadge } from '@buildeross/ui/StatBadge'
import {
  formatMarketCap,
  formatPrice,
  formatSupply,
} from '@buildeross/utils/formatMarketCap'
import { walletSnippet } from '@buildeross/utils/helpers'
import { DEFAULT_CLANKER_TOTAL_SUPPLY } from '@buildeross/utils/poolConfig/clankerCreator'
import { DEFAULT_ZORA_TOTAL_SUPPLY } from '@buildeross/utils/poolConfig/zoraContent'
import { Box, Flex, Grid, Spinner, Text } from '@buildeross/zord'
import { Address } from 'viem'

import {
  coinHeader,
  coinImageContainer,
  sectionDivider,
  statsGrid,
} from './CoinDetail.css'

interface CoinInfoProps {
  name: string
  symbol: string
  image: string | null
  coinAddress: Address
  daoAddress: Address | null
  daoName: string | null
  chainId: number
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
  creatorAddress: Address | null
  // Coin type
  isClankerToken?: boolean
  // Optional: pass the full coin/token data for price fetching
  clankerToken?: ClankerTokenFragment | null
  zoraCoin?: ZoraCoinFragment | null
}

export const CoinInfo = ({
  name,
  symbol,
  image,
  coinAddress,
  daoAddress,
  daoName,
  chainId,
  chainSlug,
  pairedToken,
  // pairedTokenSymbol,
  // poolFee,
  description,
  // uri,
  metadata,
  createdAt,
  creatorAddress,
  isClankerToken,
  clankerToken,
  zoraCoin,
}: CoinInfoProps) => {
  // Fetch price data
  const clankerWithPrice = useClankerTokenWithPrice({
    clankerToken: isClankerToken ? clankerToken : null,
    chainId: chainId as CHAIN_ID,
    enabled: !!isClankerToken && !!clankerToken,
  })

  const zoraCoinWithPrice = useZoraCoinWithPrice({
    zoraCoin: !isClankerToken ? zoraCoin : null,
    chainId: chainId as CHAIN_ID,
    enabled: !isClankerToken && !!zoraCoin,
  })

  const priceUsd = isClankerToken ? clankerWithPrice.priceUsd : zoraCoinWithPrice.priceUsd
  const marketCap = isClankerToken
    ? clankerWithPrice.marketCap
    : zoraCoinWithPrice.marketCap
  const isLoadingPrice = isClankerToken
    ? clankerWithPrice.isLoadingPrice
    : zoraCoinWithPrice.isLoadingPrice

  // Fetch creator ENS data
  const { displayName: creatorDisplayName, ensAvatar: creatorAvatar } = useEnsData(
    creatorAddress || undefined
  )

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

  const totalSupply = isClankerToken
    ? DEFAULT_CLANKER_TOTAL_SUPPLY
    : DEFAULT_ZORA_TOTAL_SUPPLY

  return (
    <Box>
      {/* Media Display */}
      {shouldUseMediaPreview ? (
        <Box w="100%" mb="x6" borderRadius="curved" overflow="hidden">
          <MediaPreview
            mediaUrl={animationFetchableUrl}
            mediaType={mediaType}
            width="100%"
          />
        </Box>
      ) : image ? (
        <Box mb="x6" borderRadius="curved" overflow="hidden">
          <FallbackImage src={image} alt={name} style={{ width: '100%' }} />
        </Box>
      ) : null}

      {/* Header with image and basic info */}
      <Flex gap="x6" align="flex-start" className={coinHeader}>
        {image && shouldUseMediaPreview && (
          <Box className={coinImageContainer}>
            <FallbackImage
              src={image}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        )}

        <Flex direction="column" gap="x2" flex={1}>
          <Text variant="heading-md">{name}</Text>
          <Flex align="center" gap="x2">
            <Text variant="heading-xs" color="text3">
              {symbol}
            </Text>
            {marketCap !== null && marketCap !== undefined && (
              <StatBadge variant="accent">
                {isLoadingPrice ? <Spinner size="sm" /> : formatMarketCap(marketCap)}
              </StatBadge>
            )}
          </Flex>
        </Flex>
      </Flex>

      <Box className={sectionDivider} />

      {/* Creator */}
      {creatorAddress && (
        <>
          <Box mb="x6">
            <Text variant="label-sm" color="text3" mb="x2">
              Created by
            </Text>
            <Flex align="center">
              <Avatar address={creatorAddress} src={creatorAvatar} size="28" />
              <Text fontWeight="display" ml="x2">
                {creatorDisplayName || walletSnippet(creatorAddress)}
              </Text>
            </Flex>
          </Box>
          <Box className={sectionDivider} />
        </>
      )}

      {/* Price, Market Cap, Total Supply - 3 column grid */}
      <Grid className={statsGrid} mb="x6">
        <Box>
          <Text variant="label-sm" color="text3" mb="x2">
            Price
          </Text>
          <Text variant="heading-sm">
            {isLoadingPrice ? <Spinner size="sm" /> : formatPrice(priceUsd)}
          </Text>
        </Box>
        <Box>
          <Text variant="label-sm" color="text3" mb="x2">
            Market Cap
          </Text>
          <Text variant="heading-sm">
            {isLoadingPrice ? <Spinner size="sm" /> : formatMarketCap(marketCap)}
          </Text>
        </Box>
        <Box>
          <Text variant="label-sm" color="text3" mb="x2">
            Total Supply
          </Text>
          <Text variant="heading-sm">{formatSupply(totalSupply)}</Text>
        </Box>
      </Grid>

      {/* Paired With */}
      {pairedToken && (
        <>
          <Box mb="x6">
            <Text variant="label-sm" color="text3" mb="x2">
              Paired With
            </Text>
            <ContractLink address={pairedToken} chainId={chainId as CHAIN_ID} size="sm" />
          </Box>
          <Box className={sectionDivider} />
        </>
      )}

      <Box className={sectionDivider} />

      {/* Contract */}
      <Box mb="x6">
        <Text variant="label-sm" color="text3" mb="x2">
          Contract
        </Text>
        <ContractLink address={coinAddress} chainId={chainId as CHAIN_ID} size="sm" />
      </Box>

      <Box className={sectionDivider} />

      {/* DAO */}
      {daoAddress && daoName && (
        <>
          <Box mb="x6">
            <Text variant="label-sm" color="text3" mb="x2">
              DAO
            </Text>
            <Link link={`/dao/${chainSlug}/${daoAddress}`}>
              <Text variant="paragraph-md" color="accent">
                {daoName}
              </Text>
            </Link>
          </Box>
          <Box className={sectionDivider} />
        </>
      )}

      {/* Description */}
      {description && (
        <>
          <Box mb="x6">
            <Text variant="label-sm" color="text3" mb="x2">
              Description
            </Text>
            <Text variant="paragraph-md" color="text1">
              {description}
            </Text>
          </Box>
          <Box className={sectionDivider} />
        </>
      )}

      {/* Created Date */}
      {createdAt && (
        <Box mb="x6">
          <Text variant="label-sm" color="text3" mb="x2">
            Created
          </Text>
          <Text variant="paragraph-md" color="text1">
            {new Date(parseInt(createdAt) * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Box>
      )}
    </Box>
  )
}
