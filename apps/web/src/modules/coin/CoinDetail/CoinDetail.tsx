import { useScrollDirection } from '@buildeross/hooks/useScrollDirection'
import { type IpfsMetadata } from '@buildeross/ipfs-service'
import { ProposalNavigation } from '@buildeross/proposal-ui'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { SwapWidget } from '@buildeross/ui/SwapWidget'
import { Box, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import { Address } from 'viem'

import {
  coinDetailContainer,
  coinDetailLayout,
  coinInfoPanel,
  swapPanel,
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
  // Coin type
  isClankerToken?: boolean
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
}: CoinDetailProps) => {
  const router = useRouter()
  const { getDaoLink } = useLinks()
  const scrollDirection = useScrollDirection()

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
            chainSlug={chainSlug}
            pairedToken={pairedToken}
            pairedTokenSymbol={pairedTokenSymbol}
            poolFee={poolFee}
            description={description}
            uri={uri}
            metadata={metadata}
            createdAt={createdAt}
          />
        </Box>

        {/* Right: Swap Widget */}
        <Box
          className={swapPanel}
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
  )
}
