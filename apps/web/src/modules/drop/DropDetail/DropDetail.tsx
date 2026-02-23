import { BASE_URL } from '@buildeross/constants/baseUrl'
import { useScrollDirection } from '@buildeross/hooks'
import { ProposalNavigation } from '@buildeross/proposal-ui'
import { type ZoraDropFragment } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { DropMintWidget } from '@buildeross/ui/DropMintWidget'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { MobileMintBar } from '@buildeross/ui/MobileMintBar'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { Address, formatEther } from 'viem'

import {
  dropDetailContainer,
  dropDetailLayout,
  dropInfoPanel,
  mintPanel,
  mintPanelDesktopOnly,
} from './DropDetail.css'
import { DropInfo } from './DropInfo'

interface DropDetailProps {
  drop: ZoraDropFragment
  daoAddress: Address | null
  daoName: string | null
  chainId: number
  transactionHash: string | null
}

export const DropDetail = ({
  drop,
  daoAddress,
  daoName,
  chainId,
  transactionHash,
}: DropDetailProps) => {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)
  const router = useRouter()
  const { getDaoLink, getDropLink } = useLinks()
  const scrollDirection = useScrollDirection()

  // Calculate sidebar top offset based on header visibility
  // Header is 80px tall and hidden when scrollDirection is 'down'
  const sidebarTopOffset = scrollDirection === 'down' ? 24 : 104 // 24px + 80px header

  // Calculate sale timing
  const now = Date.now() / 1000
  const saleStart = parseInt(drop.publicSaleStart)
  const saleEnd = parseInt(drop.publicSaleEnd)
  const saleNotStarted = saleStart > 0 && now < saleStart
  const saleEnded = saleEnd > 0 && now > saleEnd
  const saleActive = !saleNotStarted && !saleEnded

  const priceEth = formatEther(BigInt(drop.publicSalePrice))

  const handleBackClick = () => {
    if (daoAddress) {
      const daoLink = getDaoLink?.(chainId, daoAddress, 'drops')
      if (daoLink) {
        router.push(daoLink.href)
      } else {
        router.back()
      }
    } else {
      router.back()
    }
  }

  const shareUrl = useMemo(() => {
    const link = getDropLink(chainId as CHAIN_ID, drop.id as Address)
    return link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`
  }, [chainId, drop.id, getDropLink])

  return (
    <>
      <Box className={dropDetailContainer}>
        {/* Back button */}
        <ProposalNavigation handleBack={handleBackClick} />

        {/* Main layout: Left panel (info) + Right panel (mint) */}
        <Box className={dropDetailLayout} mt="x4">
          {/* Left: Drop Information */}
          <Box className={dropInfoPanel}>
            <DropInfo
              drop={drop}
              daoAddress={daoAddress}
              daoName={daoName}
              chainId={chainId}
              transactionHash={transactionHash}
            />
          </Box>

          {/* Right: Mint Widget (Desktop Only) */}
          <Box
            className={`${mintPanel} ${mintPanelDesktopOnly}`}
            style={{ top: `${sidebarTopOffset}px` }}
            data-header-visible={scrollDirection !== 'down'}
          >
            <DropMintWidget
              chainId={chainId as CHAIN_ID}
              dropAddress={drop.id as Address}
              symbol={drop.symbol}
              priceEth={priceEth}
              saleActive={saleActive}
              saleNotStarted={saleNotStarted}
              saleEnded={saleEnded}
              saleStart={saleStart}
              saleEnd={saleEnd}
              editionSize={drop.editionSize}
              maxPerAddress={parseInt(drop.maxSalePurchasePerAddress)}
            />
          </Box>
        </Box>
      </Box>

      {/* Mobile Mint Bar */}
      <MobileMintBar
        symbol={drop.symbol}
        priceEth={priceEth}
        shareUrl={shareUrl}
        saleActive={saleActive}
        onMintClick={() => setIsMobileModalOpen(true)}
      />

      {/* Mobile Mint Modal */}
      <AnimatedModal
        open={isMobileModalOpen}
        close={() => setIsMobileModalOpen(false)}
        size="medium"
      >
        <Box w="100%">
          <Flex align="center" justify="space-between" mb="x4" w="100%">
            <Text variant="heading-md">Mint {drop.symbol}</Text>
            <Button
              variant="ghost"
              p="x0"
              size="xs"
              onClick={() => setIsMobileModalOpen(false)}
              style={{ padding: 0, flexShrink: 0 }}
            >
              <Icon id="cross" />
            </Button>
          </Flex>
          <DropMintWidget
            chainId={chainId as CHAIN_ID}
            dropAddress={drop.id as Address}
            symbol={drop.symbol}
            priceEth={priceEth}
            saleActive={saleActive}
            saleNotStarted={saleNotStarted}
            saleEnded={saleEnded}
            saleStart={saleStart}
            saleEnd={saleEnd}
            editionSize={drop.editionSize}
            maxPerAddress={parseInt(drop.maxSalePurchasePerAddress)}
          />
        </Box>
      </AnimatedModal>
    </>
  )
}
