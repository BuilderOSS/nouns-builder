import { Box, Flex, Stack, Text } from '@zoralabs/zord'
import dynamic from 'next/dynamic'
import React from 'react'

import { Icon } from 'src/components/Icon'
import { ETHERSCAN_BASE_URL } from 'src/constants/etherscan'
import { AuctionBidFragment } from 'src/data/subgraph/sdk.generated'
import { useChainStore } from 'src/stores/useChainStore'

import { AllBids } from '../AllBids'
import { allRecentBidsButton, recentBid } from '../Auction.css'
import { Bidder } from './Bidder'

const AnimatedModal = dynamic(() => import('src/components/Modal/AnimatedModal'), {
  ssr: false,
})

interface RecentBidsProps {
  bids: AuctionBidFragment[]
}

export const RecentBids: React.FC<RecentBidsProps> = ({ bids }) => {
  const chain = useChainStore((x) => x.chain)

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
              href={`${ETHERSCAN_BASE_URL[chain.id]}/address/${bidder}`}
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
