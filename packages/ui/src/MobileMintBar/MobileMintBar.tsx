import { Button } from '@buildeross/zord'
import React from 'react'

import { ShareButton } from '../ShareButton'
import { mintButton, mobileMintBar } from './MobileMintBar.css'

export interface MobileMintBarProps {
  symbol: string
  priceEth: string
  shareUrl: string | null
  saleActive: boolean
  saleNotStarted: boolean
  saleEnded: boolean
  onMintClick: () => void
}

export const MobileMintBar: React.FC<MobileMintBarProps> = ({
  symbol,
  shareUrl,
  saleActive,
  saleNotStarted,
  saleEnded,
  onMintClick,
}) => {
  return (
    <div className={mobileMintBar}>
      {shareUrl && <ShareButton url={shareUrl} variant="outline" />}
      <Button
        onClick={onMintClick}
        variant="primary"
        className={mintButton}
        disabled={!saleActive}
      >
        {saleActive
          ? `Mint ${symbol}`
          : saleNotStarted
            ? 'Sale Not Started'
            : saleEnded
              ? 'Sale Ended'
              : 'Mint Unavailable'}
      </Button>
    </div>
  )
}
