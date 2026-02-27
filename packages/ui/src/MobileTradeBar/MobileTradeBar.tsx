import { CHAIN_ID } from '@buildeross/types'
import { Button } from '@buildeross/zord'
import React, { useMemo } from 'react'
import { Address } from 'viem'
import { useAccount, useBalance } from 'wagmi'

import { ShareButton } from '../ShareButton'
import { mobileTradeBar, tradeButton } from './MobileTradeBar.css'

export interface MobileTradeBarProps {
  symbol: string
  priceUsd: number | null
  shareUrl: string | null
  isLoadingPrice?: boolean
  onTradeClick: () => void
  chainId: CHAIN_ID
  coinAddress: Address
  sellEnabled?: boolean
}

export const MobileTradeBar: React.FC<MobileTradeBarProps> = ({
  symbol,
  shareUrl,
  onTradeClick,
  chainId,
  coinAddress,
  sellEnabled = true,
}) => {
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

  // Show "Trade" only if sellEnabled is true AND user has a balance
  const buttonText = sellEnabled && hasBalance ? `Trade ${symbol}` : `Buy ${symbol}`

  return (
    <div className={mobileTradeBar}>
      {shareUrl && <ShareButton url={shareUrl} variant="outline" />}
      <Button onClick={onTradeClick} variant="primary" className={tradeButton}>
        {buttonText}
      </Button>
    </div>
  )
}
