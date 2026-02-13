import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { CHAIN_ID } from '@buildeross/types'
import { ContractLink } from '@buildeross/ui/ContractLink'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { SwapWidget } from '@buildeross/ui/SwapWidget'
import { formatMarketCap, formatPrice } from '@buildeross/utils/formatMarketCap'
import { Box, Button, Flex, Grid, Spinner, Text } from '@buildeross/zord'
import { useState } from 'react'
import { Address } from 'viem'

import { creatorCoinGrid, creatorCoinSection, stat } from './Coins.css'

interface CreatorCoinSectionProps {
  chainId: CHAIN_ID
  tokenAddress: Address
  name: string
  symbol: string
  image?: string
  priceUsd?: number | null
  marketCap?: number | null
  isLoadingPrice?: boolean
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
  isLoadingPrice,
  pairedToken,
}: CreatorCoinSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)
  const coinHref = chain ? `/coin/${chain.slug}/${tokenAddress}` : '#'

  // Only show Trade button for Base chains
  const showTradeButton = chainId === CHAIN_ID.BASE || chainId === CHAIN_ID.BASE_SEPOLIA

  return (
    <>
      <Box className={creatorCoinSection}>
        <Flex justify="space-between" align="center" mb="x6">
          <Text variant="heading-sm">Creator Coin</Text>
          <Flex gap="x2">
            {showTradeButton && (
              <Button
                variant="primary"
                icon="swap"
                iconAlign="left"
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                Trade
              </Button>
            )}
            <Link link={{ href: coinHref }}>
              <Button variant="outline" icon="arrowRight" iconAlign="right" size="sm">
                View Details
              </Button>
            </Link>
          </Flex>
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

            <Flex direction="column" gap="x2" flex={1}>
              <Text variant="heading-xs">{name}</Text>
              <Text variant="paragraph-sm" color="text3">
                {symbol}
              </Text>
              <ContractLink address={tokenAddress} chainId={chainId} size="xs" noBorder />
            </Flex>
          </Flex>

          {/* Right side: Stats */}
          <Flex direction="column" gap="x2">
            {/* Price & Market Cap in one row */}
            <Flex gap="x6" wrap="wrap">
              <Box className={stat} style={{ flex: 1, minWidth: 120 }}>
                <Text variant="label-sm" color="text3" mb="x1">
                  Price
                </Text>
                <Text variant="heading-xs" color="text1">
                  {isLoadingPrice ? <Spinner size="sm" /> : formatPrice(priceUsd)}
                </Text>
              </Box>

              <Box className={stat} style={{ flex: 1, minWidth: 120 }}>
                <Text variant="label-sm" color="text3" mb="x1">
                  Market Cap
                </Text>
                <Text variant="paragraph-md" color="text1">
                  {isLoadingPrice ? <Spinner size="sm" /> : formatMarketCap(marketCap)}
                </Text>
              </Box>
            </Flex>

            {pairedToken && (
              <Box className={stat}>
                <Text variant="label-sm" color="text3" mb="x1">
                  Paired With
                </Text>
                <ContractLink
                  address={pairedToken as `0x${string}`}
                  chainId={chainId}
                  size="xs"
                  noBorder
                />
              </Box>
            )}
          </Flex>
        </Grid>
      </Box>

      {/* Trade Modal */}
      {showTradeButton && (
        <AnimatedModal
          open={isModalOpen}
          close={() => setIsModalOpen(false)}
          size="medium"
        >
          <Box p="x6">
            <Text variant="heading-md" mb="x4">
              Trade {symbol}
            </Text>
            <SwapWidget
              coinAddress={tokenAddress}
              symbol={symbol}
              chainId={chainId as CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA}
            />
          </Box>
        </AnimatedModal>
      )}
    </>
  )
}
