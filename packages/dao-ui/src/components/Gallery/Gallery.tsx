import { useClankerTokens } from '@buildeross/hooks/useClankerTokens'
import {
  useClankerTokenWithPrice,
  useZoraCoinWithPrice,
} from '@buildeross/hooks/useCoinsWithPrices'
import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useGalleryItems } from '@buildeross/hooks/useGalleryItems'
import { useVotes } from '@buildeross/hooks/useVotes'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { CHAIN_ID, TransactionType } from '@buildeross/types'
import { DropdownSelect, type SelectOption } from '@buildeross/ui/DropdownSelect'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { skeletonAnimation } from '@buildeross/ui/styles'
import { SwapWidget } from '@buildeross/ui/SwapWidget'
import {
  isChainIdSupportedByCoining,
  isChainIdSupportedForSaleOfZoraCoins,
} from '@buildeross/utils/coining'
import { isChainIdSupportedByDroposal } from '@buildeross/utils/droposal'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import React, { useMemo, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

import { CoinCard } from '../Cards/CoinCard'
import { CreatorCoinSection } from '../Cards/CreatorCoinSection'
import { DropCard } from '../Cards/DropCard'
import { emptyState, galleryContainer, galleryGrid } from './Gallery.css'

type SwapWidgetModalProps = {
  handleCloseModal: () => void
  selectedCoin: {
    address: Address
    symbol: string
    isZoraCoin: boolean
  }
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
}

const SwapWidgetModal: React.FC<SwapWidgetModalProps> = ({
  handleCloseModal,
  selectedCoin,
  chainId,
}) => {
  const sellEnabled = !selectedCoin.isZoraCoin
    ? true
    : isChainIdSupportedForSaleOfZoraCoins(chainId)
  return (
    <AnimatedModal open={true} close={handleCloseModal} size="medium">
      <Box w="100%">
        <Flex align="center" justify="space-between" mb="x4" w="100%">
          <Text variant="heading-md">
            {sellEnabled ? 'Trade' : 'Buy'} {selectedCoin.symbol}
          </Text>
          <Button
            variant="ghost"
            p="x0"
            size="xs"
            onClick={handleCloseModal}
            style={{ padding: 0, flexShrink: 0 }}
          >
            <Icon id="cross" />
          </Button>
        </Flex>
        <SwapWidget
          coinAddress={selectedCoin.address}
          symbol={selectedCoin.symbol}
          chainId={chainId as CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA}
          isZoraCoin={selectedCoin.isZoraCoin}
        />
      </Box>
    </AnimatedModal>
  )
}

// Wrapper component to fetch price for individual coin
const CoinCardWithPrice: React.FC<{
  coinAddress: Address
  name: string
  symbol: string
  image?: string
  createdAt?: string
  chainId: CHAIN_ID
  onTradeClick?: (coinAddress: Address, symbol: string, isZoraCoin: boolean) => void
}> = ({ coinAddress, name, symbol, image, createdAt, chainId, onTradeClick }) => {
  const coinWithPrice = useZoraCoinWithPrice({
    zoraCoin: { coinAddress, name, symbol, uri: image } as any,
    chainId,
    enabled: true,
  })

  return (
    <CoinCard
      chainId={chainId}
      coinAddress={coinAddress}
      name={name}
      symbol={symbol}
      image={image}
      priceUsd={coinWithPrice.priceUsd}
      marketCap={coinWithPrice.marketCap}
      isLoadingPrice={coinWithPrice.isLoadingPrice}
      createdAt={createdAt}
      isZoraCoin={true}
      onTradeClick={onTradeClick}
      showTypeBadge={true}
    />
  )
}

export type GalleryProps = {
  onOpenProposalCreate: () => void
  onOpenCoinCreate: () => void
}

export const Gallery: React.FC<GalleryProps> = ({
  onOpenProposalCreate,
  onOpenCoinCreate,
}) => {
  const {
    addresses: { token, governor },
  } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const { address } = useAccount()
  const { getCoinCreateLink } = useLinks()

  const { createProposal, setTransactionType } = useProposalStore()

  // State for dropdown selection
  type CreateOption = 'permissionless-post' | 'dao-post' | 'dao-drop' | 'dao-creator-coin'

  // Shared modal state for all trade buttons
  const [selectedCoin, setSelectedCoin] = useState<{
    address: Address
    symbol: string
    isZoraCoin: boolean
  } | null>(null)

  const handleTradeClick = (
    coinAddress: Address,
    symbol: string,
    isZoraCoin: boolean
  ) => {
    setSelectedCoin({ address: coinAddress, symbol, isZoraCoin })
  }

  const handleCloseModal = () => {
    setSelectedCoin(null)
  }

  // Check if chains are supported
  const isCoinSupported = isChainIdSupportedByCoining(chain.id)
  const isDropSupported = isChainIdSupportedByDroposal(chain.id)

  // Fetch creator coins (ClankerTokens) - only the first/latest one
  const {
    data: clankerTokens,
    isLoading: clankerLoading,
    error: clankerError,
  } = useClankerTokens({
    chainId: chain.id,
    collectionAddress: token,
    enabled: isCoinSupported,
    first: 1,
  })

  // Fetch gallery items (combined coins and drops)
  const {
    data: galleryItems,
    isLoading: galleryLoading,
    error: galleryError,
  } = useGalleryItems({
    chainId: chain.id,
    collectionAddress: token,
    enabled: isCoinSupported || isDropSupported,
    first: 100,
  })

  const creatorCoin = clankerTokens?.[0]

  // Fetch price data for creator coin
  const creatorCoinWithPrice = useClankerTokenWithPrice({
    clankerToken: creatorCoin,
    chainId: chain.id,
    enabled: !!creatorCoin && isCoinSupported,
  })

  // Get voting threshold for Create Drop button
  const { isOwner, isDelegating, hasThreshold, proposalVotesRequired } = useVotes({
    chainId: chain.id,
    governorAddress: governor,
    signerAddress: address,
    collectionAddress: token,
  })

  // Check if governance is delayed
  const { isGovernanceDelayed } = useDelayedGovernance({
    tokenAddress: token,
    governorAddress: governor,
    chainId: chain.id,
  })

  // Handle create option selection from dropdown
  const handleCreateOptionChange = (option: CreateOption) => {
    // Block DAO-related options if governance is delayed
    const isDaoOption =
      option === 'dao-post' || option === 'dao-drop' || option === 'dao-creator-coin'

    if (isDaoOption && isGovernanceDelayed) {
      // Don't execute DAO actions when governance is delayed
      return
    }

    switch (option) {
      case 'permissionless-post':
        // Navigate to coin create page
        onOpenCoinCreate()
        break
      case 'dao-post':
        setTransactionType(TransactionType.CONTENT_COIN)
        createProposal({
          title: undefined,
          summary: undefined,
          disabled: false,
          transactions: [],
        })
        onOpenProposalCreate()
        break
      case 'dao-drop':
        setTransactionType(TransactionType.DROPOSAL)
        createProposal({
          title: undefined,
          summary: undefined,
          disabled: false,
          transactions: [],
        })
        onOpenProposalCreate()
        break
      case 'dao-creator-coin':
        setTransactionType(TransactionType.CREATOR_COIN)
        createProposal({
          title: undefined,
          summary: undefined,
          disabled: false,
          transactions: [],
        })
        onOpenProposalCreate()
        break
    }
  }

  // Build dropdown options based on creator coin existence and chain support
  const createOptions = useMemo((): SelectOption<CreateOption>[] => {
    const options: SelectOption<CreateOption>[] = []

    if (!creatorCoin) {
      // No creator coin - show creator coin and drop options for voters
      if (isCoinSupported) {
        options.push({
          value: 'dao-creator-coin',
          label: 'Create Creator Coin',
        })
      }
    } else {
      // Has creator coin - show all post and drop options
      if (isCoinSupported) {
        options.push({
          value: 'permissionless-post',
          label: 'Create Post',
        })
        options.push({
          value: 'dao-post',
          label: 'Propose Post',
        })
      }
    }
    if (isDropSupported) {
      options.push({
        value: 'dao-drop',
        label: 'Create Drop',
      })
    }

    return options
  }, [creatorCoin, isCoinSupported, isDropSupported])

  // Get the default selected option (first available option)
  const defaultCreateOption = useMemo(
    () => createOptions[0]?.value || 'permissionless-post',
    [createOptions]
  )

  // Show error if both are not supported
  if (!isCoinSupported && !isDropSupported) {
    return (
      <Box className={emptyState}>
        <Text variant="paragraph-md">Gallery is not available on this network</Text>
        <Text variant="paragraph-sm" color="text3" mt="x2">
          Switch to a supported network to view coins and drops
        </Text>
      </Box>
    )
  }

  if (clankerError || galleryError) {
    return (
      <Box className={emptyState}>
        <Text variant="paragraph-md" color="negative">
          Error loading gallery
        </Text>
        <Text variant="paragraph-sm" color="text3" mt="x2">
          {clankerError?.message || galleryError?.message || 'Please try again later'}
        </Text>
      </Box>
    )
  }

  return (
    <Box className={galleryContainer}>
      {/* Creator Coin Section */}
      {isCoinSupported && (
        <>
          {clankerLoading ? (
            <Box className={emptyState}>
              <Text variant="paragraph-md">Loading creator coin...</Text>
            </Box>
          ) : creatorCoin ? (
            <CreatorCoinSection
              chainId={chain.id}
              tokenAddress={creatorCoin.tokenAddress}
              name={creatorCoin.tokenName}
              symbol={creatorCoin.tokenSymbol}
              image={creatorCoin.tokenImage}
              pairedToken={creatorCoin.pairedToken}
              priceUsd={creatorCoinWithPrice.priceUsd}
              marketCap={creatorCoinWithPrice.marketCap}
              isLoadingPrice={creatorCoinWithPrice.isLoadingPrice}
              isZoraCoin={false}
              onTradeClick={handleTradeClick}
            />
          ) : null}
        </>
      )}

      {/* Header with action buttons */}
      <Flex justify="space-between" align="center" mb="x6" wrap="wrap" gap="x4">
        <Text variant="heading-sm" style={{ fontWeight: 800 }}>
          Gallery
        </Text>

        <Flex gap="x2" align="center" wrap="wrap">
          {/* Helper text for voting status - desktop only */}
          <Flex
            justify={'center'}
            align={'center'}
            display={{ '@initial': 'none', '@768': 'flex' }}
            gap="x2"
          >
            {!creatorCoin && !hasThreshold && address && (
              <Text variant="paragraph-sm" color="text3">
                You need votes to create content for this DAO.
              </Text>
            )}
            {address && !isDelegating && !isOwner && !hasThreshold && (
              <Text variant="paragraph-sm" color="text3">
                You have no votes.
              </Text>
            )}
            {isDelegating && (
              <Text variant="paragraph-sm" color="text3">
                Your votes are delegated.
              </Text>
            )}
            {isOwner && !hasThreshold && (
              <Text variant="paragraph-sm" color="text3">
                {Number(proposalVotesRequired)} votes required to propose.
              </Text>
            )}
          </Flex>

          {/* Create button - adapts based on creator coin and voting power */}
          {hasThreshold ? (
            // User has voting power - show dropdown or single button
            createOptions.length === 1 ? (
              // Only one option - render simple button
              <Button
                variant="primary"
                onClick={() => handleCreateOptionChange(createOptions[0].value)}
              >
                {createOptions[0].label}
              </Button>
            ) : (
              // Multiple options - render dropdown
              <Box width={{ '@initial': '100%', '@768': 'auto' }}>
                <DropdownSelect
                  value={defaultCreateOption}
                  options={createOptions}
                  onChange={handleCreateOptionChange}
                  disabled={false}
                  positioning="absolute"
                  customLabel="Create"
                  variant="button"
                  buttonVariant="primary"
                  buttonSize="md"
                  align="right"
                />
              </Box>
            )
          ) : creatorCoin ? (
            // No voting power but has creator coin - show simple link button
            <Link link={getCoinCreateLink(chain.id, token as `0x${string}`)}>
              <Button variant="primary">Create Post</Button>
            </Link>
          ) : (
            // No voting power and no creator coin - disabled button
            <Button variant="primary" disabled>
              Create
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Gallery Grid */}
      {galleryLoading ? (
        <Box className={galleryGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Box
              key={index}
              width="100%"
              height="x64"
              borderRadius="curved"
              backgroundColor="background2"
              style={{ animation: skeletonAnimation }}
            />
          ))}
        </Box>
      ) : galleryItems && galleryItems.length > 0 ? (
        <Box className={galleryGrid}>
          {galleryItems.map((item) => {
            if (item.itemType === 'coin') {
              return (
                <CoinCardWithPrice
                  key={item.coinAddress}
                  coinAddress={item.coinAddress}
                  name={item.name}
                  symbol={item.symbol}
                  image={item.uri}
                  createdAt={item.createdAt}
                  chainId={chain.id}
                  onTradeClick={handleTradeClick}
                />
              )
            } else {
              return (
                <DropCard
                  key={item.id}
                  chainId={chain.id}
                  dropAddress={item.id as `0x${string}`}
                  name={item.name}
                  symbol={item.symbol}
                  imageURI={item.imageURI}
                  editionSize={item.editionSize}
                  createdAt={item.createdAt}
                  showTypeBadge={true}
                />
              )
            }
          })}
        </Box>
      ) : (
        <Box className={emptyState}>
          <Text variant="paragraph-md">No items in gallery yet</Text>
          <Text variant="paragraph-sm" color="text3" mt="x2">
            Create coins or drops to get started
          </Text>
        </Box>
      )}

      {/* Shared Trade Modal */}
      {selectedCoin && (
        <SwapWidgetModal
          handleCloseModal={handleCloseModal}
          selectedCoin={selectedCoin}
          chainId={chain.id as CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA}
        />
      )}
    </Box>
  )
}
