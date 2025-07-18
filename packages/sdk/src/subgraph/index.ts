// SDK exported from main index with alias
export * from './requests/auctionHistory'
export * from './requests/averageWinningBid'
export * from './requests/daoMembership'
export * from './requests/daoMetadata'
export * from './requests/daoQuery'
export * from './requests/daoVoters'
export * from './requests/dashboardQuery'
export * from './requests/exploreQueries'
export * from './requests/getBids'
export * from './requests/homepageQuery'
export * from './requests/memberSnapshot'
export * from './requests/proposalQuery'
export * from './requests/proposalsQuery'
export * from './requests/sync'
export * from './requests/tokensQuery'
export { SDK as SubgraphSDK } from './client'

export {
  Auction_OrderBy,
  type AuctionFragment,
  type AuctionBidFragment,
  type AuctionHistoryQuery,
  type CurrentAuctionFragment,
  type DaoFragment,
  type ProposalFragment,
  type ProposalVoteFragment,
  ProposalVoteSupport,
  OrderDirection,
  Token_OrderBy,
  Snapshot_OrderBy,
  type Proposal_Filter,
  type TokenWithDaoQuery,
} from './sdk.generated'
