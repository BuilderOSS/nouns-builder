import { useTimeout } from '@buildeross/hooks/useTimeout'
import { auctionAbi } from '@buildeross/sdk/contract'
import { AuctionBidFragment } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import dayjs from 'dayjs'
import { Fragment, useState } from 'react'
import { formatEther, isAddress } from 'viem'
import { useReadContract } from 'wagmi'

import { AuctionDetails } from '../AuctionDetails'
import { BidAmount } from '../BidAmount'
import { ActionsWrapper } from '../BidHistory'
import { WinningBidder } from '../WinningBidder'
import { AuctionCountdown } from './AuctionCountdown'
import { PlaceBid } from './PlaceBid'
import { RecentBids } from './RecentBids'
import { Settle } from './Settle'

export const CurrentAuction = ({
  chainId,
  tokenId,
  auctionAddress,
  tokenAddress,
  auctionPaused,
  daoName,
  bid,
  owner,
  endTime,
  bids,
  referral: referralParam,
  onSuccess,
}: {
  chainId: CHAIN_ID
  tokenId: string
  auctionAddress: AddressType
  tokenAddress: AddressType
  auctionPaused: boolean
  daoName: string
  bid?: bigint
  owner?: string
  endTime?: number
  bids: AuctionBidFragment[]
  referral?: AddressType
  onSuccess?: () => void
}) => {
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
    !auctionVersion?.startsWith('1') && !!referralParam && isAddress(referralParam)
      ? (referralParam as AddressType)
      : undefined

  if (isEnded || isOver) {
    return (
      <Fragment>
        <AuctionDetails>
          <BidAmount isOver bid={formattedBid} />
          <WinningBidder owner={owner} />
        </AuctionDetails>

        <ActionsWrapper>
          <Settle
            isEnding={isEnding}
            owner={owner}
            chainId={chainId}
            auctionAddress={auctionAddress}
            auctionPaused={auctionPaused}
          />
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
        <PlaceBid
          daoName={daoName}
          chainId={chainId}
          tokenId={tokenId}
          highestBid={bid}
          referral={referral}
          auctionAddress={auctionAddress}
          tokenAddress={tokenAddress}
          onSuccess={onSuccess}
        />
      </ActionsWrapper>

      <RecentBids bids={bids} />
    </Fragment>
  )
}
