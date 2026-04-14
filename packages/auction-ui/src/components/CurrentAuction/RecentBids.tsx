import { AuctionBidFragment } from '@buildeross/sdk/subgraph'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Box, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { AllBids } from '../AllBids'
import { allRecentBidsButton, recentBid, recentBidRow } from '../Auction.css'
import { Bidder } from './Bidder'

interface RecentBidsProps {
  bids: AuctionBidFragment[]
}

export const RecentBids: React.FC<RecentBidsProps> = ({ bids }) => {
  const [showAllBidsModal, setShowAllBidsModal] = React.useState(false)
  const inlineBids = bids.slice(0, 2)
  const bidsCountLabel = bids.length === 1 ? '1 bid' : `${bids.length} bids`
  const shouldShowAllBidsButtonOnMobile = bids.length > 1
  const shouldShowAllBidsButtonOnDesktop = bids.length > 2
  const shouldShowAllBidsButton =
    shouldShowAllBidsButtonOnMobile || shouldShowAllBidsButtonOnDesktop

  return bids.length ? (
    <Box mt="x3">
      <Stack>
        {inlineBids.map(({ amount, bidder, id, comment }) => (
          <Flex
            direction="column"
            align="center"
            key={`${bidder}_${amount}_${id}`}
            className={`${recentBid} ${recentBidRow}`}
          >
            <Flex align="center" justify="space-between" width="100%">
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

            {comment?.trim() ? (
              <Text
                mt="x2"
                variant="paragraph-sm"
                color="secondary"
                style={{ width: '100%', wordBreak: 'break-word' }}
              >
                {comment.trim()}
              </Text>
            ) : null}
          </Flex>
        ))}
        {shouldShowAllBidsButton ? (
          <Flex
            mt="x4"
            align="center"
            justify="center"
            className={recentBid}
            display={{
              '@initial': shouldShowAllBidsButtonOnMobile ? 'flex' : 'none',
              '@768': shouldShowAllBidsButtonOnDesktop ? 'flex' : 'none',
            }}
          >
            <AnimatedModal
              open={showAllBidsModal}
              close={() => setShowAllBidsModal(false)}
              trigger={
                <button
                  type="button"
                  className={allRecentBidsButton}
                  onClick={() => setShowAllBidsModal(true)}
                >
                  {`View all ${bidsCountLabel}`}
                </button>
              }
            >
              <AllBids bids={bids} onClose={() => setShowAllBidsModal(false)} />
            </AnimatedModal>
          </Flex>
        ) : null}
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
