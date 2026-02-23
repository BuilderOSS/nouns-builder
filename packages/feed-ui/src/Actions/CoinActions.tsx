import { BASE_URL } from '@buildeross/constants/baseUrl'
import { type AddressType, CHAIN_ID } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { ShareButton } from '@buildeross/ui/ShareButton'
import { isChainIdSupportedByCoining } from '@buildeross/utils/coining'
import { Button, Flex } from '@buildeross/zord'
import React, { useCallback, useMemo } from 'react'

import type { OnOpenTradeModal } from '../types/modalStates'

interface CoinActionsProps {
  chainId: CHAIN_ID
  coinAddress: AddressType
  symbol: string
  daoName: string
  daoImage: string
  onOpenTradeModal: OnOpenTradeModal
  isClankerToken: boolean
}

export const CoinActions: React.FC<CoinActionsProps> = ({
  chainId,
  coinAddress,
  symbol = 'Coin',
  daoName,
  daoImage,
  onOpenTradeModal,
}) => {
  const { getCoinLink } = useLinks()

  const shareUrl = useMemo(() => {
    const link = getCoinLink(chainId, coinAddress)
    return link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`
  }, [chainId, coinAddress, getCoinLink])

  const handleOpenTrade = useCallback(() => {
    onOpenTradeModal({
      coinAddress,
      symbol,
      chainId,
      daoName,
      daoImage,
    })
  }, [onOpenTradeModal, coinAddress, symbol, chainId, daoName, daoImage])

  // Only show Trade button for Base chains (where swap functionality is available)
  const showTradeButton = isChainIdSupportedByCoining(chainId)

  return (
    <Flex gap="x2" align="center" wrap="wrap">
      {showTradeButton && (
        <Button size="sm" px="x3" variant="outline" onClick={handleOpenTrade}>
          Trade
        </Button>
      )}
      <LinkWrapper link={getCoinLink(chainId, coinAddress)} isExternal>
        <Button size="sm" px="x3" variant="secondary">
          View Coin
        </Button>
      </LinkWrapper>
      {shareUrl && <ShareButton url={shareUrl} size="sm" variant="secondary" />}
    </Flex>
  )
}
