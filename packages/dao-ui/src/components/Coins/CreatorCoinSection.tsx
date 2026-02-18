import { BASE_URL } from '@buildeross/constants/baseUrl'
import { CHAIN_ID } from '@buildeross/types'
import { ContractLink } from '@buildeross/ui/ContractLink'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { ShareButton } from '@buildeross/ui/ShareButton'
import { formatMarketCap } from '@buildeross/utils/formatMarketCap'
import { isCoinSupportedChain } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Spinner, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import { Address } from 'viem'

import { creatorCoinSection } from './Coins.css'

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
  onTradeClick?: (tokenAddress: Address, symbol: string) => void
}

export const CreatorCoinSection = ({
  chainId,
  tokenAddress,
  name,
  symbol,
  image,
  // priceUsd,
  marketCap,
  isLoadingPrice,
  onTradeClick,
}: CreatorCoinSectionProps) => {
  const { getCoinLink } = useLinks()

  const shareUrl = useMemo(() => {
    const link = getCoinLink(chainId, tokenAddress)
    return link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`
  }, [chainId, tokenAddress, getCoinLink])

  // Only show Trade button for Base chains
  const showTradeButton = isCoinSupportedChain(chainId)

  const renderActionButtons = () => (
    <>
      {showTradeButton && (
        <Button
          variant="primary"
          iconAlign="left"
          onClick={() => onTradeClick?.(tokenAddress, symbol)}
        >
          Trade
        </Button>
      )}
      <Link link={getCoinLink(chainId, tokenAddress)}>
        <Button variant="outline" icon="arrowRight" iconAlign="right">
          View Details
        </Button>
      </Link>
    </>
  )

  return (
    <Flex className={creatorCoinSection} direction="column" gap="x6">
      <Flex justify="space-between" wrap="wrap" gap="x2" align="flex-start">
        <Flex gap="x2" align="flex-start" style={{ flexGrow: 1 }}>
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
            <Text
              variant="heading-xs"
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {name}
            </Text>
            <Text variant="paragraph-sm" color="text3">
              {symbol}
            </Text>
          </Flex>
          {shareUrl && <ShareButton url={shareUrl} variant="ghost" />}
        </Flex>
        <Flex
          gap="x2"
          justify="flex-end"
          display={{ '@initial': 'none', '@768': 'flex' }}
          style={{ flexShrink: 0 }}
        >
          {renderActionButtons()}
        </Flex>
      </Flex>

      {/* Contract & Market Cap in one row */}
      <Flex gap="x2" wrap="wrap" align="center" justify="space-between" w="100%">
        <Box style={{ flexShrink: 0 }}>
          <Text variant="label-sm" color="text3" mb="x1">
            Contract
          </Text>
          <ContractLink
            address={tokenAddress}
            chainId={chainId}
            size="sm"
            noBorder
            px="x0"
            py="x0"
          />
        </Box>
        <Box style={{ flexShrink: 0 }}>
          <Text variant="label-sm" color="text3" mb="x1">
            Market Cap
          </Text>
          <Text variant="paragraph-md" color="text1">
            {isLoadingPrice ? <Spinner size="sm" /> : formatMarketCap(marketCap)}
          </Text>
        </Box>
      </Flex>
      <Flex
        gap="x2"
        justify="flex-end"
        w="100%"
        display={{ '@initial': 'flex', '@768': 'none' }}
      >
        {renderActionButtons()}
      </Flex>
    </Flex>
  )
}
