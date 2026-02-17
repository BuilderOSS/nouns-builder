import { Button } from '@buildeross/zord'
import React from 'react'

import { ShareButton } from '../ShareButton'
import { mobileTradeBar, tradeButton } from './MobileTradeBar.css'

export interface MobileTradeBarProps {
  symbol: string
  priceUsd: number | null
  shareUrl: string | null
  isLoadingPrice?: boolean
  onTradeClick: () => void
}

export const MobileTradeBar: React.FC<MobileTradeBarProps> = ({
  symbol,
  shareUrl,
  onTradeClick,
}) => {
  return (
    <div className={mobileTradeBar}>
      {shareUrl && <ShareButton url={shareUrl} variant="outline" />}
      <Button onClick={onTradeClick} variant="primary" className={tradeButton}>
        Trade {symbol}
      </Button>
    </div>
  )
}
