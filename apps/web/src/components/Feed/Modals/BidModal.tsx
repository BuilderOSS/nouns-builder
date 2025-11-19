import { PlaceBid } from '@buildeross/auction-ui'
import { PUBLIC_ALL_CHAINS } from '@buildeross/constants'
import type { CHAIN_ID, RequiredDaoContractAddresses } from '@buildeross/types'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { Stack, Text } from '@buildeross/zord'
import React, { useState } from 'react'

export interface BidModalProps {
  isOpen: boolean
  onClose: () => void
  chainId: CHAIN_ID
  tokenId: string
  daoName: string
  addresses: RequiredDaoContractAddresses
  highestBid?: bigint
}

export const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  chainId,
  tokenId,
  daoName,
  addresses,
  highestBid,
}) => {
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSuccess = () => {
    setIsSuccess(true)
    // Auto-close after 2 seconds
    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 2000)
  }

  const handleClose = () => {
    setIsSuccess(false)
    onClose()
  }

  const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)!

  return (
    <AnimatedModal open={isOpen} close={handleClose} size="medium">
      {isSuccess ? (
        <SuccessModalContent
          success
          title="Bid Placed!"
          subtitle="Your bid has been submitted successfully"
        />
      ) : (
        <Stack gap="x6" p="x6" w="100%">
          <Text variant="heading-md">Place Your Bid</Text>
          <PlaceBid
            chain={chain}
            tokenId={tokenId}
            daoName={daoName}
            addresses={addresses}
            highestBid={highestBid}
            onSuccess={handleSuccess}
          />
        </Stack>
      )}
    </AnimatedModal>
  )
}
