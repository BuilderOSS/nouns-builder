import type { FeedItem as FeedItemType } from '@buildeross/types'
import { Box, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { AuctionBidPlacedItem } from './AuctionBidPlacedItem'
import { AuctionCreatedItem } from './AuctionCreatedItem'
import { AuctionSettledItem } from './AuctionSettledItem'
import { feedItemCard, feedItemIcon, feedItemMeta } from './Feed.css'
import { FeedItemActor } from './FeedItemActor'
import { FeedItemDao } from './FeedItemDao'
import { ProposalCreatedItem } from './ProposalCreatedItem'
import { ProposalExecutedItem } from './ProposalExecutedItem'
import { ProposalUpdatedItem } from './ProposalUpdatedItem'
import { ProposalVotedItem } from './ProposalVotedItem'

export interface FeedItemProps {
  item: FeedItemType
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const FeedItemIconWrapper = ({ type }: { type: FeedItemType['type'] }) => {
  const getIcon = () => {
    switch (type) {
      case 'PROPOSAL_CREATED':
        return 'plus'
      case 'PROPOSAL_UPDATED':
        return 'refresh'
      case 'PROPOSAL_VOTED':
        return 'check'
      case 'PROPOSAL_EXECUTED':
        return 'checkInCircle'
      case 'AUCTION_CREATED':
        return 'collection'
      case 'AUCTION_BID_PLACED':
        return 'eth'
      case 'AUCTION_SETTLED':
        return 'checkInCircle'
      default:
        return 'question'
    }
  }

  return (
    <Box className={feedItemIcon}>
      <Icon id={getIcon()} size="md" />
    </Box>
  )
}

export const FeedItem: React.FC<FeedItemProps> = ({ item }) => {
  const renderContent = () => {
    switch (item.type) {
      case 'PROPOSAL_CREATED':
        return <ProposalCreatedItem item={item} />
      case 'PROPOSAL_UPDATED':
        return <ProposalUpdatedItem item={item} />
      case 'PROPOSAL_VOTED':
        return <ProposalVotedItem item={item} />
      case 'PROPOSAL_EXECUTED':
        return <ProposalExecutedItem item={item} />
      case 'AUCTION_CREATED':
        return <AuctionCreatedItem item={item} />
      case 'AUCTION_BID_PLACED':
        return <AuctionBidPlacedItem item={item} />
      case 'AUCTION_SETTLED':
        return <AuctionSettledItem item={item} />
      default:
        return <Text color="text3">Unknown feed item type</Text>
    }
  }

  return (
    <Flex className={feedItemCard}>
      <Flex gap="x4" w="100%">
        <FeedItemIconWrapper type={item.type} />

        <Stack gap="x3" style={{ flex: 1, minWidth: 0 }}>
          {renderContent()}

          <Flex justify="space-between" align="center" mt="x2" gap="x4" wrap="wrap">
            <Flex gap="x4" align="center" wrap="wrap">
              <FeedItemActor address={item.actor} />
              <FeedItemDao
                address={item.daoId}
                chainId={item.chainId}
                daoName={item.daoName}
                daoImage={item.daoImage}
              />
            </Flex>
            <Text className={feedItemMeta}>{formatTimestamp(item.timestamp)}</Text>
          </Flex>
        </Stack>
      </Flex>
    </Flex>
  )
}
