import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { CHAIN_ID } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { Box, Button, Flex, Grid, Text } from '@buildeross/zord'
import { Address } from 'viem'

import { creatorCoinGrid, creatorCoinSection, stat } from './Coins.css'

interface CreatorCoinSectionProps {
  chainId: CHAIN_ID
  tokenAddress: Address
  name: string
  symbol: string
  image?: string
  priceUsd?: string
  marketCap?: string
  pairedToken?: string
}

export const CreatorCoinSection = ({
  chainId,
  tokenAddress,
  name,
  symbol,
  image,
  priceUsd,
  marketCap,
  pairedToken,
}: CreatorCoinSectionProps) => {
  const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)
  const coinHref = chain ? `/coin/${chain.slug}/${tokenAddress}` : '#'

  return (
    <Box className={creatorCoinSection}>
      <Flex justify="space-between" align="center" mb="x6">
        <Text variant="heading-sm">Creator Coin</Text>
        <Link link={{ href: coinHref }}>
          <Button variant="outline" icon="arrowRight" iconAlign="right" size="sm">
            View Details
          </Button>
        </Link>
      </Flex>

      <Grid className={creatorCoinGrid}>
        {/* Left side: Token info */}
        <Flex gap="x4" align="flex-start">
          {image && (
            <Box
              width="x16"
              height="x16"
              borderRadius="round"
              overflow="hidden"
              flexShrink={0}
            >
              <FallbackImage
                src={image}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          )}

          <Flex direction="column" gap="x2">
            <Text variant="heading-xs">{name}</Text>
            <Text variant="paragraph-sm" color="text3">
              {symbol}
            </Text>
            <Text variant="paragraph-sm" color="text4" fontFamily="mono">
              {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
            </Text>
          </Flex>
        </Flex>

        {/* Right side: Stats */}
        <Flex direction="column" gap="x2">
          {priceUsd && (
            <Box className={stat}>
              <Text variant="label-sm" color="text3" mb="x1">
                Price
              </Text>
              <Text variant="heading-xs" color="text1">
                ${priceUsd}
              </Text>
            </Box>
          )}

          {marketCap && (
            <Box className={stat}>
              <Text variant="label-sm" color="text3" mb="x1">
                Market Cap
              </Text>
              <Text variant="paragraph-md" color="text1">
                ${marketCap}
              </Text>
            </Box>
          )}

          {pairedToken && (
            <Box className={stat}>
              <Text variant="label-sm" color="text3" mb="x1">
                Paired With
              </Text>
              <Text variant="paragraph-md" color="text1" fontFamily="mono">
                {pairedToken.slice(0, 6)}...{pairedToken.slice(-4)}
              </Text>
            </Box>
          )}
        </Flex>
      </Grid>
    </Box>
  )
}
