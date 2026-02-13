import { formatPrice } from '@buildeross/utils/formatMarketCap'
import { Button, Icon, Spinner, Text } from '@buildeross/zord'
import React from 'react'

import { mobileTradeBar, priceDisplay, tradeButton } from './MobileTradeBar.css'

export interface MobileTradeBarProps {
  symbol: string
  priceUsd: number | null
  isLoadingPrice?: boolean
  onTradeClick: () => void
}

export const MobileTradeBar: React.FC<MobileTradeBarProps> = ({
  symbol,
  priceUsd,
  isLoadingPrice,
  onTradeClick,
}) => {
  return (
    <div className={mobileTradeBar}>
      <div className={priceDisplay}>
        <Text variant="label-sm" color="text3">
          Current Price
        </Text>
        <Text variant="heading-xs">
          {isLoadingPrice ? <Spinner size="sm" /> : formatPrice(priceUsd)}
        </Text>
      </div>
      <Button onClick={onTradeClick} variant="primary" className={tradeButton}>
        <Icon id="swap" />
        Trade {symbol}
      </Button>
    </div>
  )
}
