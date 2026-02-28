import { CHAIN_ID } from '@buildeross/types'
import { DropMintWidget } from '@buildeross/ui/DropMintWidget'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Stack } from '@buildeross/zord'
import React from 'react'
import { Address } from 'viem'

import { ModalHeader } from './ModalHeader'

export interface MintModalProps {
  isOpen: boolean
  onClose: () => void
  dropAddress: Address
  symbol: string
  chainId: CHAIN_ID
  daoName: string
  daoImage: string
  priceEth: string
  saleActive: boolean
  saleNotStarted: boolean
  saleEnded: boolean
  saleStart?: number
  saleEnd?: number
  editionSize?: string
  maxPerAddress?: number
  onMintSuccess?: (txHash: string) => void
}

export const MintModal: React.FC<MintModalProps> = ({
  isOpen,
  onClose,
  dropAddress,
  symbol,
  chainId,
  daoName,
  daoImage,
  priceEth,
  saleActive,
  saleNotStarted,
  saleEnded,
  saleStart,
  saleEnd,
  editionSize,
  maxPerAddress,
  onMintSuccess,
}) => {
  const onSuccessMint = React.useCallback(
    (txHash: string) => {
      onMintSuccess?.(txHash)
      onClose()
    },
    [onClose, onMintSuccess]
  )

  return (
    <AnimatedModal open={isOpen} close={onClose} size="medium">
      <Stack w="100%">
        <ModalHeader
          daoName={daoName}
          daoImage={daoImage}
          title={`Mint ${symbol}`}
          onClose={onClose}
        />
        <DropMintWidget
          chainId={chainId}
          dropAddress={dropAddress}
          symbol={symbol}
          priceEth={priceEth}
          saleActive={saleActive}
          saleNotStarted={saleNotStarted}
          saleEnded={saleEnded}
          saleStart={saleStart}
          saleEnd={saleEnd}
          editionSize={editionSize}
          maxPerAddress={maxPerAddress}
          onMintSuccess={onSuccessMint}
        />
      </Stack>
    </AnimatedModal>
  )
}
