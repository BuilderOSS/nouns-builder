import { Button } from '@buildeross/zord'
import React from 'react'

import { ShareButton } from '../ShareButton'
import { mintButton, mobileMintBar, priceDisplay } from './MobileMintBar.css'

export interface MobileMintBarProps {
  symbol: string
  priceEth: string
  shareUrl: string | null
  saleActive: boolean
  onMintClick: () => void
}

export const MobileMintBar: React.FC<MobileMintBarProps> = ({
  symbol,
  priceEth,
  shareUrl,
  saleActive,
  onMintClick,
}) => {
  return (
    <div className={mobileMintBar}>
      {shareUrl && <ShareButton url={shareUrl} variant="outline" />}
      <div className={priceDisplay}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
          {Number(priceEth) === 0 ? 'Free' : `${priceEth} ETH`}
        </span>
      </div>
      <Button
        onClick={onMintClick}
        variant="primary"
        className={mintButton}
        disabled={!saleActive}
      >
        Mint {symbol}
      </Button>
    </div>
  )
}
