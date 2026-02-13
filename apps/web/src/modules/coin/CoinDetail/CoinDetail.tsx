import {
  useClankerTokenWithPrice,
  useScrollDirection,
  useZoraCoinWithPrice,
} from '@buildeross/hooks'
import { type IpfsMetadata } from '@buildeross/ipfs-service'
import { ProposalNavigation } from '@buildeross/proposal-ui'
import {
  type ClankerTokenFragment,
  type ZoraCoinFragment,
} from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { MobileTradeBar } from '@buildeross/ui/MobileTradeBar'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { SwapWidget } from '@buildeross/ui/SwapWidget'
import { Box, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Address } from 'viem'

import {
  coinDetailContainer,
  coinDetailLayout,
  coinInfoPanel,
  swapPanel,
  swapPanelDesktopOnly,
} from './CoinDetail.css'
import { CoinInfo } from './CoinInfo'

interface CoinDetailProps {
  // Coin data
  name: string
  symbol: string
  image: string | null
  coinAddress: Address
  chainSlug: string
  chainId: number
  // DAO info
  daoAddress: Address | null
  daoName: string | null
  // Pool info
  pairedToken: Address | null
  pairedTokenSymbol: string | null
  poolFee: string | null
  // Metadata
  description: string | null
  uri: string | null
  metadata: IpfsMetadata | null
  createdAt: string | null
  creatorAddress: Address | null
  // Coin type
  isClankerToken?: boolean
  // Optional: full coin/token data
  clankerToken?: ClankerTokenFragment | null
  zoraCoin?: ZoraCoinFragment | null
}

export const CoinDetail = ({
  name,
  symbol,
  image,
  coinAddress,
  chainSlug,
  chainId,
  daoAddress,
  daoName,
  pairedToken,
  pairedTokenSymbol,
  poolFee,
  description,
  uri,
  metadata,
  createdAt,
  creatorAddress,
  isClankerToken,
  clankerToken,
  zoraCoin,
}: CoinDetailProps) => {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)
  const router = useRouter()
  const { getDaoLink } = useLinks()
  const scrollDirection = useScrollDirection()

  // Fetch price data for mobile trade bar
  const clankerWithPrice = useClankerTokenWithPrice({
    clankerToken: isClankerToken ? clankerToken : null,
    chainId: chainId as CHAIN_ID,
    enabled: !!isClankerToken && !!clankerToken,
  })

  const zoraCoinWithPrice = useZoraCoinWithPrice({
    zoraCoin: !isClankerToken ? zoraCoin : null,
    chainId: chainId as CHAIN_ID,
    enabled: !isClankerToken && !!zoraCoin,
  })

  const priceUsd = isClankerToken ? clankerWithPrice.priceUsd : zoraCoinWithPrice.priceUsd
  const isLoadingPrice = isClankerToken
    ? clankerWithPrice.isLoadingPrice
    : zoraCoinWithPrice.isLoadingPrice

  // Calculate sidebar top offset based on header visibility
  // Header is 80px tall and hidden when scrollDirection is 'down'
  const sidebarTopOffset = scrollDirection === 'down' ? 24 : 104 // 24px + 80px header

  const handleBackClick = () => {
    if (daoAddress) {
      const daoLink = getDaoLink?.(chainId, daoAddress, 'coins')
      if (daoLink) {
        router.push(daoLink.href)
      } else {
        router.back()
      }
    } else {
      router.back()
    }
  }

  return (
    <>
      <Box className={coinDetailContainer}>
        {/* Back button */}
        <ProposalNavigation handleBack={handleBackClick} />

        {/* Main layout: Left panel (info) + Right panel (swap) */}
        <Box className={coinDetailLayout} mt="x4">
          {/* Left: Coin Information */}
          <Box className={coinInfoPanel}>
            <CoinInfo
              name={name}
              symbol={symbol}
              image={image}
              coinAddress={coinAddress}
              daoAddress={daoAddress}
              daoName={daoName}
              chainId={chainId}
              chainSlug={chainSlug}
              pairedToken={pairedToken}
              pairedTokenSymbol={pairedTokenSymbol}
              poolFee={poolFee}
              description={description}
              uri={uri}
              metadata={metadata}
              createdAt={createdAt}
              creatorAddress={creatorAddress}
              isClankerToken={isClankerToken}
              clankerToken={clankerToken}
              zoraCoin={zoraCoin}
            />
          </Box>

          {/* Right: Swap Widget (Desktop Only) */}
          <Box
            className={`${swapPanel} ${swapPanelDesktopOnly}`}
            style={{ top: `${sidebarTopOffset}px` }}
            data-header-visible={scrollDirection !== 'down'}
          >
            <Text variant="heading-sm" mb="x4">
              Trade {symbol}
            </Text>
            <SwapWidget coinAddress={coinAddress} symbol={symbol} chainId={chainId} />
          </Box>
        </Box>
      </Box>

      {/* Mobile Trade Bar */}
      <MobileTradeBar
        symbol={symbol}
        priceUsd={priceUsd}
        isLoadingPrice={isLoadingPrice}
        onTradeClick={() => setIsMobileModalOpen(true)}
      />

      {/* Mobile Trade Modal */}
      <AnimatedModal
        open={isMobileModalOpen}
        close={() => setIsMobileModalOpen(false)}
        size="medium"
      >
        <Box p="x6">
          <Text variant="heading-md" mb="x4">
            Trade {symbol}
          </Text>
          <SwapWidget coinAddress={coinAddress} symbol={symbol} chainId={chainId} />
        </Box>
      </AnimatedModal>
    </>
  )
}
