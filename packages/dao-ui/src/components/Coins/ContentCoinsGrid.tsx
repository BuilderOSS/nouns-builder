import { CHAIN_ID } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import { Address } from 'viem'

import { CoinCard } from './CoinCard'
import { coinsGrid, emptyState } from './Coins.css'

interface ContentCoin {
  coinAddress: Address
  name: string
  symbol: string
  uri?: string
  // Add more fields as needed from ZoraCoin entity
}

interface ContentCoinsGridProps {
  chainId: CHAIN_ID
  daoAddress: Address
  coins: ContentCoin[]
  isLoading?: boolean
}

export const ContentCoinsGrid = ({
  chainId,
  daoAddress,
  coins,
  isLoading,
}: ContentCoinsGridProps) => {
  const { getPostCreateLink } = useLinks()
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
        <Link link={getPostCreateLink?.(chainId, daoAddress)}>
          <Button>Create Post</Button>
        </Link>
      </Flex>
      <Box className={coinsGrid}>
        {coins.map((coin) => (
          <CoinCard
            key={coin.coinAddress}
            chainId={chainId}
            coinAddress={coin.coinAddress}
            name={coin.name}
            symbol={coin.symbol}
            image={coin.uri}
            // TODO: Calculate price and priceUsd in Phase 6
          />
        ))}
      </Box>
    </>
  )
}
