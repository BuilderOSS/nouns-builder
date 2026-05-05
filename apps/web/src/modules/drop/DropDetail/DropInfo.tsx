import { BASE_URL } from '@buildeross/constants/baseUrl'
import { useEnsData, useMediaType, useProposalByExecutionTx } from '@buildeross/hooks'
import { type ZoraDropFragment } from '@buildeross/sdk/subgraph'
import { useDaoStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { ContractLink } from '@buildeross/ui/ContractLink'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { ShareButton } from '@buildeross/ui/ShareButton'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import { Address, formatEther, isAddressEqual } from 'viem'

import { HoldersSection } from '../../../components/HoldersSection'
import { ProposalLink } from '../../../components/ProposalLink'
import { dropHeader, dropImageContainer, onlyDesktop } from './DropDetail.css'

interface DropInfoProps {
  drop: ZoraDropFragment
  daoAddress: Address | null
  daoName: string | null
  daoImage: string | null
  chainId: number
  transactionHash: string | null
  holders?: Array<{
    holder: `0x${string}`
    balance: string
    totalSpent?: string
    totalPurchased?: string
  }>
}

export const DropInfo = ({
  drop,
  daoAddress,
  daoName,
  daoImage,
  chainId,
  transactionHash,
  holders,
}: DropInfoProps) => {
  const { getDropLink, getDaoLink } = useLinks()
  const { treasury } = useDaoStore((state) => state.addresses)

  // Fetch proposal by execution transaction hash
  const { data: proposal } = useProposalByExecutionTx({
    chainId: chainId as CHAIN_ID,
    executionTransactionHash: transactionHash || undefined,
    enabled: !!transactionHash,
  })

  // Fetch creator ENS data
  const { displayName: creatorDisplayName, ensAvatar: creatorAvatar } = useEnsData(
    drop.creator as Address
  )

  // Fetch proposer ENS data
  const { displayName: proposerDisplayName, ensAvatar: proposerAvatar } = useEnsData(
    (proposal?.proposer ?? undefined) as Address | undefined
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

  const priceEth = formatEther(BigInt(drop.publicSalePrice || '0'))

  const isTreasuryFundsRecipient = treasury
    ? isAddressEqual(drop.fundsRecipient, treasury)
    : false

  return (
    <Box>
      <Box w="100%" mb="x3">
        {/* Media Display */}
        {shouldUseMediaPreview ? (
          <Box w="100%" borderRadius="curved" overflow="hidden">
            <MediaPreview
              mediaUrl={animationFetchableUrl}
              mediaType={mediaType}
              coverUrl={drop.imageURI}
              width="100%"
            />
          </Box>
        ) : drop.imageURI ? (
          <Box w="100%" borderRadius="curved" overflow="hidden">
            <FallbackImage
              src={drop.imageURI}
              alt={drop.name}
              style={{ width: '100%' }}
            />
          </Box>
        ) : null}
      </Box>

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

      {proposal?.proposer ? (
        <Box mb="x3">
          {/* Proposer */}
          <Text variant="label-sm" color="text3" mb="x2">
            Created by
          </Text>
          <WalletIdentityWithPreview
            address={proposal.proposer as Address}
            displayName={proposerDisplayName}
            avatarSrc={proposerAvatar}
            avatarSize="28"
            mobileTapBehavior="toggle"
          />
        </Box>
      ) : (
        <Box mb="x3">
          {/* Creator */}
          <Text variant="label-sm" color="text3" mb="x2">
            Created by
          </Text>
          <WalletIdentityWithPreview
            address={drop.creator as Address}
            displayName={creatorDisplayName}
            avatarSrc={creatorAvatar}
            avatarSize="28"
            mobileTapBehavior="toggle"
          />
        </Box>
      )}

      {/* Price */}
      <Box mb="x3">
        <Text variant="label-sm" color="text3" mb="x2">
          Price
        </Text>
        <Text variant="heading-sm">
          {Number(priceEth) === 0 ? 'Free' : `${priceEth} ETH`}
        </Text>
      </Box>

      {/* Contract */}
      <Box mb="x3">
        <Text variant="label-sm" color="text3" mb="x2">
          Contract
        </Text>
        <ContractLink
          address={drop.id as Address}
          chainId={chainId as CHAIN_ID}
          size="sm"
          isToken
        />
      </Box>

      {!isTreasuryFundsRecipient && (
        <Box mb="x3">
          {/* Funds Recipient */}
          <Text variant="label-sm" color="text3" mb="x2">
            Funds Recipient
          </Text>
          <ContractLink
            address={drop.fundsRecipient as Address}
            chainId={chainId as CHAIN_ID}
            size="sm"
          />
        </Box>
      )}

      {/* DAO */}
      {daoAddress && daoName && (
        <>
          <Box mb="x3">
            <Text variant="label-sm" color="text3" mb="x2">
              {isTreasuryFundsRecipient ? 'DAO & Funds Recipient' : 'DAO'}
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
                      height={24}
                      width={24}
                    />
                  </Box>
                )}
                {daoName}
                <Icon id="arrow-top-right" />
              </Button>
            </Link>
          </Box>
        </>
      )}

      {/* Proposal */}
      {proposal && <ProposalLink proposal={proposal} chainId={chainId} />}

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
          {Number(drop.royaltyBPS ?? 0) / 100}%
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

      {/* Holders */}
      {holders && holders.length > 0 && (
        <HoldersSection holders={holders} title="Top Collectors" isDrop />
      )}
    </Box>
  )
}
