import type { FeedItem as FeedItemType } from '@buildeross/types'
import { Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { AuctionBidPlacedItem } from './AuctionBidPlacedItem'
import { AuctionCreatedItem } from './AuctionCreatedItem'
import { AuctionSettledItem } from './AuctionSettledItem'
import { feedItemCard, feedItemMeta } from './Feed.css'
import { FeedItemActor } from './FeedItemActor'
import { FeedItemDao } from './FeedItemDao'
import { ProposalCreatedItem } from './ProposalCreatedItem'
import { ProposalExecutedItem } from './ProposalExecutedItem'
import { ProposalUpdatedItem } from './ProposalUpdatedItem'
import { ProposalVotedItem } from './ProposalVotedItem'

export interface FeedItemProps {
  item: FeedItemType
  hideActor?: boolean
  hideDao?: boolean
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

export const FeedItem: React.FC<FeedItemProps> = ({
  item,
  hideActor = false,
  hideDao = false,
}) => {
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
      <Stack gap="x3" w="100%">
        {/* Top row: Avatars and timestamp */}
        <Flex gap="x2" align="center" wrap="wrap">
          {!hideActor && <FeedItemActor address={item.actor} />}
          {!hideActor && !hideDao && (
            <Text color="tertiary" fontSize="14">
              •
            </Text>
          )}
          {!hideDao && (
            <FeedItemDao
              address={item.daoId}
              chainId={item.chainId}
              daoName={item.daoName}
              daoImage={item.daoImage}
            />
          )}
          {(!hideActor || !hideDao) && (
            <Text color="tertiary" fontSize="14">
              •
            </Text>
          )}
          <Text className={feedItemMeta}>{formatTimestamp(item.timestamp)}</Text>
        </Flex>

        {/* Content */}
        {renderContent()}

        {/* Actions section */}
        <Flex
          gap="x4"
          align="center"
          pt="x2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {/* Placeholder for actions - to be implemented */}
        </Flex>
      </Stack>
    </Flex>
  )
}
