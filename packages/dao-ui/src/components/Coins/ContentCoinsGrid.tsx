import { useZoraCoinWithPrice } from '@buildeross/hooks/useCoinsWithPrices'
import { type ZoraCoinFragment } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import React from 'react'
import { Address } from 'viem'

import { CoinCard } from './CoinCard'
import { coinsGrid, emptyState } from './Coins.css'

interface ContentCoinsGridProps {
  chainId: CHAIN_ID
  daoAddress: Address
  coins: ZoraCoinFragment[]
  isLoading?: boolean
  onTradeClick?: (coinAddress: Address, symbol: string) => void
}

// Wrapper component to fetch price for individual coin
const CoinCardWithPrice: React.FC<{
  coin: ZoraCoinFragment
  chainId: CHAIN_ID
  onTradeClick?: (coinAddress: Address, symbol: string) => void
}> = ({ coin, chainId, onTradeClick }) => {
  const coinWithPrice = useZoraCoinWithPrice({
    zoraCoin: coin,
    chainId,
    enabled: true,
  })

  return (
    <CoinCard
      chainId={chainId}
      coinAddress={coin.coinAddress}
      name={coin.name}
      symbol={coin.symbol}
      image={coin.uri}
      priceUsd={coinWithPrice.priceUsd}
      marketCap={coinWithPrice.marketCap}
      isLoadingPrice={coinWithPrice.isLoadingPrice}
      createdAt={coin.createdAt}
      isClankerToken={false}
      onTradeClick={onTradeClick}
    />
  )
}

export const ContentCoinsGrid = ({
  chainId,
  daoAddress,
  coins,
  isLoading,
  onTradeClick,
}: ContentCoinsGridProps) => {
  const { getCoinCreateLink } = useLinks()

  if (isLoading) {
    return (
      <Box className={emptyState}>
        <Text variant="paragraph-md">Loading content coins...</Text>
      </Box>
    )
  }

  if (!coins || coins.length === 0) {
    return (
      <Box className={emptyState}>
        <Text variant="paragraph-md">No content coins created yet</Text>
        <Text variant="paragraph-sm" color="text3" mt="x2">
          Create your first content coin to get started
        </Text>
      </Box>
    )
  }

  return (
    <>
      <Flex justify="space-between" align="center" mb="x4">
        <Text variant="heading-sm">Content Coins</Text>
        <Link link={getCoinCreateLink?.(chainId, daoAddress)}>
          <Button>Create Post</Button>
        </Link>
      </Flex>
      <Box className={coinsGrid}>
        {coins.map((coin) => (
          <CoinCardWithPrice
            key={coin.coinAddress}
            coin={coin}
            chainId={chainId}
            onTradeClick={onTradeClick}
          />
        ))}
      </Box>
    </>
  )
}
