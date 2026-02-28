import type { FeedItem as FeedItemType } from '@buildeross/types'
import { formatTimeAgo } from '@buildeross/utils/formatTime'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { isAddressEqual } from 'viem'

import { FeedItemActions } from './Actions/FeedItemActions'
import { AuctionBidPlacedItem } from './AuctionBidPlacedItem'
import { AuctionCreatedItem } from './AuctionCreatedItem'
import { AuctionSettledItem } from './AuctionSettledItem'
import { ClankerTokenCreatedItem } from './ClankerTokenCreatedItem'
import { feedItemCard, feedItemChain, feedItemMeta, feedItemMetaRow } from './Feed.css'
import { FeedItemActor } from './FeedItemActor'
import { FeedItemChain } from './FeedItemChain'
import { FeedItemDao } from './FeedItemDao'
import { ProposalCreatedItem } from './ProposalCreatedItem'
import { ProposalExecutedItem } from './ProposalExecutedItem'
import { ProposalUpdatedItem } from './ProposalUpdatedItem'
import { ProposalVotedItem } from './ProposalVotedItem'
import type {
  OnOpenBidModal,
  OnOpenMintModal,
  OnOpenPropdateModal,
  OnOpenTradeModal,
  OnOpenVoteModal,
} from './types/modalStates'
import { ZoraCoinCreatedItem } from './ZoraCoinCreatedItem'
import { ZoraDropCreatedItem } from './ZoraDropCreatedItem'

export interface FeedItemProps {
  item: FeedItemType
  hideActor?: boolean
  hideDao?: boolean
  onOpenBidModal: OnOpenBidModal
  onOpenVoteModal: OnOpenVoteModal
  onOpenPropdateModal: OnOpenPropdateModal
  onOpenTradeModal: OnOpenTradeModal
  onOpenMintModal: OnOpenMintModal
}

const Separator = () => (
  <Flex align="center" justify="center">
    <Box
      style={{
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        overflow: 'hidden',
      }}
      backgroundColor="tertiary"
    />
  </Flex>
)

export const FeedItem: React.FC<FeedItemProps> = ({
  item,
  hideActor: outerHideActor = false,
  hideDao = false,
  onOpenBidModal,
  onOpenVoteModal,
  onOpenPropdateModal,
  onOpenTradeModal,
  onOpenMintModal,
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
      case 'CLANKER_TOKEN_CREATED':
        return <ClankerTokenCreatedItem item={item} />
      case 'ZORA_COIN_CREATED':
        return <ZoraCoinCreatedItem item={item} />
      case 'ZORA_DROP_CREATED':
        return <ZoraDropCreatedItem item={item} />
      default:
        return <Text color="text3">Unknown feed item type</Text>
    }
  }

  const hideActor = outerHideActor || isAddressEqual(item.actor, item.addresses.treasury)

  // Helper to determine whether to render separators
  const shouldShowSeparatorAfterActor = !hideActor && !hideDao

  return (
    <Flex className={feedItemCard}>
      <Stack gap="x3" w="100%">
        {/* Top row: User, DAO */}
        <Flex gap="x2" align="center" wrap>
          {/* Actor */}
          {!hideActor && <FeedItemActor address={item.actor} />}

          {/* Separator after actor */}
          {shouldShowSeparatorAfterActor && <Separator />}

          {/* DAO */}
          {!hideDao && (
            <FeedItemDao
              address={item.daoId}
              chainId={item.chainId}
              daoName={item.daoName}
              daoImage={item.daoImage}
            />
          )}
        </Flex>

        {/* Content */}
        {renderContent()}

        {/* Actions and metadata row - same row on desktop, different rows on mobile */}
        <Box className={feedItemMetaRow}>
          {/* Actions section */}
          <FeedItemActions
            item={item}
            onOpenBidModal={onOpenBidModal}
            onOpenVoteModal={onOpenVoteModal}
            onOpenPropdateModal={onOpenPropdateModal}
            onOpenTradeModal={onOpenTradeModal}
            onOpenMintModal={onOpenMintModal}
          />

          {/* Chain and timestamp */}
          <Flex gap="x2" align="center" wrap className={feedItemChain} flex={1}>
            {/* Chain */}
            <FeedItemChain chainId={item.chainId} />

            {/* Separator before timestamp */}
            <Separator />

            {/* Timestamp */}
            <Text className={feedItemMeta}>{formatTimeAgo(item.timestamp)}</Text>
          </Flex>
        </Box>
      </Stack>
    </Flex>
  )
}
