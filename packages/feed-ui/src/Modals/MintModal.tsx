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
}) => {
  return (
    <AnimatedModal key="feed-mint-modal" open={isOpen} close={onClose} size="medium">
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
          onMintSuccess={() => {
            // Could show success toast here
          }}
        />
      </Stack>
    </AnimatedModal>
  )
}
