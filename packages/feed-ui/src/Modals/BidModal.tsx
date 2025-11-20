import { CurrentAuction, useAuctionEvents } from '@buildeross/auction-ui'
import { PUBLIC_ALL_CHAINS } from '@buildeross/constants'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { getBids } from '@buildeross/sdk/subgraph'
import type {
  AddressType,
  CHAIN_ID,
  RequiredDaoContractAddresses,
} from '@buildeross/types'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { Stack, Text } from '@buildeross/zord'
import React, { useState } from 'react'
import useSWR from 'swr'

export interface BidModalProps {
  isOpen: boolean
  onClose: () => void
  chainId: CHAIN_ID
  tokenId: string
  tokenName: string
  daoName: string
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
  addresses,
  highestBid,
  paused,
  highestBidder,
  endTime,
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

  const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)!

  return (
    <AnimatedModal open={isOpen} close={handleClose} size="medium">
      <>
        {isOpen &&
          (isSuccess ? (
            <SuccessModalContent
              success
              title="Bid Placed!"
              subtitle="Your bid has been submitted successfully"
            />
          ) : (
            <Stack p="x6" w="100%">
              <Text variant="heading-md" mb="x4">
                Place Your Bid
              </Text>
              <Text variant="paragraph-sm" color="tertiary" mb="x6">
                Token: {tokenName}
              </Text>

              <CurrentAuction
                chainId={chain.id}
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
          ))}
      </>
    </AnimatedModal>
  )
}
