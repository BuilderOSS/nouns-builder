import { CHAIN_ID } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { SwapWidget } from '@buildeross/ui/SwapWidget'
import { Stack } from '@buildeross/zord'
import React from 'react'
import { Address } from 'viem'

import { ModalHeader } from './ModalHeader'

export interface TradeModalProps {
  isOpen: boolean
  onClose: () => void
  coinAddress: Address
  symbol: string
  chainId: CHAIN_ID
  daoName: string
  daoImage: string
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  coinAddress,
  symbol,
  chainId,
  daoName,
  daoImage,
}) => {
  return (
    <AnimatedModal open={isOpen} close={onClose} size="medium">
      <Stack w="100%">
        <ModalHeader
          daoName={daoName}
          daoImage={daoImage}
          title={`Trade ${symbol}`}
          onClose={onClose}
        />
        <SwapWidget
          coinAddress={coinAddress as `0x${string}`}
          symbol={symbol}
          chainId={chainId as CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA}
        />
      </Stack>
    </AnimatedModal>
  )
}
