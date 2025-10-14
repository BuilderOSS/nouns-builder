import { Settle } from '@buildeross/auction-ui'
import { useMinBidIncrement } from '@buildeross/hooks/useMinBidIncrement'
import { auctionAbi } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { maxChar } from '@buildeross/utils/helpers'
import { Box, Button } from '@buildeross/zord'
import * as Sentry from '@sentry/nextjs'
import React, { useCallback, useMemo, useState } from 'react'
import { Address, parseEther } from 'viem'
import { useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

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
  const config = useConfig()
  const { minBidAmount } = useMinBidIncrement({
    highestBid: highestBid?.amount ? BigInt(highestBid?.amount) : undefined,
    reservePrice: BigInt(reservePrice),
    minBidIncrement: BigInt(minimumBidIncrement),
  })

  const [bidAmount, setBidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isMinBid = useMemo(
    () => Number(bidAmount) >= minBidAmount,
    [bidAmount, minBidAmount]
  )

  const isValidBid = bidAmount && isMinBid

  const handleCreateBid = useCallback(async () => {
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
  }, [
    isMinBid,
    bidAmount,
    isLoading,
    config,
    auctionAddress,
    currentAuction?.token?.tokenId,
    chainId,
  ])

  if (isEnded || isOver) {
    return (
      <Settle
        isEnding={false}
        owner={highestBid?.bidder}
        auctionAddress={auctionAddress}
        compact={true}
        chainId={chainId}
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
        disabled={!isValidBid}
        loading={isLoading}
        handleClick={handleCreateBid}
        position={'relative'}
        className={bidButton}
        chainId={chainId}
      >
        Bid
      </ContractButton>
    </>
  )
}
