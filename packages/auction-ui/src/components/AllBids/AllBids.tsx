import { AuctionBidFragment } from '@buildeross/sdk/subgraph'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import React from 'react'

import { BidCard } from './BidCard'

interface AuctionAllBidsProps {
  bids: AuctionBidFragment[]
  onClose?: () => void
}

export const AllBids: React.FC<AuctionAllBidsProps> = ({ bids, onClose }) => {
  return (
    <Flex direction={'column'}>
      {bids.length > 0 ? (
        <>
          <Flex align="center" justify="space-between" mb="x4" py="x2">
            <Text variant="heading-md" fontWeight="display">
              Bid History
            </Text>
            {onClose ? (
              <Button
                variant="ghost"
                p="x0"
                size="xs"
                onClick={onClose}
                style={{ padding: 0, flexShrink: 0 }}
              >
                <Icon id="cross" />
              </Button>
            ) : null}
          </Flex>

          <Flex
            pb="x4"
            direction="column"
            overflowY="auto"
            style={{ maxHeight: 'min(70vh, 640px)' }}
          >
            {bids.map((bid: AuctionBidFragment) => (
              <BidCard
                key={`${bid.bidder}_${bid.amount}_expanded`}
                bid={bid}
                walletPreview={false}
              />
            ))}
          </Flex>
        </>
      ) : (
        <>
          <Flex align="center" justify="space-between" mb="x4" py="x2">
            <Text variant="heading-md" fontWeight="display">
              Bid History
            </Text>
            {onClose ? (
              <Button
                variant="ghost"
                p="x0"
                size="xs"
                onClick={onClose}
                style={{ padding: 0, flexShrink: 0 }}
              >
                <Icon id="cross" />
              </Button>
            ) : null}
          </Flex>
          <Box fontSize={20}>No bids</Box>
        </>
      )}
    </Flex>
  )
}
