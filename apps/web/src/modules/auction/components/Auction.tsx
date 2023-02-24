import React, { Fragment } from 'react'
import { readContract } from '@wagmi/core'
import useSWR from 'swr'
import { Flex, Grid } from '@zoralabs/zord'

import { AddressType, TokenWithWinner } from 'src/typings'
import { auctionAbi } from 'src/data/contract/abis'
import SWR_KEYS from 'src/constants/swrKeys'
import getBids from 'src/data/contract/requests/getBids'

import { auctionGrid, auctionWrapper, auctionWrapVariants } from './Auction.css'
import { AuctionDetails } from './AuctionDetails'
import { ActionsWrapper, BidHistory } from './BidHistory'
import { CurrentAuction } from './CurrentAuction'
import { BidAmount } from './BidAmount'
import { WinningBidder } from './WinningBidder'
import { AuctionImage } from './AuctionImage'
import { AuctionTokenPicker } from './AuctionTokenPicker'
import { useAuctionEvents } from '../hooks'

interface AuctionControllerProps {
  auctionAddress: string
  collection: string
  token: TokenWithWinner
}

export const Auction: React.FC<AuctionControllerProps> = ({
  auctionAddress,
  collection,
  token,
}) => {
  const { mintDate, name, image, price: tokenPrice, owner: tokenOwner } = token

  const { data: auction } = useSWR(
    [SWR_KEYS.AUCTION, auctionAddress],
    (_, auctionAddress) =>
      readContract({
        abi: auctionAbi,
        address: auctionAddress as AddressType,
        functionName: 'auction',
      }),
    { revalidateOnFocus: true }
  )

  const isTokenActiveAuction = !!auction?.tokenId && auction.tokenId.eq(token.id)

  useAuctionEvents({
    collection,
    isTokenActiveAuction,
    tokenId: token.id,
  })

  const { data: bids } = useSWR([SWR_KEYS.AUCTION_BIDS, auctionAddress, token.id], () =>
    getBids(auctionAddress, token.id)
  )

  return (
    <Flex className={auctionWrapVariants['post']}>
      <Grid className={auctionGrid}>
        <AuctionImage
          key={`auction-${collection}-image-${token.id}`}
          image={image}
          isLoading={!auction}
        />

        <Flex
          direction={'column'}
          height={{ '@initial': 'auto', '@768': '100%' }}
          mt={{ '@initial': 'x4', '@768': 'x0' }}
          className={auctionWrapper}
        >
          <AuctionTokenPicker
            mintDate={mintDate}
            name={name}
            collection={collection}
            tokenId={Number(token.id)}
            currentAuction={auction?.tokenId.toNumber()}
          />

          {isTokenActiveAuction && !!auction && (
            <CurrentAuction
              tokenId={token.id}
              auctionAddress={auctionAddress}
              bid={auction.highestBid}
              owner={auction.highestBidder}
              endTime={auction.endTime}
              bids={bids || []}
            />
          )}

          {!isTokenActiveAuction && !!auction && (
            <Fragment>
              <AuctionDetails>
                <BidAmount isOver bid={tokenPrice ?? undefined} />
                <WinningBidder owner={tokenOwner ?? undefined} />
              </AuctionDetails>
              <ActionsWrapper>
                <BidHistory bids={bids || []} />
              </ActionsWrapper>
            </Fragment>
          )}
        </Flex>
      </Grid>
    </Flex>
  )
}
