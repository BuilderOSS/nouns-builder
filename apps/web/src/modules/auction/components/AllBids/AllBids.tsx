import { AuctionBidFragment } from '@buildeross/sdk/subgraph'
import { Box, Flex } from '@buildeross/zord'
import React from 'react'

import { BidCard } from './BidCard'

interface AuctionAllBidsProps {
  bids: AuctionBidFragment[]
}

export const AllBids: React.FC<AuctionAllBidsProps> = ({ bids }) => {
  return (
    <Flex direction={'column'}>
      {bids.length > 0 ? (
        <>
          <Box fontSize={20} mb={'x2'}>
            Bid History
          </Box>

          <Flex pb="x4" direction="column" overflowY="auto" style={{ height: 200 }}>
            {bids.map((bid: AuctionBidFragment) => (
              <BidCard key={`${bid.bidder}_${bid.amount}_expanded`} bid={bid} />
            ))}
          </Flex>
        </>
      ) : (
        <Box fontSize={20}>No bids</Box>
      )}
    </Flex>
  )
}
