import { AuctionBidFragment } from '@buildeross/sdk/subgraph'
import { AnimatedModal } from '@buildeross/ui'
import { Box, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { AllBids } from '../AllBids'
import { allRecentBidsButton, recentBid } from '../Auction.css'
import { Bidder } from './Bidder'

interface RecentBidsProps {
  bids: AuctionBidFragment[]
}

export const RecentBids: React.FC<RecentBidsProps> = ({ bids }) => {
  return bids.length ? (
    <Box mt="x3">
      <Stack>
        {bids.slice(0, 3).map(({ amount, bidder, id }) => (
          <Flex
            align="center"
            py="x2"
            justify="space-between"
            key={`${bidder}_${amount}_${id}`}
            className={recentBid}
          >
            <Bidder address={bidder} />

            <Flex
              align="center"
              as="a"
              href={`/profile/${bidder}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Text mr="x2" variant="paragraph-md" color="tertiary">
                {amount} ETH
              </Text>
              <Icon id="external-16" fill="text4" size="sm" align={'center'} />
            </Flex>
          </Flex>
        ))}
        <Flex mt="x4" align="center" justify="center" className={recentBid}>
          <AnimatedModal
            trigger={
              <button type="button" className={allRecentBidsButton}>
                View All Bids
              </button>
            }
          >
            <AllBids bids={bids} />
          </AnimatedModal>
        </Flex>
      </Stack>
    </Box>
  ) : (
    <Flex mt="x5" align="center" justify="center">
      <Text variant="paragraph-lg" color="tertiary">
        No bids yet
      </Text>
    </Flex>
  )
}
