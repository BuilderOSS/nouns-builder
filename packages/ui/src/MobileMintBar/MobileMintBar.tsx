import { Button } from '@buildeross/zord'
import React from 'react'

import { ShareButton } from '../ShareButton'
import { mintButton, mobileMintBar } from './MobileMintBar.css'

export interface MobileMintBarProps {
  symbol: string
  priceEth: string
  shareUrl: string | null
  saleActive: boolean
  onMintClick: () => void
}

export const MobileMintBar: React.FC<MobileMintBarProps> = ({
  symbol,
  shareUrl,
  saleActive,
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
        Mint {symbol}
      </Button>
    </div>
  )
}
