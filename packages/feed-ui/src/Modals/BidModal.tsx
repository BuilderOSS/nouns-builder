import { CurrentAuction, useAuctionEvents } from '@buildeross/auction-ui'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { getBids } from '@buildeross/sdk/subgraph'
import type {
  AddressType,
  CHAIN_ID,
  RequiredDaoContractAddresses,
} from '@buildeross/types'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { Stack } from '@buildeross/zord'
import React, { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'

import { ModalHeader } from './ModalHeader'

export interface BidModalProps {
  isOpen: boolean
  onClose: () => void
  chainId: CHAIN_ID
  tokenId: string
  tokenName: string
  daoName: string
  daoImage: string
  addresses: RequiredDaoContractAddresses
  highestBid?: bigint
  highestBidder?: AddressType
  endTime?: number
  paused?: boolean
}

export const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  chainId,
  tokenId,
  tokenName,
  daoName,
  daoImage,
  addresses,
  highestBid,
  paused,
  highestBidder,
  endTime,
}) => {
  const [isSuccess, setIsSuccess] = useState(false)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
        successTimerRef.current = null
      }
    }
  }, [])

  const handleClose = () => {
    onClose()
    setIsSuccess(false)

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
  }

  const handleSuccess = () => {
    setIsSuccess(true)
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
    }
    // Auto-close after 2 seconds
    successTimerRef.current = setTimeout(() => {
      handleClose()
    }, 2000)
  }

  const { data: bids } = useSWR(
    chainId && tokenId && addresses.token
      ? ([
          SWR_KEYS.AUCTION_BIDS,
          chainId,
          addresses.token.toLowerCase(),
          tokenId.toString(),
        ] as const)
      : null,
    ([, _chainId, _collection, _tokenId]) => getBids(_chainId, _collection, _tokenId)
  )

  useAuctionEvents({
    chainId,
    auctionAddress: addresses.auction,
    tokenAddress: addresses.token,
    enabled: isOpen,
  })

  return (
    <AnimatedModal open={isOpen} close={handleClose} size="medium">
      {isSuccess ? (
        <SuccessModalContent
          success
          title="Bid Placed!"
          subtitle="Your bid has been submitted successfully"
        />
      ) : (
        <Stack w="100%">
          <ModalHeader
            daoName={daoName}
            daoImage={daoImage}
            title="Place Bid"
            subtitle={tokenName}
            onClose={handleClose}
          />

          <CurrentAuction
            chainId={chainId}
            tokenId={tokenId}
            auctionAddress={addresses.auction}
            tokenAddress={addresses.token}
            auctionPaused={paused ?? false}
            daoName={daoName}
            bid={highestBid}
            owner={highestBidder}
            endTime={endTime}
            bids={bids || []}
            onSuccess={handleSuccess}
          />
        </Stack>
      )}
    </AnimatedModal>
  )
}
