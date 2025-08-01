import { auctionAbi } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { maxChar } from '@buildeross/utils/helpers'
import { Box, Button } from '@buildeross/zord'
import * as Sentry from '@sentry/nextjs'
import React, { useState } from 'react'
import { ContractButton } from 'src/components/ContractButton'
import { Address, parseEther } from 'viem'
import { useChainId, useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { useMinBidIncrement } from '../auction'
import { Settle } from '../auction/components/CurrentAuction/Settle'
import { DashboardDaoProps } from './Dashboard'
import { bidButton, bidForm, bidInput, minButton } from './dashboard.css'

export const BidActionButton = ({
  chainId,
  auctionConfig,
  currentAuction,
  isEnded,
  auctionAddress,
  isOver,
}: DashboardDaoProps & {
  userAddress: AddressType
  isOver: boolean
  isEnded: boolean
}) => {
  const { minimumBidIncrement, reservePrice } = auctionConfig
  const { highestBid } = currentAuction || {}
  const wagmiChainId = useChainId()
  const config = useConfig()
  const { minBidAmount } = useMinBidIncrement({
    highestBid: highestBid?.amount ? BigInt(highestBid?.amount) : undefined,
    reservePrice: BigInt(reservePrice),
    minBidIncrement: BigInt(minimumBidIncrement),
  })

  const [bidAmount, setBidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isMinBid = Number(bidAmount) >= minBidAmount

  const isValidBid = bidAmount && isMinBid

  const isValidChain = wagmiChainId === chainId

  const handleCreateBid = async () => {
    if (!isMinBid || !bidAmount || isLoading) return

    try {
      setIsLoading(true)

      const data = await simulateContract(config, {
        abi: auctionAbi,
        address: auctionAddress as Address,
        functionName: 'createBid',
        args: [BigInt(currentAuction?.token?.tokenId)],
        value: parseEther(bidAmount.toString()),
      })

      const txHash = await writeContract(config, data.request)
      if (txHash) await waitForTransactionReceipt(config, { hash: txHash, chainId })
      setBidAmount('')
    } catch (error) {
      console.error(error)
      Sentry.captureException(error)
      await Sentry.flush(2000)
    } finally {
      setIsLoading(false)
    }
  }

  if (isEnded || isOver) {
    return (
      <Settle
        isEnding={false}
        owner={highestBid?.bidder}
        externalAuctionAddress={auctionAddress}
        compact={true}
      />
    )
  }

  return (
    <>
      <form className={bidForm}>
        <Box position="relative" mr={'x2'}>
          <input
            className={bidInput}
            placeholder={maxChar(`${minBidAmount} ETH`, 12)}
            type={'number'}
            min={minBidAmount}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            position="absolute"
            height={'100%'}
            mr={'x4'}
            px={'x0'}
            fontWeight={'label'}
            size="sm"
            variant="ghost"
            className={minButton}
            onClick={() => {
              setBidAmount(minBidAmount.toString())
            }}
            disabled={Number(bidAmount) >= minBidAmount}
          >
            Min
          </Button>
        </Box>
      </form>
      <ContractButton
        borderRadius={'curved'}
        disabled={!isValidBid || !isValidChain}
        loading={isLoading}
        handleClick={() => {
          handleCreateBid()
        }}
        position={'relative'}
        className={bidButton}
      >
        Bid
      </ContractButton>
    </>
  )
}
