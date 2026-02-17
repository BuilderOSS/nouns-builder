import { COIN_SUPPORTED_CHAIN_IDS } from '@buildeross/constants/chains'
import { useClankerTokens } from '@buildeross/hooks/useClankerTokens'
import { useClankerTokenWithPrice } from '@buildeross/hooks/useCoinsWithPrices'
import { useZoraCoins } from '@buildeross/hooks/useZoraCoins'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { SwapWidget } from '@buildeross/ui/SwapWidget'
import { Box, Text } from '@buildeross/zord'
import React, { useMemo, useState } from 'react'
import { Address } from 'viem'

import { coinsContainer, emptyState } from './Coins.css'
import { ContentCoinsGrid } from './ContentCoinsGrid'
import { CreatorCoinSection } from './CreatorCoinSection'

export const Coins: React.FC = () => {
  const {
    addresses: { token },
  } = useDaoStore()
  const chain = useChainStore((x) => x.chain)

  // Shared modal state for all trade buttons
  const [selectedCoin, setSelectedCoin] = useState<{
    address: Address
    symbol: string
  } | null>(null)

  const handleTradeClick = (coinAddress: Address, symbol: string) => {
    setSelectedCoin({ address: coinAddress, symbol })
  }

  const handleCloseModal = () => {
    setSelectedCoin(null)
  }

  // Check if chain is supported
  const isChainSupported = useMemo(
    () =>
      COIN_SUPPORTED_CHAIN_IDS.includes(
        chain.id as (typeof COIN_SUPPORTED_CHAIN_IDS)[number]
      ),
    [chain.id]
  )

  // Fetch creator coins (ClankerTokens) - only the first/latest one
  const {
    data: clankerTokens,
    isLoading: clankerLoading,
    error: clankerError,
  } = useClankerTokens({
    chainId: chain.id,
    collectionAddress: token,
    enabled: isChainSupported,
    first: 1, // We only show the latest clanker token
  })

  // Fetch content coins (ZoraCoins) - all of them (up to 100)
  const {
    data: zoraCoins,
    isLoading: zoraLoading,
    error: zoraError,
  } = useZoraCoins({
    chainId: chain.id,
    collectionAddress: token,
    enabled: isChainSupported,
    first: 100, // Fetch up to 100 content coins
  })

  const creatorCoin = clankerTokens?.[0]
  const contentCoins = zoraCoins || []

  // Fetch price data for creator coin - must be called before early returns
  const creatorCoinWithPrice = useClankerTokenWithPrice({
    clankerToken: creatorCoin,
    chainId: chain.id,
    enabled: !!creatorCoin && isChainSupported,
  })

  if (!isChainSupported) {
    return (
      <Box className={emptyState}>
        <Text variant="paragraph-md">Coins are only available on Base network</Text>
        <Text variant="paragraph-sm" color="text3" mt="x2">
          Switch to Base to view and trade coins
        </Text>
      </Box>
    )
  }

  if (clankerError || zoraError) {
    return (
      <Box className={emptyState}>
        <Text variant="paragraph-md" color="negative">
          Error loading coins
        </Text>
        <Text variant="paragraph-sm" color="text3" mt="x2">
          {clankerError?.message || zoraError?.message || 'Please try again later'}
        </Text>
      </Box>
    )
  }

  return (
    <Box className={coinsContainer}>
      {/* Creator Coin Section */}
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
          onTradeClick={handleTradeClick}
        />
      ) : (
        <Box className={emptyState} mb="x6">
          <Text variant="paragraph-md">No creator coin found</Text>
          <Text variant="paragraph-sm" color="text3" mt="x2">
            Create a creator coin for this DAO to get started
          </Text>
        </Box>
      )}

      {/* Content Coins Grid */}
      {token && (
        <ContentCoinsGrid
          chainId={chain.id}
          daoAddress={token}
          coins={contentCoins}
          isLoading={zoraLoading}
          onTradeClick={handleTradeClick}
        />
      )}

      {/* Shared Trade Modal */}
      {selectedCoin && (
        <AnimatedModal open={!!selectedCoin} close={handleCloseModal} size="medium">
          <Box p="x6">
            <Text variant="heading-md" mb="x4">
              Trade {selectedCoin.symbol}
            </Text>
            <SwapWidget
              coinAddress={selectedCoin.address}
              symbol={selectedCoin.symbol}
              chainId={chain.id as CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA}
            />
          </Box>
        </AnimatedModal>
      )}
    </Box>
  )
}
