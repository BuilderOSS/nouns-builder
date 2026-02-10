import { COIN_SUPPORTED_CHAIN_IDS } from '@buildeross/constants/chains'
import { useClankerTokens } from '@buildeross/hooks/useClankerTokens'
import { useZoraCoins } from '@buildeross/hooks/useZoraCoins'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { Box, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'

import { coinsContainer, emptyState } from './Coins.css'
import { ContentCoinsGrid } from './ContentCoinsGrid'
import { CreatorCoinSection } from './CreatorCoinSection'

export const Coins: React.FC = () => {
  const {
    addresses: { token },
  } = useDaoStore()
  const chain = useChainStore((x) => x.chain)

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

  const creatorCoin = clankerTokens?.[0]
  const contentCoins = zoraCoins || []

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
          // TODO: Add price and market cap in Phase 6
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
          coins={contentCoins.map((coin) => ({
            coinAddress: coin.coinAddress,
            name: coin.name,
            symbol: coin.symbol,
            uri: coin.uri,
          }))}
          isLoading={zoraLoading}
        />
      )}
    </Box>
  )
}
