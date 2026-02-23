import type { FeedItem } from '@buildeross/types'
import React from 'react'

import type {
  OnOpenBidModal,
  OnOpenMintModal,
  OnOpenPropdateModal,
  OnOpenTradeModal,
  OnOpenVoteModal,
} from '../types/modalStates'
import { AuctionActions } from './AuctionActions'
import { CoinActions } from './CoinActions'
import { ProposalActions } from './ProposalActions'
import { ZoraDropActions } from './ZoraDropActions'

interface FeedItemActionsProps {
  item: FeedItem
  onOpenBidModal: OnOpenBidModal
  onOpenVoteModal: OnOpenVoteModal
  onOpenPropdateModal: OnOpenPropdateModal
  onOpenTradeModal: OnOpenTradeModal
  onOpenMintModal: OnOpenMintModal
}

const ONE_MONTH = 30 * 24 * 60 * 60

export const FeedItemActions: React.FC<FeedItemActionsProps> = ({
  item,
  onOpenBidModal,
  onOpenVoteModal,
  onOpenPropdateModal,
  onOpenTradeModal,
  onOpenMintModal,
}) => {
  // Only show actions for recent items (last 30 days)
  const isRecent = item.timestamp > Date.now() / 1000 - ONE_MONTH

  if (!isRecent) {
    return null
  }

  switch (item.type) {
    case 'AUCTION_CREATED':
    case 'AUCTION_BID_PLACED':
    case 'AUCTION_SETTLED':
      return (
        <AuctionActions
          daoName={item.daoName}
          daoImage={item.daoImage}
          chainId={item.chainId}
          tokenId={item.tokenId}
          tokenName={item.tokenName}
          addresses={item.addresses}
          onOpenBidModal={onOpenBidModal}
        />
      )

    case 'PROPOSAL_CREATED':
    case 'PROPOSAL_VOTED':
    case 'PROPOSAL_UPDATED':
    case 'PROPOSAL_EXECUTED':
      return (
        <ProposalActions
          chainId={item.chainId}
          proposalId={item.proposalId}
          proposalNumber={item.proposalNumber}
          proposalTitle={item.proposalTitle}
          proposalTimeCreated={item.proposalTimeCreated}
          addresses={item.addresses}
          daoName={item.daoName}
          daoImage={item.daoImage}
          isExecuted={item.type === 'PROPOSAL_EXECUTED'}
          updateItem={item.type === 'PROPOSAL_UPDATED' ? item : undefined}
          onOpenVoteModal={onOpenVoteModal}
          onOpenPropdateModal={onOpenPropdateModal}
        />
      )

    case 'CLANKER_TOKEN_CREATED':
      return (
        <CoinActions
          chainId={item.chainId}
          coinAddress={item.tokenAddress}
          symbol={item.tokenSymbol}
          daoName={item.daoName}
          daoImage={item.daoImage}
          onOpenTradeModal={onOpenTradeModal}
          isClankerToken={true}
        />
      )

    case 'ZORA_COIN_CREATED':
      return (
        <CoinActions
          chainId={item.chainId}
          coinAddress={item.coinAddress}
          symbol={item.coinSymbol}
          daoName={item.daoName}
          daoImage={item.daoImage}
          onOpenTradeModal={onOpenTradeModal}
          isClankerToken={false}
        />
      )

    case 'ZORA_DROP_CREATED': {
      // Calculate sale timing
      const now = Date.now() / 1000
      const saleStart = item.publicSaleStart
      const saleEnd = item.publicSaleEnd
      const saleNotStarted = saleStart > now
      const saleEnded = saleEnd < now
      const saleActive = saleStart <= now && saleEnd > now

      return (
        <ZoraDropActions
          chainId={item.chainId}
          dropAddress={item.dropAddress}
          symbol={item.dropSymbol}
          daoName={item.daoName}
          daoImage={item.daoImage}
          priceEth={item.publicSalePrice}
          saleActive={saleActive}
          saleNotStarted={saleNotStarted}
          saleEnded={saleEnded}
          saleStart={saleStart}
          saleEnd={saleEnd}
          editionSize={item.editionSize}
          maxPerAddress={item.maxSalePurchasePerAddress}
          onOpenMintModal={onOpenMintModal}
        />
      )
    }

    default:
      return null
  }
}
