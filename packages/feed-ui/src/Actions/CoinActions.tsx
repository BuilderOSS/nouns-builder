import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { type AddressType, CHAIN_ID } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { ShareButton } from '@buildeross/ui/ShareButton'
import { SwapWidget } from '@buildeross/ui/SwapWidget'
import { isCoinSupportedChain } from '@buildeross/utils/helpers'
import { Button, Flex, Text } from '@buildeross/zord'
import React, { useMemo, useState } from 'react'

interface CoinActionsProps {
  chainId: CHAIN_ID
  coinAddress: AddressType
  symbol?: string
}

export const CoinActions: React.FC<CoinActionsProps> = ({
  chainId,
  coinAddress,
  symbol = 'Coin',
}) => {
  const { getCoinLink } = useLinks()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Build coin detail link
  const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)
  const coinLink = chain ? `/coin/${chain.slug}/${coinAddress}` : '#'

  const shareUrl = useMemo(() => {
    const link = getCoinLink(chainId, coinAddress)
    return typeof link === 'string' ? link : link.href
  }, [chainId, coinAddress, getCoinLink])

  // Only show Trade button for Base chains (where swap functionality is available)
  const showTradeButton = isCoinSupportedChain(chainId)

  return (
    <>
      <Flex gap="x2" align="center" wrap="wrap">
        {showTradeButton && (
          <Button
            size="sm"
            px="x3"
            variant="outline"
            onClick={() => setIsModalOpen(true)}
          >
            Trade
          </Button>
        )}
        <LinkWrapper link={{ href: coinLink }}>
          <Button size="sm" px="x3" variant="secondary">
            View Details
          </Button>
        </LinkWrapper>
        {shareUrl && <ShareButton url={shareUrl} size="sm" variant="secondary" />}
      </Flex>

      {showTradeButton && (
        <AnimatedModal
          open={isModalOpen}
          close={() => setIsModalOpen(false)}
          size="medium"
        >
          <div style={{ padding: '24px' }}>
            <Text variant="heading-md" mb="x4">
              Trade {symbol}
            </Text>
            <SwapWidget
              coinAddress={coinAddress as `0x${string}`}
              symbol={symbol}
              chainId={chainId as CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA}
            />
          </div>
        </AnimatedModal>
      )}
    </>
  )
}
