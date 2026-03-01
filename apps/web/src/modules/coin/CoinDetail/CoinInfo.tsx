import { BASE_URL } from '@buildeross/constants/baseUrl'
import {
  useClankerTokenWithPrice,
  useEnsData,
  useMediaType,
  useProposalByExecutionTx,
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
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { ShareButton } from '@buildeross/ui/ShareButton'
import { DEFAULT_CLANKER_TOTAL_SUPPLY } from '@buildeross/utils/coining/clankerCreator'
import { DEFAULT_ZORA_TOTAL_SUPPLY } from '@buildeross/utils/coining/zoraContent'
import { formatMarketCap, formatSupply } from '@buildeross/utils/formatMarketCap'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Grid, Icon, Spinner, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import { Address } from 'viem'

import { ProposalLink } from '../../../components/ProposalLink'
import { CoinComments } from './CoinComments'
import { coinHeader, coinImageContainer, onlyDesktop, statsGrid } from './CoinDetail.css'

interface CoinInfoProps {
  name: string
  symbol: string
  image: string | null
  coinAddress: Address
  daoAddress: Address | null
  daoName: string | null
  daoImage: string | null
  chainId: number
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
  transactionHash: string | null
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
  daoImage,
  chainId,
  pairedToken,
  // pairedTokenSymbol,
  // poolFee,
  description,
  // uri,
  metadata,
  createdAt,
  creatorAddress,
  transactionHash,
  isClankerToken,
  clankerToken,
  zoraCoin,
}: CoinInfoProps) => {
  const { getCoinLink, getDaoLink } = useLinks()

  // Fetch proposal by execution transaction hash
  const { data: proposal } = useProposalByExecutionTx({
    chainId: chainId as CHAIN_ID,
    executionTransactionHash: transactionHash || undefined,
    enabled: !!transactionHash,
  })

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

  // Fetch proposer ENS data
  const { displayName: proposerDisplayName, ensAvatar: proposerAvatar } = useEnsData(
    (proposal?.proposer ?? undefined) as Address | undefined
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

  const shareUrl = useMemo(() => {
    const link = getCoinLink(chainId as CHAIN_ID, coinAddress)
    return link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`
  }, [chainId, coinAddress, getCoinLink])

  return (
    <Box>
      <Box w="100%" mb="x3">
        {/* Media Display */}
        {shouldUseMediaPreview ? (
          <Box w="100%" borderRadius="curved" overflow="hidden">
            <MediaPreview
              mediaUrl={animationFetchableUrl}
              coverUrl={image ?? undefined}
              mediaType={mediaType}
              width="100%"
            />
          </Box>
        ) : image ? (
          <Box w="100%" borderRadius="curved" overflow="hidden">
            <FallbackImage src={image} alt={name} style={{ width: '100%' }} />
          </Box>
        ) : null}
      </Box>

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
          <Flex align="center" gap="x2" justify="space-between">
            <Text variant="heading-md">{name}</Text>
            <ShareButton
              url={shareUrl}
              size="md"
              variant="ghost"
              className={onlyDesktop}
            />
          </Flex>
          <Flex align="center" gap="x2">
            <Text variant="heading-xs" color="text3">
              {symbol}
            </Text>
          </Flex>
        </Flex>
      </Flex>

      {proposal?.proposer ? (
        <Box mb="x3">
          {/* Proposer */}
          <Text variant="label-sm" color="text3" mb="x2">
            Created by
          </Text>
          <Flex align="center">
            <Avatar
              address={proposal.proposer as Address}
              src={proposerAvatar}
              size="28"
            />
            <Text fontWeight="display" ml="x2">
              {proposerDisplayName || walletSnippet(proposal.proposer as Address)}
            </Text>
          </Flex>
        </Box>
      ) : (
        <Box mb="x3">
          {/* Creator */}
          <Text variant="label-sm" color="text3" mb="x2">
            Created by
          </Text>
          <Flex align="center">
            <Avatar address={creatorAddress as Address} src={creatorAvatar} size="28" />
            <Text fontWeight="display" ml="x2">
              {creatorDisplayName || walletSnippet(creatorAddress as Address)}
            </Text>
          </Flex>
        </Box>
      )}

      {/* Market Cap, Total Supply - 2 column grid */}
      <Grid className={statsGrid} mb="x3">
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
          <Box mb="x3">
            <Text variant="label-sm" color="text3" mb="x2">
              Paired With
            </Text>
            <ContractLink address={pairedToken} chainId={chainId as CHAIN_ID} size="sm" />
          </Box>
        </>
      )}

      {/* Contract */}
      <Box mb="x3">
        <Text variant="label-sm" color="text3" mb="x2">
          Contract
        </Text>
        <ContractLink address={coinAddress} chainId={chainId as CHAIN_ID} size="sm" />
      </Box>

      {/* DAO */}
      {daoAddress && daoName && (
        <>
          <Box mb="x3">
            <Text variant="label-sm" color="text3" mb="x2">
              DAO
            </Text>
            <Link link={getDaoLink(chainId, daoAddress)} isExternal>
              <Button
                variant="secondaryAccent"
                size="md"
                px="x4"
                gap="x2"
                style={{ fontSize: '14px' }}
              >
                {daoImage && (
                  <Box flexShrink={0}>
                    <FallbackImage
                      src={daoImage}
                      style={{ borderRadius: '100%', objectFit: 'contain' }}
                      alt={daoName}
                      height={32}
                      width={32}
                    />
                  </Box>
                )}
                {daoName}
                <Icon id="arrowTopRight" />
              </Button>
            </Link>
          </Box>
        </>
      )}

      {/* Proposal */}
      {proposal && <ProposalLink proposal={proposal} chainId={chainId} />}

      {/* Description */}
      {description && (
        <>
          <Box mb="x3">
            <Text variant="label-sm" color="text3" mb="x2">
              Description
            </Text>
            <Text variant="paragraph-md" color="text1">
              {description}
            </Text>
          </Box>
        </>
      )}

      {/* Created Date */}
      {createdAt && (
        <>
          <Box mb="x3">
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
        </>
      )}

      {/* Comments - Only for Zora Coins */}
      {!isClankerToken && chainId !== CHAIN_ID.BASE_SEPOLIA && (
        <CoinComments coinAddress={coinAddress} chainId={chainId} />
      )}
    </Box>
  )
}
