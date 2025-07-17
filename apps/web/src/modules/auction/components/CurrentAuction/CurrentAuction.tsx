import { AddressType, Chain } from '@buildeross/types'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import React, { Fragment, useState } from 'react'
import { formatEther } from 'viem'
import { useReadContract } from 'wagmi'

import { auctionAbi } from 'src/data/contract/abis'
import { AuctionBidFragment } from 'src/data/subgraph/sdk.generated'
import { useTimeout } from 'src/hooks/useTimeout'

import { AuctionDetails } from '../AuctionDetails'
import { BidAmount } from '../BidAmount'
import { ActionsWrapper } from '../BidHistory'
import { WinningBidder } from '../WinningBidder'
import { AuctionCountdown } from './AuctionCountdown'
import { MemoizedPlaceBid } from './PlaceBid'
import { RecentBids } from './RecentBids'
import { Settle } from './Settle'

export const CurrentAuction = ({
  chain,
  tokenId,
  auctionAddress,
  daoName,
  bid,
  owner,
  endTime,
  bids,
}: {
  chain: Chain
  tokenId: string
  auctionAddress: AddressType
  daoName: string
  bid?: bigint
  owner?: string
  endTime?: number
  bids: AuctionBidFragment[]
}) => {
  const { query } = useRouter()
  const [isEnded, setIsEnded] = useState(false)
  const [isEnding, setIsEnding] = useState(false)

  const { data: auctionVersion } = useReadContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'contractVersion',
  })

  const isEndingTimeout = isEnded ? 4000 : null

  useTimeout(() => {
    setIsEnding(false)
  }, isEndingTimeout)

  const onEnd = () => {
    setIsEnded(true)
    setIsEnding(true)
  }

  const isOver = !!endTime ? dayjs.unix(Date.now() / 1000) >= dayjs.unix(endTime) : true
  const formattedBid = bid ? formatEther(bid) : ''

  // Set the referral if auction version is != 1 and query.referral is present
  const referral =
    !auctionVersion?.startsWith('1') && query.referral
      ? (query.referral as AddressType)
      : undefined

  if (isEnded || isOver) {
    return (
      <Fragment>
        <AuctionDetails>
          <BidAmount isOver bid={formattedBid} />
          <WinningBidder owner={owner} />
        </AuctionDetails>

        <ActionsWrapper>
          <Settle isEnding={isEnding} owner={owner} />
        </ActionsWrapper>
      </Fragment>
    )
  }

  return (
    <Fragment>
      <AuctionDetails>
        <BidAmount isOver={false} bid={formattedBid} />
        <AuctionCountdown endTime={endTime as number} onEnd={onEnd} />
      </AuctionDetails>

      <ActionsWrapper>
        <MemoizedPlaceBid
          daoName={daoName}
          chain={chain}
          tokenId={tokenId}
          highestBid={bid}
          referral={referral}
        />
      </ActionsWrapper>

      <RecentBids bids={bids} />
    </Fragment>
  )
}
