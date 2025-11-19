import type { FeedItem } from '@buildeross/types'
import React from 'react'

import { AuctionActions } from './AuctionActions'
import { ProposalActions } from './ProposalActions'

interface FeedItemActionsProps {
  item: FeedItem
}

export const FeedItemActions: React.FC<FeedItemActionsProps> = ({ item }) => {
  // Only show actions for recent items (last 30 days)
  const isRecent = item.timestamp > Date.now() / 1000 - 30 * 24 * 60 * 60

  if (!isRecent) {
    return null
  }

  switch (item.type) {
    case 'AUCTION_CREATED':
    case 'AUCTION_BID_PLACED':
    case 'AUCTION_SETTLED':
      return (
        <AuctionActions
          chainId={item.chainId}
          tokenId={item.tokenId}
          addresses={item.addresses}
        />
      )

    case 'PROPOSAL_CREATED':
    case 'PROPOSAL_VOTED':
      return (
        <ProposalActions
          chainId={item.chainId}
          proposalId={item.proposalId}
          proposalNumber={item.proposalNumber}
          isExecuted={false}
          addresses={item.addresses}
        />
      )

    case 'PROPOSAL_UPDATED':
      return (
        <ProposalActions
          chainId={item.chainId}
          proposalId={item.proposalId}
          proposalNumber={item.proposalNumber}
          isExecuted={false}
          isUpdate={true}
          addresses={item.addresses}
        />
      )

    case 'PROPOSAL_EXECUTED':
      return (
        <ProposalActions
          chainId={item.chainId}
          proposalId={item.proposalId}
          proposalNumber={item.proposalNumber}
          addresses={item.addresses}
          isExecuted={true}
        />
      )

    default:
      return null
  }
}
