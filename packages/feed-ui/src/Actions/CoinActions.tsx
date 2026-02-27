import { BASE_URL } from '@buildeross/constants/baseUrl'
import { type AddressType, CHAIN_ID } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { LikeButton } from '@buildeross/ui/LikeButton'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { ShareButton } from '@buildeross/ui/ShareButton'
import {
  isChainIdSupportedByCoining,
  isChainIdSupportedForSaleOfZoraCoins,
} from '@buildeross/utils/coining'
import { Button, Flex } from '@buildeross/zord'
import React, { useCallback, useMemo } from 'react'
import { useAccount, useBalance } from 'wagmi'

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
  symbol,
  daoName,
  daoImage,
  onOpenTradeModal,
  isClankerToken,
}) => {
  const { getCoinLink } = useLinks()

  const buttonSize = { '@initial': 'xs', '@768': 'sm' } as const

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
      isZoraCoin: !isClankerToken,
    })
  }, [onOpenTradeModal, coinAddress, symbol, chainId, daoName, daoImage, isClankerToken])

  // Only show Trade button for Base chains (where swap functionality is available)
  const showTradeButton = isChainIdSupportedByCoining(chainId)
  const sellEnabled = isClankerToken
    ? true
    : isChainIdSupportedForSaleOfZoraCoins(chainId)

  const { address: userAddress } = useAccount()

  // Get user's coin balance to determine if they can trade
  // Only fetch balance if sellEnabled is true (otherwise we always show "Buy")
  const { data: coinBalance } = useBalance({
    address: userAddress,
    token: coinAddress,
    chainId,
    query: {
      enabled: !!userAddress && sellEnabled,
    },
  })

  // Check if user owns any of this coin
  const hasBalance = useMemo(() => {
    return sellEnabled && coinBalance && coinBalance.value > 0n
  }, [sellEnabled, coinBalance])

  // Show like button only for Zora coins (not Clanker tokens) on supported chains
  const showLikeButton = !isClankerToken && isChainIdSupportedByCoining(chainId)

  return (
    <Flex gap="x2" align="center" wrap="wrap">
      {showTradeButton && (
        <ContractButton
          size={buttonSize}
          px="x3"
          variant="outline"
          handleClick={handleOpenTrade}
          chainId={chainId}
        >
          {sellEnabled && hasBalance ? 'Trade' : 'Buy'}
        </ContractButton>
      )}
      <LinkWrapper link={getCoinLink(chainId, coinAddress)} isExternal>
        <Button size={buttonSize} px="x3" variant="secondary">
          View Coin
        </Button>
      </LinkWrapper>
      {showLikeButton && isChainIdSupportedByCoining(chainId) && (
        <LikeButton
          coinAddress={coinAddress}
          symbol={symbol}
          chainId={chainId}
          size={buttonSize}
          variant="secondary"
        />
      )}
      {shareUrl && <ShareButton url={shareUrl} size={buttonSize} variant="secondary" />}
    </Flex>
  )
}
