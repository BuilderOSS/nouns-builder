import { GraphQLClient, RequestOptions } from 'graphql-request'
import gql from 'graphql-tag'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never
}
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders']
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  BigDecimal: { input: any; output: any }
  BigInt: { input: any; output: any }
  Bytes: { input: any; output: any }
  Int8: { input: any; output: any }
  Timestamp: { input: any; output: any }
}

/** Indicates whether the current, partially filled bucket should be included in the response. Defaults to `exclude` */
export enum Aggregation_Current {
  /** Exclude the current, partially filled bucket from the response */
  Exclude = 'exclude',
  /** Include the current, partially filled bucket in the response */
  Include = 'include',
}

export enum Aggregation_Interval {
  Day = 'day',
  Hour = 'hour',
}

export type Auction = {
  __typename?: 'Auction'
  bidCount: Scalars['Int']['output']
  bids?: Maybe<Array<AuctionBid>>
  dao: Dao
  endTime: Scalars['BigInt']['output']
  extended: Scalars['Boolean']['output']
  firstBidTime?: Maybe<Scalars['BigInt']['output']>
  highestBid?: Maybe<AuctionBid>
  id: Scalars['ID']['output']
  settled: Scalars['Boolean']['output']
  startTime: Scalars['BigInt']['output']
  token: Token
  winningBid?: Maybe<AuctionBid>
}

export type AuctionBidsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<AuctionBid_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<AuctionBid_Filter>
}

export type AuctionBid = {
  __typename?: 'AuctionBid'
  amount: Scalars['BigInt']['output']
  auction: Auction
  bidTime: Scalars['BigInt']['output']
  bidder: Scalars['Bytes']['output']
  comment?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  transactionHash: Scalars['Bytes']['output']
}

export type AuctionBidPlacedEvent = FeedEvent & {
  __typename?: 'AuctionBidPlacedEvent'
  actor: Scalars['Bytes']['output']
  auction: Auction
  bid: AuctionBid
  blockNumber: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export type AuctionBidPlacedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<AuctionBidPlacedEvent_Filter>>>
  auction?: InputMaybe<Scalars['String']['input']>
  auction_?: InputMaybe<Auction_Filter>
  auction_contains?: InputMaybe<Scalars['String']['input']>
  auction_contains_nocase?: InputMaybe<Scalars['String']['input']>
  auction_ends_with?: InputMaybe<Scalars['String']['input']>
  auction_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  auction_gt?: InputMaybe<Scalars['String']['input']>
  auction_gte?: InputMaybe<Scalars['String']['input']>
  auction_in?: InputMaybe<Array<Scalars['String']['input']>>
  auction_lt?: InputMaybe<Scalars['String']['input']>
  auction_lte?: InputMaybe<Scalars['String']['input']>
  auction_not?: InputMaybe<Scalars['String']['input']>
  auction_not_contains?: InputMaybe<Scalars['String']['input']>
  auction_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  auction_not_ends_with?: InputMaybe<Scalars['String']['input']>
  auction_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  auction_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  auction_not_starts_with?: InputMaybe<Scalars['String']['input']>
  auction_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  auction_starts_with?: InputMaybe<Scalars['String']['input']>
  auction_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  bid?: InputMaybe<Scalars['String']['input']>
  bid_?: InputMaybe<AuctionBid_Filter>
  bid_contains?: InputMaybe<Scalars['String']['input']>
  bid_contains_nocase?: InputMaybe<Scalars['String']['input']>
  bid_ends_with?: InputMaybe<Scalars['String']['input']>
  bid_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  bid_gt?: InputMaybe<Scalars['String']['input']>
  bid_gte?: InputMaybe<Scalars['String']['input']>
  bid_in?: InputMaybe<Array<Scalars['String']['input']>>
  bid_lt?: InputMaybe<Scalars['String']['input']>
  bid_lte?: InputMaybe<Scalars['String']['input']>
  bid_not?: InputMaybe<Scalars['String']['input']>
  bid_not_contains?: InputMaybe<Scalars['String']['input']>
  bid_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  bid_not_ends_with?: InputMaybe<Scalars['String']['input']>
  bid_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  bid_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  bid_not_starts_with?: InputMaybe<Scalars['String']['input']>
  bid_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  bid_starts_with?: InputMaybe<Scalars['String']['input']>
  bid_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<AuctionBidPlacedEvent_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum AuctionBidPlacedEvent_OrderBy {
  Actor = 'actor',
  Auction = 'auction',
  AuctionBidCount = 'auction__bidCount',
  AuctionEndTime = 'auction__endTime',
  AuctionExtended = 'auction__extended',
  AuctionFirstBidTime = 'auction__firstBidTime',
  AuctionId = 'auction__id',
  AuctionSettled = 'auction__settled',
  AuctionStartTime = 'auction__startTime',
  Bid = 'bid',
  BidAmount = 'bid__amount',
  BidBidTime = 'bid__bidTime',
  BidBidder = 'bid__bidder',
  BidComment = 'bid__comment',
  BidId = 'bid__id',
  BidTransactionHash = 'bid__transactionHash',
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export type AuctionBid_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amount?: InputMaybe<Scalars['BigInt']['input']>
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>
  amount_not?: InputMaybe<Scalars['BigInt']['input']>
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  and?: InputMaybe<Array<InputMaybe<AuctionBid_Filter>>>
  auction?: InputMaybe<Scalars['String']['input']>
  auction_?: InputMaybe<Auction_Filter>
  auction_contains?: InputMaybe<Scalars['String']['input']>
  auction_contains_nocase?: InputMaybe<Scalars['String']['input']>
  auction_ends_with?: InputMaybe<Scalars['String']['input']>
  auction_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  auction_gt?: InputMaybe<Scalars['String']['input']>
  auction_gte?: InputMaybe<Scalars['String']['input']>
  auction_in?: InputMaybe<Array<Scalars['String']['input']>>
  auction_lt?: InputMaybe<Scalars['String']['input']>
  auction_lte?: InputMaybe<Scalars['String']['input']>
  auction_not?: InputMaybe<Scalars['String']['input']>
  auction_not_contains?: InputMaybe<Scalars['String']['input']>
  auction_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  auction_not_ends_with?: InputMaybe<Scalars['String']['input']>
  auction_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  auction_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  auction_not_starts_with?: InputMaybe<Scalars['String']['input']>
  auction_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  auction_starts_with?: InputMaybe<Scalars['String']['input']>
  auction_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  bidTime?: InputMaybe<Scalars['BigInt']['input']>
  bidTime_gt?: InputMaybe<Scalars['BigInt']['input']>
  bidTime_gte?: InputMaybe<Scalars['BigInt']['input']>
  bidTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  bidTime_lt?: InputMaybe<Scalars['BigInt']['input']>
  bidTime_lte?: InputMaybe<Scalars['BigInt']['input']>
  bidTime_not?: InputMaybe<Scalars['BigInt']['input']>
  bidTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  bidder?: InputMaybe<Scalars['Bytes']['input']>
  bidder_contains?: InputMaybe<Scalars['Bytes']['input']>
  bidder_gt?: InputMaybe<Scalars['Bytes']['input']>
  bidder_gte?: InputMaybe<Scalars['Bytes']['input']>
  bidder_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  bidder_lt?: InputMaybe<Scalars['Bytes']['input']>
  bidder_lte?: InputMaybe<Scalars['Bytes']['input']>
  bidder_not?: InputMaybe<Scalars['Bytes']['input']>
  bidder_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  bidder_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  comment?: InputMaybe<Scalars['String']['input']>
  comment_contains?: InputMaybe<Scalars['String']['input']>
  comment_contains_nocase?: InputMaybe<Scalars['String']['input']>
  comment_ends_with?: InputMaybe<Scalars['String']['input']>
  comment_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  comment_gt?: InputMaybe<Scalars['String']['input']>
  comment_gte?: InputMaybe<Scalars['String']['input']>
  comment_in?: InputMaybe<Array<Scalars['String']['input']>>
  comment_lt?: InputMaybe<Scalars['String']['input']>
  comment_lte?: InputMaybe<Scalars['String']['input']>
  comment_not?: InputMaybe<Scalars['String']['input']>
  comment_not_contains?: InputMaybe<Scalars['String']['input']>
  comment_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  comment_not_ends_with?: InputMaybe<Scalars['String']['input']>
  comment_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  comment_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  comment_not_starts_with?: InputMaybe<Scalars['String']['input']>
  comment_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  comment_starts_with?: InputMaybe<Scalars['String']['input']>
  comment_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<AuctionBid_Filter>>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
}

export enum AuctionBid_OrderBy {
  Amount = 'amount',
  Auction = 'auction',
  AuctionBidCount = 'auction__bidCount',
  AuctionEndTime = 'auction__endTime',
  AuctionExtended = 'auction__extended',
  AuctionFirstBidTime = 'auction__firstBidTime',
  AuctionId = 'auction__id',
  AuctionSettled = 'auction__settled',
  AuctionStartTime = 'auction__startTime',
  BidTime = 'bidTime',
  Bidder = 'bidder',
  Comment = 'comment',
  Id = 'id',
  TransactionHash = 'transactionHash',
}

export type AuctionConfig = {
  __typename?: 'AuctionConfig'
  duration: Scalars['BigInt']['output']
  id: Scalars['ID']['output']
  minimumBidIncrement: Scalars['BigInt']['output']
  reservePrice: Scalars['BigInt']['output']
  timeBuffer: Scalars['BigInt']['output']
}

export type AuctionConfig_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<AuctionConfig_Filter>>>
  duration?: InputMaybe<Scalars['BigInt']['input']>
  duration_gt?: InputMaybe<Scalars['BigInt']['input']>
  duration_gte?: InputMaybe<Scalars['BigInt']['input']>
  duration_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  duration_lt?: InputMaybe<Scalars['BigInt']['input']>
  duration_lte?: InputMaybe<Scalars['BigInt']['input']>
  duration_not?: InputMaybe<Scalars['BigInt']['input']>
  duration_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  minimumBidIncrement?: InputMaybe<Scalars['BigInt']['input']>
  minimumBidIncrement_gt?: InputMaybe<Scalars['BigInt']['input']>
  minimumBidIncrement_gte?: InputMaybe<Scalars['BigInt']['input']>
  minimumBidIncrement_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  minimumBidIncrement_lt?: InputMaybe<Scalars['BigInt']['input']>
  minimumBidIncrement_lte?: InputMaybe<Scalars['BigInt']['input']>
  minimumBidIncrement_not?: InputMaybe<Scalars['BigInt']['input']>
  minimumBidIncrement_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  or?: InputMaybe<Array<InputMaybe<AuctionConfig_Filter>>>
  reservePrice?: InputMaybe<Scalars['BigInt']['input']>
  reservePrice_gt?: InputMaybe<Scalars['BigInt']['input']>
  reservePrice_gte?: InputMaybe<Scalars['BigInt']['input']>
  reservePrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  reservePrice_lt?: InputMaybe<Scalars['BigInt']['input']>
  reservePrice_lte?: InputMaybe<Scalars['BigInt']['input']>
  reservePrice_not?: InputMaybe<Scalars['BigInt']['input']>
  reservePrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timeBuffer?: InputMaybe<Scalars['BigInt']['input']>
  timeBuffer_gt?: InputMaybe<Scalars['BigInt']['input']>
  timeBuffer_gte?: InputMaybe<Scalars['BigInt']['input']>
  timeBuffer_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timeBuffer_lt?: InputMaybe<Scalars['BigInt']['input']>
  timeBuffer_lte?: InputMaybe<Scalars['BigInt']['input']>
  timeBuffer_not?: InputMaybe<Scalars['BigInt']['input']>
  timeBuffer_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
}

export enum AuctionConfig_OrderBy {
  Duration = 'duration',
  Id = 'id',
  MinimumBidIncrement = 'minimumBidIncrement',
  ReservePrice = 'reservePrice',
  TimeBuffer = 'timeBuffer',
}

export type AuctionCreatedEvent = FeedEvent & {
  __typename?: 'AuctionCreatedEvent'
  actor: Scalars['Bytes']['output']
  auction: Auction
  blockNumber: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export type AuctionCreatedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<AuctionCreatedEvent_Filter>>>
  auction?: InputMaybe<Scalars['String']['input']>
  auction_?: InputMaybe<Auction_Filter>
  auction_contains?: InputMaybe<Scalars['String']['input']>
  auction_contains_nocase?: InputMaybe<Scalars['String']['input']>
  auction_ends_with?: InputMaybe<Scalars['String']['input']>
  auction_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  auction_gt?: InputMaybe<Scalars['String']['input']>
  auction_gte?: InputMaybe<Scalars['String']['input']>
  auction_in?: InputMaybe<Array<Scalars['String']['input']>>
  auction_lt?: InputMaybe<Scalars['String']['input']>
  auction_lte?: InputMaybe<Scalars['String']['input']>
  auction_not?: InputMaybe<Scalars['String']['input']>
  auction_not_contains?: InputMaybe<Scalars['String']['input']>
  auction_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  auction_not_ends_with?: InputMaybe<Scalars['String']['input']>
  auction_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  auction_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  auction_not_starts_with?: InputMaybe<Scalars['String']['input']>
  auction_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  auction_starts_with?: InputMaybe<Scalars['String']['input']>
  auction_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<AuctionCreatedEvent_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum AuctionCreatedEvent_OrderBy {
  Actor = 'actor',
  Auction = 'auction',
  AuctionBidCount = 'auction__bidCount',
  AuctionEndTime = 'auction__endTime',
  AuctionExtended = 'auction__extended',
  AuctionFirstBidTime = 'auction__firstBidTime',
  AuctionId = 'auction__id',
  AuctionSettled = 'auction__settled',
  AuctionStartTime = 'auction__startTime',
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export type AuctionSettledEvent = FeedEvent & {
  __typename?: 'AuctionSettledEvent'
  actor: Scalars['Bytes']['output']
  amount: Scalars['BigInt']['output']
  auction: Auction
  blockNumber: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
  winner: Scalars['Bytes']['output']
}

export type AuctionSettledEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  amount?: InputMaybe<Scalars['BigInt']['input']>
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>
  amount_not?: InputMaybe<Scalars['BigInt']['input']>
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  and?: InputMaybe<Array<InputMaybe<AuctionSettledEvent_Filter>>>
  auction?: InputMaybe<Scalars['String']['input']>
  auction_?: InputMaybe<Auction_Filter>
  auction_contains?: InputMaybe<Scalars['String']['input']>
  auction_contains_nocase?: InputMaybe<Scalars['String']['input']>
  auction_ends_with?: InputMaybe<Scalars['String']['input']>
  auction_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  auction_gt?: InputMaybe<Scalars['String']['input']>
  auction_gte?: InputMaybe<Scalars['String']['input']>
  auction_in?: InputMaybe<Array<Scalars['String']['input']>>
  auction_lt?: InputMaybe<Scalars['String']['input']>
  auction_lte?: InputMaybe<Scalars['String']['input']>
  auction_not?: InputMaybe<Scalars['String']['input']>
  auction_not_contains?: InputMaybe<Scalars['String']['input']>
  auction_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  auction_not_ends_with?: InputMaybe<Scalars['String']['input']>
  auction_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  auction_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  auction_not_starts_with?: InputMaybe<Scalars['String']['input']>
  auction_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  auction_starts_with?: InputMaybe<Scalars['String']['input']>
  auction_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<AuctionSettledEvent_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
  winner?: InputMaybe<Scalars['Bytes']['input']>
  winner_contains?: InputMaybe<Scalars['Bytes']['input']>
  winner_gt?: InputMaybe<Scalars['Bytes']['input']>
  winner_gte?: InputMaybe<Scalars['Bytes']['input']>
  winner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  winner_lt?: InputMaybe<Scalars['Bytes']['input']>
  winner_lte?: InputMaybe<Scalars['Bytes']['input']>
  winner_not?: InputMaybe<Scalars['Bytes']['input']>
  winner_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  winner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
}

export enum AuctionSettledEvent_OrderBy {
  Actor = 'actor',
  Amount = 'amount',
  Auction = 'auction',
  AuctionBidCount = 'auction__bidCount',
  AuctionEndTime = 'auction__endTime',
  AuctionExtended = 'auction__extended',
  AuctionFirstBidTime = 'auction__firstBidTime',
  AuctionId = 'auction__id',
  AuctionSettled = 'auction__settled',
  AuctionStartTime = 'auction__startTime',
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
  Winner = 'winner',
}

export type Auction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<Auction_Filter>>>
  bidCount?: InputMaybe<Scalars['Int']['input']>
  bidCount_gt?: InputMaybe<Scalars['Int']['input']>
  bidCount_gte?: InputMaybe<Scalars['Int']['input']>
  bidCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  bidCount_lt?: InputMaybe<Scalars['Int']['input']>
  bidCount_lte?: InputMaybe<Scalars['Int']['input']>
  bidCount_not?: InputMaybe<Scalars['Int']['input']>
  bidCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  bids_?: InputMaybe<AuctionBid_Filter>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  endTime?: InputMaybe<Scalars['BigInt']['input']>
  endTime_gt?: InputMaybe<Scalars['BigInt']['input']>
  endTime_gte?: InputMaybe<Scalars['BigInt']['input']>
  endTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  endTime_lt?: InputMaybe<Scalars['BigInt']['input']>
  endTime_lte?: InputMaybe<Scalars['BigInt']['input']>
  endTime_not?: InputMaybe<Scalars['BigInt']['input']>
  endTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  extended?: InputMaybe<Scalars['Boolean']['input']>
  extended_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  extended_not?: InputMaybe<Scalars['Boolean']['input']>
  extended_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  firstBidTime?: InputMaybe<Scalars['BigInt']['input']>
  firstBidTime_gt?: InputMaybe<Scalars['BigInt']['input']>
  firstBidTime_gte?: InputMaybe<Scalars['BigInt']['input']>
  firstBidTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  firstBidTime_lt?: InputMaybe<Scalars['BigInt']['input']>
  firstBidTime_lte?: InputMaybe<Scalars['BigInt']['input']>
  firstBidTime_not?: InputMaybe<Scalars['BigInt']['input']>
  firstBidTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  highestBid?: InputMaybe<Scalars['String']['input']>
  highestBid_?: InputMaybe<AuctionBid_Filter>
  highestBid_contains?: InputMaybe<Scalars['String']['input']>
  highestBid_contains_nocase?: InputMaybe<Scalars['String']['input']>
  highestBid_ends_with?: InputMaybe<Scalars['String']['input']>
  highestBid_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  highestBid_gt?: InputMaybe<Scalars['String']['input']>
  highestBid_gte?: InputMaybe<Scalars['String']['input']>
  highestBid_in?: InputMaybe<Array<Scalars['String']['input']>>
  highestBid_lt?: InputMaybe<Scalars['String']['input']>
  highestBid_lte?: InputMaybe<Scalars['String']['input']>
  highestBid_not?: InputMaybe<Scalars['String']['input']>
  highestBid_not_contains?: InputMaybe<Scalars['String']['input']>
  highestBid_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  highestBid_not_ends_with?: InputMaybe<Scalars['String']['input']>
  highestBid_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  highestBid_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  highestBid_not_starts_with?: InputMaybe<Scalars['String']['input']>
  highestBid_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  highestBid_starts_with?: InputMaybe<Scalars['String']['input']>
  highestBid_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<Auction_Filter>>>
  settled?: InputMaybe<Scalars['Boolean']['input']>
  settled_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  settled_not?: InputMaybe<Scalars['Boolean']['input']>
  settled_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  startTime?: InputMaybe<Scalars['BigInt']['input']>
  startTime_gt?: InputMaybe<Scalars['BigInt']['input']>
  startTime_gte?: InputMaybe<Scalars['BigInt']['input']>
  startTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  startTime_lt?: InputMaybe<Scalars['BigInt']['input']>
  startTime_lte?: InputMaybe<Scalars['BigInt']['input']>
  startTime_not?: InputMaybe<Scalars['BigInt']['input']>
  startTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  token?: InputMaybe<Scalars['String']['input']>
  token_?: InputMaybe<Token_Filter>
  token_contains?: InputMaybe<Scalars['String']['input']>
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>
  token_ends_with?: InputMaybe<Scalars['String']['input']>
  token_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  token_gt?: InputMaybe<Scalars['String']['input']>
  token_gte?: InputMaybe<Scalars['String']['input']>
  token_in?: InputMaybe<Array<Scalars['String']['input']>>
  token_lt?: InputMaybe<Scalars['String']['input']>
  token_lte?: InputMaybe<Scalars['String']['input']>
  token_not?: InputMaybe<Scalars['String']['input']>
  token_not_contains?: InputMaybe<Scalars['String']['input']>
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  token_not_ends_with?: InputMaybe<Scalars['String']['input']>
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  token_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  token_not_starts_with?: InputMaybe<Scalars['String']['input']>
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  token_starts_with?: InputMaybe<Scalars['String']['input']>
  token_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  winningBid?: InputMaybe<Scalars['String']['input']>
  winningBid_?: InputMaybe<AuctionBid_Filter>
  winningBid_contains?: InputMaybe<Scalars['String']['input']>
  winningBid_contains_nocase?: InputMaybe<Scalars['String']['input']>
  winningBid_ends_with?: InputMaybe<Scalars['String']['input']>
  winningBid_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  winningBid_gt?: InputMaybe<Scalars['String']['input']>
  winningBid_gte?: InputMaybe<Scalars['String']['input']>
  winningBid_in?: InputMaybe<Array<Scalars['String']['input']>>
  winningBid_lt?: InputMaybe<Scalars['String']['input']>
  winningBid_lte?: InputMaybe<Scalars['String']['input']>
  winningBid_not?: InputMaybe<Scalars['String']['input']>
  winningBid_not_contains?: InputMaybe<Scalars['String']['input']>
  winningBid_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  winningBid_not_ends_with?: InputMaybe<Scalars['String']['input']>
  winningBid_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  winningBid_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  winningBid_not_starts_with?: InputMaybe<Scalars['String']['input']>
  winningBid_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  winningBid_starts_with?: InputMaybe<Scalars['String']['input']>
  winningBid_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
}

export enum Auction_OrderBy {
  BidCount = 'bidCount',
  Bids = 'bids',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  EndTime = 'endTime',
  Extended = 'extended',
  FirstBidTime = 'firstBidTime',
  HighestBid = 'highestBid',
  HighestBidAmount = 'highestBid__amount',
  HighestBidBidTime = 'highestBid__bidTime',
  HighestBidBidder = 'highestBid__bidder',
  HighestBidComment = 'highestBid__comment',
  HighestBidId = 'highestBid__id',
  HighestBidTransactionHash = 'highestBid__transactionHash',
  Id = 'id',
  Settled = 'settled',
  StartTime = 'startTime',
  Token = 'token',
  TokenContent = 'token__content',
  TokenId = 'token__id',
  TokenImage = 'token__image',
  TokenMintedAt = 'token__mintedAt',
  TokenName = 'token__name',
  TokenOwner = 'token__owner',
  TokenTokenContract = 'token__tokenContract',
  TokenTokenId = 'token__tokenId',
  WinningBid = 'winningBid',
  WinningBidAmount = 'winningBid__amount',
  WinningBidBidTime = 'winningBid__bidTime',
  WinningBidBidder = 'winningBid__bidder',
  WinningBidComment = 'winningBid__comment',
  WinningBidId = 'winningBid__id',
  WinningBidTransactionHash = 'winningBid__transactionHash',
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input']
}

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>
  number?: InputMaybe<Scalars['Int']['input']>
  number_gte?: InputMaybe<Scalars['Int']['input']>
}

export type CandidateComment = {
  __typename?: 'CandidateComment'
  candidate: Scalars['Bytes']['output']
  comment: Scalars['String']['output']
  commenter: Scalars['Bytes']['output']
  createdAt: Scalars['BigInt']['output']
  group: ProposalCandidateGroup
  id: Scalars['ID']['output']
  parentComment?: Maybe<CandidateComment>
  replies: Array<CandidateComment>
  revoked: Scalars['Boolean']['output']
  support: CandidateVoteSupport
  voteWeight: Scalars['BigInt']['output']
}

export type CandidateCommentRepliesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<CandidateComment_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<CandidateComment_Filter>
}

export type CandidateCommentCreatedEvent = FeedEvent & {
  __typename?: 'CandidateCommentCreatedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  comment: CandidateComment
  dao: Dao
  group: ProposalCandidateGroup
  id: Scalars['ID']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export type CandidateCommentCreatedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<CandidateCommentCreatedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  comment?: InputMaybe<Scalars['String']['input']>
  comment_?: InputMaybe<CandidateComment_Filter>
  comment_contains?: InputMaybe<Scalars['String']['input']>
  comment_contains_nocase?: InputMaybe<Scalars['String']['input']>
  comment_ends_with?: InputMaybe<Scalars['String']['input']>
  comment_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  comment_gt?: InputMaybe<Scalars['String']['input']>
  comment_gte?: InputMaybe<Scalars['String']['input']>
  comment_in?: InputMaybe<Array<Scalars['String']['input']>>
  comment_lt?: InputMaybe<Scalars['String']['input']>
  comment_lte?: InputMaybe<Scalars['String']['input']>
  comment_not?: InputMaybe<Scalars['String']['input']>
  comment_not_contains?: InputMaybe<Scalars['String']['input']>
  comment_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  comment_not_ends_with?: InputMaybe<Scalars['String']['input']>
  comment_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  comment_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  comment_not_starts_with?: InputMaybe<Scalars['String']['input']>
  comment_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  comment_starts_with?: InputMaybe<Scalars['String']['input']>
  comment_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  group?: InputMaybe<Scalars['String']['input']>
  group_?: InputMaybe<ProposalCandidateGroup_Filter>
  group_contains?: InputMaybe<Scalars['String']['input']>
  group_contains_nocase?: InputMaybe<Scalars['String']['input']>
  group_ends_with?: InputMaybe<Scalars['String']['input']>
  group_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_gt?: InputMaybe<Scalars['String']['input']>
  group_gte?: InputMaybe<Scalars['String']['input']>
  group_in?: InputMaybe<Array<Scalars['String']['input']>>
  group_lt?: InputMaybe<Scalars['String']['input']>
  group_lte?: InputMaybe<Scalars['String']['input']>
  group_not?: InputMaybe<Scalars['String']['input']>
  group_not_contains?: InputMaybe<Scalars['String']['input']>
  group_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  group_not_ends_with?: InputMaybe<Scalars['String']['input']>
  group_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  group_not_starts_with?: InputMaybe<Scalars['String']['input']>
  group_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_starts_with?: InputMaybe<Scalars['String']['input']>
  group_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<CandidateCommentCreatedEvent_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum CandidateCommentCreatedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  Comment = 'comment',
  CommentCandidate = 'comment__candidate',
  CommentComment = 'comment__comment',
  CommentCommenter = 'comment__commenter',
  CommentCreatedAt = 'comment__createdAt',
  CommentId = 'comment__id',
  CommentRevoked = 'comment__revoked',
  CommentSupport = 'comment__support',
  CommentVoteWeight = 'comment__voteWeight',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Group = 'group',
  GroupCandidateNumber = 'group__candidateNumber',
  GroupCommentCount = 'group__commentCount',
  GroupCreatedAt = 'group__createdAt',
  GroupCurrentAbstainCount = 'group__currentAbstainCount',
  GroupCurrentAgainstCount = 'group__currentAgainstCount',
  GroupCurrentForCount = 'group__currentForCount',
  GroupId = 'group__id',
  GroupLatestVersionNumber = 'group__latestVersionNumber',
  GroupProposer = 'group__proposer',
  GroupSalt = 'group__salt',
  GroupVersionCount = 'group__versionCount',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export type CandidateComment_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<CandidateComment_Filter>>>
  candidate?: InputMaybe<Scalars['Bytes']['input']>
  candidate_contains?: InputMaybe<Scalars['Bytes']['input']>
  candidate_gt?: InputMaybe<Scalars['Bytes']['input']>
  candidate_gte?: InputMaybe<Scalars['Bytes']['input']>
  candidate_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  candidate_lt?: InputMaybe<Scalars['Bytes']['input']>
  candidate_lte?: InputMaybe<Scalars['Bytes']['input']>
  candidate_not?: InputMaybe<Scalars['Bytes']['input']>
  candidate_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  candidate_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  comment?: InputMaybe<Scalars['String']['input']>
  comment_contains?: InputMaybe<Scalars['String']['input']>
  comment_contains_nocase?: InputMaybe<Scalars['String']['input']>
  comment_ends_with?: InputMaybe<Scalars['String']['input']>
  comment_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  comment_gt?: InputMaybe<Scalars['String']['input']>
  comment_gte?: InputMaybe<Scalars['String']['input']>
  comment_in?: InputMaybe<Array<Scalars['String']['input']>>
  comment_lt?: InputMaybe<Scalars['String']['input']>
  comment_lte?: InputMaybe<Scalars['String']['input']>
  comment_not?: InputMaybe<Scalars['String']['input']>
  comment_not_contains?: InputMaybe<Scalars['String']['input']>
  comment_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  comment_not_ends_with?: InputMaybe<Scalars['String']['input']>
  comment_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  comment_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  comment_not_starts_with?: InputMaybe<Scalars['String']['input']>
  comment_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  comment_starts_with?: InputMaybe<Scalars['String']['input']>
  comment_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  commenter?: InputMaybe<Scalars['Bytes']['input']>
  commenter_contains?: InputMaybe<Scalars['Bytes']['input']>
  commenter_gt?: InputMaybe<Scalars['Bytes']['input']>
  commenter_gte?: InputMaybe<Scalars['Bytes']['input']>
  commenter_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  commenter_lt?: InputMaybe<Scalars['Bytes']['input']>
  commenter_lte?: InputMaybe<Scalars['Bytes']['input']>
  commenter_not?: InputMaybe<Scalars['Bytes']['input']>
  commenter_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  commenter_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  createdAt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  group?: InputMaybe<Scalars['String']['input']>
  group_?: InputMaybe<ProposalCandidateGroup_Filter>
  group_contains?: InputMaybe<Scalars['String']['input']>
  group_contains_nocase?: InputMaybe<Scalars['String']['input']>
  group_ends_with?: InputMaybe<Scalars['String']['input']>
  group_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_gt?: InputMaybe<Scalars['String']['input']>
  group_gte?: InputMaybe<Scalars['String']['input']>
  group_in?: InputMaybe<Array<Scalars['String']['input']>>
  group_lt?: InputMaybe<Scalars['String']['input']>
  group_lte?: InputMaybe<Scalars['String']['input']>
  group_not?: InputMaybe<Scalars['String']['input']>
  group_not_contains?: InputMaybe<Scalars['String']['input']>
  group_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  group_not_ends_with?: InputMaybe<Scalars['String']['input']>
  group_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  group_not_starts_with?: InputMaybe<Scalars['String']['input']>
  group_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_starts_with?: InputMaybe<Scalars['String']['input']>
  group_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<CandidateComment_Filter>>>
  parentComment?: InputMaybe<Scalars['String']['input']>
  parentComment_?: InputMaybe<CandidateComment_Filter>
  parentComment_contains?: InputMaybe<Scalars['String']['input']>
  parentComment_contains_nocase?: InputMaybe<Scalars['String']['input']>
  parentComment_ends_with?: InputMaybe<Scalars['String']['input']>
  parentComment_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  parentComment_gt?: InputMaybe<Scalars['String']['input']>
  parentComment_gte?: InputMaybe<Scalars['String']['input']>
  parentComment_in?: InputMaybe<Array<Scalars['String']['input']>>
  parentComment_lt?: InputMaybe<Scalars['String']['input']>
  parentComment_lte?: InputMaybe<Scalars['String']['input']>
  parentComment_not?: InputMaybe<Scalars['String']['input']>
  parentComment_not_contains?: InputMaybe<Scalars['String']['input']>
  parentComment_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  parentComment_not_ends_with?: InputMaybe<Scalars['String']['input']>
  parentComment_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  parentComment_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  parentComment_not_starts_with?: InputMaybe<Scalars['String']['input']>
  parentComment_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  parentComment_starts_with?: InputMaybe<Scalars['String']['input']>
  parentComment_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  replies_?: InputMaybe<CandidateComment_Filter>
  revoked?: InputMaybe<Scalars['Boolean']['input']>
  revoked_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  revoked_not?: InputMaybe<Scalars['Boolean']['input']>
  revoked_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  support?: InputMaybe<CandidateVoteSupport>
  support_in?: InputMaybe<Array<CandidateVoteSupport>>
  support_not?: InputMaybe<CandidateVoteSupport>
  support_not_in?: InputMaybe<Array<CandidateVoteSupport>>
  voteWeight?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_gt?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_gte?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  voteWeight_lt?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_lte?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_not?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
}

export enum CandidateComment_OrderBy {
  Candidate = 'candidate',
  Comment = 'comment',
  Commenter = 'commenter',
  CreatedAt = 'createdAt',
  Group = 'group',
  GroupCandidateNumber = 'group__candidateNumber',
  GroupCommentCount = 'group__commentCount',
  GroupCreatedAt = 'group__createdAt',
  GroupCurrentAbstainCount = 'group__currentAbstainCount',
  GroupCurrentAgainstCount = 'group__currentAgainstCount',
  GroupCurrentForCount = 'group__currentForCount',
  GroupId = 'group__id',
  GroupLatestVersionNumber = 'group__latestVersionNumber',
  GroupProposer = 'group__proposer',
  GroupSalt = 'group__salt',
  GroupVersionCount = 'group__versionCount',
  Id = 'id',
  ParentComment = 'parentComment',
  ParentCommentCandidate = 'parentComment__candidate',
  ParentCommentComment = 'parentComment__comment',
  ParentCommentCommenter = 'parentComment__commenter',
  ParentCommentCreatedAt = 'parentComment__createdAt',
  ParentCommentId = 'parentComment__id',
  ParentCommentRevoked = 'parentComment__revoked',
  ParentCommentSupport = 'parentComment__support',
  ParentCommentVoteWeight = 'parentComment__voteWeight',
  Replies = 'replies',
  Revoked = 'revoked',
  Support = 'support',
  VoteWeight = 'voteWeight',
}

export type CandidateSponsorSignature = {
  __typename?: 'CandidateSponsorSignature'
  createdAt: Scalars['BigInt']['output']
  deadline: Scalars['BigInt']['output']
  id: Scalars['ID']['output']
  nonce: Scalars['BigInt']['output']
  proposalId: Scalars['Bytes']['output']
  revoked: Scalars['Boolean']['output']
  signature: Scalars['Bytes']['output']
  signer: Scalars['Bytes']['output']
  version: ProposalCandidateVersion
  voteWeight: Scalars['BigInt']['output']
}

export type CandidateSponsorSignatureCreatedEvent = FeedEvent & {
  __typename?: 'CandidateSponsorSignatureCreatedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  candidateVersion: ProposalCandidateVersion
  dao: Dao
  group: ProposalCandidateGroup
  id: Scalars['ID']['output']
  signature: CandidateSponsorSignature
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export type CandidateSponsorSignatureCreatedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<CandidateSponsorSignatureCreatedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  candidateVersion?: InputMaybe<Scalars['String']['input']>
  candidateVersion_?: InputMaybe<ProposalCandidateVersion_Filter>
  candidateVersion_contains?: InputMaybe<Scalars['String']['input']>
  candidateVersion_contains_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_ends_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_gt?: InputMaybe<Scalars['String']['input']>
  candidateVersion_gte?: InputMaybe<Scalars['String']['input']>
  candidateVersion_in?: InputMaybe<Array<Scalars['String']['input']>>
  candidateVersion_lt?: InputMaybe<Scalars['String']['input']>
  candidateVersion_lte?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_contains?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_ends_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  candidateVersion_not_starts_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_starts_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  group?: InputMaybe<Scalars['String']['input']>
  group_?: InputMaybe<ProposalCandidateGroup_Filter>
  group_contains?: InputMaybe<Scalars['String']['input']>
  group_contains_nocase?: InputMaybe<Scalars['String']['input']>
  group_ends_with?: InputMaybe<Scalars['String']['input']>
  group_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_gt?: InputMaybe<Scalars['String']['input']>
  group_gte?: InputMaybe<Scalars['String']['input']>
  group_in?: InputMaybe<Array<Scalars['String']['input']>>
  group_lt?: InputMaybe<Scalars['String']['input']>
  group_lte?: InputMaybe<Scalars['String']['input']>
  group_not?: InputMaybe<Scalars['String']['input']>
  group_not_contains?: InputMaybe<Scalars['String']['input']>
  group_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  group_not_ends_with?: InputMaybe<Scalars['String']['input']>
  group_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  group_not_starts_with?: InputMaybe<Scalars['String']['input']>
  group_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_starts_with?: InputMaybe<Scalars['String']['input']>
  group_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<CandidateSponsorSignatureCreatedEvent_Filter>>>
  signature?: InputMaybe<Scalars['String']['input']>
  signature_?: InputMaybe<CandidateSponsorSignature_Filter>
  signature_contains?: InputMaybe<Scalars['String']['input']>
  signature_contains_nocase?: InputMaybe<Scalars['String']['input']>
  signature_ends_with?: InputMaybe<Scalars['String']['input']>
  signature_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  signature_gt?: InputMaybe<Scalars['String']['input']>
  signature_gte?: InputMaybe<Scalars['String']['input']>
  signature_in?: InputMaybe<Array<Scalars['String']['input']>>
  signature_lt?: InputMaybe<Scalars['String']['input']>
  signature_lte?: InputMaybe<Scalars['String']['input']>
  signature_not?: InputMaybe<Scalars['String']['input']>
  signature_not_contains?: InputMaybe<Scalars['String']['input']>
  signature_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  signature_not_ends_with?: InputMaybe<Scalars['String']['input']>
  signature_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  signature_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  signature_not_starts_with?: InputMaybe<Scalars['String']['input']>
  signature_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  signature_starts_with?: InputMaybe<Scalars['String']['input']>
  signature_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum CandidateSponsorSignatureCreatedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  CandidateVersion = 'candidateVersion',
  CandidateVersionAttestationUid = 'candidateVersion__attestationUID',
  CandidateVersionAttester = 'candidateVersion__attester',
  CandidateVersionCandidateId = 'candidateVersion__candidateId',
  CandidateVersionComputedProposalId = 'candidateVersion__computedProposalId',
  CandidateVersionCreatedAt = 'candidateVersion__createdAt',
  CandidateVersionDescription = 'candidateVersion__description',
  CandidateVersionDiscussionUrl = 'candidateVersion__discussionUrl',
  CandidateVersionId = 'candidateVersion__id',
  CandidateVersionMetadata = 'candidateVersion__metadata',
  CandidateVersionRepresentedAddress = 'candidateVersion__representedAddress',
  CandidateVersionRevoked = 'candidateVersion__revoked',
  CandidateVersionSalt = 'candidateVersion__salt',
  CandidateVersionSignatureCount = 'candidateVersion__signatureCount',
  CandidateVersionTitle = 'candidateVersion__title',
  CandidateVersionTotalVoteWeight = 'candidateVersion__totalVoteWeight',
  CandidateVersionVersionNumber = 'candidateVersion__versionNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Group = 'group',
  GroupCandidateNumber = 'group__candidateNumber',
  GroupCommentCount = 'group__commentCount',
  GroupCreatedAt = 'group__createdAt',
  GroupCurrentAbstainCount = 'group__currentAbstainCount',
  GroupCurrentAgainstCount = 'group__currentAgainstCount',
  GroupCurrentForCount = 'group__currentForCount',
  GroupId = 'group__id',
  GroupLatestVersionNumber = 'group__latestVersionNumber',
  GroupProposer = 'group__proposer',
  GroupSalt = 'group__salt',
  GroupVersionCount = 'group__versionCount',
  Id = 'id',
  Signature = 'signature',
  SignatureCreatedAt = 'signature__createdAt',
  SignatureDeadline = 'signature__deadline',
  SignatureId = 'signature__id',
  SignatureNonce = 'signature__nonce',
  SignatureProposalId = 'signature__proposalId',
  SignatureRevoked = 'signature__revoked',
  SignatureSignature = 'signature__signature',
  SignatureSigner = 'signature__signer',
  SignatureVoteWeight = 'signature__voteWeight',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export type CandidateSponsorSignature_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<CandidateSponsorSignature_Filter>>>
  createdAt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  deadline?: InputMaybe<Scalars['BigInt']['input']>
  deadline_gt?: InputMaybe<Scalars['BigInt']['input']>
  deadline_gte?: InputMaybe<Scalars['BigInt']['input']>
  deadline_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  deadline_lt?: InputMaybe<Scalars['BigInt']['input']>
  deadline_lte?: InputMaybe<Scalars['BigInt']['input']>
  deadline_not?: InputMaybe<Scalars['BigInt']['input']>
  deadline_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  nonce?: InputMaybe<Scalars['BigInt']['input']>
  nonce_gt?: InputMaybe<Scalars['BigInt']['input']>
  nonce_gte?: InputMaybe<Scalars['BigInt']['input']>
  nonce_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  nonce_lt?: InputMaybe<Scalars['BigInt']['input']>
  nonce_lte?: InputMaybe<Scalars['BigInt']['input']>
  nonce_not?: InputMaybe<Scalars['BigInt']['input']>
  nonce_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  or?: InputMaybe<Array<InputMaybe<CandidateSponsorSignature_Filter>>>
  proposalId?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_contains?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_gt?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_gte?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  proposalId_lt?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_lte?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_not?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  revoked?: InputMaybe<Scalars['Boolean']['input']>
  revoked_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  revoked_not?: InputMaybe<Scalars['Boolean']['input']>
  revoked_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  signature?: InputMaybe<Scalars['Bytes']['input']>
  signature_contains?: InputMaybe<Scalars['Bytes']['input']>
  signature_gt?: InputMaybe<Scalars['Bytes']['input']>
  signature_gte?: InputMaybe<Scalars['Bytes']['input']>
  signature_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  signature_lt?: InputMaybe<Scalars['Bytes']['input']>
  signature_lte?: InputMaybe<Scalars['Bytes']['input']>
  signature_not?: InputMaybe<Scalars['Bytes']['input']>
  signature_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  signature_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  signer?: InputMaybe<Scalars['Bytes']['input']>
  signer_contains?: InputMaybe<Scalars['Bytes']['input']>
  signer_gt?: InputMaybe<Scalars['Bytes']['input']>
  signer_gte?: InputMaybe<Scalars['Bytes']['input']>
  signer_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  signer_lt?: InputMaybe<Scalars['Bytes']['input']>
  signer_lte?: InputMaybe<Scalars['Bytes']['input']>
  signer_not?: InputMaybe<Scalars['Bytes']['input']>
  signer_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  signer_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  version?: InputMaybe<Scalars['String']['input']>
  version_?: InputMaybe<ProposalCandidateVersion_Filter>
  version_contains?: InputMaybe<Scalars['String']['input']>
  version_contains_nocase?: InputMaybe<Scalars['String']['input']>
  version_ends_with?: InputMaybe<Scalars['String']['input']>
  version_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  version_gt?: InputMaybe<Scalars['String']['input']>
  version_gte?: InputMaybe<Scalars['String']['input']>
  version_in?: InputMaybe<Array<Scalars['String']['input']>>
  version_lt?: InputMaybe<Scalars['String']['input']>
  version_lte?: InputMaybe<Scalars['String']['input']>
  version_not?: InputMaybe<Scalars['String']['input']>
  version_not_contains?: InputMaybe<Scalars['String']['input']>
  version_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  version_not_ends_with?: InputMaybe<Scalars['String']['input']>
  version_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  version_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  version_not_starts_with?: InputMaybe<Scalars['String']['input']>
  version_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  version_starts_with?: InputMaybe<Scalars['String']['input']>
  version_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  voteWeight?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_gt?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_gte?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  voteWeight_lt?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_lte?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_not?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
}

export enum CandidateSponsorSignature_OrderBy {
  CreatedAt = 'createdAt',
  Deadline = 'deadline',
  Id = 'id',
  Nonce = 'nonce',
  ProposalId = 'proposalId',
  Revoked = 'revoked',
  Signature = 'signature',
  Signer = 'signer',
  Version = 'version',
  VersionAttestationUid = 'version__attestationUID',
  VersionAttester = 'version__attester',
  VersionCandidateId = 'version__candidateId',
  VersionComputedProposalId = 'version__computedProposalId',
  VersionCreatedAt = 'version__createdAt',
  VersionDescription = 'version__description',
  VersionDiscussionUrl = 'version__discussionUrl',
  VersionId = 'version__id',
  VersionMetadata = 'version__metadata',
  VersionRepresentedAddress = 'version__representedAddress',
  VersionRevoked = 'version__revoked',
  VersionSalt = 'version__salt',
  VersionSignatureCount = 'version__signatureCount',
  VersionTitle = 'version__title',
  VersionTotalVoteWeight = 'version__totalVoteWeight',
  VersionVersionNumber = 'version__versionNumber',
  VoteWeight = 'voteWeight',
}

export type CandidateSubmittedAsProposalEvent = FeedEvent & {
  __typename?: 'CandidateSubmittedAsProposalEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  candidateVersion: ProposalCandidateVersion
  dao: Dao
  group: ProposalCandidateGroup
  id: Scalars['ID']['output']
  proposal: Proposal
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export type CandidateSubmittedAsProposalEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<CandidateSubmittedAsProposalEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  candidateVersion?: InputMaybe<Scalars['String']['input']>
  candidateVersion_?: InputMaybe<ProposalCandidateVersion_Filter>
  candidateVersion_contains?: InputMaybe<Scalars['String']['input']>
  candidateVersion_contains_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_ends_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_gt?: InputMaybe<Scalars['String']['input']>
  candidateVersion_gte?: InputMaybe<Scalars['String']['input']>
  candidateVersion_in?: InputMaybe<Array<Scalars['String']['input']>>
  candidateVersion_lt?: InputMaybe<Scalars['String']['input']>
  candidateVersion_lte?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_contains?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_ends_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  candidateVersion_not_starts_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_starts_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  group?: InputMaybe<Scalars['String']['input']>
  group_?: InputMaybe<ProposalCandidateGroup_Filter>
  group_contains?: InputMaybe<Scalars['String']['input']>
  group_contains_nocase?: InputMaybe<Scalars['String']['input']>
  group_ends_with?: InputMaybe<Scalars['String']['input']>
  group_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_gt?: InputMaybe<Scalars['String']['input']>
  group_gte?: InputMaybe<Scalars['String']['input']>
  group_in?: InputMaybe<Array<Scalars['String']['input']>>
  group_lt?: InputMaybe<Scalars['String']['input']>
  group_lte?: InputMaybe<Scalars['String']['input']>
  group_not?: InputMaybe<Scalars['String']['input']>
  group_not_contains?: InputMaybe<Scalars['String']['input']>
  group_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  group_not_ends_with?: InputMaybe<Scalars['String']['input']>
  group_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  group_not_starts_with?: InputMaybe<Scalars['String']['input']>
  group_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_starts_with?: InputMaybe<Scalars['String']['input']>
  group_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<CandidateSubmittedAsProposalEvent_Filter>>>
  proposal?: InputMaybe<Scalars['String']['input']>
  proposal_?: InputMaybe<Proposal_Filter>
  proposal_contains?: InputMaybe<Scalars['String']['input']>
  proposal_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_gt?: InputMaybe<Scalars['String']['input']>
  proposal_gte?: InputMaybe<Scalars['String']['input']>
  proposal_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_lt?: InputMaybe<Scalars['String']['input']>
  proposal_lte?: InputMaybe<Scalars['String']['input']>
  proposal_not?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_not_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum CandidateSubmittedAsProposalEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  CandidateVersion = 'candidateVersion',
  CandidateVersionAttestationUid = 'candidateVersion__attestationUID',
  CandidateVersionAttester = 'candidateVersion__attester',
  CandidateVersionCandidateId = 'candidateVersion__candidateId',
  CandidateVersionComputedProposalId = 'candidateVersion__computedProposalId',
  CandidateVersionCreatedAt = 'candidateVersion__createdAt',
  CandidateVersionDescription = 'candidateVersion__description',
  CandidateVersionDiscussionUrl = 'candidateVersion__discussionUrl',
  CandidateVersionId = 'candidateVersion__id',
  CandidateVersionMetadata = 'candidateVersion__metadata',
  CandidateVersionRepresentedAddress = 'candidateVersion__representedAddress',
  CandidateVersionRevoked = 'candidateVersion__revoked',
  CandidateVersionSalt = 'candidateVersion__salt',
  CandidateVersionSignatureCount = 'candidateVersion__signatureCount',
  CandidateVersionTitle = 'candidateVersion__title',
  CandidateVersionTotalVoteWeight = 'candidateVersion__totalVoteWeight',
  CandidateVersionVersionNumber = 'candidateVersion__versionNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Group = 'group',
  GroupCandidateNumber = 'group__candidateNumber',
  GroupCommentCount = 'group__commentCount',
  GroupCreatedAt = 'group__createdAt',
  GroupCurrentAbstainCount = 'group__currentAbstainCount',
  GroupCurrentAgainstCount = 'group__currentAgainstCount',
  GroupCurrentForCount = 'group__currentForCount',
  GroupId = 'group__id',
  GroupLatestVersionNumber = 'group__latestVersionNumber',
  GroupProposer = 'group__proposer',
  GroupSalt = 'group__salt',
  GroupVersionCount = 'group__versionCount',
  Id = 'id',
  Proposal = 'proposal',
  ProposalAbstainVotes = 'proposal__abstainVotes',
  ProposalAgainstVotes = 'proposal__againstVotes',
  ProposalCalldatas = 'proposal__calldatas',
  ProposalCancelTransactionHash = 'proposal__cancelTransactionHash',
  ProposalCanceled = 'proposal__canceled',
  ProposalCanceledAt = 'proposal__canceledAt',
  ProposalDescription = 'proposal__description',
  ProposalDescriptionHash = 'proposal__descriptionHash',
  ProposalDiscussionUrl = 'proposal__discussionUrl',
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalIsSigned = 'proposal__isSigned',
  ProposalMetadata = 'proposal__metadata',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalRepresentedAddress = 'proposal__representedAddress',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
  ProposalUpdateCount = 'proposal__updateCount',
  ProposalUpdateMessage = 'proposal__updateMessage',
  ProposalUpdatePeriodEnd = 'proposal__updatePeriodEnd',
  ProposalVetoTransactionHash = 'proposal__vetoTransactionHash',
  ProposalVetoed = 'proposal__vetoed',
  ProposalVetoedAt = 'proposal__vetoedAt',
  ProposalVoteCount = 'proposal__voteCount',
  ProposalVoteEnd = 'proposal__voteEnd',
  ProposalVoteStart = 'proposal__voteStart',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export type CandidateVersionCreatedEvent = FeedEvent & {
  __typename?: 'CandidateVersionCreatedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  candidateVersion: ProposalCandidateVersion
  dao: Dao
  group: ProposalCandidateGroup
  id: Scalars['ID']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export type CandidateVersionCreatedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<CandidateVersionCreatedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  candidateVersion?: InputMaybe<Scalars['String']['input']>
  candidateVersion_?: InputMaybe<ProposalCandidateVersion_Filter>
  candidateVersion_contains?: InputMaybe<Scalars['String']['input']>
  candidateVersion_contains_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_ends_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_gt?: InputMaybe<Scalars['String']['input']>
  candidateVersion_gte?: InputMaybe<Scalars['String']['input']>
  candidateVersion_in?: InputMaybe<Array<Scalars['String']['input']>>
  candidateVersion_lt?: InputMaybe<Scalars['String']['input']>
  candidateVersion_lte?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_contains?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_ends_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  candidateVersion_not_starts_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_starts_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  group?: InputMaybe<Scalars['String']['input']>
  group_?: InputMaybe<ProposalCandidateGroup_Filter>
  group_contains?: InputMaybe<Scalars['String']['input']>
  group_contains_nocase?: InputMaybe<Scalars['String']['input']>
  group_ends_with?: InputMaybe<Scalars['String']['input']>
  group_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_gt?: InputMaybe<Scalars['String']['input']>
  group_gte?: InputMaybe<Scalars['String']['input']>
  group_in?: InputMaybe<Array<Scalars['String']['input']>>
  group_lt?: InputMaybe<Scalars['String']['input']>
  group_lte?: InputMaybe<Scalars['String']['input']>
  group_not?: InputMaybe<Scalars['String']['input']>
  group_not_contains?: InputMaybe<Scalars['String']['input']>
  group_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  group_not_ends_with?: InputMaybe<Scalars['String']['input']>
  group_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  group_not_starts_with?: InputMaybe<Scalars['String']['input']>
  group_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_starts_with?: InputMaybe<Scalars['String']['input']>
  group_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<CandidateVersionCreatedEvent_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum CandidateVersionCreatedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  CandidateVersion = 'candidateVersion',
  CandidateVersionAttestationUid = 'candidateVersion__attestationUID',
  CandidateVersionAttester = 'candidateVersion__attester',
  CandidateVersionCandidateId = 'candidateVersion__candidateId',
  CandidateVersionComputedProposalId = 'candidateVersion__computedProposalId',
  CandidateVersionCreatedAt = 'candidateVersion__createdAt',
  CandidateVersionDescription = 'candidateVersion__description',
  CandidateVersionDiscussionUrl = 'candidateVersion__discussionUrl',
  CandidateVersionId = 'candidateVersion__id',
  CandidateVersionMetadata = 'candidateVersion__metadata',
  CandidateVersionRepresentedAddress = 'candidateVersion__representedAddress',
  CandidateVersionRevoked = 'candidateVersion__revoked',
  CandidateVersionSalt = 'candidateVersion__salt',
  CandidateVersionSignatureCount = 'candidateVersion__signatureCount',
  CandidateVersionTitle = 'candidateVersion__title',
  CandidateVersionTotalVoteWeight = 'candidateVersion__totalVoteWeight',
  CandidateVersionVersionNumber = 'candidateVersion__versionNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Group = 'group',
  GroupCandidateNumber = 'group__candidateNumber',
  GroupCommentCount = 'group__commentCount',
  GroupCreatedAt = 'group__createdAt',
  GroupCurrentAbstainCount = 'group__currentAbstainCount',
  GroupCurrentAgainstCount = 'group__currentAgainstCount',
  GroupCurrentForCount = 'group__currentForCount',
  GroupId = 'group__id',
  GroupLatestVersionNumber = 'group__latestVersionNumber',
  GroupProposer = 'group__proposer',
  GroupSalt = 'group__salt',
  GroupVersionCount = 'group__versionCount',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export enum CandidateVoteSupport {
  Abstain = 'ABSTAIN',
  Against = 'AGAINST',
  For = 'FOR',
  None = 'NONE',
}

export type ClankerToken = {
  __typename?: 'ClankerToken'
  adminChangedAt?: Maybe<Scalars['BigInt']['output']>
  createdAt: Scalars['BigInt']['output']
  createdAtBlock: Scalars['BigInt']['output']
  dao?: Maybe<Dao>
  extensions: Array<Scalars['Bytes']['output']>
  extensionsSupply: Scalars['BigInt']['output']
  holders: Array<ClankerTokenHolder>
  id: Scalars['ID']['output']
  isTrusted: Scalars['Boolean']['output']
  locker: Scalars['Bytes']['output']
  mevModule: Scalars['Bytes']['output']
  msgSender: Scalars['Bytes']['output']
  pairedToken: Scalars['Bytes']['output']
  poolHook: Scalars['Bytes']['output']
  poolId: Scalars['Bytes']['output']
  startingTick: Scalars['BigInt']['output']
  swapRoute?: Maybe<SwapRoute>
  tokenAddress: Scalars['Bytes']['output']
  tokenAdmin: Scalars['Bytes']['output']
  tokenContext: Scalars['String']['output']
  tokenImage: Scalars['String']['output']
  tokenMetadata: Scalars['String']['output']
  tokenName: Scalars['String']['output']
  tokenSymbol: Scalars['String']['output']
  transactionHash: Scalars['Bytes']['output']
}

export type ClankerTokenHoldersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ClankerTokenHolder_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ClankerTokenHolder_Filter>
}

export type ClankerTokenCreatedEvent = FeedEvent & {
  __typename?: 'ClankerTokenCreatedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  clankerToken: ClankerToken
  dao: Dao
  id: Scalars['ID']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export type ClankerTokenCreatedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<ClankerTokenCreatedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  clankerToken?: InputMaybe<Scalars['String']['input']>
  clankerToken_?: InputMaybe<ClankerToken_Filter>
  clankerToken_contains?: InputMaybe<Scalars['String']['input']>
  clankerToken_contains_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_ends_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_gt?: InputMaybe<Scalars['String']['input']>
  clankerToken_gte?: InputMaybe<Scalars['String']['input']>
  clankerToken_in?: InputMaybe<Array<Scalars['String']['input']>>
  clankerToken_lt?: InputMaybe<Scalars['String']['input']>
  clankerToken_lte?: InputMaybe<Scalars['String']['input']>
  clankerToken_not?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_contains?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_ends_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  clankerToken_not_starts_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_starts_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ClankerTokenCreatedEvent_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum ClankerTokenCreatedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  ClankerToken = 'clankerToken',
  ClankerTokenAdminChangedAt = 'clankerToken__adminChangedAt',
  ClankerTokenCreatedAt = 'clankerToken__createdAt',
  ClankerTokenCreatedAtBlock = 'clankerToken__createdAtBlock',
  ClankerTokenExtensionsSupply = 'clankerToken__extensionsSupply',
  ClankerTokenId = 'clankerToken__id',
  ClankerTokenIsTrusted = 'clankerToken__isTrusted',
  ClankerTokenLocker = 'clankerToken__locker',
  ClankerTokenMevModule = 'clankerToken__mevModule',
  ClankerTokenMsgSender = 'clankerToken__msgSender',
  ClankerTokenPairedToken = 'clankerToken__pairedToken',
  ClankerTokenPoolHook = 'clankerToken__poolHook',
  ClankerTokenPoolId = 'clankerToken__poolId',
  ClankerTokenStartingTick = 'clankerToken__startingTick',
  ClankerTokenTokenAddress = 'clankerToken__tokenAddress',
  ClankerTokenTokenAdmin = 'clankerToken__tokenAdmin',
  ClankerTokenTokenContext = 'clankerToken__tokenContext',
  ClankerTokenTokenImage = 'clankerToken__tokenImage',
  ClankerTokenTokenMetadata = 'clankerToken__tokenMetadata',
  ClankerTokenTokenName = 'clankerToken__tokenName',
  ClankerTokenTokenSymbol = 'clankerToken__tokenSymbol',
  ClankerTokenTransactionHash = 'clankerToken__transactionHash',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export type ClankerTokenHolder = {
  __typename?: 'ClankerTokenHolder'
  balance: Scalars['BigInt']['output']
  holder: Scalars['Bytes']['output']
  id: Scalars['ID']['output']
  token: ClankerToken
  updatedAt: Scalars['BigInt']['output']
  updatedAtBlock: Scalars['BigInt']['output']
}

export type ClankerTokenHolder_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<ClankerTokenHolder_Filter>>>
  balance?: InputMaybe<Scalars['BigInt']['input']>
  balance_gt?: InputMaybe<Scalars['BigInt']['input']>
  balance_gte?: InputMaybe<Scalars['BigInt']['input']>
  balance_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  balance_lt?: InputMaybe<Scalars['BigInt']['input']>
  balance_lte?: InputMaybe<Scalars['BigInt']['input']>
  balance_not?: InputMaybe<Scalars['BigInt']['input']>
  balance_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  holder?: InputMaybe<Scalars['Bytes']['input']>
  holder_contains?: InputMaybe<Scalars['Bytes']['input']>
  holder_gt?: InputMaybe<Scalars['Bytes']['input']>
  holder_gte?: InputMaybe<Scalars['Bytes']['input']>
  holder_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  holder_lt?: InputMaybe<Scalars['Bytes']['input']>
  holder_lte?: InputMaybe<Scalars['Bytes']['input']>
  holder_not?: InputMaybe<Scalars['Bytes']['input']>
  holder_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  holder_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ClankerTokenHolder_Filter>>>
  token?: InputMaybe<Scalars['String']['input']>
  token_?: InputMaybe<ClankerToken_Filter>
  token_contains?: InputMaybe<Scalars['String']['input']>
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>
  token_ends_with?: InputMaybe<Scalars['String']['input']>
  token_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  token_gt?: InputMaybe<Scalars['String']['input']>
  token_gte?: InputMaybe<Scalars['String']['input']>
  token_in?: InputMaybe<Array<Scalars['String']['input']>>
  token_lt?: InputMaybe<Scalars['String']['input']>
  token_lte?: InputMaybe<Scalars['String']['input']>
  token_not?: InputMaybe<Scalars['String']['input']>
  token_not_contains?: InputMaybe<Scalars['String']['input']>
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  token_not_ends_with?: InputMaybe<Scalars['String']['input']>
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  token_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  token_not_starts_with?: InputMaybe<Scalars['String']['input']>
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  token_starts_with?: InputMaybe<Scalars['String']['input']>
  token_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  updatedAt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_gt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_gte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updatedAtBlock_lt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_lte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_not?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updatedAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updatedAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_not?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
}

export enum ClankerTokenHolder_OrderBy {
  Balance = 'balance',
  Holder = 'holder',
  Id = 'id',
  Token = 'token',
  TokenAdminChangedAt = 'token__adminChangedAt',
  TokenCreatedAt = 'token__createdAt',
  TokenCreatedAtBlock = 'token__createdAtBlock',
  TokenExtensionsSupply = 'token__extensionsSupply',
  TokenId = 'token__id',
  TokenIsTrusted = 'token__isTrusted',
  TokenLocker = 'token__locker',
  TokenMevModule = 'token__mevModule',
  TokenMsgSender = 'token__msgSender',
  TokenPairedToken = 'token__pairedToken',
  TokenPoolHook = 'token__poolHook',
  TokenPoolId = 'token__poolId',
  TokenStartingTick = 'token__startingTick',
  TokenTokenAddress = 'token__tokenAddress',
  TokenTokenAdmin = 'token__tokenAdmin',
  TokenTokenContext = 'token__tokenContext',
  TokenTokenImage = 'token__tokenImage',
  TokenTokenMetadata = 'token__tokenMetadata',
  TokenTokenName = 'token__tokenName',
  TokenTokenSymbol = 'token__tokenSymbol',
  TokenTransactionHash = 'token__transactionHash',
  UpdatedAt = 'updatedAt',
  UpdatedAtBlock = 'updatedAtBlock',
}

export type ClankerTokenLinkedEvent = FeedEvent & {
  __typename?: 'ClankerTokenLinkedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  clankerToken: ClankerToken
  dao: Dao
  id: Scalars['ID']['output']
  previousAdmin: Scalars['Bytes']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export type ClankerTokenLinkedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<ClankerTokenLinkedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  clankerToken?: InputMaybe<Scalars['String']['input']>
  clankerToken_?: InputMaybe<ClankerToken_Filter>
  clankerToken_contains?: InputMaybe<Scalars['String']['input']>
  clankerToken_contains_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_ends_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_gt?: InputMaybe<Scalars['String']['input']>
  clankerToken_gte?: InputMaybe<Scalars['String']['input']>
  clankerToken_in?: InputMaybe<Array<Scalars['String']['input']>>
  clankerToken_lt?: InputMaybe<Scalars['String']['input']>
  clankerToken_lte?: InputMaybe<Scalars['String']['input']>
  clankerToken_not?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_contains?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_ends_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  clankerToken_not_starts_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_starts_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ClankerTokenLinkedEvent_Filter>>>
  previousAdmin?: InputMaybe<Scalars['Bytes']['input']>
  previousAdmin_contains?: InputMaybe<Scalars['Bytes']['input']>
  previousAdmin_gt?: InputMaybe<Scalars['Bytes']['input']>
  previousAdmin_gte?: InputMaybe<Scalars['Bytes']['input']>
  previousAdmin_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  previousAdmin_lt?: InputMaybe<Scalars['Bytes']['input']>
  previousAdmin_lte?: InputMaybe<Scalars['Bytes']['input']>
  previousAdmin_not?: InputMaybe<Scalars['Bytes']['input']>
  previousAdmin_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  previousAdmin_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum ClankerTokenLinkedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  ClankerToken = 'clankerToken',
  ClankerTokenAdminChangedAt = 'clankerToken__adminChangedAt',
  ClankerTokenCreatedAt = 'clankerToken__createdAt',
  ClankerTokenCreatedAtBlock = 'clankerToken__createdAtBlock',
  ClankerTokenExtensionsSupply = 'clankerToken__extensionsSupply',
  ClankerTokenId = 'clankerToken__id',
  ClankerTokenIsTrusted = 'clankerToken__isTrusted',
  ClankerTokenLocker = 'clankerToken__locker',
  ClankerTokenMevModule = 'clankerToken__mevModule',
  ClankerTokenMsgSender = 'clankerToken__msgSender',
  ClankerTokenPairedToken = 'clankerToken__pairedToken',
  ClankerTokenPoolHook = 'clankerToken__poolHook',
  ClankerTokenPoolId = 'clankerToken__poolId',
  ClankerTokenStartingTick = 'clankerToken__startingTick',
  ClankerTokenTokenAddress = 'clankerToken__tokenAddress',
  ClankerTokenTokenAdmin = 'clankerToken__tokenAdmin',
  ClankerTokenTokenContext = 'clankerToken__tokenContext',
  ClankerTokenTokenImage = 'clankerToken__tokenImage',
  ClankerTokenTokenMetadata = 'clankerToken__tokenMetadata',
  ClankerTokenTokenName = 'clankerToken__tokenName',
  ClankerTokenTokenSymbol = 'clankerToken__tokenSymbol',
  ClankerTokenTransactionHash = 'clankerToken__transactionHash',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  PreviousAdmin = 'previousAdmin',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export type ClankerTokenUnlinkedEvent = FeedEvent & {
  __typename?: 'ClankerTokenUnlinkedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  clankerToken: ClankerToken
  dao: Dao
  id: Scalars['ID']['output']
  newAdmin: Scalars['Bytes']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export type ClankerTokenUnlinkedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<ClankerTokenUnlinkedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  clankerToken?: InputMaybe<Scalars['String']['input']>
  clankerToken_?: InputMaybe<ClankerToken_Filter>
  clankerToken_contains?: InputMaybe<Scalars['String']['input']>
  clankerToken_contains_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_ends_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_gt?: InputMaybe<Scalars['String']['input']>
  clankerToken_gte?: InputMaybe<Scalars['String']['input']>
  clankerToken_in?: InputMaybe<Array<Scalars['String']['input']>>
  clankerToken_lt?: InputMaybe<Scalars['String']['input']>
  clankerToken_lte?: InputMaybe<Scalars['String']['input']>
  clankerToken_not?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_contains?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_ends_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  clankerToken_not_starts_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_starts_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  newAdmin?: InputMaybe<Scalars['Bytes']['input']>
  newAdmin_contains?: InputMaybe<Scalars['Bytes']['input']>
  newAdmin_gt?: InputMaybe<Scalars['Bytes']['input']>
  newAdmin_gte?: InputMaybe<Scalars['Bytes']['input']>
  newAdmin_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  newAdmin_lt?: InputMaybe<Scalars['Bytes']['input']>
  newAdmin_lte?: InputMaybe<Scalars['Bytes']['input']>
  newAdmin_not?: InputMaybe<Scalars['Bytes']['input']>
  newAdmin_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  newAdmin_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  or?: InputMaybe<Array<InputMaybe<ClankerTokenUnlinkedEvent_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum ClankerTokenUnlinkedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  ClankerToken = 'clankerToken',
  ClankerTokenAdminChangedAt = 'clankerToken__adminChangedAt',
  ClankerTokenCreatedAt = 'clankerToken__createdAt',
  ClankerTokenCreatedAtBlock = 'clankerToken__createdAtBlock',
  ClankerTokenExtensionsSupply = 'clankerToken__extensionsSupply',
  ClankerTokenId = 'clankerToken__id',
  ClankerTokenIsTrusted = 'clankerToken__isTrusted',
  ClankerTokenLocker = 'clankerToken__locker',
  ClankerTokenMevModule = 'clankerToken__mevModule',
  ClankerTokenMsgSender = 'clankerToken__msgSender',
  ClankerTokenPairedToken = 'clankerToken__pairedToken',
  ClankerTokenPoolHook = 'clankerToken__poolHook',
  ClankerTokenPoolId = 'clankerToken__poolId',
  ClankerTokenStartingTick = 'clankerToken__startingTick',
  ClankerTokenTokenAddress = 'clankerToken__tokenAddress',
  ClankerTokenTokenAdmin = 'clankerToken__tokenAdmin',
  ClankerTokenTokenContext = 'clankerToken__tokenContext',
  ClankerTokenTokenImage = 'clankerToken__tokenImage',
  ClankerTokenTokenMetadata = 'clankerToken__tokenMetadata',
  ClankerTokenTokenName = 'clankerToken__tokenName',
  ClankerTokenTokenSymbol = 'clankerToken__tokenSymbol',
  ClankerTokenTransactionHash = 'clankerToken__transactionHash',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  NewAdmin = 'newAdmin',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export type ClankerToken_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  adminChangedAt?: InputMaybe<Scalars['BigInt']['input']>
  adminChangedAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  adminChangedAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  adminChangedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  adminChangedAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  adminChangedAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  adminChangedAt_not?: InputMaybe<Scalars['BigInt']['input']>
  adminChangedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  and?: InputMaybe<Array<InputMaybe<ClankerToken_Filter>>>
  createdAt?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_gt?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_gte?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAtBlock_lt?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_lte?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_not?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  extensions?: InputMaybe<Array<Scalars['Bytes']['input']>>
  extensionsSupply?: InputMaybe<Scalars['BigInt']['input']>
  extensionsSupply_gt?: InputMaybe<Scalars['BigInt']['input']>
  extensionsSupply_gte?: InputMaybe<Scalars['BigInt']['input']>
  extensionsSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  extensionsSupply_lt?: InputMaybe<Scalars['BigInt']['input']>
  extensionsSupply_lte?: InputMaybe<Scalars['BigInt']['input']>
  extensionsSupply_not?: InputMaybe<Scalars['BigInt']['input']>
  extensionsSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  extensions_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>
  extensions_not?: InputMaybe<Array<Scalars['Bytes']['input']>>
  extensions_not_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>
  holders_?: InputMaybe<ClankerTokenHolder_Filter>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  isTrusted?: InputMaybe<Scalars['Boolean']['input']>
  isTrusted_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  isTrusted_not?: InputMaybe<Scalars['Boolean']['input']>
  isTrusted_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  locker?: InputMaybe<Scalars['Bytes']['input']>
  locker_contains?: InputMaybe<Scalars['Bytes']['input']>
  locker_gt?: InputMaybe<Scalars['Bytes']['input']>
  locker_gte?: InputMaybe<Scalars['Bytes']['input']>
  locker_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  locker_lt?: InputMaybe<Scalars['Bytes']['input']>
  locker_lte?: InputMaybe<Scalars['Bytes']['input']>
  locker_not?: InputMaybe<Scalars['Bytes']['input']>
  locker_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  locker_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  mevModule?: InputMaybe<Scalars['Bytes']['input']>
  mevModule_contains?: InputMaybe<Scalars['Bytes']['input']>
  mevModule_gt?: InputMaybe<Scalars['Bytes']['input']>
  mevModule_gte?: InputMaybe<Scalars['Bytes']['input']>
  mevModule_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  mevModule_lt?: InputMaybe<Scalars['Bytes']['input']>
  mevModule_lte?: InputMaybe<Scalars['Bytes']['input']>
  mevModule_not?: InputMaybe<Scalars['Bytes']['input']>
  mevModule_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  mevModule_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  msgSender?: InputMaybe<Scalars['Bytes']['input']>
  msgSender_contains?: InputMaybe<Scalars['Bytes']['input']>
  msgSender_gt?: InputMaybe<Scalars['Bytes']['input']>
  msgSender_gte?: InputMaybe<Scalars['Bytes']['input']>
  msgSender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  msgSender_lt?: InputMaybe<Scalars['Bytes']['input']>
  msgSender_lte?: InputMaybe<Scalars['Bytes']['input']>
  msgSender_not?: InputMaybe<Scalars['Bytes']['input']>
  msgSender_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  msgSender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  or?: InputMaybe<Array<InputMaybe<ClankerToken_Filter>>>
  pairedToken?: InputMaybe<Scalars['Bytes']['input']>
  pairedToken_contains?: InputMaybe<Scalars['Bytes']['input']>
  pairedToken_gt?: InputMaybe<Scalars['Bytes']['input']>
  pairedToken_gte?: InputMaybe<Scalars['Bytes']['input']>
  pairedToken_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  pairedToken_lt?: InputMaybe<Scalars['Bytes']['input']>
  pairedToken_lte?: InputMaybe<Scalars['Bytes']['input']>
  pairedToken_not?: InputMaybe<Scalars['Bytes']['input']>
  pairedToken_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  pairedToken_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolHook?: InputMaybe<Scalars['Bytes']['input']>
  poolHook_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolHook_gt?: InputMaybe<Scalars['Bytes']['input']>
  poolHook_gte?: InputMaybe<Scalars['Bytes']['input']>
  poolHook_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolHook_lt?: InputMaybe<Scalars['Bytes']['input']>
  poolHook_lte?: InputMaybe<Scalars['Bytes']['input']>
  poolHook_not?: InputMaybe<Scalars['Bytes']['input']>
  poolHook_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolHook_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolId?: InputMaybe<Scalars['Bytes']['input']>
  poolId_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolId_gt?: InputMaybe<Scalars['Bytes']['input']>
  poolId_gte?: InputMaybe<Scalars['Bytes']['input']>
  poolId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolId_lt?: InputMaybe<Scalars['Bytes']['input']>
  poolId_lte?: InputMaybe<Scalars['Bytes']['input']>
  poolId_not?: InputMaybe<Scalars['Bytes']['input']>
  poolId_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  startingTick?: InputMaybe<Scalars['BigInt']['input']>
  startingTick_gt?: InputMaybe<Scalars['BigInt']['input']>
  startingTick_gte?: InputMaybe<Scalars['BigInt']['input']>
  startingTick_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  startingTick_lt?: InputMaybe<Scalars['BigInt']['input']>
  startingTick_lte?: InputMaybe<Scalars['BigInt']['input']>
  startingTick_not?: InputMaybe<Scalars['BigInt']['input']>
  startingTick_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  swapRoute_?: InputMaybe<SwapRoute_Filter>
  tokenAddress?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_gt?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_gte?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenAddress_lt?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_lte?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_not?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenAdmin?: InputMaybe<Scalars['Bytes']['input']>
  tokenAdmin_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenAdmin_gt?: InputMaybe<Scalars['Bytes']['input']>
  tokenAdmin_gte?: InputMaybe<Scalars['Bytes']['input']>
  tokenAdmin_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenAdmin_lt?: InputMaybe<Scalars['Bytes']['input']>
  tokenAdmin_lte?: InputMaybe<Scalars['Bytes']['input']>
  tokenAdmin_not?: InputMaybe<Scalars['Bytes']['input']>
  tokenAdmin_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenAdmin_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenContext?: InputMaybe<Scalars['String']['input']>
  tokenContext_contains?: InputMaybe<Scalars['String']['input']>
  tokenContext_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenContext_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenContext_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenContext_gt?: InputMaybe<Scalars['String']['input']>
  tokenContext_gte?: InputMaybe<Scalars['String']['input']>
  tokenContext_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenContext_lt?: InputMaybe<Scalars['String']['input']>
  tokenContext_lte?: InputMaybe<Scalars['String']['input']>
  tokenContext_not?: InputMaybe<Scalars['String']['input']>
  tokenContext_not_contains?: InputMaybe<Scalars['String']['input']>
  tokenContext_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenContext_not_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenContext_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenContext_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenContext_not_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenContext_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenContext_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenContext_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenImage?: InputMaybe<Scalars['String']['input']>
  tokenImage_contains?: InputMaybe<Scalars['String']['input']>
  tokenImage_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenImage_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenImage_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenImage_gt?: InputMaybe<Scalars['String']['input']>
  tokenImage_gte?: InputMaybe<Scalars['String']['input']>
  tokenImage_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenImage_lt?: InputMaybe<Scalars['String']['input']>
  tokenImage_lte?: InputMaybe<Scalars['String']['input']>
  tokenImage_not?: InputMaybe<Scalars['String']['input']>
  tokenImage_not_contains?: InputMaybe<Scalars['String']['input']>
  tokenImage_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenImage_not_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenImage_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenImage_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenImage_not_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenImage_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenImage_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenImage_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenMetadata?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_contains?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_gt?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_gte?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenMetadata_lt?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_lte?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_not?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_not_contains?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_not_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenMetadata_not_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenMetadata_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenName?: InputMaybe<Scalars['String']['input']>
  tokenName_contains?: InputMaybe<Scalars['String']['input']>
  tokenName_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenName_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenName_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenName_gt?: InputMaybe<Scalars['String']['input']>
  tokenName_gte?: InputMaybe<Scalars['String']['input']>
  tokenName_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenName_lt?: InputMaybe<Scalars['String']['input']>
  tokenName_lte?: InputMaybe<Scalars['String']['input']>
  tokenName_not?: InputMaybe<Scalars['String']['input']>
  tokenName_not_contains?: InputMaybe<Scalars['String']['input']>
  tokenName_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenName_not_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenName_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenName_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenName_not_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenName_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenName_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenName_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenSymbol?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_contains?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_gt?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_gte?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenSymbol_lt?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_lte?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not_contains?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenSymbol_not_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
}

export enum ClankerToken_OrderBy {
  AdminChangedAt = 'adminChangedAt',
  CreatedAt = 'createdAt',
  CreatedAtBlock = 'createdAtBlock',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Extensions = 'extensions',
  ExtensionsSupply = 'extensionsSupply',
  Holders = 'holders',
  Id = 'id',
  IsTrusted = 'isTrusted',
  Locker = 'locker',
  MevModule = 'mevModule',
  MsgSender = 'msgSender',
  PairedToken = 'pairedToken',
  PoolHook = 'poolHook',
  PoolId = 'poolId',
  StartingTick = 'startingTick',
  SwapRoute = 'swapRoute',
  SwapRouteCoinAddress = 'swapRoute__coinAddress',
  SwapRouteCreatedAt = 'swapRoute__createdAt',
  SwapRouteId = 'swapRoute__id',
  SwapRouteUpdatedAt = 'swapRoute__updatedAt',
  TokenAddress = 'tokenAddress',
  TokenAdmin = 'tokenAdmin',
  TokenContext = 'tokenContext',
  TokenImage = 'tokenImage',
  TokenMetadata = 'tokenMetadata',
  TokenName = 'tokenName',
  TokenSymbol = 'tokenSymbol',
  TransactionHash = 'transactionHash',
}

export enum CoinType {
  ClankerToken = 'CLANKER_TOKEN',
  Unknown = 'UNKNOWN',
  Weth = 'WETH',
  ZoraCoin = 'ZORA_COIN',
}

export type Dao = {
  __typename?: 'DAO'
  auctionAddress: Scalars['Bytes']['output']
  auctionConfig: AuctionConfig
  auctions: Array<Auction>
  candidateCount: Scalars['Int']['output']
  candidates: Array<ProposalCandidateGroup>
  clankerTokens: Array<ClankerToken>
  contractImage: Scalars['String']['output']
  currentAuction?: Maybe<Auction>
  daoMultisigUpdates: Array<DaoMultisigUpdate>
  description: Scalars['String']['output']
  feedEvents: Array<FeedEvent>
  governorAddress: Scalars['Bytes']['output']
  id: Scalars['ID']['output']
  links: Array<DaoLink>
  metadata?: Maybe<Scalars['String']['output']>
  metadataAddress: Scalars['Bytes']['output']
  metadataProperties?: Maybe<Array<MetadataProperty>>
  name: Scalars['String']['output']
  ownerCount: Scalars['Int']['output']
  owners: Array<DaoTokenOwner>
  pinnedAssets: Array<TreasuryAssetPin>
  projectURI: Scalars['String']['output']
  proposalCount: Scalars['Int']['output']
  proposals: Array<Proposal>
  symbol: Scalars['String']['output']
  tokenAddress: Scalars['Bytes']['output']
  tokens: Array<Token>
  tokensCount: Scalars['Int']['output']
  totalAuctionSales: Scalars['BigInt']['output']
  totalSupply: Scalars['Int']['output']
  treasuryAddress: Scalars['Bytes']['output']
  voterCount: Scalars['Int']['output']
  voters: Array<DaoVoter>
  zoraCoins: Array<ZoraCoin>
  zoraDrops: Array<ZoraDrop>
}

export type DaoAuctionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Auction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<Auction_Filter>
}

export type DaoCandidatesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalCandidateGroup_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ProposalCandidateGroup_Filter>
}

export type DaoClankerTokensArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ClankerToken_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ClankerToken_Filter>
}

export type DaoDaoMultisigUpdatesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoMultisigUpdate_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<DaoMultisigUpdate_Filter>
}

export type DaoFeedEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<FeedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<FeedEvent_Filter>
}

export type DaoLinksArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoLink_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<DaoLink_Filter>
}

export type DaoMetadataPropertiesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<MetadataProperty_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<MetadataProperty_Filter>
}

export type DaoOwnersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoTokenOwner_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<DaoTokenOwner_Filter>
}

export type DaoPinnedAssetsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<TreasuryAssetPin_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<TreasuryAssetPin_Filter>
}

export type DaoProposalsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Proposal_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<Proposal_Filter>
}

export type DaoTokensArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Token_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<Token_Filter>
}

export type DaoVotersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoVoter_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<DaoVoter_Filter>
}

export type DaoZoraCoinsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraCoin_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ZoraCoin_Filter>
}

export type DaoZoraDropsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraDrop_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ZoraDrop_Filter>
}

export type DaoLink = {
  __typename?: 'DAOLink'
  dao: Dao
  id: Scalars['ID']['output']
  key: Scalars['String']['output']
  url: Scalars['String']['output']
}

export type DaoLink_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<DaoLink_Filter>>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  key?: InputMaybe<Scalars['String']['input']>
  key_contains?: InputMaybe<Scalars['String']['input']>
  key_contains_nocase?: InputMaybe<Scalars['String']['input']>
  key_ends_with?: InputMaybe<Scalars['String']['input']>
  key_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  key_gt?: InputMaybe<Scalars['String']['input']>
  key_gte?: InputMaybe<Scalars['String']['input']>
  key_in?: InputMaybe<Array<Scalars['String']['input']>>
  key_lt?: InputMaybe<Scalars['String']['input']>
  key_lte?: InputMaybe<Scalars['String']['input']>
  key_not?: InputMaybe<Scalars['String']['input']>
  key_not_contains?: InputMaybe<Scalars['String']['input']>
  key_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  key_not_ends_with?: InputMaybe<Scalars['String']['input']>
  key_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  key_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  key_not_starts_with?: InputMaybe<Scalars['String']['input']>
  key_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  key_starts_with?: InputMaybe<Scalars['String']['input']>
  key_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  or?: InputMaybe<Array<InputMaybe<DaoLink_Filter>>>
  url?: InputMaybe<Scalars['String']['input']>
  url_contains?: InputMaybe<Scalars['String']['input']>
  url_contains_nocase?: InputMaybe<Scalars['String']['input']>
  url_ends_with?: InputMaybe<Scalars['String']['input']>
  url_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  url_gt?: InputMaybe<Scalars['String']['input']>
  url_gte?: InputMaybe<Scalars['String']['input']>
  url_in?: InputMaybe<Array<Scalars['String']['input']>>
  url_lt?: InputMaybe<Scalars['String']['input']>
  url_lte?: InputMaybe<Scalars['String']['input']>
  url_not?: InputMaybe<Scalars['String']['input']>
  url_not_contains?: InputMaybe<Scalars['String']['input']>
  url_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  url_not_ends_with?: InputMaybe<Scalars['String']['input']>
  url_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  url_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  url_not_starts_with?: InputMaybe<Scalars['String']['input']>
  url_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  url_starts_with?: InputMaybe<Scalars['String']['input']>
  url_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
}

export enum DaoLink_OrderBy {
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Key = 'key',
  Url = 'url',
}

export type DaoTokenOwner = {
  __typename?: 'DAOTokenOwner'
  dao: Dao
  daoTokenCount: Scalars['Int']['output']
  daoTokens: Array<Token>
  delegate: Scalars['Bytes']['output']
  id: Scalars['ID']['output']
  owner: Scalars['Bytes']['output']
}

export type DaoTokenOwnerDaoTokensArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Token_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<Token_Filter>
}

export type DaoTokenOwner_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<DaoTokenOwner_Filter>>>
  dao?: InputMaybe<Scalars['String']['input']>
  daoTokenCount?: InputMaybe<Scalars['Int']['input']>
  daoTokenCount_gt?: InputMaybe<Scalars['Int']['input']>
  daoTokenCount_gte?: InputMaybe<Scalars['Int']['input']>
  daoTokenCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  daoTokenCount_lt?: InputMaybe<Scalars['Int']['input']>
  daoTokenCount_lte?: InputMaybe<Scalars['Int']['input']>
  daoTokenCount_not?: InputMaybe<Scalars['Int']['input']>
  daoTokenCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  daoTokens_?: InputMaybe<Token_Filter>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  delegate?: InputMaybe<Scalars['Bytes']['input']>
  delegate_contains?: InputMaybe<Scalars['Bytes']['input']>
  delegate_gt?: InputMaybe<Scalars['Bytes']['input']>
  delegate_gte?: InputMaybe<Scalars['Bytes']['input']>
  delegate_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  delegate_lt?: InputMaybe<Scalars['Bytes']['input']>
  delegate_lte?: InputMaybe<Scalars['Bytes']['input']>
  delegate_not?: InputMaybe<Scalars['Bytes']['input']>
  delegate_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  delegate_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<DaoTokenOwner_Filter>>>
  owner?: InputMaybe<Scalars['Bytes']['input']>
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>
  owner_not?: InputMaybe<Scalars['Bytes']['input']>
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
}

export enum DaoTokenOwner_OrderBy {
  Dao = 'dao',
  DaoTokenCount = 'daoTokenCount',
  DaoTokens = 'daoTokens',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Delegate = 'delegate',
  Id = 'id',
  Owner = 'owner',
}

export type DaoVoter = {
  __typename?: 'DAOVoter'
  dao: Dao
  daoTokenCount: Scalars['Int']['output']
  daoTokens: Array<Token>
  id: Scalars['ID']['output']
  voter: Scalars['Bytes']['output']
}

export type DaoVoterDaoTokensArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Token_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<Token_Filter>
}

export type DaoVoter_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<DaoVoter_Filter>>>
  dao?: InputMaybe<Scalars['String']['input']>
  daoTokenCount?: InputMaybe<Scalars['Int']['input']>
  daoTokenCount_gt?: InputMaybe<Scalars['Int']['input']>
  daoTokenCount_gte?: InputMaybe<Scalars['Int']['input']>
  daoTokenCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  daoTokenCount_lt?: InputMaybe<Scalars['Int']['input']>
  daoTokenCount_lte?: InputMaybe<Scalars['Int']['input']>
  daoTokenCount_not?: InputMaybe<Scalars['Int']['input']>
  daoTokenCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  daoTokens_?: InputMaybe<Token_Filter>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<DaoVoter_Filter>>>
  voter?: InputMaybe<Scalars['Bytes']['input']>
  voter_contains?: InputMaybe<Scalars['Bytes']['input']>
  voter_gt?: InputMaybe<Scalars['Bytes']['input']>
  voter_gte?: InputMaybe<Scalars['Bytes']['input']>
  voter_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  voter_lt?: InputMaybe<Scalars['Bytes']['input']>
  voter_lte?: InputMaybe<Scalars['Bytes']['input']>
  voter_not?: InputMaybe<Scalars['Bytes']['input']>
  voter_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  voter_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
}

export enum DaoVoter_OrderBy {
  Dao = 'dao',
  DaoTokenCount = 'daoTokenCount',
  DaoTokens = 'daoTokens',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Voter = 'voter',
}

export type Dao_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<Dao_Filter>>>
  auctionAddress?: InputMaybe<Scalars['Bytes']['input']>
  auctionAddress_contains?: InputMaybe<Scalars['Bytes']['input']>
  auctionAddress_gt?: InputMaybe<Scalars['Bytes']['input']>
  auctionAddress_gte?: InputMaybe<Scalars['Bytes']['input']>
  auctionAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  auctionAddress_lt?: InputMaybe<Scalars['Bytes']['input']>
  auctionAddress_lte?: InputMaybe<Scalars['Bytes']['input']>
  auctionAddress_not?: InputMaybe<Scalars['Bytes']['input']>
  auctionAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  auctionAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  auctionConfig?: InputMaybe<Scalars['String']['input']>
  auctionConfig_?: InputMaybe<AuctionConfig_Filter>
  auctionConfig_contains?: InputMaybe<Scalars['String']['input']>
  auctionConfig_contains_nocase?: InputMaybe<Scalars['String']['input']>
  auctionConfig_ends_with?: InputMaybe<Scalars['String']['input']>
  auctionConfig_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  auctionConfig_gt?: InputMaybe<Scalars['String']['input']>
  auctionConfig_gte?: InputMaybe<Scalars['String']['input']>
  auctionConfig_in?: InputMaybe<Array<Scalars['String']['input']>>
  auctionConfig_lt?: InputMaybe<Scalars['String']['input']>
  auctionConfig_lte?: InputMaybe<Scalars['String']['input']>
  auctionConfig_not?: InputMaybe<Scalars['String']['input']>
  auctionConfig_not_contains?: InputMaybe<Scalars['String']['input']>
  auctionConfig_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  auctionConfig_not_ends_with?: InputMaybe<Scalars['String']['input']>
  auctionConfig_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  auctionConfig_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  auctionConfig_not_starts_with?: InputMaybe<Scalars['String']['input']>
  auctionConfig_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  auctionConfig_starts_with?: InputMaybe<Scalars['String']['input']>
  auctionConfig_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  auctions_?: InputMaybe<Auction_Filter>
  candidateCount?: InputMaybe<Scalars['Int']['input']>
  candidateCount_gt?: InputMaybe<Scalars['Int']['input']>
  candidateCount_gte?: InputMaybe<Scalars['Int']['input']>
  candidateCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  candidateCount_lt?: InputMaybe<Scalars['Int']['input']>
  candidateCount_lte?: InputMaybe<Scalars['Int']['input']>
  candidateCount_not?: InputMaybe<Scalars['Int']['input']>
  candidateCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  candidates_?: InputMaybe<ProposalCandidateGroup_Filter>
  clankerTokens_?: InputMaybe<ClankerToken_Filter>
  contractImage?: InputMaybe<Scalars['String']['input']>
  contractImage_contains?: InputMaybe<Scalars['String']['input']>
  contractImage_contains_nocase?: InputMaybe<Scalars['String']['input']>
  contractImage_ends_with?: InputMaybe<Scalars['String']['input']>
  contractImage_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  contractImage_gt?: InputMaybe<Scalars['String']['input']>
  contractImage_gte?: InputMaybe<Scalars['String']['input']>
  contractImage_in?: InputMaybe<Array<Scalars['String']['input']>>
  contractImage_lt?: InputMaybe<Scalars['String']['input']>
  contractImage_lte?: InputMaybe<Scalars['String']['input']>
  contractImage_not?: InputMaybe<Scalars['String']['input']>
  contractImage_not_contains?: InputMaybe<Scalars['String']['input']>
  contractImage_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  contractImage_not_ends_with?: InputMaybe<Scalars['String']['input']>
  contractImage_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  contractImage_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  contractImage_not_starts_with?: InputMaybe<Scalars['String']['input']>
  contractImage_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  contractImage_starts_with?: InputMaybe<Scalars['String']['input']>
  contractImage_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  currentAuction?: InputMaybe<Scalars['String']['input']>
  currentAuction_?: InputMaybe<Auction_Filter>
  currentAuction_contains?: InputMaybe<Scalars['String']['input']>
  currentAuction_contains_nocase?: InputMaybe<Scalars['String']['input']>
  currentAuction_ends_with?: InputMaybe<Scalars['String']['input']>
  currentAuction_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  currentAuction_gt?: InputMaybe<Scalars['String']['input']>
  currentAuction_gte?: InputMaybe<Scalars['String']['input']>
  currentAuction_in?: InputMaybe<Array<Scalars['String']['input']>>
  currentAuction_lt?: InputMaybe<Scalars['String']['input']>
  currentAuction_lte?: InputMaybe<Scalars['String']['input']>
  currentAuction_not?: InputMaybe<Scalars['String']['input']>
  currentAuction_not_contains?: InputMaybe<Scalars['String']['input']>
  currentAuction_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  currentAuction_not_ends_with?: InputMaybe<Scalars['String']['input']>
  currentAuction_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  currentAuction_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  currentAuction_not_starts_with?: InputMaybe<Scalars['String']['input']>
  currentAuction_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  currentAuction_starts_with?: InputMaybe<Scalars['String']['input']>
  currentAuction_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  daoMultisigUpdates_?: InputMaybe<DaoMultisigUpdate_Filter>
  description?: InputMaybe<Scalars['String']['input']>
  description_contains?: InputMaybe<Scalars['String']['input']>
  description_contains_nocase?: InputMaybe<Scalars['String']['input']>
  description_ends_with?: InputMaybe<Scalars['String']['input']>
  description_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_gt?: InputMaybe<Scalars['String']['input']>
  description_gte?: InputMaybe<Scalars['String']['input']>
  description_in?: InputMaybe<Array<Scalars['String']['input']>>
  description_lt?: InputMaybe<Scalars['String']['input']>
  description_lte?: InputMaybe<Scalars['String']['input']>
  description_not?: InputMaybe<Scalars['String']['input']>
  description_not_contains?: InputMaybe<Scalars['String']['input']>
  description_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  description_not_ends_with?: InputMaybe<Scalars['String']['input']>
  description_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  description_not_starts_with?: InputMaybe<Scalars['String']['input']>
  description_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_starts_with?: InputMaybe<Scalars['String']['input']>
  description_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  feedEvents_?: InputMaybe<FeedEvent_Filter>
  governorAddress?: InputMaybe<Scalars['Bytes']['input']>
  governorAddress_contains?: InputMaybe<Scalars['Bytes']['input']>
  governorAddress_gt?: InputMaybe<Scalars['Bytes']['input']>
  governorAddress_gte?: InputMaybe<Scalars['Bytes']['input']>
  governorAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  governorAddress_lt?: InputMaybe<Scalars['Bytes']['input']>
  governorAddress_lte?: InputMaybe<Scalars['Bytes']['input']>
  governorAddress_not?: InputMaybe<Scalars['Bytes']['input']>
  governorAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  governorAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  links_?: InputMaybe<DaoLink_Filter>
  metadata?: InputMaybe<Scalars['String']['input']>
  metadataAddress?: InputMaybe<Scalars['Bytes']['input']>
  metadataAddress_contains?: InputMaybe<Scalars['Bytes']['input']>
  metadataAddress_gt?: InputMaybe<Scalars['Bytes']['input']>
  metadataAddress_gte?: InputMaybe<Scalars['Bytes']['input']>
  metadataAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  metadataAddress_lt?: InputMaybe<Scalars['Bytes']['input']>
  metadataAddress_lte?: InputMaybe<Scalars['Bytes']['input']>
  metadataAddress_not?: InputMaybe<Scalars['Bytes']['input']>
  metadataAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  metadataAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  metadataProperties?: InputMaybe<Array<Scalars['String']['input']>>
  metadataProperties_?: InputMaybe<MetadataProperty_Filter>
  metadataProperties_contains?: InputMaybe<Array<Scalars['String']['input']>>
  metadataProperties_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>
  metadataProperties_not?: InputMaybe<Array<Scalars['String']['input']>>
  metadataProperties_not_contains?: InputMaybe<Array<Scalars['String']['input']>>
  metadataProperties_not_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>
  metadata_contains?: InputMaybe<Scalars['String']['input']>
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_ends_with?: InputMaybe<Scalars['String']['input']>
  metadata_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_gt?: InputMaybe<Scalars['String']['input']>
  metadata_gte?: InputMaybe<Scalars['String']['input']>
  metadata_in?: InputMaybe<Array<Scalars['String']['input']>>
  metadata_lt?: InputMaybe<Scalars['String']['input']>
  metadata_lte?: InputMaybe<Scalars['String']['input']>
  metadata_not?: InputMaybe<Scalars['String']['input']>
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_not_ends_with?: InputMaybe<Scalars['String']['input']>
  metadata_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  metadata_not_starts_with?: InputMaybe<Scalars['String']['input']>
  metadata_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_starts_with?: InputMaybe<Scalars['String']['input']>
  metadata_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  name?: InputMaybe<Scalars['String']['input']>
  name_contains?: InputMaybe<Scalars['String']['input']>
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>
  name_ends_with?: InputMaybe<Scalars['String']['input']>
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_gt?: InputMaybe<Scalars['String']['input']>
  name_gte?: InputMaybe<Scalars['String']['input']>
  name_in?: InputMaybe<Array<Scalars['String']['input']>>
  name_lt?: InputMaybe<Scalars['String']['input']>
  name_lte?: InputMaybe<Scalars['String']['input']>
  name_not?: InputMaybe<Scalars['String']['input']>
  name_not_contains?: InputMaybe<Scalars['String']['input']>
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_starts_with?: InputMaybe<Scalars['String']['input']>
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  or?: InputMaybe<Array<InputMaybe<Dao_Filter>>>
  ownerCount?: InputMaybe<Scalars['Int']['input']>
  ownerCount_gt?: InputMaybe<Scalars['Int']['input']>
  ownerCount_gte?: InputMaybe<Scalars['Int']['input']>
  ownerCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  ownerCount_lt?: InputMaybe<Scalars['Int']['input']>
  ownerCount_lte?: InputMaybe<Scalars['Int']['input']>
  ownerCount_not?: InputMaybe<Scalars['Int']['input']>
  ownerCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  owners_?: InputMaybe<DaoTokenOwner_Filter>
  pinnedAssets_?: InputMaybe<TreasuryAssetPin_Filter>
  projectURI?: InputMaybe<Scalars['String']['input']>
  projectURI_contains?: InputMaybe<Scalars['String']['input']>
  projectURI_contains_nocase?: InputMaybe<Scalars['String']['input']>
  projectURI_ends_with?: InputMaybe<Scalars['String']['input']>
  projectURI_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  projectURI_gt?: InputMaybe<Scalars['String']['input']>
  projectURI_gte?: InputMaybe<Scalars['String']['input']>
  projectURI_in?: InputMaybe<Array<Scalars['String']['input']>>
  projectURI_lt?: InputMaybe<Scalars['String']['input']>
  projectURI_lte?: InputMaybe<Scalars['String']['input']>
  projectURI_not?: InputMaybe<Scalars['String']['input']>
  projectURI_not_contains?: InputMaybe<Scalars['String']['input']>
  projectURI_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  projectURI_not_ends_with?: InputMaybe<Scalars['String']['input']>
  projectURI_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  projectURI_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  projectURI_not_starts_with?: InputMaybe<Scalars['String']['input']>
  projectURI_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  projectURI_starts_with?: InputMaybe<Scalars['String']['input']>
  projectURI_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposalCount?: InputMaybe<Scalars['Int']['input']>
  proposalCount_gt?: InputMaybe<Scalars['Int']['input']>
  proposalCount_gte?: InputMaybe<Scalars['Int']['input']>
  proposalCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  proposalCount_lt?: InputMaybe<Scalars['Int']['input']>
  proposalCount_lte?: InputMaybe<Scalars['Int']['input']>
  proposalCount_not?: InputMaybe<Scalars['Int']['input']>
  proposalCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  proposals_?: InputMaybe<Proposal_Filter>
  symbol?: InputMaybe<Scalars['String']['input']>
  symbol_contains?: InputMaybe<Scalars['String']['input']>
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_gt?: InputMaybe<Scalars['String']['input']>
  symbol_gte?: InputMaybe<Scalars['String']['input']>
  symbol_in?: InputMaybe<Array<Scalars['String']['input']>>
  symbol_lt?: InputMaybe<Scalars['String']['input']>
  symbol_lte?: InputMaybe<Scalars['String']['input']>
  symbol_not?: InputMaybe<Scalars['String']['input']>
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenAddress?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_gt?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_gte?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenAddress_lt?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_lte?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_not?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokensCount?: InputMaybe<Scalars['Int']['input']>
  tokensCount_gt?: InputMaybe<Scalars['Int']['input']>
  tokensCount_gte?: InputMaybe<Scalars['Int']['input']>
  tokensCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  tokensCount_lt?: InputMaybe<Scalars['Int']['input']>
  tokensCount_lte?: InputMaybe<Scalars['Int']['input']>
  tokensCount_not?: InputMaybe<Scalars['Int']['input']>
  tokensCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  tokens_?: InputMaybe<Token_Filter>
  totalAuctionSales?: InputMaybe<Scalars['BigInt']['input']>
  totalAuctionSales_gt?: InputMaybe<Scalars['BigInt']['input']>
  totalAuctionSales_gte?: InputMaybe<Scalars['BigInt']['input']>
  totalAuctionSales_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  totalAuctionSales_lt?: InputMaybe<Scalars['BigInt']['input']>
  totalAuctionSales_lte?: InputMaybe<Scalars['BigInt']['input']>
  totalAuctionSales_not?: InputMaybe<Scalars['BigInt']['input']>
  totalAuctionSales_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  totalSupply?: InputMaybe<Scalars['Int']['input']>
  totalSupply_gt?: InputMaybe<Scalars['Int']['input']>
  totalSupply_gte?: InputMaybe<Scalars['Int']['input']>
  totalSupply_in?: InputMaybe<Array<Scalars['Int']['input']>>
  totalSupply_lt?: InputMaybe<Scalars['Int']['input']>
  totalSupply_lte?: InputMaybe<Scalars['Int']['input']>
  totalSupply_not?: InputMaybe<Scalars['Int']['input']>
  totalSupply_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  treasuryAddress?: InputMaybe<Scalars['Bytes']['input']>
  treasuryAddress_contains?: InputMaybe<Scalars['Bytes']['input']>
  treasuryAddress_gt?: InputMaybe<Scalars['Bytes']['input']>
  treasuryAddress_gte?: InputMaybe<Scalars['Bytes']['input']>
  treasuryAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  treasuryAddress_lt?: InputMaybe<Scalars['Bytes']['input']>
  treasuryAddress_lte?: InputMaybe<Scalars['Bytes']['input']>
  treasuryAddress_not?: InputMaybe<Scalars['Bytes']['input']>
  treasuryAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  treasuryAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  voterCount?: InputMaybe<Scalars['Int']['input']>
  voterCount_gt?: InputMaybe<Scalars['Int']['input']>
  voterCount_gte?: InputMaybe<Scalars['Int']['input']>
  voterCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  voterCount_lt?: InputMaybe<Scalars['Int']['input']>
  voterCount_lte?: InputMaybe<Scalars['Int']['input']>
  voterCount_not?: InputMaybe<Scalars['Int']['input']>
  voterCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  voters_?: InputMaybe<DaoVoter_Filter>
  zoraCoins_?: InputMaybe<ZoraCoin_Filter>
  zoraDrops_?: InputMaybe<ZoraDrop_Filter>
}

export enum Dao_OrderBy {
  AuctionAddress = 'auctionAddress',
  AuctionConfig = 'auctionConfig',
  AuctionConfigDuration = 'auctionConfig__duration',
  AuctionConfigId = 'auctionConfig__id',
  AuctionConfigMinimumBidIncrement = 'auctionConfig__minimumBidIncrement',
  AuctionConfigReservePrice = 'auctionConfig__reservePrice',
  AuctionConfigTimeBuffer = 'auctionConfig__timeBuffer',
  Auctions = 'auctions',
  CandidateCount = 'candidateCount',
  Candidates = 'candidates',
  ClankerTokens = 'clankerTokens',
  ContractImage = 'contractImage',
  CurrentAuction = 'currentAuction',
  CurrentAuctionBidCount = 'currentAuction__bidCount',
  CurrentAuctionEndTime = 'currentAuction__endTime',
  CurrentAuctionExtended = 'currentAuction__extended',
  CurrentAuctionFirstBidTime = 'currentAuction__firstBidTime',
  CurrentAuctionId = 'currentAuction__id',
  CurrentAuctionSettled = 'currentAuction__settled',
  CurrentAuctionStartTime = 'currentAuction__startTime',
  DaoMultisigUpdates = 'daoMultisigUpdates',
  Description = 'description',
  FeedEvents = 'feedEvents',
  GovernorAddress = 'governorAddress',
  Id = 'id',
  Links = 'links',
  Metadata = 'metadata',
  MetadataAddress = 'metadataAddress',
  MetadataProperties = 'metadataProperties',
  Name = 'name',
  OwnerCount = 'ownerCount',
  Owners = 'owners',
  PinnedAssets = 'pinnedAssets',
  ProjectUri = 'projectURI',
  ProposalCount = 'proposalCount',
  Proposals = 'proposals',
  Symbol = 'symbol',
  TokenAddress = 'tokenAddress',
  Tokens = 'tokens',
  TokensCount = 'tokensCount',
  TotalAuctionSales = 'totalAuctionSales',
  TotalSupply = 'totalSupply',
  TreasuryAddress = 'treasuryAddress',
  VoterCount = 'voterCount',
  Voters = 'voters',
  ZoraCoins = 'zoraCoins',
  ZoraDrops = 'zoraDrops',
}

export type DaoMultisigUpdate = {
  __typename?: 'DaoMultisigUpdate'
  creator: Scalars['Bytes']['output']
  dao: Dao
  daoMultisig: Scalars['Bytes']['output']
  deleted: Scalars['Boolean']['output']
  id: Scalars['ID']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
}

export type DaoMultisigUpdate_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<DaoMultisigUpdate_Filter>>>
  creator?: InputMaybe<Scalars['Bytes']['input']>
  creator_contains?: InputMaybe<Scalars['Bytes']['input']>
  creator_gt?: InputMaybe<Scalars['Bytes']['input']>
  creator_gte?: InputMaybe<Scalars['Bytes']['input']>
  creator_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  creator_lt?: InputMaybe<Scalars['Bytes']['input']>
  creator_lte?: InputMaybe<Scalars['Bytes']['input']>
  creator_not?: InputMaybe<Scalars['Bytes']['input']>
  creator_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  creator_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  daoMultisig?: InputMaybe<Scalars['Bytes']['input']>
  daoMultisig_contains?: InputMaybe<Scalars['Bytes']['input']>
  daoMultisig_gt?: InputMaybe<Scalars['Bytes']['input']>
  daoMultisig_gte?: InputMaybe<Scalars['Bytes']['input']>
  daoMultisig_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  daoMultisig_lt?: InputMaybe<Scalars['Bytes']['input']>
  daoMultisig_lte?: InputMaybe<Scalars['Bytes']['input']>
  daoMultisig_not?: InputMaybe<Scalars['Bytes']['input']>
  daoMultisig_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  daoMultisig_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  deleted?: InputMaybe<Scalars['Boolean']['input']>
  deleted_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  deleted_not?: InputMaybe<Scalars['Boolean']['input']>
  deleted_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<DaoMultisigUpdate_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
}

export enum DaoMultisigUpdate_OrderBy {
  Creator = 'creator',
  Dao = 'dao',
  DaoMultisig = 'daoMultisig',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Deleted = 'deleted',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
}

export type FeedEvent = {
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export enum FeedEventType {
  AuctionBidPlaced = 'AUCTION_BID_PLACED',
  AuctionCreated = 'AUCTION_CREATED',
  AuctionSettled = 'AUCTION_SETTLED',
  CandidateCommentCreated = 'CANDIDATE_COMMENT_CREATED',
  CandidateSponsorSignatureCreated = 'CANDIDATE_SPONSOR_SIGNATURE_CREATED',
  CandidateSubmittedAsProposal = 'CANDIDATE_SUBMITTED_AS_PROPOSAL',
  CandidateVersionCreated = 'CANDIDATE_VERSION_CREATED',
  ClankerTokenCreated = 'CLANKER_TOKEN_CREATED',
  ClankerTokenLinked = 'CLANKER_TOKEN_LINKED',
  ClankerTokenUnlinked = 'CLANKER_TOKEN_UNLINKED',
  ProposalCreated = 'PROPOSAL_CREATED',
  ProposalEdited = 'PROPOSAL_EDITED',
  ProposalExecuted = 'PROPOSAL_EXECUTED',
  ProposalUpdated = 'PROPOSAL_UPDATED',
  ProposalVoted = 'PROPOSAL_VOTED',
  ZoraCoinCreated = 'ZORA_COIN_CREATED',
  ZoraDropCreated = 'ZORA_DROP_CREATED',
}

export type FeedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<FeedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<FeedEvent_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum FeedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export type MetadataItem = {
  __typename?: 'MetadataItem'
  id: Scalars['ID']['output']
  index: Scalars['Int']['output']
  isNewProperty: Scalars['Boolean']['output']
  name: Scalars['String']['output']
  propertyId: Scalars['BigInt']['output']
  propertyInfo: MetadataProperty
}

export type MetadataItem_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<MetadataItem_Filter>>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  index?: InputMaybe<Scalars['Int']['input']>
  index_gt?: InputMaybe<Scalars['Int']['input']>
  index_gte?: InputMaybe<Scalars['Int']['input']>
  index_in?: InputMaybe<Array<Scalars['Int']['input']>>
  index_lt?: InputMaybe<Scalars['Int']['input']>
  index_lte?: InputMaybe<Scalars['Int']['input']>
  index_not?: InputMaybe<Scalars['Int']['input']>
  index_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  isNewProperty?: InputMaybe<Scalars['Boolean']['input']>
  isNewProperty_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  isNewProperty_not?: InputMaybe<Scalars['Boolean']['input']>
  isNewProperty_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  name?: InputMaybe<Scalars['String']['input']>
  name_contains?: InputMaybe<Scalars['String']['input']>
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>
  name_ends_with?: InputMaybe<Scalars['String']['input']>
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_gt?: InputMaybe<Scalars['String']['input']>
  name_gte?: InputMaybe<Scalars['String']['input']>
  name_in?: InputMaybe<Array<Scalars['String']['input']>>
  name_lt?: InputMaybe<Scalars['String']['input']>
  name_lte?: InputMaybe<Scalars['String']['input']>
  name_not?: InputMaybe<Scalars['String']['input']>
  name_not_contains?: InputMaybe<Scalars['String']['input']>
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_starts_with?: InputMaybe<Scalars['String']['input']>
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  or?: InputMaybe<Array<InputMaybe<MetadataItem_Filter>>>
  propertyId?: InputMaybe<Scalars['BigInt']['input']>
  propertyId_gt?: InputMaybe<Scalars['BigInt']['input']>
  propertyId_gte?: InputMaybe<Scalars['BigInt']['input']>
  propertyId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  propertyId_lt?: InputMaybe<Scalars['BigInt']['input']>
  propertyId_lte?: InputMaybe<Scalars['BigInt']['input']>
  propertyId_not?: InputMaybe<Scalars['BigInt']['input']>
  propertyId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  propertyInfo?: InputMaybe<Scalars['String']['input']>
  propertyInfo_?: InputMaybe<MetadataProperty_Filter>
  propertyInfo_contains?: InputMaybe<Scalars['String']['input']>
  propertyInfo_contains_nocase?: InputMaybe<Scalars['String']['input']>
  propertyInfo_ends_with?: InputMaybe<Scalars['String']['input']>
  propertyInfo_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  propertyInfo_gt?: InputMaybe<Scalars['String']['input']>
  propertyInfo_gte?: InputMaybe<Scalars['String']['input']>
  propertyInfo_in?: InputMaybe<Array<Scalars['String']['input']>>
  propertyInfo_lt?: InputMaybe<Scalars['String']['input']>
  propertyInfo_lte?: InputMaybe<Scalars['String']['input']>
  propertyInfo_not?: InputMaybe<Scalars['String']['input']>
  propertyInfo_not_contains?: InputMaybe<Scalars['String']['input']>
  propertyInfo_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  propertyInfo_not_ends_with?: InputMaybe<Scalars['String']['input']>
  propertyInfo_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  propertyInfo_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  propertyInfo_not_starts_with?: InputMaybe<Scalars['String']['input']>
  propertyInfo_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  propertyInfo_starts_with?: InputMaybe<Scalars['String']['input']>
  propertyInfo_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
}

export enum MetadataItem_OrderBy {
  Id = 'id',
  Index = 'index',
  IsNewProperty = 'isNewProperty',
  Name = 'name',
  PropertyId = 'propertyId',
  PropertyInfo = 'propertyInfo',
  PropertyInfoCreatedAt = 'propertyInfo__createdAt',
  PropertyInfoDeleted = 'propertyInfo__deleted',
  PropertyInfoId = 'propertyInfo__id',
  PropertyInfoIpfsBaseUri = 'propertyInfo__ipfsBaseUri',
  PropertyInfoIpfsExtension = 'propertyInfo__ipfsExtension',
}

export type MetadataProperty = {
  __typename?: 'MetadataProperty'
  createdAt: Scalars['BigInt']['output']
  dao: Dao
  deleted: Scalars['Boolean']['output']
  id: Scalars['ID']['output']
  ipfsBaseUri: Scalars['String']['output']
  ipfsExtension: Scalars['String']['output']
  items: Array<MetadataItem>
  names: Array<Scalars['String']['output']>
}

export type MetadataPropertyItemsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<MetadataItem_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<MetadataItem_Filter>
}

export type MetadataProperty_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<MetadataProperty_Filter>>>
  createdAt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  deleted?: InputMaybe<Scalars['Boolean']['input']>
  deleted_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  deleted_not?: InputMaybe<Scalars['Boolean']['input']>
  deleted_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  ipfsBaseUri?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_contains?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_contains_nocase?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_ends_with?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_gt?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_gte?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_in?: InputMaybe<Array<Scalars['String']['input']>>
  ipfsBaseUri_lt?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_lte?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_not?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_not_contains?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_not_ends_with?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  ipfsBaseUri_not_starts_with?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_starts_with?: InputMaybe<Scalars['String']['input']>
  ipfsBaseUri_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  ipfsExtension?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_contains?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_contains_nocase?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_ends_with?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_gt?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_gte?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_in?: InputMaybe<Array<Scalars['String']['input']>>
  ipfsExtension_lt?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_lte?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_not?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_not_contains?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_not_ends_with?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  ipfsExtension_not_starts_with?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_starts_with?: InputMaybe<Scalars['String']['input']>
  ipfsExtension_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  items_?: InputMaybe<MetadataItem_Filter>
  names?: InputMaybe<Array<Scalars['String']['input']>>
  names_contains?: InputMaybe<Array<Scalars['String']['input']>>
  names_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>
  names_not?: InputMaybe<Array<Scalars['String']['input']>>
  names_not_contains?: InputMaybe<Array<Scalars['String']['input']>>
  names_not_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>
  or?: InputMaybe<Array<InputMaybe<MetadataProperty_Filter>>>
}

export enum MetadataProperty_OrderBy {
  CreatedAt = 'createdAt',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Deleted = 'deleted',
  Id = 'id',
  IpfsBaseUri = 'ipfsBaseUri',
  IpfsExtension = 'ipfsExtension',
  Items = 'items',
  Names = 'names',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type PaymentOption = {
  __typename?: 'PaymentOption'
  endHopIndex: Scalars['Int']['output']
  id: Scalars['ID']['output']
  isDirectSwap: Scalars['Boolean']['output']
  route: SwapRoute
  startHopIndex: Scalars['Int']['output']
  tokenAddress: Scalars['Bytes']['output']
  tokenName: Scalars['String']['output']
  tokenSymbol: Scalars['String']['output']
  tokenType: CoinType
}

export type PaymentOption_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<PaymentOption_Filter>>>
  endHopIndex?: InputMaybe<Scalars['Int']['input']>
  endHopIndex_gt?: InputMaybe<Scalars['Int']['input']>
  endHopIndex_gte?: InputMaybe<Scalars['Int']['input']>
  endHopIndex_in?: InputMaybe<Array<Scalars['Int']['input']>>
  endHopIndex_lt?: InputMaybe<Scalars['Int']['input']>
  endHopIndex_lte?: InputMaybe<Scalars['Int']['input']>
  endHopIndex_not?: InputMaybe<Scalars['Int']['input']>
  endHopIndex_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  isDirectSwap?: InputMaybe<Scalars['Boolean']['input']>
  isDirectSwap_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  isDirectSwap_not?: InputMaybe<Scalars['Boolean']['input']>
  isDirectSwap_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  or?: InputMaybe<Array<InputMaybe<PaymentOption_Filter>>>
  route?: InputMaybe<Scalars['String']['input']>
  route_?: InputMaybe<SwapRoute_Filter>
  route_contains?: InputMaybe<Scalars['String']['input']>
  route_contains_nocase?: InputMaybe<Scalars['String']['input']>
  route_ends_with?: InputMaybe<Scalars['String']['input']>
  route_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  route_gt?: InputMaybe<Scalars['String']['input']>
  route_gte?: InputMaybe<Scalars['String']['input']>
  route_in?: InputMaybe<Array<Scalars['String']['input']>>
  route_lt?: InputMaybe<Scalars['String']['input']>
  route_lte?: InputMaybe<Scalars['String']['input']>
  route_not?: InputMaybe<Scalars['String']['input']>
  route_not_contains?: InputMaybe<Scalars['String']['input']>
  route_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  route_not_ends_with?: InputMaybe<Scalars['String']['input']>
  route_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  route_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  route_not_starts_with?: InputMaybe<Scalars['String']['input']>
  route_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  route_starts_with?: InputMaybe<Scalars['String']['input']>
  route_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  startHopIndex?: InputMaybe<Scalars['Int']['input']>
  startHopIndex_gt?: InputMaybe<Scalars['Int']['input']>
  startHopIndex_gte?: InputMaybe<Scalars['Int']['input']>
  startHopIndex_in?: InputMaybe<Array<Scalars['Int']['input']>>
  startHopIndex_lt?: InputMaybe<Scalars['Int']['input']>
  startHopIndex_lte?: InputMaybe<Scalars['Int']['input']>
  startHopIndex_not?: InputMaybe<Scalars['Int']['input']>
  startHopIndex_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  tokenAddress?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_gt?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_gte?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenAddress_lt?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_lte?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_not?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenName?: InputMaybe<Scalars['String']['input']>
  tokenName_contains?: InputMaybe<Scalars['String']['input']>
  tokenName_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenName_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenName_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenName_gt?: InputMaybe<Scalars['String']['input']>
  tokenName_gte?: InputMaybe<Scalars['String']['input']>
  tokenName_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenName_lt?: InputMaybe<Scalars['String']['input']>
  tokenName_lte?: InputMaybe<Scalars['String']['input']>
  tokenName_not?: InputMaybe<Scalars['String']['input']>
  tokenName_not_contains?: InputMaybe<Scalars['String']['input']>
  tokenName_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenName_not_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenName_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenName_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenName_not_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenName_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenName_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenName_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenSymbol?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_contains?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_gt?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_gte?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenSymbol_lt?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_lte?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not_contains?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not_ends_with?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  tokenSymbol_not_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_starts_with?: InputMaybe<Scalars['String']['input']>
  tokenSymbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tokenType?: InputMaybe<CoinType>
  tokenType_in?: InputMaybe<Array<CoinType>>
  tokenType_not?: InputMaybe<CoinType>
  tokenType_not_in?: InputMaybe<Array<CoinType>>
}

export enum PaymentOption_OrderBy {
  EndHopIndex = 'endHopIndex',
  Id = 'id',
  IsDirectSwap = 'isDirectSwap',
  Route = 'route',
  RouteCoinAddress = 'route__coinAddress',
  RouteCreatedAt = 'route__createdAt',
  RouteId = 'route__id',
  RouteUpdatedAt = 'route__updatedAt',
  StartHopIndex = 'startHopIndex',
  TokenAddress = 'tokenAddress',
  TokenName = 'tokenName',
  TokenSymbol = 'tokenSymbol',
  TokenType = 'tokenType',
}

export type Proposal = ProposalMetadataEntity & {
  __typename?: 'Proposal'
  abstainVotes: Scalars['Int']['output']
  againstVotes: Scalars['Int']['output']
  calldatas?: Maybe<Scalars['String']['output']>
  cancelTransactionHash?: Maybe<Scalars['Bytes']['output']>
  canceled: Scalars['Boolean']['output']
  canceledAt?: Maybe<Scalars['BigInt']['output']>
  candidateVersion?: Maybe<ProposalCandidateVersion>
  dao: Dao
  description?: Maybe<Scalars['String']['output']>
  descriptionHash: Scalars['Bytes']['output']
  discussionUrl?: Maybe<Scalars['String']['output']>
  executableFrom?: Maybe<Scalars['BigInt']['output']>
  executed: Scalars['Boolean']['output']
  executedAt?: Maybe<Scalars['BigInt']['output']>
  executionTransactionHash?: Maybe<Scalars['Bytes']['output']>
  expiresAt?: Maybe<Scalars['BigInt']['output']>
  forVotes: Scalars['Int']['output']
  id: Scalars['ID']['output']
  isSigned: Scalars['Boolean']['output']
  metadata?: Maybe<Scalars['String']['output']>
  proposalId: Scalars['Bytes']['output']
  proposalNumber: Scalars['Int']['output']
  proposalThreshold: Scalars['BigInt']['output']
  proposer: Scalars['Bytes']['output']
  queued: Scalars['Boolean']['output']
  queuedAt?: Maybe<Scalars['BigInt']['output']>
  queuedTransactionHash?: Maybe<Scalars['Bytes']['output']>
  quorumVotes: Scalars['BigInt']['output']
  replacedBy?: Maybe<Proposal>
  replaces?: Maybe<Proposal>
  representedAddress?: Maybe<Scalars['String']['output']>
  signers: Array<ProposalSigner>
  snapshotBlockNumber: Scalars['BigInt']['output']
  targets: Array<Scalars['Bytes']['output']>
  timeCreated: Scalars['BigInt']['output']
  title?: Maybe<Scalars['String']['output']>
  transactionHash: Scalars['Bytes']['output']
  updateCount: Scalars['Int']['output']
  updateMessage?: Maybe<Scalars['String']['output']>
  updatePeriodEnd?: Maybe<Scalars['BigInt']['output']>
  updates: Array<ProposalUpdate>
  values: Array<Scalars['BigInt']['output']>
  vetoTransactionHash?: Maybe<Scalars['Bytes']['output']>
  vetoed: Scalars['Boolean']['output']
  vetoedAt?: Maybe<Scalars['BigInt']['output']>
  voteCount: Scalars['Int']['output']
  voteEnd: Scalars['BigInt']['output']
  voteStart: Scalars['BigInt']['output']
  votes: Array<ProposalVote>
}

export type ProposalSignersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalSigner_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ProposalSigner_Filter>
}

export type ProposalUpdatesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalUpdate_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ProposalUpdate_Filter>
}

export type ProposalVotesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalVote_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ProposalVote_Filter>
}

export type ProposalCandidateGroup = {
  __typename?: 'ProposalCandidateGroup'
  candidateNumber: Scalars['Int']['output']
  commentCount: Scalars['BigInt']['output']
  comments: Array<CandidateComment>
  createdAt: Scalars['BigInt']['output']
  currentAbstainCount: Scalars['BigInt']['output']
  currentAgainstCount: Scalars['BigInt']['output']
  currentForCount: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  latestVersionNumber: Scalars['BigInt']['output']
  leadingVersion?: Maybe<ProposalCandidateVersion>
  proposer: Scalars['Bytes']['output']
  salt: Scalars['Bytes']['output']
  versionCount: Scalars['BigInt']['output']
  versions: Array<ProposalCandidateVersion>
}

export type ProposalCandidateGroupCommentsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<CandidateComment_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<CandidateComment_Filter>
}

export type ProposalCandidateGroupVersionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalCandidateVersion_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ProposalCandidateVersion_Filter>
}

export type ProposalCandidateGroup_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<ProposalCandidateGroup_Filter>>>
  candidateNumber?: InputMaybe<Scalars['Int']['input']>
  candidateNumber_gt?: InputMaybe<Scalars['Int']['input']>
  candidateNumber_gte?: InputMaybe<Scalars['Int']['input']>
  candidateNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>
  candidateNumber_lt?: InputMaybe<Scalars['Int']['input']>
  candidateNumber_lte?: InputMaybe<Scalars['Int']['input']>
  candidateNumber_not?: InputMaybe<Scalars['Int']['input']>
  candidateNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  commentCount?: InputMaybe<Scalars['BigInt']['input']>
  commentCount_gt?: InputMaybe<Scalars['BigInt']['input']>
  commentCount_gte?: InputMaybe<Scalars['BigInt']['input']>
  commentCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  commentCount_lt?: InputMaybe<Scalars['BigInt']['input']>
  commentCount_lte?: InputMaybe<Scalars['BigInt']['input']>
  commentCount_not?: InputMaybe<Scalars['BigInt']['input']>
  commentCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  comments_?: InputMaybe<CandidateComment_Filter>
  createdAt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  currentAbstainCount?: InputMaybe<Scalars['BigInt']['input']>
  currentAbstainCount_gt?: InputMaybe<Scalars['BigInt']['input']>
  currentAbstainCount_gte?: InputMaybe<Scalars['BigInt']['input']>
  currentAbstainCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  currentAbstainCount_lt?: InputMaybe<Scalars['BigInt']['input']>
  currentAbstainCount_lte?: InputMaybe<Scalars['BigInt']['input']>
  currentAbstainCount_not?: InputMaybe<Scalars['BigInt']['input']>
  currentAbstainCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  currentAgainstCount?: InputMaybe<Scalars['BigInt']['input']>
  currentAgainstCount_gt?: InputMaybe<Scalars['BigInt']['input']>
  currentAgainstCount_gte?: InputMaybe<Scalars['BigInt']['input']>
  currentAgainstCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  currentAgainstCount_lt?: InputMaybe<Scalars['BigInt']['input']>
  currentAgainstCount_lte?: InputMaybe<Scalars['BigInt']['input']>
  currentAgainstCount_not?: InputMaybe<Scalars['BigInt']['input']>
  currentAgainstCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  currentForCount?: InputMaybe<Scalars['BigInt']['input']>
  currentForCount_gt?: InputMaybe<Scalars['BigInt']['input']>
  currentForCount_gte?: InputMaybe<Scalars['BigInt']['input']>
  currentForCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  currentForCount_lt?: InputMaybe<Scalars['BigInt']['input']>
  currentForCount_lte?: InputMaybe<Scalars['BigInt']['input']>
  currentForCount_not?: InputMaybe<Scalars['BigInt']['input']>
  currentForCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  latestVersionNumber?: InputMaybe<Scalars['BigInt']['input']>
  latestVersionNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  latestVersionNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  latestVersionNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  latestVersionNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  latestVersionNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  latestVersionNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  latestVersionNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  leadingVersion?: InputMaybe<Scalars['String']['input']>
  leadingVersion_?: InputMaybe<ProposalCandidateVersion_Filter>
  leadingVersion_contains?: InputMaybe<Scalars['String']['input']>
  leadingVersion_contains_nocase?: InputMaybe<Scalars['String']['input']>
  leadingVersion_ends_with?: InputMaybe<Scalars['String']['input']>
  leadingVersion_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  leadingVersion_gt?: InputMaybe<Scalars['String']['input']>
  leadingVersion_gte?: InputMaybe<Scalars['String']['input']>
  leadingVersion_in?: InputMaybe<Array<Scalars['String']['input']>>
  leadingVersion_lt?: InputMaybe<Scalars['String']['input']>
  leadingVersion_lte?: InputMaybe<Scalars['String']['input']>
  leadingVersion_not?: InputMaybe<Scalars['String']['input']>
  leadingVersion_not_contains?: InputMaybe<Scalars['String']['input']>
  leadingVersion_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  leadingVersion_not_ends_with?: InputMaybe<Scalars['String']['input']>
  leadingVersion_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  leadingVersion_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  leadingVersion_not_starts_with?: InputMaybe<Scalars['String']['input']>
  leadingVersion_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  leadingVersion_starts_with?: InputMaybe<Scalars['String']['input']>
  leadingVersion_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  or?: InputMaybe<Array<InputMaybe<ProposalCandidateGroup_Filter>>>
  proposer?: InputMaybe<Scalars['Bytes']['input']>
  proposer_contains?: InputMaybe<Scalars['Bytes']['input']>
  proposer_gt?: InputMaybe<Scalars['Bytes']['input']>
  proposer_gte?: InputMaybe<Scalars['Bytes']['input']>
  proposer_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  proposer_lt?: InputMaybe<Scalars['Bytes']['input']>
  proposer_lte?: InputMaybe<Scalars['Bytes']['input']>
  proposer_not?: InputMaybe<Scalars['Bytes']['input']>
  proposer_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  proposer_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  salt?: InputMaybe<Scalars['Bytes']['input']>
  salt_contains?: InputMaybe<Scalars['Bytes']['input']>
  salt_gt?: InputMaybe<Scalars['Bytes']['input']>
  salt_gte?: InputMaybe<Scalars['Bytes']['input']>
  salt_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  salt_lt?: InputMaybe<Scalars['Bytes']['input']>
  salt_lte?: InputMaybe<Scalars['Bytes']['input']>
  salt_not?: InputMaybe<Scalars['Bytes']['input']>
  salt_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  salt_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  versionCount?: InputMaybe<Scalars['BigInt']['input']>
  versionCount_gt?: InputMaybe<Scalars['BigInt']['input']>
  versionCount_gte?: InputMaybe<Scalars['BigInt']['input']>
  versionCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  versionCount_lt?: InputMaybe<Scalars['BigInt']['input']>
  versionCount_lte?: InputMaybe<Scalars['BigInt']['input']>
  versionCount_not?: InputMaybe<Scalars['BigInt']['input']>
  versionCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  versions_?: InputMaybe<ProposalCandidateVersion_Filter>
}

export enum ProposalCandidateGroup_OrderBy {
  CandidateNumber = 'candidateNumber',
  CommentCount = 'commentCount',
  Comments = 'comments',
  CreatedAt = 'createdAt',
  CurrentAbstainCount = 'currentAbstainCount',
  CurrentAgainstCount = 'currentAgainstCount',
  CurrentForCount = 'currentForCount',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  LatestVersionNumber = 'latestVersionNumber',
  LeadingVersion = 'leadingVersion',
  LeadingVersionAttestationUid = 'leadingVersion__attestationUID',
  LeadingVersionAttester = 'leadingVersion__attester',
  LeadingVersionCandidateId = 'leadingVersion__candidateId',
  LeadingVersionComputedProposalId = 'leadingVersion__computedProposalId',
  LeadingVersionCreatedAt = 'leadingVersion__createdAt',
  LeadingVersionDescription = 'leadingVersion__description',
  LeadingVersionDiscussionUrl = 'leadingVersion__discussionUrl',
  LeadingVersionId = 'leadingVersion__id',
  LeadingVersionMetadata = 'leadingVersion__metadata',
  LeadingVersionRepresentedAddress = 'leadingVersion__representedAddress',
  LeadingVersionRevoked = 'leadingVersion__revoked',
  LeadingVersionSalt = 'leadingVersion__salt',
  LeadingVersionSignatureCount = 'leadingVersion__signatureCount',
  LeadingVersionTitle = 'leadingVersion__title',
  LeadingVersionTotalVoteWeight = 'leadingVersion__totalVoteWeight',
  LeadingVersionVersionNumber = 'leadingVersion__versionNumber',
  Proposer = 'proposer',
  Salt = 'salt',
  VersionCount = 'versionCount',
  Versions = 'versions',
}

export type ProposalCandidateVersion = ProposalMetadataEntity & {
  __typename?: 'ProposalCandidateVersion'
  attestationUID: Scalars['Bytes']['output']
  attester: Scalars['Bytes']['output']
  calldatas: Array<Scalars['Bytes']['output']>
  candidateId: Scalars['Bytes']['output']
  computedProposalId: Scalars['Bytes']['output']
  createdAt: Scalars['BigInt']['output']
  description?: Maybe<Scalars['String']['output']>
  discussionUrl?: Maybe<Scalars['String']['output']>
  group: ProposalCandidateGroup
  id: Scalars['ID']['output']
  metadata?: Maybe<Scalars['String']['output']>
  proposal?: Maybe<Proposal>
  representedAddress?: Maybe<Scalars['String']['output']>
  revoked: Scalars['Boolean']['output']
  salt: Scalars['Bytes']['output']
  signatureCount: Scalars['BigInt']['output']
  signatures: Array<CandidateSponsorSignature>
  targets: Array<Scalars['Bytes']['output']>
  title?: Maybe<Scalars['String']['output']>
  totalVoteWeight: Scalars['BigInt']['output']
  values: Array<Scalars['BigInt']['output']>
  versionNumber: Scalars['BigInt']['output']
}

export type ProposalCandidateVersionSignaturesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<CandidateSponsorSignature_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<CandidateSponsorSignature_Filter>
}

export type ProposalCandidateVersion_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<ProposalCandidateVersion_Filter>>>
  attestationUID?: InputMaybe<Scalars['Bytes']['input']>
  attestationUID_contains?: InputMaybe<Scalars['Bytes']['input']>
  attestationUID_gt?: InputMaybe<Scalars['Bytes']['input']>
  attestationUID_gte?: InputMaybe<Scalars['Bytes']['input']>
  attestationUID_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  attestationUID_lt?: InputMaybe<Scalars['Bytes']['input']>
  attestationUID_lte?: InputMaybe<Scalars['Bytes']['input']>
  attestationUID_not?: InputMaybe<Scalars['Bytes']['input']>
  attestationUID_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  attestationUID_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  attester?: InputMaybe<Scalars['Bytes']['input']>
  attester_contains?: InputMaybe<Scalars['Bytes']['input']>
  attester_gt?: InputMaybe<Scalars['Bytes']['input']>
  attester_gte?: InputMaybe<Scalars['Bytes']['input']>
  attester_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  attester_lt?: InputMaybe<Scalars['Bytes']['input']>
  attester_lte?: InputMaybe<Scalars['Bytes']['input']>
  attester_not?: InputMaybe<Scalars['Bytes']['input']>
  attester_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  attester_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  calldatas?: InputMaybe<Array<Scalars['Bytes']['input']>>
  calldatas_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>
  calldatas_not?: InputMaybe<Array<Scalars['Bytes']['input']>>
  calldatas_not_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>
  candidateId?: InputMaybe<Scalars['Bytes']['input']>
  candidateId_contains?: InputMaybe<Scalars['Bytes']['input']>
  candidateId_gt?: InputMaybe<Scalars['Bytes']['input']>
  candidateId_gte?: InputMaybe<Scalars['Bytes']['input']>
  candidateId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  candidateId_lt?: InputMaybe<Scalars['Bytes']['input']>
  candidateId_lte?: InputMaybe<Scalars['Bytes']['input']>
  candidateId_not?: InputMaybe<Scalars['Bytes']['input']>
  candidateId_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  candidateId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  computedProposalId?: InputMaybe<Scalars['Bytes']['input']>
  computedProposalId_contains?: InputMaybe<Scalars['Bytes']['input']>
  computedProposalId_gt?: InputMaybe<Scalars['Bytes']['input']>
  computedProposalId_gte?: InputMaybe<Scalars['Bytes']['input']>
  computedProposalId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  computedProposalId_lt?: InputMaybe<Scalars['Bytes']['input']>
  computedProposalId_lte?: InputMaybe<Scalars['Bytes']['input']>
  computedProposalId_not?: InputMaybe<Scalars['Bytes']['input']>
  computedProposalId_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  computedProposalId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  createdAt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  description?: InputMaybe<Scalars['String']['input']>
  description_contains?: InputMaybe<Scalars['String']['input']>
  description_contains_nocase?: InputMaybe<Scalars['String']['input']>
  description_ends_with?: InputMaybe<Scalars['String']['input']>
  description_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_gt?: InputMaybe<Scalars['String']['input']>
  description_gte?: InputMaybe<Scalars['String']['input']>
  description_in?: InputMaybe<Array<Scalars['String']['input']>>
  description_lt?: InputMaybe<Scalars['String']['input']>
  description_lte?: InputMaybe<Scalars['String']['input']>
  description_not?: InputMaybe<Scalars['String']['input']>
  description_not_contains?: InputMaybe<Scalars['String']['input']>
  description_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  description_not_ends_with?: InputMaybe<Scalars['String']['input']>
  description_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  description_not_starts_with?: InputMaybe<Scalars['String']['input']>
  description_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_starts_with?: InputMaybe<Scalars['String']['input']>
  description_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl?: InputMaybe<Scalars['String']['input']>
  discussionUrl_contains?: InputMaybe<Scalars['String']['input']>
  discussionUrl_contains_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_ends_with?: InputMaybe<Scalars['String']['input']>
  discussionUrl_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_gt?: InputMaybe<Scalars['String']['input']>
  discussionUrl_gte?: InputMaybe<Scalars['String']['input']>
  discussionUrl_in?: InputMaybe<Array<Scalars['String']['input']>>
  discussionUrl_lt?: InputMaybe<Scalars['String']['input']>
  discussionUrl_lte?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_contains?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_ends_with?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  discussionUrl_not_starts_with?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_starts_with?: InputMaybe<Scalars['String']['input']>
  discussionUrl_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  group?: InputMaybe<Scalars['String']['input']>
  group_?: InputMaybe<ProposalCandidateGroup_Filter>
  group_contains?: InputMaybe<Scalars['String']['input']>
  group_contains_nocase?: InputMaybe<Scalars['String']['input']>
  group_ends_with?: InputMaybe<Scalars['String']['input']>
  group_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_gt?: InputMaybe<Scalars['String']['input']>
  group_gte?: InputMaybe<Scalars['String']['input']>
  group_in?: InputMaybe<Array<Scalars['String']['input']>>
  group_lt?: InputMaybe<Scalars['String']['input']>
  group_lte?: InputMaybe<Scalars['String']['input']>
  group_not?: InputMaybe<Scalars['String']['input']>
  group_not_contains?: InputMaybe<Scalars['String']['input']>
  group_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  group_not_ends_with?: InputMaybe<Scalars['String']['input']>
  group_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  group_not_starts_with?: InputMaybe<Scalars['String']['input']>
  group_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  group_starts_with?: InputMaybe<Scalars['String']['input']>
  group_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  metadata?: InputMaybe<Scalars['String']['input']>
  metadata_contains?: InputMaybe<Scalars['String']['input']>
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_ends_with?: InputMaybe<Scalars['String']['input']>
  metadata_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_gt?: InputMaybe<Scalars['String']['input']>
  metadata_gte?: InputMaybe<Scalars['String']['input']>
  metadata_in?: InputMaybe<Array<Scalars['String']['input']>>
  metadata_lt?: InputMaybe<Scalars['String']['input']>
  metadata_lte?: InputMaybe<Scalars['String']['input']>
  metadata_not?: InputMaybe<Scalars['String']['input']>
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_not_ends_with?: InputMaybe<Scalars['String']['input']>
  metadata_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  metadata_not_starts_with?: InputMaybe<Scalars['String']['input']>
  metadata_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_starts_with?: InputMaybe<Scalars['String']['input']>
  metadata_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  or?: InputMaybe<Array<InputMaybe<ProposalCandidateVersion_Filter>>>
  proposal?: InputMaybe<Scalars['String']['input']>
  proposal_?: InputMaybe<Proposal_Filter>
  proposal_contains?: InputMaybe<Scalars['String']['input']>
  proposal_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_gt?: InputMaybe<Scalars['String']['input']>
  proposal_gte?: InputMaybe<Scalars['String']['input']>
  proposal_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_lt?: InputMaybe<Scalars['String']['input']>
  proposal_lte?: InputMaybe<Scalars['String']['input']>
  proposal_not?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_not_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress?: InputMaybe<Scalars['String']['input']>
  representedAddress_contains?: InputMaybe<Scalars['String']['input']>
  representedAddress_contains_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_ends_with?: InputMaybe<Scalars['String']['input']>
  representedAddress_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_gt?: InputMaybe<Scalars['String']['input']>
  representedAddress_gte?: InputMaybe<Scalars['String']['input']>
  representedAddress_in?: InputMaybe<Array<Scalars['String']['input']>>
  representedAddress_lt?: InputMaybe<Scalars['String']['input']>
  representedAddress_lte?: InputMaybe<Scalars['String']['input']>
  representedAddress_not?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_contains?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_ends_with?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  representedAddress_not_starts_with?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_starts_with?: InputMaybe<Scalars['String']['input']>
  representedAddress_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  revoked?: InputMaybe<Scalars['Boolean']['input']>
  revoked_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  revoked_not?: InputMaybe<Scalars['Boolean']['input']>
  revoked_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  salt?: InputMaybe<Scalars['Bytes']['input']>
  salt_contains?: InputMaybe<Scalars['Bytes']['input']>
  salt_gt?: InputMaybe<Scalars['Bytes']['input']>
  salt_gte?: InputMaybe<Scalars['Bytes']['input']>
  salt_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  salt_lt?: InputMaybe<Scalars['Bytes']['input']>
  salt_lte?: InputMaybe<Scalars['Bytes']['input']>
  salt_not?: InputMaybe<Scalars['Bytes']['input']>
  salt_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  salt_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  signatureCount?: InputMaybe<Scalars['BigInt']['input']>
  signatureCount_gt?: InputMaybe<Scalars['BigInt']['input']>
  signatureCount_gte?: InputMaybe<Scalars['BigInt']['input']>
  signatureCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  signatureCount_lt?: InputMaybe<Scalars['BigInt']['input']>
  signatureCount_lte?: InputMaybe<Scalars['BigInt']['input']>
  signatureCount_not?: InputMaybe<Scalars['BigInt']['input']>
  signatureCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  signatures_?: InputMaybe<CandidateSponsorSignature_Filter>
  targets?: InputMaybe<Array<Scalars['Bytes']['input']>>
  targets_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>
  targets_not?: InputMaybe<Array<Scalars['Bytes']['input']>>
  targets_not_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>
  title?: InputMaybe<Scalars['String']['input']>
  title_contains?: InputMaybe<Scalars['String']['input']>
  title_contains_nocase?: InputMaybe<Scalars['String']['input']>
  title_ends_with?: InputMaybe<Scalars['String']['input']>
  title_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  title_gt?: InputMaybe<Scalars['String']['input']>
  title_gte?: InputMaybe<Scalars['String']['input']>
  title_in?: InputMaybe<Array<Scalars['String']['input']>>
  title_lt?: InputMaybe<Scalars['String']['input']>
  title_lte?: InputMaybe<Scalars['String']['input']>
  title_not?: InputMaybe<Scalars['String']['input']>
  title_not_contains?: InputMaybe<Scalars['String']['input']>
  title_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  title_not_ends_with?: InputMaybe<Scalars['String']['input']>
  title_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  title_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  title_not_starts_with?: InputMaybe<Scalars['String']['input']>
  title_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  title_starts_with?: InputMaybe<Scalars['String']['input']>
  title_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  totalVoteWeight?: InputMaybe<Scalars['BigInt']['input']>
  totalVoteWeight_gt?: InputMaybe<Scalars['BigInt']['input']>
  totalVoteWeight_gte?: InputMaybe<Scalars['BigInt']['input']>
  totalVoteWeight_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  totalVoteWeight_lt?: InputMaybe<Scalars['BigInt']['input']>
  totalVoteWeight_lte?: InputMaybe<Scalars['BigInt']['input']>
  totalVoteWeight_not?: InputMaybe<Scalars['BigInt']['input']>
  totalVoteWeight_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  values?: InputMaybe<Array<Scalars['BigInt']['input']>>
  values_contains?: InputMaybe<Array<Scalars['BigInt']['input']>>
  values_not?: InputMaybe<Array<Scalars['BigInt']['input']>>
  values_not_contains?: InputMaybe<Array<Scalars['BigInt']['input']>>
  versionNumber?: InputMaybe<Scalars['BigInt']['input']>
  versionNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  versionNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  versionNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  versionNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  versionNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  versionNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  versionNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
}

export enum ProposalCandidateVersion_OrderBy {
  AttestationUid = 'attestationUID',
  Attester = 'attester',
  Calldatas = 'calldatas',
  CandidateId = 'candidateId',
  ComputedProposalId = 'computedProposalId',
  CreatedAt = 'createdAt',
  Description = 'description',
  DiscussionUrl = 'discussionUrl',
  Group = 'group',
  GroupCandidateNumber = 'group__candidateNumber',
  GroupCommentCount = 'group__commentCount',
  GroupCreatedAt = 'group__createdAt',
  GroupCurrentAbstainCount = 'group__currentAbstainCount',
  GroupCurrentAgainstCount = 'group__currentAgainstCount',
  GroupCurrentForCount = 'group__currentForCount',
  GroupId = 'group__id',
  GroupLatestVersionNumber = 'group__latestVersionNumber',
  GroupProposer = 'group__proposer',
  GroupSalt = 'group__salt',
  GroupVersionCount = 'group__versionCount',
  Id = 'id',
  Metadata = 'metadata',
  Proposal = 'proposal',
  ProposalAbstainVotes = 'proposal__abstainVotes',
  ProposalAgainstVotes = 'proposal__againstVotes',
  ProposalCalldatas = 'proposal__calldatas',
  ProposalCancelTransactionHash = 'proposal__cancelTransactionHash',
  ProposalCanceled = 'proposal__canceled',
  ProposalCanceledAt = 'proposal__canceledAt',
  ProposalDescription = 'proposal__description',
  ProposalDescriptionHash = 'proposal__descriptionHash',
  ProposalDiscussionUrl = 'proposal__discussionUrl',
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalIsSigned = 'proposal__isSigned',
  ProposalMetadata = 'proposal__metadata',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalRepresentedAddress = 'proposal__representedAddress',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
  ProposalUpdateCount = 'proposal__updateCount',
  ProposalUpdateMessage = 'proposal__updateMessage',
  ProposalUpdatePeriodEnd = 'proposal__updatePeriodEnd',
  ProposalVetoTransactionHash = 'proposal__vetoTransactionHash',
  ProposalVetoed = 'proposal__vetoed',
  ProposalVetoedAt = 'proposal__vetoedAt',
  ProposalVoteCount = 'proposal__voteCount',
  ProposalVoteEnd = 'proposal__voteEnd',
  ProposalVoteStart = 'proposal__voteStart',
  RepresentedAddress = 'representedAddress',
  Revoked = 'revoked',
  Salt = 'salt',
  SignatureCount = 'signatureCount',
  Signatures = 'signatures',
  Targets = 'targets',
  Title = 'title',
  TotalVoteWeight = 'totalVoteWeight',
  Values = 'values',
  VersionNumber = 'versionNumber',
}

export type ProposalCreatedEvent = FeedEvent & {
  __typename?: 'ProposalCreatedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  proposal: Proposal
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export type ProposalCreatedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<ProposalCreatedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ProposalCreatedEvent_Filter>>>
  proposal?: InputMaybe<Scalars['String']['input']>
  proposal_?: InputMaybe<Proposal_Filter>
  proposal_contains?: InputMaybe<Scalars['String']['input']>
  proposal_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_gt?: InputMaybe<Scalars['String']['input']>
  proposal_gte?: InputMaybe<Scalars['String']['input']>
  proposal_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_lt?: InputMaybe<Scalars['String']['input']>
  proposal_lte?: InputMaybe<Scalars['String']['input']>
  proposal_not?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_not_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum ProposalCreatedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Proposal = 'proposal',
  ProposalAbstainVotes = 'proposal__abstainVotes',
  ProposalAgainstVotes = 'proposal__againstVotes',
  ProposalCalldatas = 'proposal__calldatas',
  ProposalCancelTransactionHash = 'proposal__cancelTransactionHash',
  ProposalCanceled = 'proposal__canceled',
  ProposalCanceledAt = 'proposal__canceledAt',
  ProposalDescription = 'proposal__description',
  ProposalDescriptionHash = 'proposal__descriptionHash',
  ProposalDiscussionUrl = 'proposal__discussionUrl',
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalIsSigned = 'proposal__isSigned',
  ProposalMetadata = 'proposal__metadata',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalRepresentedAddress = 'proposal__representedAddress',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
  ProposalUpdateCount = 'proposal__updateCount',
  ProposalUpdateMessage = 'proposal__updateMessage',
  ProposalUpdatePeriodEnd = 'proposal__updatePeriodEnd',
  ProposalVetoTransactionHash = 'proposal__vetoTransactionHash',
  ProposalVetoed = 'proposal__vetoed',
  ProposalVetoedAt = 'proposal__vetoedAt',
  ProposalVoteCount = 'proposal__voteCount',
  ProposalVoteEnd = 'proposal__voteEnd',
  ProposalVoteStart = 'proposal__voteStart',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export type ProposalEditedEvent = FeedEvent & {
  __typename?: 'ProposalEditedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  previousProposal: Proposal
  proposal: Proposal
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export type ProposalEditedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<ProposalEditedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ProposalEditedEvent_Filter>>>
  previousProposal?: InputMaybe<Scalars['String']['input']>
  previousProposal_?: InputMaybe<Proposal_Filter>
  previousProposal_contains?: InputMaybe<Scalars['String']['input']>
  previousProposal_contains_nocase?: InputMaybe<Scalars['String']['input']>
  previousProposal_ends_with?: InputMaybe<Scalars['String']['input']>
  previousProposal_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  previousProposal_gt?: InputMaybe<Scalars['String']['input']>
  previousProposal_gte?: InputMaybe<Scalars['String']['input']>
  previousProposal_in?: InputMaybe<Array<Scalars['String']['input']>>
  previousProposal_lt?: InputMaybe<Scalars['String']['input']>
  previousProposal_lte?: InputMaybe<Scalars['String']['input']>
  previousProposal_not?: InputMaybe<Scalars['String']['input']>
  previousProposal_not_contains?: InputMaybe<Scalars['String']['input']>
  previousProposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  previousProposal_not_ends_with?: InputMaybe<Scalars['String']['input']>
  previousProposal_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  previousProposal_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  previousProposal_not_starts_with?: InputMaybe<Scalars['String']['input']>
  previousProposal_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  previousProposal_starts_with?: InputMaybe<Scalars['String']['input']>
  previousProposal_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal?: InputMaybe<Scalars['String']['input']>
  proposal_?: InputMaybe<Proposal_Filter>
  proposal_contains?: InputMaybe<Scalars['String']['input']>
  proposal_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_gt?: InputMaybe<Scalars['String']['input']>
  proposal_gte?: InputMaybe<Scalars['String']['input']>
  proposal_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_lt?: InputMaybe<Scalars['String']['input']>
  proposal_lte?: InputMaybe<Scalars['String']['input']>
  proposal_not?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_not_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum ProposalEditedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  PreviousProposal = 'previousProposal',
  PreviousProposalAbstainVotes = 'previousProposal__abstainVotes',
  PreviousProposalAgainstVotes = 'previousProposal__againstVotes',
  PreviousProposalCalldatas = 'previousProposal__calldatas',
  PreviousProposalCancelTransactionHash = 'previousProposal__cancelTransactionHash',
  PreviousProposalCanceled = 'previousProposal__canceled',
  PreviousProposalCanceledAt = 'previousProposal__canceledAt',
  PreviousProposalDescription = 'previousProposal__description',
  PreviousProposalDescriptionHash = 'previousProposal__descriptionHash',
  PreviousProposalDiscussionUrl = 'previousProposal__discussionUrl',
  PreviousProposalExecutableFrom = 'previousProposal__executableFrom',
  PreviousProposalExecuted = 'previousProposal__executed',
  PreviousProposalExecutedAt = 'previousProposal__executedAt',
  PreviousProposalExecutionTransactionHash = 'previousProposal__executionTransactionHash',
  PreviousProposalExpiresAt = 'previousProposal__expiresAt',
  PreviousProposalForVotes = 'previousProposal__forVotes',
  PreviousProposalId = 'previousProposal__id',
  PreviousProposalIsSigned = 'previousProposal__isSigned',
  PreviousProposalMetadata = 'previousProposal__metadata',
  PreviousProposalProposalId = 'previousProposal__proposalId',
  PreviousProposalProposalNumber = 'previousProposal__proposalNumber',
  PreviousProposalProposalThreshold = 'previousProposal__proposalThreshold',
  PreviousProposalProposer = 'previousProposal__proposer',
  PreviousProposalQueued = 'previousProposal__queued',
  PreviousProposalQueuedAt = 'previousProposal__queuedAt',
  PreviousProposalQueuedTransactionHash = 'previousProposal__queuedTransactionHash',
  PreviousProposalQuorumVotes = 'previousProposal__quorumVotes',
  PreviousProposalRepresentedAddress = 'previousProposal__representedAddress',
  PreviousProposalSnapshotBlockNumber = 'previousProposal__snapshotBlockNumber',
  PreviousProposalTimeCreated = 'previousProposal__timeCreated',
  PreviousProposalTitle = 'previousProposal__title',
  PreviousProposalTransactionHash = 'previousProposal__transactionHash',
  PreviousProposalUpdateCount = 'previousProposal__updateCount',
  PreviousProposalUpdateMessage = 'previousProposal__updateMessage',
  PreviousProposalUpdatePeriodEnd = 'previousProposal__updatePeriodEnd',
  PreviousProposalVetoTransactionHash = 'previousProposal__vetoTransactionHash',
  PreviousProposalVetoed = 'previousProposal__vetoed',
  PreviousProposalVetoedAt = 'previousProposal__vetoedAt',
  PreviousProposalVoteCount = 'previousProposal__voteCount',
  PreviousProposalVoteEnd = 'previousProposal__voteEnd',
  PreviousProposalVoteStart = 'previousProposal__voteStart',
  Proposal = 'proposal',
  ProposalAbstainVotes = 'proposal__abstainVotes',
  ProposalAgainstVotes = 'proposal__againstVotes',
  ProposalCalldatas = 'proposal__calldatas',
  ProposalCancelTransactionHash = 'proposal__cancelTransactionHash',
  ProposalCanceled = 'proposal__canceled',
  ProposalCanceledAt = 'proposal__canceledAt',
  ProposalDescription = 'proposal__description',
  ProposalDescriptionHash = 'proposal__descriptionHash',
  ProposalDiscussionUrl = 'proposal__discussionUrl',
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalIsSigned = 'proposal__isSigned',
  ProposalMetadata = 'proposal__metadata',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalRepresentedAddress = 'proposal__representedAddress',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
  ProposalUpdateCount = 'proposal__updateCount',
  ProposalUpdateMessage = 'proposal__updateMessage',
  ProposalUpdatePeriodEnd = 'proposal__updatePeriodEnd',
  ProposalVetoTransactionHash = 'proposal__vetoTransactionHash',
  ProposalVetoed = 'proposal__vetoed',
  ProposalVetoedAt = 'proposal__vetoedAt',
  ProposalVoteCount = 'proposal__voteCount',
  ProposalVoteEnd = 'proposal__voteEnd',
  ProposalVoteStart = 'proposal__voteStart',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export type ProposalExecutedEvent = FeedEvent & {
  __typename?: 'ProposalExecutedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  proposal: Proposal
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
}

export type ProposalExecutedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<ProposalExecutedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ProposalExecutedEvent_Filter>>>
  proposal?: InputMaybe<Scalars['String']['input']>
  proposal_?: InputMaybe<Proposal_Filter>
  proposal_contains?: InputMaybe<Scalars['String']['input']>
  proposal_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_gt?: InputMaybe<Scalars['String']['input']>
  proposal_gte?: InputMaybe<Scalars['String']['input']>
  proposal_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_lt?: InputMaybe<Scalars['String']['input']>
  proposal_lte?: InputMaybe<Scalars['String']['input']>
  proposal_not?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_not_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
}

export enum ProposalExecutedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Proposal = 'proposal',
  ProposalAbstainVotes = 'proposal__abstainVotes',
  ProposalAgainstVotes = 'proposal__againstVotes',
  ProposalCalldatas = 'proposal__calldatas',
  ProposalCancelTransactionHash = 'proposal__cancelTransactionHash',
  ProposalCanceled = 'proposal__canceled',
  ProposalCanceledAt = 'proposal__canceledAt',
  ProposalDescription = 'proposal__description',
  ProposalDescriptionHash = 'proposal__descriptionHash',
  ProposalDiscussionUrl = 'proposal__discussionUrl',
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalIsSigned = 'proposal__isSigned',
  ProposalMetadata = 'proposal__metadata',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalRepresentedAddress = 'proposal__representedAddress',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
  ProposalUpdateCount = 'proposal__updateCount',
  ProposalUpdateMessage = 'proposal__updateMessage',
  ProposalUpdatePeriodEnd = 'proposal__updatePeriodEnd',
  ProposalVetoTransactionHash = 'proposal__vetoTransactionHash',
  ProposalVetoed = 'proposal__vetoed',
  ProposalVetoedAt = 'proposal__vetoedAt',
  ProposalVoteCount = 'proposal__voteCount',
  ProposalVoteEnd = 'proposal__voteEnd',
  ProposalVoteStart = 'proposal__voteStart',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

export type ProposalMetadataEntity = {
  description?: Maybe<Scalars['String']['output']>
  discussionUrl?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  metadata?: Maybe<Scalars['String']['output']>
  representedAddress?: Maybe<Scalars['String']['output']>
  title?: Maybe<Scalars['String']['output']>
}

export type ProposalMetadataEntity_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<ProposalMetadataEntity_Filter>>>
  description?: InputMaybe<Scalars['String']['input']>
  description_contains?: InputMaybe<Scalars['String']['input']>
  description_contains_nocase?: InputMaybe<Scalars['String']['input']>
  description_ends_with?: InputMaybe<Scalars['String']['input']>
  description_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_gt?: InputMaybe<Scalars['String']['input']>
  description_gte?: InputMaybe<Scalars['String']['input']>
  description_in?: InputMaybe<Array<Scalars['String']['input']>>
  description_lt?: InputMaybe<Scalars['String']['input']>
  description_lte?: InputMaybe<Scalars['String']['input']>
  description_not?: InputMaybe<Scalars['String']['input']>
  description_not_contains?: InputMaybe<Scalars['String']['input']>
  description_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  description_not_ends_with?: InputMaybe<Scalars['String']['input']>
  description_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  description_not_starts_with?: InputMaybe<Scalars['String']['input']>
  description_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_starts_with?: InputMaybe<Scalars['String']['input']>
  description_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl?: InputMaybe<Scalars['String']['input']>
  discussionUrl_contains?: InputMaybe<Scalars['String']['input']>
  discussionUrl_contains_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_ends_with?: InputMaybe<Scalars['String']['input']>
  discussionUrl_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_gt?: InputMaybe<Scalars['String']['input']>
  discussionUrl_gte?: InputMaybe<Scalars['String']['input']>
  discussionUrl_in?: InputMaybe<Array<Scalars['String']['input']>>
  discussionUrl_lt?: InputMaybe<Scalars['String']['input']>
  discussionUrl_lte?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_contains?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_ends_with?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  discussionUrl_not_starts_with?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_starts_with?: InputMaybe<Scalars['String']['input']>
  discussionUrl_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  metadata?: InputMaybe<Scalars['String']['input']>
  metadata_contains?: InputMaybe<Scalars['String']['input']>
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_ends_with?: InputMaybe<Scalars['String']['input']>
  metadata_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_gt?: InputMaybe<Scalars['String']['input']>
  metadata_gte?: InputMaybe<Scalars['String']['input']>
  metadata_in?: InputMaybe<Array<Scalars['String']['input']>>
  metadata_lt?: InputMaybe<Scalars['String']['input']>
  metadata_lte?: InputMaybe<Scalars['String']['input']>
  metadata_not?: InputMaybe<Scalars['String']['input']>
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_not_ends_with?: InputMaybe<Scalars['String']['input']>
  metadata_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  metadata_not_starts_with?: InputMaybe<Scalars['String']['input']>
  metadata_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_starts_with?: InputMaybe<Scalars['String']['input']>
  metadata_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  or?: InputMaybe<Array<InputMaybe<ProposalMetadataEntity_Filter>>>
  representedAddress?: InputMaybe<Scalars['String']['input']>
  representedAddress_contains?: InputMaybe<Scalars['String']['input']>
  representedAddress_contains_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_ends_with?: InputMaybe<Scalars['String']['input']>
  representedAddress_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_gt?: InputMaybe<Scalars['String']['input']>
  representedAddress_gte?: InputMaybe<Scalars['String']['input']>
  representedAddress_in?: InputMaybe<Array<Scalars['String']['input']>>
  representedAddress_lt?: InputMaybe<Scalars['String']['input']>
  representedAddress_lte?: InputMaybe<Scalars['String']['input']>
  representedAddress_not?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_contains?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_ends_with?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  representedAddress_not_starts_with?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_starts_with?: InputMaybe<Scalars['String']['input']>
  representedAddress_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  title?: InputMaybe<Scalars['String']['input']>
  title_contains?: InputMaybe<Scalars['String']['input']>
  title_contains_nocase?: InputMaybe<Scalars['String']['input']>
  title_ends_with?: InputMaybe<Scalars['String']['input']>
  title_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  title_gt?: InputMaybe<Scalars['String']['input']>
  title_gte?: InputMaybe<Scalars['String']['input']>
  title_in?: InputMaybe<Array<Scalars['String']['input']>>
  title_lt?: InputMaybe<Scalars['String']['input']>
  title_lte?: InputMaybe<Scalars['String']['input']>
  title_not?: InputMaybe<Scalars['String']['input']>
  title_not_contains?: InputMaybe<Scalars['String']['input']>
  title_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  title_not_ends_with?: InputMaybe<Scalars['String']['input']>
  title_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  title_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  title_not_starts_with?: InputMaybe<Scalars['String']['input']>
  title_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  title_starts_with?: InputMaybe<Scalars['String']['input']>
  title_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
}

export enum ProposalMetadataEntity_OrderBy {
  Description = 'description',
  DiscussionUrl = 'discussionUrl',
  Id = 'id',
  Metadata = 'metadata',
  RepresentedAddress = 'representedAddress',
  Title = 'title',
}

export type ProposalSigner = {
  __typename?: 'ProposalSigner'
  id: Scalars['ID']['output']
  proposal: Proposal
  signer: Scalars['Bytes']['output']
  timestamp: Scalars['BigInt']['output']
  voteWeight: Scalars['BigInt']['output']
}

export type ProposalSigner_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<ProposalSigner_Filter>>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ProposalSigner_Filter>>>
  proposal?: InputMaybe<Scalars['String']['input']>
  proposal_?: InputMaybe<Proposal_Filter>
  proposal_contains?: InputMaybe<Scalars['String']['input']>
  proposal_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_gt?: InputMaybe<Scalars['String']['input']>
  proposal_gte?: InputMaybe<Scalars['String']['input']>
  proposal_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_lt?: InputMaybe<Scalars['String']['input']>
  proposal_lte?: InputMaybe<Scalars['String']['input']>
  proposal_not?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_not_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  signer?: InputMaybe<Scalars['Bytes']['input']>
  signer_contains?: InputMaybe<Scalars['Bytes']['input']>
  signer_gt?: InputMaybe<Scalars['Bytes']['input']>
  signer_gte?: InputMaybe<Scalars['Bytes']['input']>
  signer_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  signer_lt?: InputMaybe<Scalars['Bytes']['input']>
  signer_lte?: InputMaybe<Scalars['Bytes']['input']>
  signer_not?: InputMaybe<Scalars['Bytes']['input']>
  signer_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  signer_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  voteWeight?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_gt?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_gte?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  voteWeight_lt?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_lte?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_not?: InputMaybe<Scalars['BigInt']['input']>
  voteWeight_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
}

export enum ProposalSigner_OrderBy {
  Id = 'id',
  Proposal = 'proposal',
  ProposalAbstainVotes = 'proposal__abstainVotes',
  ProposalAgainstVotes = 'proposal__againstVotes',
  ProposalCalldatas = 'proposal__calldatas',
  ProposalCancelTransactionHash = 'proposal__cancelTransactionHash',
  ProposalCanceled = 'proposal__canceled',
  ProposalCanceledAt = 'proposal__canceledAt',
  ProposalDescription = 'proposal__description',
  ProposalDescriptionHash = 'proposal__descriptionHash',
  ProposalDiscussionUrl = 'proposal__discussionUrl',
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalIsSigned = 'proposal__isSigned',
  ProposalMetadata = 'proposal__metadata',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalRepresentedAddress = 'proposal__representedAddress',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
  ProposalUpdateCount = 'proposal__updateCount',
  ProposalUpdateMessage = 'proposal__updateMessage',
  ProposalUpdatePeriodEnd = 'proposal__updatePeriodEnd',
  ProposalVetoTransactionHash = 'proposal__vetoTransactionHash',
  ProposalVetoed = 'proposal__vetoed',
  ProposalVetoedAt = 'proposal__vetoedAt',
  ProposalVoteCount = 'proposal__voteCount',
  ProposalVoteEnd = 'proposal__voteEnd',
  ProposalVoteStart = 'proposal__voteStart',
  Signer = 'signer',
  Timestamp = 'timestamp',
  VoteWeight = 'voteWeight',
}

export type ProposalUpdate = {
  __typename?: 'ProposalUpdate'
  creator: Scalars['Bytes']['output']
  deleted: Scalars['Boolean']['output']
  id: Scalars['ID']['output']
  message: Scalars['String']['output']
  messageType: Scalars['Int']['output']
  originalMessageId: Scalars['Bytes']['output']
  proposal: Proposal
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
}

export type ProposalUpdate_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<ProposalUpdate_Filter>>>
  creator?: InputMaybe<Scalars['Bytes']['input']>
  creator_contains?: InputMaybe<Scalars['Bytes']['input']>
  creator_gt?: InputMaybe<Scalars['Bytes']['input']>
  creator_gte?: InputMaybe<Scalars['Bytes']['input']>
  creator_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  creator_lt?: InputMaybe<Scalars['Bytes']['input']>
  creator_lte?: InputMaybe<Scalars['Bytes']['input']>
  creator_not?: InputMaybe<Scalars['Bytes']['input']>
  creator_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  creator_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  deleted?: InputMaybe<Scalars['Boolean']['input']>
  deleted_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  deleted_not?: InputMaybe<Scalars['Boolean']['input']>
  deleted_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  message?: InputMaybe<Scalars['String']['input']>
  messageType?: InputMaybe<Scalars['Int']['input']>
  messageType_gt?: InputMaybe<Scalars['Int']['input']>
  messageType_gte?: InputMaybe<Scalars['Int']['input']>
  messageType_in?: InputMaybe<Array<Scalars['Int']['input']>>
  messageType_lt?: InputMaybe<Scalars['Int']['input']>
  messageType_lte?: InputMaybe<Scalars['Int']['input']>
  messageType_not?: InputMaybe<Scalars['Int']['input']>
  messageType_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  message_contains?: InputMaybe<Scalars['String']['input']>
  message_contains_nocase?: InputMaybe<Scalars['String']['input']>
  message_ends_with?: InputMaybe<Scalars['String']['input']>
  message_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  message_gt?: InputMaybe<Scalars['String']['input']>
  message_gte?: InputMaybe<Scalars['String']['input']>
  message_in?: InputMaybe<Array<Scalars['String']['input']>>
  message_lt?: InputMaybe<Scalars['String']['input']>
  message_lte?: InputMaybe<Scalars['String']['input']>
  message_not?: InputMaybe<Scalars['String']['input']>
  message_not_contains?: InputMaybe<Scalars['String']['input']>
  message_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  message_not_ends_with?: InputMaybe<Scalars['String']['input']>
  message_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  message_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  message_not_starts_with?: InputMaybe<Scalars['String']['input']>
  message_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  message_starts_with?: InputMaybe<Scalars['String']['input']>
  message_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  or?: InputMaybe<Array<InputMaybe<ProposalUpdate_Filter>>>
  originalMessageId?: InputMaybe<Scalars['Bytes']['input']>
  originalMessageId_contains?: InputMaybe<Scalars['Bytes']['input']>
  originalMessageId_gt?: InputMaybe<Scalars['Bytes']['input']>
  originalMessageId_gte?: InputMaybe<Scalars['Bytes']['input']>
  originalMessageId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  originalMessageId_lt?: InputMaybe<Scalars['Bytes']['input']>
  originalMessageId_lte?: InputMaybe<Scalars['Bytes']['input']>
  originalMessageId_not?: InputMaybe<Scalars['Bytes']['input']>
  originalMessageId_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  originalMessageId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  proposal?: InputMaybe<Scalars['String']['input']>
  proposal_?: InputMaybe<Proposal_Filter>
  proposal_contains?: InputMaybe<Scalars['String']['input']>
  proposal_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_gt?: InputMaybe<Scalars['String']['input']>
  proposal_gte?: InputMaybe<Scalars['String']['input']>
  proposal_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_lt?: InputMaybe<Scalars['String']['input']>
  proposal_lte?: InputMaybe<Scalars['String']['input']>
  proposal_not?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_not_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
}

export enum ProposalUpdate_OrderBy {
  Creator = 'creator',
  Deleted = 'deleted',
  Id = 'id',
  Message = 'message',
  MessageType = 'messageType',
  OriginalMessageId = 'originalMessageId',
  Proposal = 'proposal',
  ProposalAbstainVotes = 'proposal__abstainVotes',
  ProposalAgainstVotes = 'proposal__againstVotes',
  ProposalCalldatas = 'proposal__calldatas',
  ProposalCancelTransactionHash = 'proposal__cancelTransactionHash',
  ProposalCanceled = 'proposal__canceled',
  ProposalCanceledAt = 'proposal__canceledAt',
  ProposalDescription = 'proposal__description',
  ProposalDescriptionHash = 'proposal__descriptionHash',
  ProposalDiscussionUrl = 'proposal__discussionUrl',
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalIsSigned = 'proposal__isSigned',
  ProposalMetadata = 'proposal__metadata',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalRepresentedAddress = 'proposal__representedAddress',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
  ProposalUpdateCount = 'proposal__updateCount',
  ProposalUpdateMessage = 'proposal__updateMessage',
  ProposalUpdatePeriodEnd = 'proposal__updatePeriodEnd',
  ProposalVetoTransactionHash = 'proposal__vetoTransactionHash',
  ProposalVetoed = 'proposal__vetoed',
  ProposalVetoedAt = 'proposal__vetoedAt',
  ProposalVoteCount = 'proposal__voteCount',
  ProposalVoteEnd = 'proposal__voteEnd',
  ProposalVoteStart = 'proposal__voteStart',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
}

export type ProposalUpdatedEvent = FeedEvent & {
  __typename?: 'ProposalUpdatedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  proposal: Proposal
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
  update: ProposalUpdate
}

export type ProposalUpdatedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<ProposalUpdatedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ProposalUpdatedEvent_Filter>>>
  proposal?: InputMaybe<Scalars['String']['input']>
  proposal_?: InputMaybe<Proposal_Filter>
  proposal_contains?: InputMaybe<Scalars['String']['input']>
  proposal_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_gt?: InputMaybe<Scalars['String']['input']>
  proposal_gte?: InputMaybe<Scalars['String']['input']>
  proposal_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_lt?: InputMaybe<Scalars['String']['input']>
  proposal_lte?: InputMaybe<Scalars['String']['input']>
  proposal_not?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_not_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
  update?: InputMaybe<Scalars['String']['input']>
  update_?: InputMaybe<ProposalUpdate_Filter>
  update_contains?: InputMaybe<Scalars['String']['input']>
  update_contains_nocase?: InputMaybe<Scalars['String']['input']>
  update_ends_with?: InputMaybe<Scalars['String']['input']>
  update_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  update_gt?: InputMaybe<Scalars['String']['input']>
  update_gte?: InputMaybe<Scalars['String']['input']>
  update_in?: InputMaybe<Array<Scalars['String']['input']>>
  update_lt?: InputMaybe<Scalars['String']['input']>
  update_lte?: InputMaybe<Scalars['String']['input']>
  update_not?: InputMaybe<Scalars['String']['input']>
  update_not_contains?: InputMaybe<Scalars['String']['input']>
  update_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  update_not_ends_with?: InputMaybe<Scalars['String']['input']>
  update_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  update_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  update_not_starts_with?: InputMaybe<Scalars['String']['input']>
  update_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  update_starts_with?: InputMaybe<Scalars['String']['input']>
  update_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
}

export enum ProposalUpdatedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Proposal = 'proposal',
  ProposalAbstainVotes = 'proposal__abstainVotes',
  ProposalAgainstVotes = 'proposal__againstVotes',
  ProposalCalldatas = 'proposal__calldatas',
  ProposalCancelTransactionHash = 'proposal__cancelTransactionHash',
  ProposalCanceled = 'proposal__canceled',
  ProposalCanceledAt = 'proposal__canceledAt',
  ProposalDescription = 'proposal__description',
  ProposalDescriptionHash = 'proposal__descriptionHash',
  ProposalDiscussionUrl = 'proposal__discussionUrl',
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalIsSigned = 'proposal__isSigned',
  ProposalMetadata = 'proposal__metadata',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalRepresentedAddress = 'proposal__representedAddress',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
  ProposalUpdateCount = 'proposal__updateCount',
  ProposalUpdateMessage = 'proposal__updateMessage',
  ProposalUpdatePeriodEnd = 'proposal__updatePeriodEnd',
  ProposalVetoTransactionHash = 'proposal__vetoTransactionHash',
  ProposalVetoed = 'proposal__vetoed',
  ProposalVetoedAt = 'proposal__vetoedAt',
  ProposalVoteCount = 'proposal__voteCount',
  ProposalVoteEnd = 'proposal__voteEnd',
  ProposalVoteStart = 'proposal__voteStart',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
  Update = 'update',
  UpdateCreator = 'update__creator',
  UpdateDeleted = 'update__deleted',
  UpdateId = 'update__id',
  UpdateMessage = 'update__message',
  UpdateMessageType = 'update__messageType',
  UpdateOriginalMessageId = 'update__originalMessageId',
  UpdateTimestamp = 'update__timestamp',
  UpdateTransactionHash = 'update__transactionHash',
}

export type ProposalVote = {
  __typename?: 'ProposalVote'
  id: Scalars['ID']['output']
  proposal: Proposal
  reason?: Maybe<Scalars['String']['output']>
  support: ProposalVoteSupport
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  voter: Scalars['Bytes']['output']
  weight: Scalars['Int']['output']
}

export enum ProposalVoteSupport {
  Abstain = 'ABSTAIN',
  Against = 'AGAINST',
  For = 'FOR',
}

export type ProposalVote_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<ProposalVote_Filter>>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ProposalVote_Filter>>>
  proposal?: InputMaybe<Scalars['String']['input']>
  proposal_?: InputMaybe<Proposal_Filter>
  proposal_contains?: InputMaybe<Scalars['String']['input']>
  proposal_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_gt?: InputMaybe<Scalars['String']['input']>
  proposal_gte?: InputMaybe<Scalars['String']['input']>
  proposal_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_lt?: InputMaybe<Scalars['String']['input']>
  proposal_lte?: InputMaybe<Scalars['String']['input']>
  proposal_not?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_not_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  reason?: InputMaybe<Scalars['String']['input']>
  reason_contains?: InputMaybe<Scalars['String']['input']>
  reason_contains_nocase?: InputMaybe<Scalars['String']['input']>
  reason_ends_with?: InputMaybe<Scalars['String']['input']>
  reason_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  reason_gt?: InputMaybe<Scalars['String']['input']>
  reason_gte?: InputMaybe<Scalars['String']['input']>
  reason_in?: InputMaybe<Array<Scalars['String']['input']>>
  reason_lt?: InputMaybe<Scalars['String']['input']>
  reason_lte?: InputMaybe<Scalars['String']['input']>
  reason_not?: InputMaybe<Scalars['String']['input']>
  reason_not_contains?: InputMaybe<Scalars['String']['input']>
  reason_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  reason_not_ends_with?: InputMaybe<Scalars['String']['input']>
  reason_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  reason_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  reason_not_starts_with?: InputMaybe<Scalars['String']['input']>
  reason_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  reason_starts_with?: InputMaybe<Scalars['String']['input']>
  reason_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  support?: InputMaybe<ProposalVoteSupport>
  support_in?: InputMaybe<Array<ProposalVoteSupport>>
  support_not?: InputMaybe<ProposalVoteSupport>
  support_not_in?: InputMaybe<Array<ProposalVoteSupport>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  voter?: InputMaybe<Scalars['Bytes']['input']>
  voter_contains?: InputMaybe<Scalars['Bytes']['input']>
  voter_gt?: InputMaybe<Scalars['Bytes']['input']>
  voter_gte?: InputMaybe<Scalars['Bytes']['input']>
  voter_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  voter_lt?: InputMaybe<Scalars['Bytes']['input']>
  voter_lte?: InputMaybe<Scalars['Bytes']['input']>
  voter_not?: InputMaybe<Scalars['Bytes']['input']>
  voter_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  voter_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  weight?: InputMaybe<Scalars['Int']['input']>
  weight_gt?: InputMaybe<Scalars['Int']['input']>
  weight_gte?: InputMaybe<Scalars['Int']['input']>
  weight_in?: InputMaybe<Array<Scalars['Int']['input']>>
  weight_lt?: InputMaybe<Scalars['Int']['input']>
  weight_lte?: InputMaybe<Scalars['Int']['input']>
  weight_not?: InputMaybe<Scalars['Int']['input']>
  weight_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
}

export enum ProposalVote_OrderBy {
  Id = 'id',
  Proposal = 'proposal',
  ProposalAbstainVotes = 'proposal__abstainVotes',
  ProposalAgainstVotes = 'proposal__againstVotes',
  ProposalCalldatas = 'proposal__calldatas',
  ProposalCancelTransactionHash = 'proposal__cancelTransactionHash',
  ProposalCanceled = 'proposal__canceled',
  ProposalCanceledAt = 'proposal__canceledAt',
  ProposalDescription = 'proposal__description',
  ProposalDescriptionHash = 'proposal__descriptionHash',
  ProposalDiscussionUrl = 'proposal__discussionUrl',
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalIsSigned = 'proposal__isSigned',
  ProposalMetadata = 'proposal__metadata',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalRepresentedAddress = 'proposal__representedAddress',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
  ProposalUpdateCount = 'proposal__updateCount',
  ProposalUpdateMessage = 'proposal__updateMessage',
  ProposalUpdatePeriodEnd = 'proposal__updatePeriodEnd',
  ProposalVetoTransactionHash = 'proposal__vetoTransactionHash',
  ProposalVetoed = 'proposal__vetoed',
  ProposalVetoedAt = 'proposal__vetoedAt',
  ProposalVoteCount = 'proposal__voteCount',
  ProposalVoteEnd = 'proposal__voteEnd',
  ProposalVoteStart = 'proposal__voteStart',
  Reason = 'reason',
  Support = 'support',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Voter = 'voter',
  Weight = 'weight',
}

export type ProposalVotedEvent = FeedEvent & {
  __typename?: 'ProposalVotedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  proposal: Proposal
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
  vote: ProposalVote
}

export type ProposalVotedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<ProposalVotedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ProposalVotedEvent_Filter>>>
  proposal?: InputMaybe<Scalars['String']['input']>
  proposal_?: InputMaybe<Proposal_Filter>
  proposal_contains?: InputMaybe<Scalars['String']['input']>
  proposal_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_gt?: InputMaybe<Scalars['String']['input']>
  proposal_gte?: InputMaybe<Scalars['String']['input']>
  proposal_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_lt?: InputMaybe<Scalars['String']['input']>
  proposal_lte?: InputMaybe<Scalars['String']['input']>
  proposal_not?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains?: InputMaybe<Scalars['String']['input']>
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  proposal_not_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with?: InputMaybe<Scalars['String']['input']>
  proposal_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
  vote?: InputMaybe<Scalars['String']['input']>
  vote_?: InputMaybe<ProposalVote_Filter>
  vote_contains?: InputMaybe<Scalars['String']['input']>
  vote_contains_nocase?: InputMaybe<Scalars['String']['input']>
  vote_ends_with?: InputMaybe<Scalars['String']['input']>
  vote_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  vote_gt?: InputMaybe<Scalars['String']['input']>
  vote_gte?: InputMaybe<Scalars['String']['input']>
  vote_in?: InputMaybe<Array<Scalars['String']['input']>>
  vote_lt?: InputMaybe<Scalars['String']['input']>
  vote_lte?: InputMaybe<Scalars['String']['input']>
  vote_not?: InputMaybe<Scalars['String']['input']>
  vote_not_contains?: InputMaybe<Scalars['String']['input']>
  vote_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  vote_not_ends_with?: InputMaybe<Scalars['String']['input']>
  vote_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  vote_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  vote_not_starts_with?: InputMaybe<Scalars['String']['input']>
  vote_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  vote_starts_with?: InputMaybe<Scalars['String']['input']>
  vote_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
}

export enum ProposalVotedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Proposal = 'proposal',
  ProposalAbstainVotes = 'proposal__abstainVotes',
  ProposalAgainstVotes = 'proposal__againstVotes',
  ProposalCalldatas = 'proposal__calldatas',
  ProposalCancelTransactionHash = 'proposal__cancelTransactionHash',
  ProposalCanceled = 'proposal__canceled',
  ProposalCanceledAt = 'proposal__canceledAt',
  ProposalDescription = 'proposal__description',
  ProposalDescriptionHash = 'proposal__descriptionHash',
  ProposalDiscussionUrl = 'proposal__discussionUrl',
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalIsSigned = 'proposal__isSigned',
  ProposalMetadata = 'proposal__metadata',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalRepresentedAddress = 'proposal__representedAddress',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
  ProposalUpdateCount = 'proposal__updateCount',
  ProposalUpdateMessage = 'proposal__updateMessage',
  ProposalUpdatePeriodEnd = 'proposal__updatePeriodEnd',
  ProposalVetoTransactionHash = 'proposal__vetoTransactionHash',
  ProposalVetoed = 'proposal__vetoed',
  ProposalVetoedAt = 'proposal__vetoedAt',
  ProposalVoteCount = 'proposal__voteCount',
  ProposalVoteEnd = 'proposal__voteEnd',
  ProposalVoteStart = 'proposal__voteStart',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
  Vote = 'vote',
  VoteId = 'vote__id',
  VoteReason = 'vote__reason',
  VoteSupport = 'vote__support',
  VoteTimestamp = 'vote__timestamp',
  VoteTransactionHash = 'vote__transactionHash',
  VoteVoter = 'vote__voter',
  VoteWeight = 'vote__weight',
}

export type Proposal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  abstainVotes?: InputMaybe<Scalars['Int']['input']>
  abstainVotes_gt?: InputMaybe<Scalars['Int']['input']>
  abstainVotes_gte?: InputMaybe<Scalars['Int']['input']>
  abstainVotes_in?: InputMaybe<Array<Scalars['Int']['input']>>
  abstainVotes_lt?: InputMaybe<Scalars['Int']['input']>
  abstainVotes_lte?: InputMaybe<Scalars['Int']['input']>
  abstainVotes_not?: InputMaybe<Scalars['Int']['input']>
  abstainVotes_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  againstVotes?: InputMaybe<Scalars['Int']['input']>
  againstVotes_gt?: InputMaybe<Scalars['Int']['input']>
  againstVotes_gte?: InputMaybe<Scalars['Int']['input']>
  againstVotes_in?: InputMaybe<Array<Scalars['Int']['input']>>
  againstVotes_lt?: InputMaybe<Scalars['Int']['input']>
  againstVotes_lte?: InputMaybe<Scalars['Int']['input']>
  againstVotes_not?: InputMaybe<Scalars['Int']['input']>
  againstVotes_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  and?: InputMaybe<Array<InputMaybe<Proposal_Filter>>>
  calldatas?: InputMaybe<Scalars['String']['input']>
  calldatas_contains?: InputMaybe<Scalars['String']['input']>
  calldatas_contains_nocase?: InputMaybe<Scalars['String']['input']>
  calldatas_ends_with?: InputMaybe<Scalars['String']['input']>
  calldatas_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  calldatas_gt?: InputMaybe<Scalars['String']['input']>
  calldatas_gte?: InputMaybe<Scalars['String']['input']>
  calldatas_in?: InputMaybe<Array<Scalars['String']['input']>>
  calldatas_lt?: InputMaybe<Scalars['String']['input']>
  calldatas_lte?: InputMaybe<Scalars['String']['input']>
  calldatas_not?: InputMaybe<Scalars['String']['input']>
  calldatas_not_contains?: InputMaybe<Scalars['String']['input']>
  calldatas_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  calldatas_not_ends_with?: InputMaybe<Scalars['String']['input']>
  calldatas_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  calldatas_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  calldatas_not_starts_with?: InputMaybe<Scalars['String']['input']>
  calldatas_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  calldatas_starts_with?: InputMaybe<Scalars['String']['input']>
  calldatas_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  cancelTransactionHash?: InputMaybe<Scalars['Bytes']['input']>
  cancelTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  cancelTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  cancelTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  cancelTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  cancelTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  cancelTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  cancelTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  cancelTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  cancelTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  canceled?: InputMaybe<Scalars['Boolean']['input']>
  canceledAt?: InputMaybe<Scalars['BigInt']['input']>
  canceledAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  canceledAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  canceledAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  canceledAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  canceledAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  canceledAt_not?: InputMaybe<Scalars['BigInt']['input']>
  canceledAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  canceled_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  canceled_not?: InputMaybe<Scalars['Boolean']['input']>
  canceled_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  candidateVersion?: InputMaybe<Scalars['String']['input']>
  candidateVersion_?: InputMaybe<ProposalCandidateVersion_Filter>
  candidateVersion_contains?: InputMaybe<Scalars['String']['input']>
  candidateVersion_contains_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_ends_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_gt?: InputMaybe<Scalars['String']['input']>
  candidateVersion_gte?: InputMaybe<Scalars['String']['input']>
  candidateVersion_in?: InputMaybe<Array<Scalars['String']['input']>>
  candidateVersion_lt?: InputMaybe<Scalars['String']['input']>
  candidateVersion_lte?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_contains?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_ends_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  candidateVersion_not_starts_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  candidateVersion_starts_with?: InputMaybe<Scalars['String']['input']>
  candidateVersion_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  description?: InputMaybe<Scalars['String']['input']>
  descriptionHash?: InputMaybe<Scalars['Bytes']['input']>
  descriptionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  descriptionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  descriptionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  descriptionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  descriptionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  descriptionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  descriptionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  descriptionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  descriptionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  description_contains?: InputMaybe<Scalars['String']['input']>
  description_contains_nocase?: InputMaybe<Scalars['String']['input']>
  description_ends_with?: InputMaybe<Scalars['String']['input']>
  description_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_gt?: InputMaybe<Scalars['String']['input']>
  description_gte?: InputMaybe<Scalars['String']['input']>
  description_in?: InputMaybe<Array<Scalars['String']['input']>>
  description_lt?: InputMaybe<Scalars['String']['input']>
  description_lte?: InputMaybe<Scalars['String']['input']>
  description_not?: InputMaybe<Scalars['String']['input']>
  description_not_contains?: InputMaybe<Scalars['String']['input']>
  description_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  description_not_ends_with?: InputMaybe<Scalars['String']['input']>
  description_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  description_not_starts_with?: InputMaybe<Scalars['String']['input']>
  description_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_starts_with?: InputMaybe<Scalars['String']['input']>
  description_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl?: InputMaybe<Scalars['String']['input']>
  discussionUrl_contains?: InputMaybe<Scalars['String']['input']>
  discussionUrl_contains_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_ends_with?: InputMaybe<Scalars['String']['input']>
  discussionUrl_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_gt?: InputMaybe<Scalars['String']['input']>
  discussionUrl_gte?: InputMaybe<Scalars['String']['input']>
  discussionUrl_in?: InputMaybe<Array<Scalars['String']['input']>>
  discussionUrl_lt?: InputMaybe<Scalars['String']['input']>
  discussionUrl_lte?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_contains?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_ends_with?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  discussionUrl_not_starts_with?: InputMaybe<Scalars['String']['input']>
  discussionUrl_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  discussionUrl_starts_with?: InputMaybe<Scalars['String']['input']>
  discussionUrl_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  executableFrom?: InputMaybe<Scalars['BigInt']['input']>
  executableFrom_gt?: InputMaybe<Scalars['BigInt']['input']>
  executableFrom_gte?: InputMaybe<Scalars['BigInt']['input']>
  executableFrom_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  executableFrom_lt?: InputMaybe<Scalars['BigInt']['input']>
  executableFrom_lte?: InputMaybe<Scalars['BigInt']['input']>
  executableFrom_not?: InputMaybe<Scalars['BigInt']['input']>
  executableFrom_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  executed?: InputMaybe<Scalars['Boolean']['input']>
  executedAt?: InputMaybe<Scalars['BigInt']['input']>
  executedAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  executedAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  executedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  executedAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  executedAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  executedAt_not?: InputMaybe<Scalars['BigInt']['input']>
  executedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  executed_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  executed_not?: InputMaybe<Scalars['Boolean']['input']>
  executed_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  executionTransactionHash?: InputMaybe<Scalars['Bytes']['input']>
  executionTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  executionTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  executionTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  executionTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  executionTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  executionTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  executionTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  executionTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  executionTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  expiresAt?: InputMaybe<Scalars['BigInt']['input']>
  expiresAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  expiresAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  expiresAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  expiresAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  expiresAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  expiresAt_not?: InputMaybe<Scalars['BigInt']['input']>
  expiresAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  forVotes?: InputMaybe<Scalars['Int']['input']>
  forVotes_gt?: InputMaybe<Scalars['Int']['input']>
  forVotes_gte?: InputMaybe<Scalars['Int']['input']>
  forVotes_in?: InputMaybe<Array<Scalars['Int']['input']>>
  forVotes_lt?: InputMaybe<Scalars['Int']['input']>
  forVotes_lte?: InputMaybe<Scalars['Int']['input']>
  forVotes_not?: InputMaybe<Scalars['Int']['input']>
  forVotes_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  isSigned?: InputMaybe<Scalars['Boolean']['input']>
  isSigned_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  isSigned_not?: InputMaybe<Scalars['Boolean']['input']>
  isSigned_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  metadata?: InputMaybe<Scalars['String']['input']>
  metadata_contains?: InputMaybe<Scalars['String']['input']>
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_ends_with?: InputMaybe<Scalars['String']['input']>
  metadata_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_gt?: InputMaybe<Scalars['String']['input']>
  metadata_gte?: InputMaybe<Scalars['String']['input']>
  metadata_in?: InputMaybe<Array<Scalars['String']['input']>>
  metadata_lt?: InputMaybe<Scalars['String']['input']>
  metadata_lte?: InputMaybe<Scalars['String']['input']>
  metadata_not?: InputMaybe<Scalars['String']['input']>
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_not_ends_with?: InputMaybe<Scalars['String']['input']>
  metadata_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  metadata_not_starts_with?: InputMaybe<Scalars['String']['input']>
  metadata_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  metadata_starts_with?: InputMaybe<Scalars['String']['input']>
  metadata_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  or?: InputMaybe<Array<InputMaybe<Proposal_Filter>>>
  proposalId?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_contains?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_gt?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_gte?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  proposalId_lt?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_lte?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_not?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  proposalId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  proposalNumber?: InputMaybe<Scalars['Int']['input']>
  proposalNumber_gt?: InputMaybe<Scalars['Int']['input']>
  proposalNumber_gte?: InputMaybe<Scalars['Int']['input']>
  proposalNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>
  proposalNumber_lt?: InputMaybe<Scalars['Int']['input']>
  proposalNumber_lte?: InputMaybe<Scalars['Int']['input']>
  proposalNumber_not?: InputMaybe<Scalars['Int']['input']>
  proposalNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  proposalThreshold?: InputMaybe<Scalars['BigInt']['input']>
  proposalThreshold_gt?: InputMaybe<Scalars['BigInt']['input']>
  proposalThreshold_gte?: InputMaybe<Scalars['BigInt']['input']>
  proposalThreshold_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  proposalThreshold_lt?: InputMaybe<Scalars['BigInt']['input']>
  proposalThreshold_lte?: InputMaybe<Scalars['BigInt']['input']>
  proposalThreshold_not?: InputMaybe<Scalars['BigInt']['input']>
  proposalThreshold_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  proposer?: InputMaybe<Scalars['Bytes']['input']>
  proposer_contains?: InputMaybe<Scalars['Bytes']['input']>
  proposer_gt?: InputMaybe<Scalars['Bytes']['input']>
  proposer_gte?: InputMaybe<Scalars['Bytes']['input']>
  proposer_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  proposer_lt?: InputMaybe<Scalars['Bytes']['input']>
  proposer_lte?: InputMaybe<Scalars['Bytes']['input']>
  proposer_not?: InputMaybe<Scalars['Bytes']['input']>
  proposer_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  proposer_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  queued?: InputMaybe<Scalars['Boolean']['input']>
  queuedAt?: InputMaybe<Scalars['BigInt']['input']>
  queuedAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  queuedAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  queuedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  queuedAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  queuedAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  queuedAt_not?: InputMaybe<Scalars['BigInt']['input']>
  queuedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  queuedTransactionHash?: InputMaybe<Scalars['Bytes']['input']>
  queuedTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  queuedTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  queuedTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  queuedTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  queuedTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  queuedTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  queuedTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  queuedTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  queuedTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  queued_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  queued_not?: InputMaybe<Scalars['Boolean']['input']>
  queued_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  quorumVotes?: InputMaybe<Scalars['BigInt']['input']>
  quorumVotes_gt?: InputMaybe<Scalars['BigInt']['input']>
  quorumVotes_gte?: InputMaybe<Scalars['BigInt']['input']>
  quorumVotes_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  quorumVotes_lt?: InputMaybe<Scalars['BigInt']['input']>
  quorumVotes_lte?: InputMaybe<Scalars['BigInt']['input']>
  quorumVotes_not?: InputMaybe<Scalars['BigInt']['input']>
  quorumVotes_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  replacedBy?: InputMaybe<Scalars['String']['input']>
  replacedBy_?: InputMaybe<Proposal_Filter>
  replacedBy_contains?: InputMaybe<Scalars['String']['input']>
  replacedBy_contains_nocase?: InputMaybe<Scalars['String']['input']>
  replacedBy_ends_with?: InputMaybe<Scalars['String']['input']>
  replacedBy_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  replacedBy_gt?: InputMaybe<Scalars['String']['input']>
  replacedBy_gte?: InputMaybe<Scalars['String']['input']>
  replacedBy_in?: InputMaybe<Array<Scalars['String']['input']>>
  replacedBy_lt?: InputMaybe<Scalars['String']['input']>
  replacedBy_lte?: InputMaybe<Scalars['String']['input']>
  replacedBy_not?: InputMaybe<Scalars['String']['input']>
  replacedBy_not_contains?: InputMaybe<Scalars['String']['input']>
  replacedBy_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  replacedBy_not_ends_with?: InputMaybe<Scalars['String']['input']>
  replacedBy_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  replacedBy_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  replacedBy_not_starts_with?: InputMaybe<Scalars['String']['input']>
  replacedBy_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  replacedBy_starts_with?: InputMaybe<Scalars['String']['input']>
  replacedBy_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  replaces?: InputMaybe<Scalars['String']['input']>
  replaces_?: InputMaybe<Proposal_Filter>
  replaces_contains?: InputMaybe<Scalars['String']['input']>
  replaces_contains_nocase?: InputMaybe<Scalars['String']['input']>
  replaces_ends_with?: InputMaybe<Scalars['String']['input']>
  replaces_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  replaces_gt?: InputMaybe<Scalars['String']['input']>
  replaces_gte?: InputMaybe<Scalars['String']['input']>
  replaces_in?: InputMaybe<Array<Scalars['String']['input']>>
  replaces_lt?: InputMaybe<Scalars['String']['input']>
  replaces_lte?: InputMaybe<Scalars['String']['input']>
  replaces_not?: InputMaybe<Scalars['String']['input']>
  replaces_not_contains?: InputMaybe<Scalars['String']['input']>
  replaces_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  replaces_not_ends_with?: InputMaybe<Scalars['String']['input']>
  replaces_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  replaces_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  replaces_not_starts_with?: InputMaybe<Scalars['String']['input']>
  replaces_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  replaces_starts_with?: InputMaybe<Scalars['String']['input']>
  replaces_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress?: InputMaybe<Scalars['String']['input']>
  representedAddress_contains?: InputMaybe<Scalars['String']['input']>
  representedAddress_contains_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_ends_with?: InputMaybe<Scalars['String']['input']>
  representedAddress_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_gt?: InputMaybe<Scalars['String']['input']>
  representedAddress_gte?: InputMaybe<Scalars['String']['input']>
  representedAddress_in?: InputMaybe<Array<Scalars['String']['input']>>
  representedAddress_lt?: InputMaybe<Scalars['String']['input']>
  representedAddress_lte?: InputMaybe<Scalars['String']['input']>
  representedAddress_not?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_contains?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_ends_with?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  representedAddress_not_starts_with?: InputMaybe<Scalars['String']['input']>
  representedAddress_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  representedAddress_starts_with?: InputMaybe<Scalars['String']['input']>
  representedAddress_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  signers_?: InputMaybe<ProposalSigner_Filter>
  snapshotBlockNumber?: InputMaybe<Scalars['BigInt']['input']>
  snapshotBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  snapshotBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  snapshotBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  snapshotBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  snapshotBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  snapshotBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  snapshotBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  targets?: InputMaybe<Array<Scalars['Bytes']['input']>>
  targets_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>
  targets_not?: InputMaybe<Array<Scalars['Bytes']['input']>>
  targets_not_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>
  timeCreated?: InputMaybe<Scalars['BigInt']['input']>
  timeCreated_gt?: InputMaybe<Scalars['BigInt']['input']>
  timeCreated_gte?: InputMaybe<Scalars['BigInt']['input']>
  timeCreated_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timeCreated_lt?: InputMaybe<Scalars['BigInt']['input']>
  timeCreated_lte?: InputMaybe<Scalars['BigInt']['input']>
  timeCreated_not?: InputMaybe<Scalars['BigInt']['input']>
  timeCreated_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  title?: InputMaybe<Scalars['String']['input']>
  title_contains?: InputMaybe<Scalars['String']['input']>
  title_contains_nocase?: InputMaybe<Scalars['String']['input']>
  title_ends_with?: InputMaybe<Scalars['String']['input']>
  title_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  title_gt?: InputMaybe<Scalars['String']['input']>
  title_gte?: InputMaybe<Scalars['String']['input']>
  title_in?: InputMaybe<Array<Scalars['String']['input']>>
  title_lt?: InputMaybe<Scalars['String']['input']>
  title_lte?: InputMaybe<Scalars['String']['input']>
  title_not?: InputMaybe<Scalars['String']['input']>
  title_not_contains?: InputMaybe<Scalars['String']['input']>
  title_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  title_not_ends_with?: InputMaybe<Scalars['String']['input']>
  title_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  title_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  title_not_starts_with?: InputMaybe<Scalars['String']['input']>
  title_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  title_starts_with?: InputMaybe<Scalars['String']['input']>
  title_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  updateCount?: InputMaybe<Scalars['Int']['input']>
  updateCount_gt?: InputMaybe<Scalars['Int']['input']>
  updateCount_gte?: InputMaybe<Scalars['Int']['input']>
  updateCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  updateCount_lt?: InputMaybe<Scalars['Int']['input']>
  updateCount_lte?: InputMaybe<Scalars['Int']['input']>
  updateCount_not?: InputMaybe<Scalars['Int']['input']>
  updateCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  updateMessage?: InputMaybe<Scalars['String']['input']>
  updateMessage_contains?: InputMaybe<Scalars['String']['input']>
  updateMessage_contains_nocase?: InputMaybe<Scalars['String']['input']>
  updateMessage_ends_with?: InputMaybe<Scalars['String']['input']>
  updateMessage_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  updateMessage_gt?: InputMaybe<Scalars['String']['input']>
  updateMessage_gte?: InputMaybe<Scalars['String']['input']>
  updateMessage_in?: InputMaybe<Array<Scalars['String']['input']>>
  updateMessage_lt?: InputMaybe<Scalars['String']['input']>
  updateMessage_lte?: InputMaybe<Scalars['String']['input']>
  updateMessage_not?: InputMaybe<Scalars['String']['input']>
  updateMessage_not_contains?: InputMaybe<Scalars['String']['input']>
  updateMessage_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  updateMessage_not_ends_with?: InputMaybe<Scalars['String']['input']>
  updateMessage_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  updateMessage_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  updateMessage_not_starts_with?: InputMaybe<Scalars['String']['input']>
  updateMessage_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  updateMessage_starts_with?: InputMaybe<Scalars['String']['input']>
  updateMessage_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  updatePeriodEnd?: InputMaybe<Scalars['BigInt']['input']>
  updatePeriodEnd_gt?: InputMaybe<Scalars['BigInt']['input']>
  updatePeriodEnd_gte?: InputMaybe<Scalars['BigInt']['input']>
  updatePeriodEnd_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updatePeriodEnd_lt?: InputMaybe<Scalars['BigInt']['input']>
  updatePeriodEnd_lte?: InputMaybe<Scalars['BigInt']['input']>
  updatePeriodEnd_not?: InputMaybe<Scalars['BigInt']['input']>
  updatePeriodEnd_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updates_?: InputMaybe<ProposalUpdate_Filter>
  values?: InputMaybe<Array<Scalars['BigInt']['input']>>
  values_contains?: InputMaybe<Array<Scalars['BigInt']['input']>>
  values_not?: InputMaybe<Array<Scalars['BigInt']['input']>>
  values_not_contains?: InputMaybe<Array<Scalars['BigInt']['input']>>
  vetoTransactionHash?: InputMaybe<Scalars['Bytes']['input']>
  vetoTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  vetoTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  vetoTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  vetoTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  vetoTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  vetoTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  vetoTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  vetoTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  vetoTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  vetoed?: InputMaybe<Scalars['Boolean']['input']>
  vetoedAt?: InputMaybe<Scalars['BigInt']['input']>
  vetoedAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  vetoedAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  vetoedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  vetoedAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  vetoedAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  vetoedAt_not?: InputMaybe<Scalars['BigInt']['input']>
  vetoedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  vetoed_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  vetoed_not?: InputMaybe<Scalars['Boolean']['input']>
  vetoed_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  voteCount?: InputMaybe<Scalars['Int']['input']>
  voteCount_gt?: InputMaybe<Scalars['Int']['input']>
  voteCount_gte?: InputMaybe<Scalars['Int']['input']>
  voteCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  voteCount_lt?: InputMaybe<Scalars['Int']['input']>
  voteCount_lte?: InputMaybe<Scalars['Int']['input']>
  voteCount_not?: InputMaybe<Scalars['Int']['input']>
  voteCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  voteEnd?: InputMaybe<Scalars['BigInt']['input']>
  voteEnd_gt?: InputMaybe<Scalars['BigInt']['input']>
  voteEnd_gte?: InputMaybe<Scalars['BigInt']['input']>
  voteEnd_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  voteEnd_lt?: InputMaybe<Scalars['BigInt']['input']>
  voteEnd_lte?: InputMaybe<Scalars['BigInt']['input']>
  voteEnd_not?: InputMaybe<Scalars['BigInt']['input']>
  voteEnd_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  voteStart?: InputMaybe<Scalars['BigInt']['input']>
  voteStart_gt?: InputMaybe<Scalars['BigInt']['input']>
  voteStart_gte?: InputMaybe<Scalars['BigInt']['input']>
  voteStart_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  voteStart_lt?: InputMaybe<Scalars['BigInt']['input']>
  voteStart_lte?: InputMaybe<Scalars['BigInt']['input']>
  voteStart_not?: InputMaybe<Scalars['BigInt']['input']>
  voteStart_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  votes_?: InputMaybe<ProposalVote_Filter>
}

export enum Proposal_OrderBy {
  AbstainVotes = 'abstainVotes',
  AgainstVotes = 'againstVotes',
  Calldatas = 'calldatas',
  CancelTransactionHash = 'cancelTransactionHash',
  Canceled = 'canceled',
  CanceledAt = 'canceledAt',
  CandidateVersion = 'candidateVersion',
  CandidateVersionAttestationUid = 'candidateVersion__attestationUID',
  CandidateVersionAttester = 'candidateVersion__attester',
  CandidateVersionCandidateId = 'candidateVersion__candidateId',
  CandidateVersionComputedProposalId = 'candidateVersion__computedProposalId',
  CandidateVersionCreatedAt = 'candidateVersion__createdAt',
  CandidateVersionDescription = 'candidateVersion__description',
  CandidateVersionDiscussionUrl = 'candidateVersion__discussionUrl',
  CandidateVersionId = 'candidateVersion__id',
  CandidateVersionMetadata = 'candidateVersion__metadata',
  CandidateVersionRepresentedAddress = 'candidateVersion__representedAddress',
  CandidateVersionRevoked = 'candidateVersion__revoked',
  CandidateVersionSalt = 'candidateVersion__salt',
  CandidateVersionSignatureCount = 'candidateVersion__signatureCount',
  CandidateVersionTitle = 'candidateVersion__title',
  CandidateVersionTotalVoteWeight = 'candidateVersion__totalVoteWeight',
  CandidateVersionVersionNumber = 'candidateVersion__versionNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Description = 'description',
  DescriptionHash = 'descriptionHash',
  DiscussionUrl = 'discussionUrl',
  ExecutableFrom = 'executableFrom',
  Executed = 'executed',
  ExecutedAt = 'executedAt',
  ExecutionTransactionHash = 'executionTransactionHash',
  ExpiresAt = 'expiresAt',
  ForVotes = 'forVotes',
  Id = 'id',
  IsSigned = 'isSigned',
  Metadata = 'metadata',
  ProposalId = 'proposalId',
  ProposalNumber = 'proposalNumber',
  ProposalThreshold = 'proposalThreshold',
  Proposer = 'proposer',
  Queued = 'queued',
  QueuedAt = 'queuedAt',
  QueuedTransactionHash = 'queuedTransactionHash',
  QuorumVotes = 'quorumVotes',
  ReplacedBy = 'replacedBy',
  ReplacedByAbstainVotes = 'replacedBy__abstainVotes',
  ReplacedByAgainstVotes = 'replacedBy__againstVotes',
  ReplacedByCalldatas = 'replacedBy__calldatas',
  ReplacedByCancelTransactionHash = 'replacedBy__cancelTransactionHash',
  ReplacedByCanceled = 'replacedBy__canceled',
  ReplacedByCanceledAt = 'replacedBy__canceledAt',
  ReplacedByDescription = 'replacedBy__description',
  ReplacedByDescriptionHash = 'replacedBy__descriptionHash',
  ReplacedByDiscussionUrl = 'replacedBy__discussionUrl',
  ReplacedByExecutableFrom = 'replacedBy__executableFrom',
  ReplacedByExecuted = 'replacedBy__executed',
  ReplacedByExecutedAt = 'replacedBy__executedAt',
  ReplacedByExecutionTransactionHash = 'replacedBy__executionTransactionHash',
  ReplacedByExpiresAt = 'replacedBy__expiresAt',
  ReplacedByForVotes = 'replacedBy__forVotes',
  ReplacedById = 'replacedBy__id',
  ReplacedByIsSigned = 'replacedBy__isSigned',
  ReplacedByMetadata = 'replacedBy__metadata',
  ReplacedByProposalId = 'replacedBy__proposalId',
  ReplacedByProposalNumber = 'replacedBy__proposalNumber',
  ReplacedByProposalThreshold = 'replacedBy__proposalThreshold',
  ReplacedByProposer = 'replacedBy__proposer',
  ReplacedByQueued = 'replacedBy__queued',
  ReplacedByQueuedAt = 'replacedBy__queuedAt',
  ReplacedByQueuedTransactionHash = 'replacedBy__queuedTransactionHash',
  ReplacedByQuorumVotes = 'replacedBy__quorumVotes',
  ReplacedByRepresentedAddress = 'replacedBy__representedAddress',
  ReplacedBySnapshotBlockNumber = 'replacedBy__snapshotBlockNumber',
  ReplacedByTimeCreated = 'replacedBy__timeCreated',
  ReplacedByTitle = 'replacedBy__title',
  ReplacedByTransactionHash = 'replacedBy__transactionHash',
  ReplacedByUpdateCount = 'replacedBy__updateCount',
  ReplacedByUpdateMessage = 'replacedBy__updateMessage',
  ReplacedByUpdatePeriodEnd = 'replacedBy__updatePeriodEnd',
  ReplacedByVetoTransactionHash = 'replacedBy__vetoTransactionHash',
  ReplacedByVetoed = 'replacedBy__vetoed',
  ReplacedByVetoedAt = 'replacedBy__vetoedAt',
  ReplacedByVoteCount = 'replacedBy__voteCount',
  ReplacedByVoteEnd = 'replacedBy__voteEnd',
  ReplacedByVoteStart = 'replacedBy__voteStart',
  Replaces = 'replaces',
  ReplacesAbstainVotes = 'replaces__abstainVotes',
  ReplacesAgainstVotes = 'replaces__againstVotes',
  ReplacesCalldatas = 'replaces__calldatas',
  ReplacesCancelTransactionHash = 'replaces__cancelTransactionHash',
  ReplacesCanceled = 'replaces__canceled',
  ReplacesCanceledAt = 'replaces__canceledAt',
  ReplacesDescription = 'replaces__description',
  ReplacesDescriptionHash = 'replaces__descriptionHash',
  ReplacesDiscussionUrl = 'replaces__discussionUrl',
  ReplacesExecutableFrom = 'replaces__executableFrom',
  ReplacesExecuted = 'replaces__executed',
  ReplacesExecutedAt = 'replaces__executedAt',
  ReplacesExecutionTransactionHash = 'replaces__executionTransactionHash',
  ReplacesExpiresAt = 'replaces__expiresAt',
  ReplacesForVotes = 'replaces__forVotes',
  ReplacesId = 'replaces__id',
  ReplacesIsSigned = 'replaces__isSigned',
  ReplacesMetadata = 'replaces__metadata',
  ReplacesProposalId = 'replaces__proposalId',
  ReplacesProposalNumber = 'replaces__proposalNumber',
  ReplacesProposalThreshold = 'replaces__proposalThreshold',
  ReplacesProposer = 'replaces__proposer',
  ReplacesQueued = 'replaces__queued',
  ReplacesQueuedAt = 'replaces__queuedAt',
  ReplacesQueuedTransactionHash = 'replaces__queuedTransactionHash',
  ReplacesQuorumVotes = 'replaces__quorumVotes',
  ReplacesRepresentedAddress = 'replaces__representedAddress',
  ReplacesSnapshotBlockNumber = 'replaces__snapshotBlockNumber',
  ReplacesTimeCreated = 'replaces__timeCreated',
  ReplacesTitle = 'replaces__title',
  ReplacesTransactionHash = 'replaces__transactionHash',
  ReplacesUpdateCount = 'replaces__updateCount',
  ReplacesUpdateMessage = 'replaces__updateMessage',
  ReplacesUpdatePeriodEnd = 'replaces__updatePeriodEnd',
  ReplacesVetoTransactionHash = 'replaces__vetoTransactionHash',
  ReplacesVetoed = 'replaces__vetoed',
  ReplacesVetoedAt = 'replaces__vetoedAt',
  ReplacesVoteCount = 'replaces__voteCount',
  ReplacesVoteEnd = 'replaces__voteEnd',
  ReplacesVoteStart = 'replaces__voteStart',
  RepresentedAddress = 'representedAddress',
  Signers = 'signers',
  SnapshotBlockNumber = 'snapshotBlockNumber',
  Targets = 'targets',
  TimeCreated = 'timeCreated',
  Title = 'title',
  TransactionHash = 'transactionHash',
  UpdateCount = 'updateCount',
  UpdateMessage = 'updateMessage',
  UpdatePeriodEnd = 'updatePeriodEnd',
  Updates = 'updates',
  Values = 'values',
  VetoTransactionHash = 'vetoTransactionHash',
  Vetoed = 'vetoed',
  VetoedAt = 'vetoedAt',
  VoteCount = 'voteCount',
  VoteEnd = 'voteEnd',
  VoteStart = 'voteStart',
  Votes = 'votes',
}

export type Query = {
  __typename?: 'Query'
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>
  auction?: Maybe<Auction>
  auctionBid?: Maybe<AuctionBid>
  auctionBidPlacedEvent?: Maybe<AuctionBidPlacedEvent>
  auctionBidPlacedEvents: Array<AuctionBidPlacedEvent>
  auctionBids: Array<AuctionBid>
  auctionConfig?: Maybe<AuctionConfig>
  auctionConfigs: Array<AuctionConfig>
  auctionCreatedEvent?: Maybe<AuctionCreatedEvent>
  auctionCreatedEvents: Array<AuctionCreatedEvent>
  auctionSettledEvent?: Maybe<AuctionSettledEvent>
  auctionSettledEvents: Array<AuctionSettledEvent>
  auctions: Array<Auction>
  candidateComment?: Maybe<CandidateComment>
  candidateCommentCreatedEvent?: Maybe<CandidateCommentCreatedEvent>
  candidateCommentCreatedEvents: Array<CandidateCommentCreatedEvent>
  candidateComments: Array<CandidateComment>
  candidateSponsorSignature?: Maybe<CandidateSponsorSignature>
  candidateSponsorSignatureCreatedEvent?: Maybe<CandidateSponsorSignatureCreatedEvent>
  candidateSponsorSignatureCreatedEvents: Array<CandidateSponsorSignatureCreatedEvent>
  candidateSponsorSignatures: Array<CandidateSponsorSignature>
  candidateSubmittedAsProposalEvent?: Maybe<CandidateSubmittedAsProposalEvent>
  candidateSubmittedAsProposalEvents: Array<CandidateSubmittedAsProposalEvent>
  candidateVersionCreatedEvent?: Maybe<CandidateVersionCreatedEvent>
  candidateVersionCreatedEvents: Array<CandidateVersionCreatedEvent>
  clankerToken?: Maybe<ClankerToken>
  clankerTokenCreatedEvent?: Maybe<ClankerTokenCreatedEvent>
  clankerTokenCreatedEvents: Array<ClankerTokenCreatedEvent>
  clankerTokenHolder?: Maybe<ClankerTokenHolder>
  clankerTokenHolders: Array<ClankerTokenHolder>
  clankerTokenLinkedEvent?: Maybe<ClankerTokenLinkedEvent>
  clankerTokenLinkedEvents: Array<ClankerTokenLinkedEvent>
  clankerTokenUnlinkedEvent?: Maybe<ClankerTokenUnlinkedEvent>
  clankerTokenUnlinkedEvents: Array<ClankerTokenUnlinkedEvent>
  clankerTokens: Array<ClankerToken>
  dao?: Maybe<Dao>
  daoMultisigUpdate?: Maybe<DaoMultisigUpdate>
  daoMultisigUpdates: Array<DaoMultisigUpdate>
  daoSearch: Array<Dao>
  daolink?: Maybe<DaoLink>
  daolinks: Array<DaoLink>
  daos: Array<Dao>
  daotokenOwner?: Maybe<DaoTokenOwner>
  daotokenOwners: Array<DaoTokenOwner>
  daovoter?: Maybe<DaoVoter>
  daovoters: Array<DaoVoter>
  feedEvent?: Maybe<FeedEvent>
  feedEvents: Array<FeedEvent>
  metadataItem?: Maybe<MetadataItem>
  metadataItems: Array<MetadataItem>
  metadataProperties: Array<MetadataProperty>
  metadataProperty?: Maybe<MetadataProperty>
  paymentOption?: Maybe<PaymentOption>
  paymentOptions: Array<PaymentOption>
  proposal?: Maybe<Proposal>
  proposalCandidateGroup?: Maybe<ProposalCandidateGroup>
  proposalCandidateGroups: Array<ProposalCandidateGroup>
  proposalCandidateVersion?: Maybe<ProposalCandidateVersion>
  proposalCandidateVersions: Array<ProposalCandidateVersion>
  proposalCreatedEvent?: Maybe<ProposalCreatedEvent>
  proposalCreatedEvents: Array<ProposalCreatedEvent>
  proposalEditedEvent?: Maybe<ProposalEditedEvent>
  proposalEditedEvents: Array<ProposalEditedEvent>
  proposalExecutedEvent?: Maybe<ProposalExecutedEvent>
  proposalExecutedEvents: Array<ProposalExecutedEvent>
  proposalMetadataEntities: Array<ProposalMetadataEntity>
  proposalMetadataEntity?: Maybe<ProposalMetadataEntity>
  proposalSigner?: Maybe<ProposalSigner>
  proposalSigners: Array<ProposalSigner>
  proposalUpdate?: Maybe<ProposalUpdate>
  proposalUpdatedEvent?: Maybe<ProposalUpdatedEvent>
  proposalUpdatedEvents: Array<ProposalUpdatedEvent>
  proposalUpdates: Array<ProposalUpdate>
  proposalVote?: Maybe<ProposalVote>
  proposalVotedEvent?: Maybe<ProposalVotedEvent>
  proposalVotedEvents: Array<ProposalVotedEvent>
  proposalVotes: Array<ProposalVote>
  proposals: Array<Proposal>
  snapshot?: Maybe<Snapshot>
  snapshots: Array<Snapshot>
  swapHop?: Maybe<SwapHop>
  swapHops: Array<SwapHop>
  swapRoute?: Maybe<SwapRoute>
  swapRoutes: Array<SwapRoute>
  token?: Maybe<Token>
  tokens: Array<Token>
  treasuryAssetPin?: Maybe<TreasuryAssetPin>
  treasuryAssetPins: Array<TreasuryAssetPin>
  zoraCoin?: Maybe<ZoraCoin>
  zoraCoinCreatedEvent?: Maybe<ZoraCoinCreatedEvent>
  zoraCoinCreatedEvents: Array<ZoraCoinCreatedEvent>
  zoraCoinHolder?: Maybe<ZoraCoinHolder>
  zoraCoinHolders: Array<ZoraCoinHolder>
  zoraCoins: Array<ZoraCoin>
  zoraDrop?: Maybe<ZoraDrop>
  zoraDropCreatedEvent?: Maybe<ZoraDropCreatedEvent>
  zoraDropCreatedEvents: Array<ZoraDropCreatedEvent>
  zoraDropHolder?: Maybe<ZoraDropHolder>
  zoraDropHolders: Array<ZoraDropHolder>
  zoraDropMintComment?: Maybe<ZoraDropMintComment>
  zoraDropMintComments: Array<ZoraDropMintComment>
  zoraDrops: Array<ZoraDrop>
}

export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>
}

export type QueryAuctionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryAuctionBidArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryAuctionBidPlacedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryAuctionBidPlacedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<AuctionBidPlacedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<AuctionBidPlacedEvent_Filter>
}

export type QueryAuctionBidsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<AuctionBid_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<AuctionBid_Filter>
}

export type QueryAuctionConfigArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryAuctionConfigsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<AuctionConfig_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<AuctionConfig_Filter>
}

export type QueryAuctionCreatedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryAuctionCreatedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<AuctionCreatedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<AuctionCreatedEvent_Filter>
}

export type QueryAuctionSettledEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryAuctionSettledEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<AuctionSettledEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<AuctionSettledEvent_Filter>
}

export type QueryAuctionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Auction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Auction_Filter>
}

export type QueryCandidateCommentArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryCandidateCommentCreatedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryCandidateCommentCreatedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<CandidateCommentCreatedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<CandidateCommentCreatedEvent_Filter>
}

export type QueryCandidateCommentsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<CandidateComment_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<CandidateComment_Filter>
}

export type QueryCandidateSponsorSignatureArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryCandidateSponsorSignatureCreatedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryCandidateSponsorSignatureCreatedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<CandidateSponsorSignatureCreatedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<CandidateSponsorSignatureCreatedEvent_Filter>
}

export type QueryCandidateSponsorSignaturesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<CandidateSponsorSignature_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<CandidateSponsorSignature_Filter>
}

export type QueryCandidateSubmittedAsProposalEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryCandidateSubmittedAsProposalEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<CandidateSubmittedAsProposalEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<CandidateSubmittedAsProposalEvent_Filter>
}

export type QueryCandidateVersionCreatedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryCandidateVersionCreatedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<CandidateVersionCreatedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<CandidateVersionCreatedEvent_Filter>
}

export type QueryClankerTokenArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryClankerTokenCreatedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryClankerTokenCreatedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ClankerTokenCreatedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ClankerTokenCreatedEvent_Filter>
}

export type QueryClankerTokenHolderArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryClankerTokenHoldersArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ClankerTokenHolder_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ClankerTokenHolder_Filter>
}

export type QueryClankerTokenLinkedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryClankerTokenLinkedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ClankerTokenLinkedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ClankerTokenLinkedEvent_Filter>
}

export type QueryClankerTokenUnlinkedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryClankerTokenUnlinkedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ClankerTokenUnlinkedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ClankerTokenUnlinkedEvent_Filter>
}

export type QueryClankerTokensArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ClankerToken_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ClankerToken_Filter>
}

export type QueryDaoArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryDaoMultisigUpdateArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryDaoMultisigUpdatesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoMultisigUpdate_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<DaoMultisigUpdate_Filter>
}

export type QueryDaoSearchArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  text: Scalars['String']['input']
  where?: InputMaybe<Dao_Filter>
}

export type QueryDaolinkArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryDaolinksArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoLink_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<DaoLink_Filter>
}

export type QueryDaosArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Dao_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Dao_Filter>
}

export type QueryDaotokenOwnerArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryDaotokenOwnersArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoTokenOwner_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<DaoTokenOwner_Filter>
}

export type QueryDaovoterArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryDaovotersArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoVoter_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<DaoVoter_Filter>
}

export type QueryFeedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryFeedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<FeedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<FeedEvent_Filter>
}

export type QueryMetadataItemArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryMetadataItemsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<MetadataItem_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<MetadataItem_Filter>
}

export type QueryMetadataPropertiesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<MetadataProperty_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<MetadataProperty_Filter>
}

export type QueryMetadataPropertyArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryPaymentOptionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryPaymentOptionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<PaymentOption_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<PaymentOption_Filter>
}

export type QueryProposalArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryProposalCandidateGroupArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryProposalCandidateGroupsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalCandidateGroup_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalCandidateGroup_Filter>
}

export type QueryProposalCandidateVersionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryProposalCandidateVersionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalCandidateVersion_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalCandidateVersion_Filter>
}

export type QueryProposalCreatedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryProposalCreatedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalCreatedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalCreatedEvent_Filter>
}

export type QueryProposalEditedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryProposalEditedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalEditedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalEditedEvent_Filter>
}

export type QueryProposalExecutedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryProposalExecutedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalExecutedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalExecutedEvent_Filter>
}

export type QueryProposalMetadataEntitiesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalMetadataEntity_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalMetadataEntity_Filter>
}

export type QueryProposalMetadataEntityArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryProposalSignerArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryProposalSignersArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalSigner_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalSigner_Filter>
}

export type QueryProposalUpdateArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryProposalUpdatedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryProposalUpdatedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalUpdatedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalUpdatedEvent_Filter>
}

export type QueryProposalUpdatesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalUpdate_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalUpdate_Filter>
}

export type QueryProposalVoteArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryProposalVotedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryProposalVotedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalVotedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalVotedEvent_Filter>
}

export type QueryProposalVotesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalVote_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalVote_Filter>
}

export type QueryProposalsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Proposal_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Proposal_Filter>
}

export type QuerySnapshotArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySnapshotsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Snapshot_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Snapshot_Filter>
}

export type QuerySwapHopArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySwapHopsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<SwapHop_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SwapHop_Filter>
}

export type QuerySwapRouteArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySwapRoutesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<SwapRoute_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SwapRoute_Filter>
}

export type QueryTokenArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryTokensArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Token_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Token_Filter>
}

export type QueryTreasuryAssetPinArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryTreasuryAssetPinsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<TreasuryAssetPin_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<TreasuryAssetPin_Filter>
}

export type QueryZoraCoinArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryZoraCoinCreatedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryZoraCoinCreatedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraCoinCreatedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ZoraCoinCreatedEvent_Filter>
}

export type QueryZoraCoinHolderArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryZoraCoinHoldersArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraCoinHolder_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ZoraCoinHolder_Filter>
}

export type QueryZoraCoinsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraCoin_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ZoraCoin_Filter>
}

export type QueryZoraDropArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryZoraDropCreatedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryZoraDropCreatedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraDropCreatedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ZoraDropCreatedEvent_Filter>
}

export type QueryZoraDropHolderArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryZoraDropHoldersArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraDropHolder_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ZoraDropHolder_Filter>
}

export type QueryZoraDropMintCommentArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryZoraDropMintCommentsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraDropMintComment_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ZoraDropMintComment_Filter>
}

export type QueryZoraDropsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraDrop_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ZoraDrop_Filter>
}

export type Snapshot = {
  __typename?: 'Snapshot'
  blockNumber: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  ownerCount: Scalars['Int']['output']
  proposalCount: Scalars['Int']['output']
  timestamp: Scalars['BigInt']['output']
  tokensCount: Scalars['Int']['output']
  totalSupply: Scalars['Int']['output']
  voterCount: Scalars['Int']['output']
}

export type Snapshot_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<Snapshot_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<Snapshot_Filter>>>
  ownerCount?: InputMaybe<Scalars['Int']['input']>
  ownerCount_gt?: InputMaybe<Scalars['Int']['input']>
  ownerCount_gte?: InputMaybe<Scalars['Int']['input']>
  ownerCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  ownerCount_lt?: InputMaybe<Scalars['Int']['input']>
  ownerCount_lte?: InputMaybe<Scalars['Int']['input']>
  ownerCount_not?: InputMaybe<Scalars['Int']['input']>
  ownerCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  proposalCount?: InputMaybe<Scalars['Int']['input']>
  proposalCount_gt?: InputMaybe<Scalars['Int']['input']>
  proposalCount_gte?: InputMaybe<Scalars['Int']['input']>
  proposalCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  proposalCount_lt?: InputMaybe<Scalars['Int']['input']>
  proposalCount_lte?: InputMaybe<Scalars['Int']['input']>
  proposalCount_not?: InputMaybe<Scalars['Int']['input']>
  proposalCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  tokensCount?: InputMaybe<Scalars['Int']['input']>
  tokensCount_gt?: InputMaybe<Scalars['Int']['input']>
  tokensCount_gte?: InputMaybe<Scalars['Int']['input']>
  tokensCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  tokensCount_lt?: InputMaybe<Scalars['Int']['input']>
  tokensCount_lte?: InputMaybe<Scalars['Int']['input']>
  tokensCount_not?: InputMaybe<Scalars['Int']['input']>
  tokensCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  totalSupply?: InputMaybe<Scalars['Int']['input']>
  totalSupply_gt?: InputMaybe<Scalars['Int']['input']>
  totalSupply_gte?: InputMaybe<Scalars['Int']['input']>
  totalSupply_in?: InputMaybe<Array<Scalars['Int']['input']>>
  totalSupply_lt?: InputMaybe<Scalars['Int']['input']>
  totalSupply_lte?: InputMaybe<Scalars['Int']['input']>
  totalSupply_not?: InputMaybe<Scalars['Int']['input']>
  totalSupply_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  voterCount?: InputMaybe<Scalars['Int']['input']>
  voterCount_gt?: InputMaybe<Scalars['Int']['input']>
  voterCount_gte?: InputMaybe<Scalars['Int']['input']>
  voterCount_in?: InputMaybe<Array<Scalars['Int']['input']>>
  voterCount_lt?: InputMaybe<Scalars['Int']['input']>
  voterCount_lte?: InputMaybe<Scalars['Int']['input']>
  voterCount_not?: InputMaybe<Scalars['Int']['input']>
  voterCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
}

export enum Snapshot_OrderBy {
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  OwnerCount = 'ownerCount',
  ProposalCount = 'proposalCount',
  Timestamp = 'timestamp',
  TokensCount = 'tokensCount',
  TotalSupply = 'totalSupply',
  VoterCount = 'voterCount',
}

export type SwapHop = {
  __typename?: 'SwapHop'
  fee?: Maybe<Scalars['BigInt']['output']>
  hooks?: Maybe<Scalars['Bytes']['output']>
  hopIndex: Scalars['Int']['output']
  id: Scalars['ID']['output']
  poolId: Scalars['Bytes']['output']
  route: SwapRoute
  tickSpacing?: Maybe<Scalars['Int']['output']>
  tokenIn: Scalars['Bytes']['output']
  tokenOut: Scalars['Bytes']['output']
}

export type SwapHop_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<SwapHop_Filter>>>
  fee?: InputMaybe<Scalars['BigInt']['input']>
  fee_gt?: InputMaybe<Scalars['BigInt']['input']>
  fee_gte?: InputMaybe<Scalars['BigInt']['input']>
  fee_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  fee_lt?: InputMaybe<Scalars['BigInt']['input']>
  fee_lte?: InputMaybe<Scalars['BigInt']['input']>
  fee_not?: InputMaybe<Scalars['BigInt']['input']>
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  hooks?: InputMaybe<Scalars['Bytes']['input']>
  hooks_contains?: InputMaybe<Scalars['Bytes']['input']>
  hooks_gt?: InputMaybe<Scalars['Bytes']['input']>
  hooks_gte?: InputMaybe<Scalars['Bytes']['input']>
  hooks_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  hooks_lt?: InputMaybe<Scalars['Bytes']['input']>
  hooks_lte?: InputMaybe<Scalars['Bytes']['input']>
  hooks_not?: InputMaybe<Scalars['Bytes']['input']>
  hooks_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  hooks_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  hopIndex?: InputMaybe<Scalars['Int']['input']>
  hopIndex_gt?: InputMaybe<Scalars['Int']['input']>
  hopIndex_gte?: InputMaybe<Scalars['Int']['input']>
  hopIndex_in?: InputMaybe<Array<Scalars['Int']['input']>>
  hopIndex_lt?: InputMaybe<Scalars['Int']['input']>
  hopIndex_lte?: InputMaybe<Scalars['Int']['input']>
  hopIndex_not?: InputMaybe<Scalars['Int']['input']>
  hopIndex_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<SwapHop_Filter>>>
  poolId?: InputMaybe<Scalars['Bytes']['input']>
  poolId_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolId_gt?: InputMaybe<Scalars['Bytes']['input']>
  poolId_gte?: InputMaybe<Scalars['Bytes']['input']>
  poolId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolId_lt?: InputMaybe<Scalars['Bytes']['input']>
  poolId_lte?: InputMaybe<Scalars['Bytes']['input']>
  poolId_not?: InputMaybe<Scalars['Bytes']['input']>
  poolId_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  route?: InputMaybe<Scalars['String']['input']>
  route_?: InputMaybe<SwapRoute_Filter>
  route_contains?: InputMaybe<Scalars['String']['input']>
  route_contains_nocase?: InputMaybe<Scalars['String']['input']>
  route_ends_with?: InputMaybe<Scalars['String']['input']>
  route_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  route_gt?: InputMaybe<Scalars['String']['input']>
  route_gte?: InputMaybe<Scalars['String']['input']>
  route_in?: InputMaybe<Array<Scalars['String']['input']>>
  route_lt?: InputMaybe<Scalars['String']['input']>
  route_lte?: InputMaybe<Scalars['String']['input']>
  route_not?: InputMaybe<Scalars['String']['input']>
  route_not_contains?: InputMaybe<Scalars['String']['input']>
  route_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  route_not_ends_with?: InputMaybe<Scalars['String']['input']>
  route_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  route_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  route_not_starts_with?: InputMaybe<Scalars['String']['input']>
  route_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  route_starts_with?: InputMaybe<Scalars['String']['input']>
  route_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  tickSpacing?: InputMaybe<Scalars['Int']['input']>
  tickSpacing_gt?: InputMaybe<Scalars['Int']['input']>
  tickSpacing_gte?: InputMaybe<Scalars['Int']['input']>
  tickSpacing_in?: InputMaybe<Array<Scalars['Int']['input']>>
  tickSpacing_lt?: InputMaybe<Scalars['Int']['input']>
  tickSpacing_lte?: InputMaybe<Scalars['Int']['input']>
  tickSpacing_not?: InputMaybe<Scalars['Int']['input']>
  tickSpacing_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  tokenIn?: InputMaybe<Scalars['Bytes']['input']>
  tokenIn_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenIn_gt?: InputMaybe<Scalars['Bytes']['input']>
  tokenIn_gte?: InputMaybe<Scalars['Bytes']['input']>
  tokenIn_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenIn_lt?: InputMaybe<Scalars['Bytes']['input']>
  tokenIn_lte?: InputMaybe<Scalars['Bytes']['input']>
  tokenIn_not?: InputMaybe<Scalars['Bytes']['input']>
  tokenIn_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenIn_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenOut?: InputMaybe<Scalars['Bytes']['input']>
  tokenOut_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenOut_gt?: InputMaybe<Scalars['Bytes']['input']>
  tokenOut_gte?: InputMaybe<Scalars['Bytes']['input']>
  tokenOut_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenOut_lt?: InputMaybe<Scalars['Bytes']['input']>
  tokenOut_lte?: InputMaybe<Scalars['Bytes']['input']>
  tokenOut_not?: InputMaybe<Scalars['Bytes']['input']>
  tokenOut_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenOut_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
}

export enum SwapHop_OrderBy {
  Fee = 'fee',
  Hooks = 'hooks',
  HopIndex = 'hopIndex',
  Id = 'id',
  PoolId = 'poolId',
  Route = 'route',
  RouteCoinAddress = 'route__coinAddress',
  RouteCreatedAt = 'route__createdAt',
  RouteId = 'route__id',
  RouteUpdatedAt = 'route__updatedAt',
  TickSpacing = 'tickSpacing',
  TokenIn = 'tokenIn',
  TokenOut = 'tokenOut',
}

export type SwapRoute = {
  __typename?: 'SwapRoute'
  clankerToken?: Maybe<ClankerToken>
  coinAddress: Scalars['Bytes']['output']
  createdAt: Scalars['BigInt']['output']
  id: Scalars['ID']['output']
  mainPath: Array<SwapHop>
  paymentOptions: Array<PaymentOption>
  updatedAt: Scalars['BigInt']['output']
  zoraCoin?: Maybe<ZoraCoin>
}

export type SwapRouteMainPathArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<SwapHop_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SwapHop_Filter>
}

export type SwapRoutePaymentOptionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<PaymentOption_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<PaymentOption_Filter>
}

export type SwapRoute_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<SwapRoute_Filter>>>
  clankerToken?: InputMaybe<Scalars['String']['input']>
  clankerToken_?: InputMaybe<ClankerToken_Filter>
  clankerToken_contains?: InputMaybe<Scalars['String']['input']>
  clankerToken_contains_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_ends_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_gt?: InputMaybe<Scalars['String']['input']>
  clankerToken_gte?: InputMaybe<Scalars['String']['input']>
  clankerToken_in?: InputMaybe<Array<Scalars['String']['input']>>
  clankerToken_lt?: InputMaybe<Scalars['String']['input']>
  clankerToken_lte?: InputMaybe<Scalars['String']['input']>
  clankerToken_not?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_contains?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_ends_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  clankerToken_not_starts_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_starts_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  coinAddress?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_contains?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_gt?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_gte?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  coinAddress_lt?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_lte?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_not?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  createdAt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  mainPath_?: InputMaybe<SwapHop_Filter>
  or?: InputMaybe<Array<InputMaybe<SwapRoute_Filter>>>
  paymentOptions_?: InputMaybe<PaymentOption_Filter>
  updatedAt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updatedAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_not?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  zoraCoin?: InputMaybe<Scalars['String']['input']>
  zoraCoin_?: InputMaybe<ZoraCoin_Filter>
  zoraCoin_contains?: InputMaybe<Scalars['String']['input']>
  zoraCoin_contains_nocase?: InputMaybe<Scalars['String']['input']>
  zoraCoin_ends_with?: InputMaybe<Scalars['String']['input']>
  zoraCoin_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  zoraCoin_gt?: InputMaybe<Scalars['String']['input']>
  zoraCoin_gte?: InputMaybe<Scalars['String']['input']>
  zoraCoin_in?: InputMaybe<Array<Scalars['String']['input']>>
  zoraCoin_lt?: InputMaybe<Scalars['String']['input']>
  zoraCoin_lte?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not_contains?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not_ends_with?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  zoraCoin_not_starts_with?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  zoraCoin_starts_with?: InputMaybe<Scalars['String']['input']>
  zoraCoin_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
}

export enum SwapRoute_OrderBy {
  ClankerToken = 'clankerToken',
  ClankerTokenAdminChangedAt = 'clankerToken__adminChangedAt',
  ClankerTokenCreatedAt = 'clankerToken__createdAt',
  ClankerTokenCreatedAtBlock = 'clankerToken__createdAtBlock',
  ClankerTokenExtensionsSupply = 'clankerToken__extensionsSupply',
  ClankerTokenId = 'clankerToken__id',
  ClankerTokenIsTrusted = 'clankerToken__isTrusted',
  ClankerTokenLocker = 'clankerToken__locker',
  ClankerTokenMevModule = 'clankerToken__mevModule',
  ClankerTokenMsgSender = 'clankerToken__msgSender',
  ClankerTokenPairedToken = 'clankerToken__pairedToken',
  ClankerTokenPoolHook = 'clankerToken__poolHook',
  ClankerTokenPoolId = 'clankerToken__poolId',
  ClankerTokenStartingTick = 'clankerToken__startingTick',
  ClankerTokenTokenAddress = 'clankerToken__tokenAddress',
  ClankerTokenTokenAdmin = 'clankerToken__tokenAdmin',
  ClankerTokenTokenContext = 'clankerToken__tokenContext',
  ClankerTokenTokenImage = 'clankerToken__tokenImage',
  ClankerTokenTokenMetadata = 'clankerToken__tokenMetadata',
  ClankerTokenTokenName = 'clankerToken__tokenName',
  ClankerTokenTokenSymbol = 'clankerToken__tokenSymbol',
  ClankerTokenTransactionHash = 'clankerToken__transactionHash',
  CoinAddress = 'coinAddress',
  CreatedAt = 'createdAt',
  Id = 'id',
  MainPath = 'mainPath',
  PaymentOptions = 'paymentOptions',
  UpdatedAt = 'updatedAt',
  ZoraCoin = 'zoraCoin',
  ZoraCoinCaller = 'zoraCoin__caller',
  ZoraCoinCoinAddress = 'zoraCoin__coinAddress',
  ZoraCoinCreatedAt = 'zoraCoin__createdAt',
  ZoraCoinCreatedAtBlock = 'zoraCoin__createdAtBlock',
  ZoraCoinCurrency = 'zoraCoin__currency',
  ZoraCoinId = 'zoraCoin__id',
  ZoraCoinName = 'zoraCoin__name',
  ZoraCoinPayoutRecipient = 'zoraCoin__payoutRecipient',
  ZoraCoinPlatformReferrer = 'zoraCoin__platformReferrer',
  ZoraCoinPoolCurrency0 = 'zoraCoin__poolCurrency0',
  ZoraCoinPoolCurrency1 = 'zoraCoin__poolCurrency1',
  ZoraCoinPoolFee = 'zoraCoin__poolFee',
  ZoraCoinPoolHooks = 'zoraCoin__poolHooks',
  ZoraCoinPoolKeyHash = 'zoraCoin__poolKeyHash',
  ZoraCoinPoolTickSpacing = 'zoraCoin__poolTickSpacing',
  ZoraCoinSymbol = 'zoraCoin__symbol',
  ZoraCoinTransactionHash = 'zoraCoin__transactionHash',
  ZoraCoinUri = 'zoraCoin__uri',
  ZoraCoinVersion = 'zoraCoin__version',
}

export type Token = {
  __typename?: 'Token'
  auction?: Maybe<Auction>
  content?: Maybe<Scalars['String']['output']>
  dao: Dao
  id: Scalars['ID']['output']
  image?: Maybe<Scalars['String']['output']>
  mintedAt: Scalars['BigInt']['output']
  name: Scalars['String']['output']
  owner: Scalars['Bytes']['output']
  ownerInfo: DaoTokenOwner
  tokenContract: Scalars['Bytes']['output']
  tokenId: Scalars['BigInt']['output']
  voterInfo: DaoVoter
}

export type Token_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<Token_Filter>>>
  auction_?: InputMaybe<Auction_Filter>
  content?: InputMaybe<Scalars['String']['input']>
  content_contains?: InputMaybe<Scalars['String']['input']>
  content_contains_nocase?: InputMaybe<Scalars['String']['input']>
  content_ends_with?: InputMaybe<Scalars['String']['input']>
  content_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  content_gt?: InputMaybe<Scalars['String']['input']>
  content_gte?: InputMaybe<Scalars['String']['input']>
  content_in?: InputMaybe<Array<Scalars['String']['input']>>
  content_lt?: InputMaybe<Scalars['String']['input']>
  content_lte?: InputMaybe<Scalars['String']['input']>
  content_not?: InputMaybe<Scalars['String']['input']>
  content_not_contains?: InputMaybe<Scalars['String']['input']>
  content_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  content_not_ends_with?: InputMaybe<Scalars['String']['input']>
  content_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  content_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  content_not_starts_with?: InputMaybe<Scalars['String']['input']>
  content_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  content_starts_with?: InputMaybe<Scalars['String']['input']>
  content_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  image?: InputMaybe<Scalars['String']['input']>
  image_contains?: InputMaybe<Scalars['String']['input']>
  image_contains_nocase?: InputMaybe<Scalars['String']['input']>
  image_ends_with?: InputMaybe<Scalars['String']['input']>
  image_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  image_gt?: InputMaybe<Scalars['String']['input']>
  image_gte?: InputMaybe<Scalars['String']['input']>
  image_in?: InputMaybe<Array<Scalars['String']['input']>>
  image_lt?: InputMaybe<Scalars['String']['input']>
  image_lte?: InputMaybe<Scalars['String']['input']>
  image_not?: InputMaybe<Scalars['String']['input']>
  image_not_contains?: InputMaybe<Scalars['String']['input']>
  image_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  image_not_ends_with?: InputMaybe<Scalars['String']['input']>
  image_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  image_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  image_not_starts_with?: InputMaybe<Scalars['String']['input']>
  image_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  image_starts_with?: InputMaybe<Scalars['String']['input']>
  image_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  mintedAt?: InputMaybe<Scalars['BigInt']['input']>
  mintedAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  mintedAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  mintedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  mintedAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  mintedAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  mintedAt_not?: InputMaybe<Scalars['BigInt']['input']>
  mintedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  name?: InputMaybe<Scalars['String']['input']>
  name_contains?: InputMaybe<Scalars['String']['input']>
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>
  name_ends_with?: InputMaybe<Scalars['String']['input']>
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_gt?: InputMaybe<Scalars['String']['input']>
  name_gte?: InputMaybe<Scalars['String']['input']>
  name_in?: InputMaybe<Array<Scalars['String']['input']>>
  name_lt?: InputMaybe<Scalars['String']['input']>
  name_lte?: InputMaybe<Scalars['String']['input']>
  name_not?: InputMaybe<Scalars['String']['input']>
  name_not_contains?: InputMaybe<Scalars['String']['input']>
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_starts_with?: InputMaybe<Scalars['String']['input']>
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  or?: InputMaybe<Array<InputMaybe<Token_Filter>>>
  owner?: InputMaybe<Scalars['Bytes']['input']>
  ownerInfo?: InputMaybe<Scalars['String']['input']>
  ownerInfo_?: InputMaybe<DaoTokenOwner_Filter>
  ownerInfo_contains?: InputMaybe<Scalars['String']['input']>
  ownerInfo_contains_nocase?: InputMaybe<Scalars['String']['input']>
  ownerInfo_ends_with?: InputMaybe<Scalars['String']['input']>
  ownerInfo_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  ownerInfo_gt?: InputMaybe<Scalars['String']['input']>
  ownerInfo_gte?: InputMaybe<Scalars['String']['input']>
  ownerInfo_in?: InputMaybe<Array<Scalars['String']['input']>>
  ownerInfo_lt?: InputMaybe<Scalars['String']['input']>
  ownerInfo_lte?: InputMaybe<Scalars['String']['input']>
  ownerInfo_not?: InputMaybe<Scalars['String']['input']>
  ownerInfo_not_contains?: InputMaybe<Scalars['String']['input']>
  ownerInfo_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  ownerInfo_not_ends_with?: InputMaybe<Scalars['String']['input']>
  ownerInfo_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  ownerInfo_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  ownerInfo_not_starts_with?: InputMaybe<Scalars['String']['input']>
  ownerInfo_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  ownerInfo_starts_with?: InputMaybe<Scalars['String']['input']>
  ownerInfo_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>
  owner_not?: InputMaybe<Scalars['Bytes']['input']>
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenContract?: InputMaybe<Scalars['Bytes']['input']>
  tokenContract_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenContract_gt?: InputMaybe<Scalars['Bytes']['input']>
  tokenContract_gte?: InputMaybe<Scalars['Bytes']['input']>
  tokenContract_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenContract_lt?: InputMaybe<Scalars['Bytes']['input']>
  tokenContract_lte?: InputMaybe<Scalars['Bytes']['input']>
  tokenContract_not?: InputMaybe<Scalars['Bytes']['input']>
  tokenContract_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  tokenContract_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  tokenId?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_gt?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_gte?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  tokenId_lt?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_lte?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_not?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  voterInfo?: InputMaybe<Scalars['String']['input']>
  voterInfo_?: InputMaybe<DaoVoter_Filter>
  voterInfo_contains?: InputMaybe<Scalars['String']['input']>
  voterInfo_contains_nocase?: InputMaybe<Scalars['String']['input']>
  voterInfo_ends_with?: InputMaybe<Scalars['String']['input']>
  voterInfo_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  voterInfo_gt?: InputMaybe<Scalars['String']['input']>
  voterInfo_gte?: InputMaybe<Scalars['String']['input']>
  voterInfo_in?: InputMaybe<Array<Scalars['String']['input']>>
  voterInfo_lt?: InputMaybe<Scalars['String']['input']>
  voterInfo_lte?: InputMaybe<Scalars['String']['input']>
  voterInfo_not?: InputMaybe<Scalars['String']['input']>
  voterInfo_not_contains?: InputMaybe<Scalars['String']['input']>
  voterInfo_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  voterInfo_not_ends_with?: InputMaybe<Scalars['String']['input']>
  voterInfo_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  voterInfo_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  voterInfo_not_starts_with?: InputMaybe<Scalars['String']['input']>
  voterInfo_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  voterInfo_starts_with?: InputMaybe<Scalars['String']['input']>
  voterInfo_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
}

export enum Token_OrderBy {
  Auction = 'auction',
  AuctionBidCount = 'auction__bidCount',
  AuctionEndTime = 'auction__endTime',
  AuctionExtended = 'auction__extended',
  AuctionFirstBidTime = 'auction__firstBidTime',
  AuctionId = 'auction__id',
  AuctionSettled = 'auction__settled',
  AuctionStartTime = 'auction__startTime',
  Content = 'content',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Image = 'image',
  MintedAt = 'mintedAt',
  Name = 'name',
  Owner = 'owner',
  OwnerInfo = 'ownerInfo',
  OwnerInfoDaoTokenCount = 'ownerInfo__daoTokenCount',
  OwnerInfoDelegate = 'ownerInfo__delegate',
  OwnerInfoId = 'ownerInfo__id',
  OwnerInfoOwner = 'ownerInfo__owner',
  TokenContract = 'tokenContract',
  TokenId = 'tokenId',
  VoterInfo = 'voterInfo',
  VoterInfoDaoTokenCount = 'voterInfo__daoTokenCount',
  VoterInfoId = 'voterInfo__id',
  VoterInfoVoter = 'voterInfo__voter',
}

export type TreasuryAssetPin = {
  __typename?: 'TreasuryAssetPin'
  creator: Scalars['Bytes']['output']
  dao: Dao
  id: Scalars['ID']['output']
  isCollection: Scalars['Boolean']['output']
  revoked: Scalars['Boolean']['output']
  revokedAt?: Maybe<Scalars['BigInt']['output']>
  revokedBy?: Maybe<Scalars['Bytes']['output']>
  revokedTxHash?: Maybe<Scalars['Bytes']['output']>
  timestamp: Scalars['BigInt']['output']
  token: Scalars['Bytes']['output']
  tokenId: Scalars['BigInt']['output']
  tokenType: Scalars['Int']['output']
  transactionHash: Scalars['Bytes']['output']
}

export type TreasuryAssetPin_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<TreasuryAssetPin_Filter>>>
  creator?: InputMaybe<Scalars['Bytes']['input']>
  creator_contains?: InputMaybe<Scalars['Bytes']['input']>
  creator_gt?: InputMaybe<Scalars['Bytes']['input']>
  creator_gte?: InputMaybe<Scalars['Bytes']['input']>
  creator_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  creator_lt?: InputMaybe<Scalars['Bytes']['input']>
  creator_lte?: InputMaybe<Scalars['Bytes']['input']>
  creator_not?: InputMaybe<Scalars['Bytes']['input']>
  creator_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  creator_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  isCollection?: InputMaybe<Scalars['Boolean']['input']>
  isCollection_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  isCollection_not?: InputMaybe<Scalars['Boolean']['input']>
  isCollection_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  or?: InputMaybe<Array<InputMaybe<TreasuryAssetPin_Filter>>>
  revoked?: InputMaybe<Scalars['Boolean']['input']>
  revokedAt?: InputMaybe<Scalars['BigInt']['input']>
  revokedAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  revokedAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  revokedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  revokedAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  revokedAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  revokedAt_not?: InputMaybe<Scalars['BigInt']['input']>
  revokedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  revokedBy?: InputMaybe<Scalars['Bytes']['input']>
  revokedBy_contains?: InputMaybe<Scalars['Bytes']['input']>
  revokedBy_gt?: InputMaybe<Scalars['Bytes']['input']>
  revokedBy_gte?: InputMaybe<Scalars['Bytes']['input']>
  revokedBy_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  revokedBy_lt?: InputMaybe<Scalars['Bytes']['input']>
  revokedBy_lte?: InputMaybe<Scalars['Bytes']['input']>
  revokedBy_not?: InputMaybe<Scalars['Bytes']['input']>
  revokedBy_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  revokedBy_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  revokedTxHash?: InputMaybe<Scalars['Bytes']['input']>
  revokedTxHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  revokedTxHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  revokedTxHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  revokedTxHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  revokedTxHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  revokedTxHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  revokedTxHash_not?: InputMaybe<Scalars['Bytes']['input']>
  revokedTxHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  revokedTxHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  revoked_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  revoked_not?: InputMaybe<Scalars['Boolean']['input']>
  revoked_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  token?: InputMaybe<Scalars['Bytes']['input']>
  tokenId?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_gt?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_gte?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  tokenId_lt?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_lte?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_not?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  tokenType?: InputMaybe<Scalars['Int']['input']>
  tokenType_gt?: InputMaybe<Scalars['Int']['input']>
  tokenType_gte?: InputMaybe<Scalars['Int']['input']>
  tokenType_in?: InputMaybe<Array<Scalars['Int']['input']>>
  tokenType_lt?: InputMaybe<Scalars['Int']['input']>
  tokenType_lte?: InputMaybe<Scalars['Int']['input']>
  tokenType_not?: InputMaybe<Scalars['Int']['input']>
  tokenType_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  token_contains?: InputMaybe<Scalars['Bytes']['input']>
  token_gt?: InputMaybe<Scalars['Bytes']['input']>
  token_gte?: InputMaybe<Scalars['Bytes']['input']>
  token_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  token_lt?: InputMaybe<Scalars['Bytes']['input']>
  token_lte?: InputMaybe<Scalars['Bytes']['input']>
  token_not?: InputMaybe<Scalars['Bytes']['input']>
  token_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  token_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
}

export enum TreasuryAssetPin_OrderBy {
  Creator = 'creator',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  IsCollection = 'isCollection',
  Revoked = 'revoked',
  RevokedAt = 'revokedAt',
  RevokedBy = 'revokedBy',
  RevokedTxHash = 'revokedTxHash',
  Timestamp = 'timestamp',
  Token = 'token',
  TokenId = 'tokenId',
  TokenType = 'tokenType',
  TransactionHash = 'transactionHash',
}

export type ZoraCoin = {
  __typename?: 'ZoraCoin'
  caller: Scalars['Bytes']['output']
  clankerToken?: Maybe<ClankerToken>
  coinAddress: Scalars['Bytes']['output']
  createdAt: Scalars['BigInt']['output']
  createdAtBlock: Scalars['BigInt']['output']
  currency: Scalars['Bytes']['output']
  dao?: Maybe<Dao>
  holders: Array<ZoraCoinHolder>
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  payoutRecipient: Scalars['Bytes']['output']
  platformReferrer: Scalars['Bytes']['output']
  poolCurrency0: Scalars['Bytes']['output']
  poolCurrency1: Scalars['Bytes']['output']
  poolFee: Scalars['BigInt']['output']
  poolHooks: Scalars['Bytes']['output']
  poolKeyHash: Scalars['Bytes']['output']
  poolTickSpacing: Scalars['Int']['output']
  swapRoute?: Maybe<SwapRoute>
  symbol: Scalars['String']['output']
  transactionHash: Scalars['Bytes']['output']
  uri: Scalars['String']['output']
  version: Scalars['String']['output']
}

export type ZoraCoinHoldersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraCoinHolder_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ZoraCoinHolder_Filter>
}

export type ZoraCoinCreatedEvent = FeedEvent & {
  __typename?: 'ZoraCoinCreatedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
  zoraCoin: ZoraCoin
}

export type ZoraCoinCreatedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<ZoraCoinCreatedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ZoraCoinCreatedEvent_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
  zoraCoin?: InputMaybe<Scalars['String']['input']>
  zoraCoin_?: InputMaybe<ZoraCoin_Filter>
  zoraCoin_contains?: InputMaybe<Scalars['String']['input']>
  zoraCoin_contains_nocase?: InputMaybe<Scalars['String']['input']>
  zoraCoin_ends_with?: InputMaybe<Scalars['String']['input']>
  zoraCoin_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  zoraCoin_gt?: InputMaybe<Scalars['String']['input']>
  zoraCoin_gte?: InputMaybe<Scalars['String']['input']>
  zoraCoin_in?: InputMaybe<Array<Scalars['String']['input']>>
  zoraCoin_lt?: InputMaybe<Scalars['String']['input']>
  zoraCoin_lte?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not_contains?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not_ends_with?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  zoraCoin_not_starts_with?: InputMaybe<Scalars['String']['input']>
  zoraCoin_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  zoraCoin_starts_with?: InputMaybe<Scalars['String']['input']>
  zoraCoin_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
}

export enum ZoraCoinCreatedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
  ZoraCoin = 'zoraCoin',
  ZoraCoinCaller = 'zoraCoin__caller',
  ZoraCoinCoinAddress = 'zoraCoin__coinAddress',
  ZoraCoinCreatedAt = 'zoraCoin__createdAt',
  ZoraCoinCreatedAtBlock = 'zoraCoin__createdAtBlock',
  ZoraCoinCurrency = 'zoraCoin__currency',
  ZoraCoinId = 'zoraCoin__id',
  ZoraCoinName = 'zoraCoin__name',
  ZoraCoinPayoutRecipient = 'zoraCoin__payoutRecipient',
  ZoraCoinPlatformReferrer = 'zoraCoin__platformReferrer',
  ZoraCoinPoolCurrency0 = 'zoraCoin__poolCurrency0',
  ZoraCoinPoolCurrency1 = 'zoraCoin__poolCurrency1',
  ZoraCoinPoolFee = 'zoraCoin__poolFee',
  ZoraCoinPoolHooks = 'zoraCoin__poolHooks',
  ZoraCoinPoolKeyHash = 'zoraCoin__poolKeyHash',
  ZoraCoinPoolTickSpacing = 'zoraCoin__poolTickSpacing',
  ZoraCoinSymbol = 'zoraCoin__symbol',
  ZoraCoinTransactionHash = 'zoraCoin__transactionHash',
  ZoraCoinUri = 'zoraCoin__uri',
  ZoraCoinVersion = 'zoraCoin__version',
}

export type ZoraCoinHolder = {
  __typename?: 'ZoraCoinHolder'
  balance: Scalars['BigInt']['output']
  coin: ZoraCoin
  holder: Scalars['Bytes']['output']
  id: Scalars['ID']['output']
  updatedAt: Scalars['BigInt']['output']
  updatedAtBlock: Scalars['BigInt']['output']
}

export type ZoraCoinHolder_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<ZoraCoinHolder_Filter>>>
  balance?: InputMaybe<Scalars['BigInt']['input']>
  balance_gt?: InputMaybe<Scalars['BigInt']['input']>
  balance_gte?: InputMaybe<Scalars['BigInt']['input']>
  balance_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  balance_lt?: InputMaybe<Scalars['BigInt']['input']>
  balance_lte?: InputMaybe<Scalars['BigInt']['input']>
  balance_not?: InputMaybe<Scalars['BigInt']['input']>
  balance_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  coin?: InputMaybe<Scalars['String']['input']>
  coin_?: InputMaybe<ZoraCoin_Filter>
  coin_contains?: InputMaybe<Scalars['String']['input']>
  coin_contains_nocase?: InputMaybe<Scalars['String']['input']>
  coin_ends_with?: InputMaybe<Scalars['String']['input']>
  coin_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  coin_gt?: InputMaybe<Scalars['String']['input']>
  coin_gte?: InputMaybe<Scalars['String']['input']>
  coin_in?: InputMaybe<Array<Scalars['String']['input']>>
  coin_lt?: InputMaybe<Scalars['String']['input']>
  coin_lte?: InputMaybe<Scalars['String']['input']>
  coin_not?: InputMaybe<Scalars['String']['input']>
  coin_not_contains?: InputMaybe<Scalars['String']['input']>
  coin_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  coin_not_ends_with?: InputMaybe<Scalars['String']['input']>
  coin_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  coin_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  coin_not_starts_with?: InputMaybe<Scalars['String']['input']>
  coin_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  coin_starts_with?: InputMaybe<Scalars['String']['input']>
  coin_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  holder?: InputMaybe<Scalars['Bytes']['input']>
  holder_contains?: InputMaybe<Scalars['Bytes']['input']>
  holder_gt?: InputMaybe<Scalars['Bytes']['input']>
  holder_gte?: InputMaybe<Scalars['Bytes']['input']>
  holder_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  holder_lt?: InputMaybe<Scalars['Bytes']['input']>
  holder_lte?: InputMaybe<Scalars['Bytes']['input']>
  holder_not?: InputMaybe<Scalars['Bytes']['input']>
  holder_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  holder_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ZoraCoinHolder_Filter>>>
  updatedAt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_gt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_gte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updatedAtBlock_lt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_lte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_not?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updatedAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updatedAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_not?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
}

export enum ZoraCoinHolder_OrderBy {
  Balance = 'balance',
  Coin = 'coin',
  CoinCaller = 'coin__caller',
  CoinCoinAddress = 'coin__coinAddress',
  CoinCreatedAt = 'coin__createdAt',
  CoinCreatedAtBlock = 'coin__createdAtBlock',
  CoinCurrency = 'coin__currency',
  CoinId = 'coin__id',
  CoinName = 'coin__name',
  CoinPayoutRecipient = 'coin__payoutRecipient',
  CoinPlatformReferrer = 'coin__platformReferrer',
  CoinPoolCurrency0 = 'coin__poolCurrency0',
  CoinPoolCurrency1 = 'coin__poolCurrency1',
  CoinPoolFee = 'coin__poolFee',
  CoinPoolHooks = 'coin__poolHooks',
  CoinPoolKeyHash = 'coin__poolKeyHash',
  CoinPoolTickSpacing = 'coin__poolTickSpacing',
  CoinSymbol = 'coin__symbol',
  CoinTransactionHash = 'coin__transactionHash',
  CoinUri = 'coin__uri',
  CoinVersion = 'coin__version',
  Holder = 'holder',
  Id = 'id',
  UpdatedAt = 'updatedAt',
  UpdatedAtBlock = 'updatedAtBlock',
}

export type ZoraCoin_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<ZoraCoin_Filter>>>
  caller?: InputMaybe<Scalars['Bytes']['input']>
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>
  caller_not?: InputMaybe<Scalars['Bytes']['input']>
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  clankerToken?: InputMaybe<Scalars['String']['input']>
  clankerToken_?: InputMaybe<ClankerToken_Filter>
  clankerToken_contains?: InputMaybe<Scalars['String']['input']>
  clankerToken_contains_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_ends_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_gt?: InputMaybe<Scalars['String']['input']>
  clankerToken_gte?: InputMaybe<Scalars['String']['input']>
  clankerToken_in?: InputMaybe<Array<Scalars['String']['input']>>
  clankerToken_lt?: InputMaybe<Scalars['String']['input']>
  clankerToken_lte?: InputMaybe<Scalars['String']['input']>
  clankerToken_not?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_contains?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_ends_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  clankerToken_not_starts_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  clankerToken_starts_with?: InputMaybe<Scalars['String']['input']>
  clankerToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  coinAddress?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_contains?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_gt?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_gte?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  coinAddress_lt?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_lte?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_not?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  coinAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  createdAt?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_gt?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_gte?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAtBlock_lt?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_lte?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_not?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  currency?: InputMaybe<Scalars['Bytes']['input']>
  currency_contains?: InputMaybe<Scalars['Bytes']['input']>
  currency_gt?: InputMaybe<Scalars['Bytes']['input']>
  currency_gte?: InputMaybe<Scalars['Bytes']['input']>
  currency_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  currency_lt?: InputMaybe<Scalars['Bytes']['input']>
  currency_lte?: InputMaybe<Scalars['Bytes']['input']>
  currency_not?: InputMaybe<Scalars['Bytes']['input']>
  currency_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  currency_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  holders_?: InputMaybe<ZoraCoinHolder_Filter>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  name?: InputMaybe<Scalars['String']['input']>
  name_contains?: InputMaybe<Scalars['String']['input']>
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>
  name_ends_with?: InputMaybe<Scalars['String']['input']>
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_gt?: InputMaybe<Scalars['String']['input']>
  name_gte?: InputMaybe<Scalars['String']['input']>
  name_in?: InputMaybe<Array<Scalars['String']['input']>>
  name_lt?: InputMaybe<Scalars['String']['input']>
  name_lte?: InputMaybe<Scalars['String']['input']>
  name_not?: InputMaybe<Scalars['String']['input']>
  name_not_contains?: InputMaybe<Scalars['String']['input']>
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_starts_with?: InputMaybe<Scalars['String']['input']>
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  or?: InputMaybe<Array<InputMaybe<ZoraCoin_Filter>>>
  payoutRecipient?: InputMaybe<Scalars['Bytes']['input']>
  payoutRecipient_contains?: InputMaybe<Scalars['Bytes']['input']>
  payoutRecipient_gt?: InputMaybe<Scalars['Bytes']['input']>
  payoutRecipient_gte?: InputMaybe<Scalars['Bytes']['input']>
  payoutRecipient_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  payoutRecipient_lt?: InputMaybe<Scalars['Bytes']['input']>
  payoutRecipient_lte?: InputMaybe<Scalars['Bytes']['input']>
  payoutRecipient_not?: InputMaybe<Scalars['Bytes']['input']>
  payoutRecipient_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  payoutRecipient_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  platformReferrer?: InputMaybe<Scalars['Bytes']['input']>
  platformReferrer_contains?: InputMaybe<Scalars['Bytes']['input']>
  platformReferrer_gt?: InputMaybe<Scalars['Bytes']['input']>
  platformReferrer_gte?: InputMaybe<Scalars['Bytes']['input']>
  platformReferrer_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  platformReferrer_lt?: InputMaybe<Scalars['Bytes']['input']>
  platformReferrer_lte?: InputMaybe<Scalars['Bytes']['input']>
  platformReferrer_not?: InputMaybe<Scalars['Bytes']['input']>
  platformReferrer_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  platformReferrer_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolCurrency0?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency0_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency0_gt?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency0_gte?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency0_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolCurrency0_lt?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency0_lte?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency0_not?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency0_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency0_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolCurrency1?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency1_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency1_gt?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency1_gte?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency1_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolCurrency1_lt?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency1_lte?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency1_not?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency1_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolCurrency1_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolFee?: InputMaybe<Scalars['BigInt']['input']>
  poolFee_gt?: InputMaybe<Scalars['BigInt']['input']>
  poolFee_gte?: InputMaybe<Scalars['BigInt']['input']>
  poolFee_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  poolFee_lt?: InputMaybe<Scalars['BigInt']['input']>
  poolFee_lte?: InputMaybe<Scalars['BigInt']['input']>
  poolFee_not?: InputMaybe<Scalars['BigInt']['input']>
  poolFee_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  poolHooks?: InputMaybe<Scalars['Bytes']['input']>
  poolHooks_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolHooks_gt?: InputMaybe<Scalars['Bytes']['input']>
  poolHooks_gte?: InputMaybe<Scalars['Bytes']['input']>
  poolHooks_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolHooks_lt?: InputMaybe<Scalars['Bytes']['input']>
  poolHooks_lte?: InputMaybe<Scalars['Bytes']['input']>
  poolHooks_not?: InputMaybe<Scalars['Bytes']['input']>
  poolHooks_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolHooks_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolKeyHash?: InputMaybe<Scalars['Bytes']['input']>
  poolKeyHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolKeyHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  poolKeyHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  poolKeyHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolKeyHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  poolKeyHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  poolKeyHash_not?: InputMaybe<Scalars['Bytes']['input']>
  poolKeyHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  poolKeyHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  poolTickSpacing?: InputMaybe<Scalars['Int']['input']>
  poolTickSpacing_gt?: InputMaybe<Scalars['Int']['input']>
  poolTickSpacing_gte?: InputMaybe<Scalars['Int']['input']>
  poolTickSpacing_in?: InputMaybe<Array<Scalars['Int']['input']>>
  poolTickSpacing_lt?: InputMaybe<Scalars['Int']['input']>
  poolTickSpacing_lte?: InputMaybe<Scalars['Int']['input']>
  poolTickSpacing_not?: InputMaybe<Scalars['Int']['input']>
  poolTickSpacing_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  swapRoute_?: InputMaybe<SwapRoute_Filter>
  symbol?: InputMaybe<Scalars['String']['input']>
  symbol_contains?: InputMaybe<Scalars['String']['input']>
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_gt?: InputMaybe<Scalars['String']['input']>
  symbol_gte?: InputMaybe<Scalars['String']['input']>
  symbol_in?: InputMaybe<Array<Scalars['String']['input']>>
  symbol_lt?: InputMaybe<Scalars['String']['input']>
  symbol_lte?: InputMaybe<Scalars['String']['input']>
  symbol_not?: InputMaybe<Scalars['String']['input']>
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  uri?: InputMaybe<Scalars['String']['input']>
  uri_contains?: InputMaybe<Scalars['String']['input']>
  uri_contains_nocase?: InputMaybe<Scalars['String']['input']>
  uri_ends_with?: InputMaybe<Scalars['String']['input']>
  uri_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  uri_gt?: InputMaybe<Scalars['String']['input']>
  uri_gte?: InputMaybe<Scalars['String']['input']>
  uri_in?: InputMaybe<Array<Scalars['String']['input']>>
  uri_lt?: InputMaybe<Scalars['String']['input']>
  uri_lte?: InputMaybe<Scalars['String']['input']>
  uri_not?: InputMaybe<Scalars['String']['input']>
  uri_not_contains?: InputMaybe<Scalars['String']['input']>
  uri_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  uri_not_ends_with?: InputMaybe<Scalars['String']['input']>
  uri_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  uri_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  uri_not_starts_with?: InputMaybe<Scalars['String']['input']>
  uri_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  uri_starts_with?: InputMaybe<Scalars['String']['input']>
  uri_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  version?: InputMaybe<Scalars['String']['input']>
  version_contains?: InputMaybe<Scalars['String']['input']>
  version_contains_nocase?: InputMaybe<Scalars['String']['input']>
  version_ends_with?: InputMaybe<Scalars['String']['input']>
  version_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  version_gt?: InputMaybe<Scalars['String']['input']>
  version_gte?: InputMaybe<Scalars['String']['input']>
  version_in?: InputMaybe<Array<Scalars['String']['input']>>
  version_lt?: InputMaybe<Scalars['String']['input']>
  version_lte?: InputMaybe<Scalars['String']['input']>
  version_not?: InputMaybe<Scalars['String']['input']>
  version_not_contains?: InputMaybe<Scalars['String']['input']>
  version_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  version_not_ends_with?: InputMaybe<Scalars['String']['input']>
  version_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  version_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  version_not_starts_with?: InputMaybe<Scalars['String']['input']>
  version_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  version_starts_with?: InputMaybe<Scalars['String']['input']>
  version_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
}

export enum ZoraCoin_OrderBy {
  Caller = 'caller',
  ClankerToken = 'clankerToken',
  ClankerTokenAdminChangedAt = 'clankerToken__adminChangedAt',
  ClankerTokenCreatedAt = 'clankerToken__createdAt',
  ClankerTokenCreatedAtBlock = 'clankerToken__createdAtBlock',
  ClankerTokenExtensionsSupply = 'clankerToken__extensionsSupply',
  ClankerTokenId = 'clankerToken__id',
  ClankerTokenIsTrusted = 'clankerToken__isTrusted',
  ClankerTokenLocker = 'clankerToken__locker',
  ClankerTokenMevModule = 'clankerToken__mevModule',
  ClankerTokenMsgSender = 'clankerToken__msgSender',
  ClankerTokenPairedToken = 'clankerToken__pairedToken',
  ClankerTokenPoolHook = 'clankerToken__poolHook',
  ClankerTokenPoolId = 'clankerToken__poolId',
  ClankerTokenStartingTick = 'clankerToken__startingTick',
  ClankerTokenTokenAddress = 'clankerToken__tokenAddress',
  ClankerTokenTokenAdmin = 'clankerToken__tokenAdmin',
  ClankerTokenTokenContext = 'clankerToken__tokenContext',
  ClankerTokenTokenImage = 'clankerToken__tokenImage',
  ClankerTokenTokenMetadata = 'clankerToken__tokenMetadata',
  ClankerTokenTokenName = 'clankerToken__tokenName',
  ClankerTokenTokenSymbol = 'clankerToken__tokenSymbol',
  ClankerTokenTransactionHash = 'clankerToken__transactionHash',
  CoinAddress = 'coinAddress',
  CreatedAt = 'createdAt',
  CreatedAtBlock = 'createdAtBlock',
  Currency = 'currency',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Holders = 'holders',
  Id = 'id',
  Name = 'name',
  PayoutRecipient = 'payoutRecipient',
  PlatformReferrer = 'platformReferrer',
  PoolCurrency0 = 'poolCurrency0',
  PoolCurrency1 = 'poolCurrency1',
  PoolFee = 'poolFee',
  PoolHooks = 'poolHooks',
  PoolKeyHash = 'poolKeyHash',
  PoolTickSpacing = 'poolTickSpacing',
  SwapRoute = 'swapRoute',
  SwapRouteCoinAddress = 'swapRoute__coinAddress',
  SwapRouteCreatedAt = 'swapRoute__createdAt',
  SwapRouteId = 'swapRoute__id',
  SwapRouteUpdatedAt = 'swapRoute__updatedAt',
  Symbol = 'symbol',
  TransactionHash = 'transactionHash',
  Uri = 'uri',
  Version = 'version',
}

export type ZoraDrop = {
  __typename?: 'ZoraDrop'
  animationURI: Scalars['String']['output']
  createdAt: Scalars['BigInt']['output']
  createdAtBlock: Scalars['BigInt']['output']
  creator: Scalars['Bytes']['output']
  dao?: Maybe<Dao>
  description: Scalars['String']['output']
  editionSize: Scalars['BigInt']['output']
  fundsRecipient: Scalars['Bytes']['output']
  holders: Array<ZoraDropHolder>
  id: Scalars['ID']['output']
  imageURI: Scalars['String']['output']
  maxSalePurchasePerAddress: Scalars['BigInt']['output']
  metadataRenderer: Scalars['Bytes']['output']
  mintComments: Array<ZoraDropMintComment>
  name: Scalars['String']['output']
  presaleEnd: Scalars['BigInt']['output']
  presaleMerkleRoot: Scalars['Bytes']['output']
  presaleStart: Scalars['BigInt']['output']
  publicSaleEnd: Scalars['BigInt']['output']
  publicSalePrice: Scalars['BigInt']['output']
  publicSaleStart: Scalars['BigInt']['output']
  royaltyBPS: Scalars['Int']['output']
  symbol: Scalars['String']['output']
  totalSalesAmount: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
}

export type ZoraDropHoldersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraDropHolder_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ZoraDropHolder_Filter>
}

export type ZoraDropMintCommentsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraDropMintComment_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ZoraDropMintComment_Filter>
}

export type ZoraDropCreatedEvent = FeedEvent & {
  __typename?: 'ZoraDropCreatedEvent'
  actor: Scalars['Bytes']['output']
  blockNumber: Scalars['BigInt']['output']
  dao: Dao
  id: Scalars['ID']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
  type: FeedEventType
  zoraDrop: ZoraDrop
}

export type ZoraDropCreatedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  actor?: InputMaybe<Scalars['Bytes']['input']>
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>
  actor_not?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  and?: InputMaybe<Array<InputMaybe<ZoraDropCreatedEvent_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ZoraDropCreatedEvent_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  type?: InputMaybe<FeedEventType>
  type_in?: InputMaybe<Array<FeedEventType>>
  type_not?: InputMaybe<FeedEventType>
  type_not_in?: InputMaybe<Array<FeedEventType>>
  zoraDrop?: InputMaybe<Scalars['String']['input']>
  zoraDrop_?: InputMaybe<ZoraDrop_Filter>
  zoraDrop_contains?: InputMaybe<Scalars['String']['input']>
  zoraDrop_contains_nocase?: InputMaybe<Scalars['String']['input']>
  zoraDrop_ends_with?: InputMaybe<Scalars['String']['input']>
  zoraDrop_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  zoraDrop_gt?: InputMaybe<Scalars['String']['input']>
  zoraDrop_gte?: InputMaybe<Scalars['String']['input']>
  zoraDrop_in?: InputMaybe<Array<Scalars['String']['input']>>
  zoraDrop_lt?: InputMaybe<Scalars['String']['input']>
  zoraDrop_lte?: InputMaybe<Scalars['String']['input']>
  zoraDrop_not?: InputMaybe<Scalars['String']['input']>
  zoraDrop_not_contains?: InputMaybe<Scalars['String']['input']>
  zoraDrop_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  zoraDrop_not_ends_with?: InputMaybe<Scalars['String']['input']>
  zoraDrop_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  zoraDrop_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  zoraDrop_not_starts_with?: InputMaybe<Scalars['String']['input']>
  zoraDrop_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  zoraDrop_starts_with?: InputMaybe<Scalars['String']['input']>
  zoraDrop_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
}

export enum ZoraDropCreatedEvent_OrderBy {
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Type = 'type',
  ZoraDrop = 'zoraDrop',
  ZoraDropAnimationUri = 'zoraDrop__animationURI',
  ZoraDropCreatedAt = 'zoraDrop__createdAt',
  ZoraDropCreatedAtBlock = 'zoraDrop__createdAtBlock',
  ZoraDropCreator = 'zoraDrop__creator',
  ZoraDropDescription = 'zoraDrop__description',
  ZoraDropEditionSize = 'zoraDrop__editionSize',
  ZoraDropFundsRecipient = 'zoraDrop__fundsRecipient',
  ZoraDropId = 'zoraDrop__id',
  ZoraDropImageUri = 'zoraDrop__imageURI',
  ZoraDropMaxSalePurchasePerAddress = 'zoraDrop__maxSalePurchasePerAddress',
  ZoraDropMetadataRenderer = 'zoraDrop__metadataRenderer',
  ZoraDropName = 'zoraDrop__name',
  ZoraDropPresaleEnd = 'zoraDrop__presaleEnd',
  ZoraDropPresaleMerkleRoot = 'zoraDrop__presaleMerkleRoot',
  ZoraDropPresaleStart = 'zoraDrop__presaleStart',
  ZoraDropPublicSaleEnd = 'zoraDrop__publicSaleEnd',
  ZoraDropPublicSalePrice = 'zoraDrop__publicSalePrice',
  ZoraDropPublicSaleStart = 'zoraDrop__publicSaleStart',
  ZoraDropRoyaltyBps = 'zoraDrop__royaltyBPS',
  ZoraDropSymbol = 'zoraDrop__symbol',
  ZoraDropTotalSalesAmount = 'zoraDrop__totalSalesAmount',
  ZoraDropTransactionHash = 'zoraDrop__transactionHash',
}

export type ZoraDropHolder = {
  __typename?: 'ZoraDropHolder'
  balance: Scalars['BigInt']['output']
  drop: ZoraDrop
  holder: Scalars['Bytes']['output']
  id: Scalars['ID']['output']
  totalPurchased: Scalars['BigInt']['output']
  totalSpent: Scalars['BigInt']['output']
  updatedAt: Scalars['BigInt']['output']
  updatedAtBlock: Scalars['BigInt']['output']
}

export type ZoraDropHolder_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<ZoraDropHolder_Filter>>>
  balance?: InputMaybe<Scalars['BigInt']['input']>
  balance_gt?: InputMaybe<Scalars['BigInt']['input']>
  balance_gte?: InputMaybe<Scalars['BigInt']['input']>
  balance_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  balance_lt?: InputMaybe<Scalars['BigInt']['input']>
  balance_lte?: InputMaybe<Scalars['BigInt']['input']>
  balance_not?: InputMaybe<Scalars['BigInt']['input']>
  balance_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  drop?: InputMaybe<Scalars['String']['input']>
  drop_?: InputMaybe<ZoraDrop_Filter>
  drop_contains?: InputMaybe<Scalars['String']['input']>
  drop_contains_nocase?: InputMaybe<Scalars['String']['input']>
  drop_ends_with?: InputMaybe<Scalars['String']['input']>
  drop_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  drop_gt?: InputMaybe<Scalars['String']['input']>
  drop_gte?: InputMaybe<Scalars['String']['input']>
  drop_in?: InputMaybe<Array<Scalars['String']['input']>>
  drop_lt?: InputMaybe<Scalars['String']['input']>
  drop_lte?: InputMaybe<Scalars['String']['input']>
  drop_not?: InputMaybe<Scalars['String']['input']>
  drop_not_contains?: InputMaybe<Scalars['String']['input']>
  drop_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  drop_not_ends_with?: InputMaybe<Scalars['String']['input']>
  drop_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  drop_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  drop_not_starts_with?: InputMaybe<Scalars['String']['input']>
  drop_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  drop_starts_with?: InputMaybe<Scalars['String']['input']>
  drop_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  holder?: InputMaybe<Scalars['Bytes']['input']>
  holder_contains?: InputMaybe<Scalars['Bytes']['input']>
  holder_gt?: InputMaybe<Scalars['Bytes']['input']>
  holder_gte?: InputMaybe<Scalars['Bytes']['input']>
  holder_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  holder_lt?: InputMaybe<Scalars['Bytes']['input']>
  holder_lte?: InputMaybe<Scalars['Bytes']['input']>
  holder_not?: InputMaybe<Scalars['Bytes']['input']>
  holder_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  holder_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ZoraDropHolder_Filter>>>
  totalPurchased?: InputMaybe<Scalars['BigInt']['input']>
  totalPurchased_gt?: InputMaybe<Scalars['BigInt']['input']>
  totalPurchased_gte?: InputMaybe<Scalars['BigInt']['input']>
  totalPurchased_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  totalPurchased_lt?: InputMaybe<Scalars['BigInt']['input']>
  totalPurchased_lte?: InputMaybe<Scalars['BigInt']['input']>
  totalPurchased_not?: InputMaybe<Scalars['BigInt']['input']>
  totalPurchased_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  totalSpent?: InputMaybe<Scalars['BigInt']['input']>
  totalSpent_gt?: InputMaybe<Scalars['BigInt']['input']>
  totalSpent_gte?: InputMaybe<Scalars['BigInt']['input']>
  totalSpent_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  totalSpent_lt?: InputMaybe<Scalars['BigInt']['input']>
  totalSpent_lte?: InputMaybe<Scalars['BigInt']['input']>
  totalSpent_not?: InputMaybe<Scalars['BigInt']['input']>
  totalSpent_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updatedAt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_gt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_gte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updatedAtBlock_lt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_lte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_not?: InputMaybe<Scalars['BigInt']['input']>
  updatedAtBlock_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updatedAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  updatedAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_not?: InputMaybe<Scalars['BigInt']['input']>
  updatedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
}

export enum ZoraDropHolder_OrderBy {
  Balance = 'balance',
  Drop = 'drop',
  DropAnimationUri = 'drop__animationURI',
  DropCreatedAt = 'drop__createdAt',
  DropCreatedAtBlock = 'drop__createdAtBlock',
  DropCreator = 'drop__creator',
  DropDescription = 'drop__description',
  DropEditionSize = 'drop__editionSize',
  DropFundsRecipient = 'drop__fundsRecipient',
  DropId = 'drop__id',
  DropImageUri = 'drop__imageURI',
  DropMaxSalePurchasePerAddress = 'drop__maxSalePurchasePerAddress',
  DropMetadataRenderer = 'drop__metadataRenderer',
  DropName = 'drop__name',
  DropPresaleEnd = 'drop__presaleEnd',
  DropPresaleMerkleRoot = 'drop__presaleMerkleRoot',
  DropPresaleStart = 'drop__presaleStart',
  DropPublicSaleEnd = 'drop__publicSaleEnd',
  DropPublicSalePrice = 'drop__publicSalePrice',
  DropPublicSaleStart = 'drop__publicSaleStart',
  DropRoyaltyBps = 'drop__royaltyBPS',
  DropSymbol = 'drop__symbol',
  DropTotalSalesAmount = 'drop__totalSalesAmount',
  DropTransactionHash = 'drop__transactionHash',
  Holder = 'holder',
  Id = 'id',
  TotalPurchased = 'totalPurchased',
  TotalSpent = 'totalSpent',
  UpdatedAt = 'updatedAt',
  UpdatedAtBlock = 'updatedAtBlock',
}

export type ZoraDropMintComment = {
  __typename?: 'ZoraDropMintComment'
  blockNumber: Scalars['BigInt']['output']
  comment: Scalars['String']['output']
  drop: ZoraDrop
  id: Scalars['ID']['output']
  quantity: Scalars['BigInt']['output']
  sender: Scalars['Bytes']['output']
  timestamp: Scalars['BigInt']['output']
  tokenId: Scalars['BigInt']['output']
  transactionHash: Scalars['Bytes']['output']
}

export type ZoraDropMintComment_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<ZoraDropMintComment_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  comment?: InputMaybe<Scalars['String']['input']>
  comment_contains?: InputMaybe<Scalars['String']['input']>
  comment_contains_nocase?: InputMaybe<Scalars['String']['input']>
  comment_ends_with?: InputMaybe<Scalars['String']['input']>
  comment_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  comment_gt?: InputMaybe<Scalars['String']['input']>
  comment_gte?: InputMaybe<Scalars['String']['input']>
  comment_in?: InputMaybe<Array<Scalars['String']['input']>>
  comment_lt?: InputMaybe<Scalars['String']['input']>
  comment_lte?: InputMaybe<Scalars['String']['input']>
  comment_not?: InputMaybe<Scalars['String']['input']>
  comment_not_contains?: InputMaybe<Scalars['String']['input']>
  comment_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  comment_not_ends_with?: InputMaybe<Scalars['String']['input']>
  comment_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  comment_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  comment_not_starts_with?: InputMaybe<Scalars['String']['input']>
  comment_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  comment_starts_with?: InputMaybe<Scalars['String']['input']>
  comment_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  drop?: InputMaybe<Scalars['String']['input']>
  drop_?: InputMaybe<ZoraDrop_Filter>
  drop_contains?: InputMaybe<Scalars['String']['input']>
  drop_contains_nocase?: InputMaybe<Scalars['String']['input']>
  drop_ends_with?: InputMaybe<Scalars['String']['input']>
  drop_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  drop_gt?: InputMaybe<Scalars['String']['input']>
  drop_gte?: InputMaybe<Scalars['String']['input']>
  drop_in?: InputMaybe<Array<Scalars['String']['input']>>
  drop_lt?: InputMaybe<Scalars['String']['input']>
  drop_lte?: InputMaybe<Scalars['String']['input']>
  drop_not?: InputMaybe<Scalars['String']['input']>
  drop_not_contains?: InputMaybe<Scalars['String']['input']>
  drop_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  drop_not_ends_with?: InputMaybe<Scalars['String']['input']>
  drop_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  drop_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  drop_not_starts_with?: InputMaybe<Scalars['String']['input']>
  drop_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  drop_starts_with?: InputMaybe<Scalars['String']['input']>
  drop_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  or?: InputMaybe<Array<InputMaybe<ZoraDropMintComment_Filter>>>
  quantity?: InputMaybe<Scalars['BigInt']['input']>
  quantity_gt?: InputMaybe<Scalars['BigInt']['input']>
  quantity_gte?: InputMaybe<Scalars['BigInt']['input']>
  quantity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  quantity_lt?: InputMaybe<Scalars['BigInt']['input']>
  quantity_lte?: InputMaybe<Scalars['BigInt']['input']>
  quantity_not?: InputMaybe<Scalars['BigInt']['input']>
  quantity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  sender?: InputMaybe<Scalars['Bytes']['input']>
  sender_contains?: InputMaybe<Scalars['Bytes']['input']>
  sender_gt?: InputMaybe<Scalars['Bytes']['input']>
  sender_gte?: InputMaybe<Scalars['Bytes']['input']>
  sender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  sender_lt?: InputMaybe<Scalars['Bytes']['input']>
  sender_lte?: InputMaybe<Scalars['Bytes']['input']>
  sender_not?: InputMaybe<Scalars['Bytes']['input']>
  sender_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  tokenId?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_gt?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_gte?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  tokenId_lt?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_lte?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_not?: InputMaybe<Scalars['BigInt']['input']>
  tokenId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
}

export enum ZoraDropMintComment_OrderBy {
  BlockNumber = 'blockNumber',
  Comment = 'comment',
  Drop = 'drop',
  DropAnimationUri = 'drop__animationURI',
  DropCreatedAt = 'drop__createdAt',
  DropCreatedAtBlock = 'drop__createdAtBlock',
  DropCreator = 'drop__creator',
  DropDescription = 'drop__description',
  DropEditionSize = 'drop__editionSize',
  DropFundsRecipient = 'drop__fundsRecipient',
  DropId = 'drop__id',
  DropImageUri = 'drop__imageURI',
  DropMaxSalePurchasePerAddress = 'drop__maxSalePurchasePerAddress',
  DropMetadataRenderer = 'drop__metadataRenderer',
  DropName = 'drop__name',
  DropPresaleEnd = 'drop__presaleEnd',
  DropPresaleMerkleRoot = 'drop__presaleMerkleRoot',
  DropPresaleStart = 'drop__presaleStart',
  DropPublicSaleEnd = 'drop__publicSaleEnd',
  DropPublicSalePrice = 'drop__publicSalePrice',
  DropPublicSaleStart = 'drop__publicSaleStart',
  DropRoyaltyBps = 'drop__royaltyBPS',
  DropSymbol = 'drop__symbol',
  DropTotalSalesAmount = 'drop__totalSalesAmount',
  DropTransactionHash = 'drop__transactionHash',
  Id = 'id',
  Quantity = 'quantity',
  Sender = 'sender',
  Timestamp = 'timestamp',
  TokenId = 'tokenId',
  TransactionHash = 'transactionHash',
}

export type ZoraDrop_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<ZoraDrop_Filter>>>
  animationURI?: InputMaybe<Scalars['String']['input']>
  animationURI_contains?: InputMaybe<Scalars['String']['input']>
  animationURI_contains_nocase?: InputMaybe<Scalars['String']['input']>
  animationURI_ends_with?: InputMaybe<Scalars['String']['input']>
  animationURI_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  animationURI_gt?: InputMaybe<Scalars['String']['input']>
  animationURI_gte?: InputMaybe<Scalars['String']['input']>
  animationURI_in?: InputMaybe<Array<Scalars['String']['input']>>
  animationURI_lt?: InputMaybe<Scalars['String']['input']>
  animationURI_lte?: InputMaybe<Scalars['String']['input']>
  animationURI_not?: InputMaybe<Scalars['String']['input']>
  animationURI_not_contains?: InputMaybe<Scalars['String']['input']>
  animationURI_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  animationURI_not_ends_with?: InputMaybe<Scalars['String']['input']>
  animationURI_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  animationURI_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  animationURI_not_starts_with?: InputMaybe<Scalars['String']['input']>
  animationURI_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  animationURI_starts_with?: InputMaybe<Scalars['String']['input']>
  animationURI_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  createdAt?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_gt?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_gte?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAtBlock_lt?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_lte?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_not?: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  creator?: InputMaybe<Scalars['Bytes']['input']>
  creator_contains?: InputMaybe<Scalars['Bytes']['input']>
  creator_gt?: InputMaybe<Scalars['Bytes']['input']>
  creator_gte?: InputMaybe<Scalars['Bytes']['input']>
  creator_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  creator_lt?: InputMaybe<Scalars['Bytes']['input']>
  creator_lte?: InputMaybe<Scalars['Bytes']['input']>
  creator_not?: InputMaybe<Scalars['Bytes']['input']>
  creator_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  creator_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  dao?: InputMaybe<Scalars['String']['input']>
  dao_?: InputMaybe<Dao_Filter>
  dao_contains?: InputMaybe<Scalars['String']['input']>
  dao_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_gt?: InputMaybe<Scalars['String']['input']>
  dao_gte?: InputMaybe<Scalars['String']['input']>
  dao_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_lt?: InputMaybe<Scalars['String']['input']>
  dao_lte?: InputMaybe<Scalars['String']['input']>
  dao_not?: InputMaybe<Scalars['String']['input']>
  dao_not_contains?: InputMaybe<Scalars['String']['input']>
  dao_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with?: InputMaybe<Scalars['String']['input']>
  dao_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  dao_not_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  dao_starts_with?: InputMaybe<Scalars['String']['input']>
  dao_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  description?: InputMaybe<Scalars['String']['input']>
  description_contains?: InputMaybe<Scalars['String']['input']>
  description_contains_nocase?: InputMaybe<Scalars['String']['input']>
  description_ends_with?: InputMaybe<Scalars['String']['input']>
  description_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_gt?: InputMaybe<Scalars['String']['input']>
  description_gte?: InputMaybe<Scalars['String']['input']>
  description_in?: InputMaybe<Array<Scalars['String']['input']>>
  description_lt?: InputMaybe<Scalars['String']['input']>
  description_lte?: InputMaybe<Scalars['String']['input']>
  description_not?: InputMaybe<Scalars['String']['input']>
  description_not_contains?: InputMaybe<Scalars['String']['input']>
  description_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  description_not_ends_with?: InputMaybe<Scalars['String']['input']>
  description_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  description_not_starts_with?: InputMaybe<Scalars['String']['input']>
  description_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  description_starts_with?: InputMaybe<Scalars['String']['input']>
  description_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  editionSize?: InputMaybe<Scalars['BigInt']['input']>
  editionSize_gt?: InputMaybe<Scalars['BigInt']['input']>
  editionSize_gte?: InputMaybe<Scalars['BigInt']['input']>
  editionSize_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  editionSize_lt?: InputMaybe<Scalars['BigInt']['input']>
  editionSize_lte?: InputMaybe<Scalars['BigInt']['input']>
  editionSize_not?: InputMaybe<Scalars['BigInt']['input']>
  editionSize_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  fundsRecipient?: InputMaybe<Scalars['Bytes']['input']>
  fundsRecipient_contains?: InputMaybe<Scalars['Bytes']['input']>
  fundsRecipient_gt?: InputMaybe<Scalars['Bytes']['input']>
  fundsRecipient_gte?: InputMaybe<Scalars['Bytes']['input']>
  fundsRecipient_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  fundsRecipient_lt?: InputMaybe<Scalars['Bytes']['input']>
  fundsRecipient_lte?: InputMaybe<Scalars['Bytes']['input']>
  fundsRecipient_not?: InputMaybe<Scalars['Bytes']['input']>
  fundsRecipient_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  fundsRecipient_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  holders_?: InputMaybe<ZoraDropHolder_Filter>
  id?: InputMaybe<Scalars['ID']['input']>
  id_gt?: InputMaybe<Scalars['ID']['input']>
  id_gte?: InputMaybe<Scalars['ID']['input']>
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>
  id_lt?: InputMaybe<Scalars['ID']['input']>
  id_lte?: InputMaybe<Scalars['ID']['input']>
  id_not?: InputMaybe<Scalars['ID']['input']>
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>
  imageURI?: InputMaybe<Scalars['String']['input']>
  imageURI_contains?: InputMaybe<Scalars['String']['input']>
  imageURI_contains_nocase?: InputMaybe<Scalars['String']['input']>
  imageURI_ends_with?: InputMaybe<Scalars['String']['input']>
  imageURI_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  imageURI_gt?: InputMaybe<Scalars['String']['input']>
  imageURI_gte?: InputMaybe<Scalars['String']['input']>
  imageURI_in?: InputMaybe<Array<Scalars['String']['input']>>
  imageURI_lt?: InputMaybe<Scalars['String']['input']>
  imageURI_lte?: InputMaybe<Scalars['String']['input']>
  imageURI_not?: InputMaybe<Scalars['String']['input']>
  imageURI_not_contains?: InputMaybe<Scalars['String']['input']>
  imageURI_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  imageURI_not_ends_with?: InputMaybe<Scalars['String']['input']>
  imageURI_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  imageURI_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  imageURI_not_starts_with?: InputMaybe<Scalars['String']['input']>
  imageURI_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  imageURI_starts_with?: InputMaybe<Scalars['String']['input']>
  imageURI_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  maxSalePurchasePerAddress?: InputMaybe<Scalars['BigInt']['input']>
  maxSalePurchasePerAddress_gt?: InputMaybe<Scalars['BigInt']['input']>
  maxSalePurchasePerAddress_gte?: InputMaybe<Scalars['BigInt']['input']>
  maxSalePurchasePerAddress_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  maxSalePurchasePerAddress_lt?: InputMaybe<Scalars['BigInt']['input']>
  maxSalePurchasePerAddress_lte?: InputMaybe<Scalars['BigInt']['input']>
  maxSalePurchasePerAddress_not?: InputMaybe<Scalars['BigInt']['input']>
  maxSalePurchasePerAddress_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  metadataRenderer?: InputMaybe<Scalars['Bytes']['input']>
  metadataRenderer_contains?: InputMaybe<Scalars['Bytes']['input']>
  metadataRenderer_gt?: InputMaybe<Scalars['Bytes']['input']>
  metadataRenderer_gte?: InputMaybe<Scalars['Bytes']['input']>
  metadataRenderer_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  metadataRenderer_lt?: InputMaybe<Scalars['Bytes']['input']>
  metadataRenderer_lte?: InputMaybe<Scalars['Bytes']['input']>
  metadataRenderer_not?: InputMaybe<Scalars['Bytes']['input']>
  metadataRenderer_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  metadataRenderer_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  mintComments_?: InputMaybe<ZoraDropMintComment_Filter>
  name?: InputMaybe<Scalars['String']['input']>
  name_contains?: InputMaybe<Scalars['String']['input']>
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>
  name_ends_with?: InputMaybe<Scalars['String']['input']>
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_gt?: InputMaybe<Scalars['String']['input']>
  name_gte?: InputMaybe<Scalars['String']['input']>
  name_in?: InputMaybe<Array<Scalars['String']['input']>>
  name_lt?: InputMaybe<Scalars['String']['input']>
  name_lte?: InputMaybe<Scalars['String']['input']>
  name_not?: InputMaybe<Scalars['String']['input']>
  name_not_contains?: InputMaybe<Scalars['String']['input']>
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  name_starts_with?: InputMaybe<Scalars['String']['input']>
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  or?: InputMaybe<Array<InputMaybe<ZoraDrop_Filter>>>
  presaleEnd?: InputMaybe<Scalars['BigInt']['input']>
  presaleEnd_gt?: InputMaybe<Scalars['BigInt']['input']>
  presaleEnd_gte?: InputMaybe<Scalars['BigInt']['input']>
  presaleEnd_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  presaleEnd_lt?: InputMaybe<Scalars['BigInt']['input']>
  presaleEnd_lte?: InputMaybe<Scalars['BigInt']['input']>
  presaleEnd_not?: InputMaybe<Scalars['BigInt']['input']>
  presaleEnd_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  presaleMerkleRoot?: InputMaybe<Scalars['Bytes']['input']>
  presaleMerkleRoot_contains?: InputMaybe<Scalars['Bytes']['input']>
  presaleMerkleRoot_gt?: InputMaybe<Scalars['Bytes']['input']>
  presaleMerkleRoot_gte?: InputMaybe<Scalars['Bytes']['input']>
  presaleMerkleRoot_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  presaleMerkleRoot_lt?: InputMaybe<Scalars['Bytes']['input']>
  presaleMerkleRoot_lte?: InputMaybe<Scalars['Bytes']['input']>
  presaleMerkleRoot_not?: InputMaybe<Scalars['Bytes']['input']>
  presaleMerkleRoot_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  presaleMerkleRoot_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  presaleStart?: InputMaybe<Scalars['BigInt']['input']>
  presaleStart_gt?: InputMaybe<Scalars['BigInt']['input']>
  presaleStart_gte?: InputMaybe<Scalars['BigInt']['input']>
  presaleStart_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  presaleStart_lt?: InputMaybe<Scalars['BigInt']['input']>
  presaleStart_lte?: InputMaybe<Scalars['BigInt']['input']>
  presaleStart_not?: InputMaybe<Scalars['BigInt']['input']>
  presaleStart_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  publicSaleEnd?: InputMaybe<Scalars['BigInt']['input']>
  publicSaleEnd_gt?: InputMaybe<Scalars['BigInt']['input']>
  publicSaleEnd_gte?: InputMaybe<Scalars['BigInt']['input']>
  publicSaleEnd_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  publicSaleEnd_lt?: InputMaybe<Scalars['BigInt']['input']>
  publicSaleEnd_lte?: InputMaybe<Scalars['BigInt']['input']>
  publicSaleEnd_not?: InputMaybe<Scalars['BigInt']['input']>
  publicSaleEnd_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  publicSalePrice?: InputMaybe<Scalars['BigInt']['input']>
  publicSalePrice_gt?: InputMaybe<Scalars['BigInt']['input']>
  publicSalePrice_gte?: InputMaybe<Scalars['BigInt']['input']>
  publicSalePrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  publicSalePrice_lt?: InputMaybe<Scalars['BigInt']['input']>
  publicSalePrice_lte?: InputMaybe<Scalars['BigInt']['input']>
  publicSalePrice_not?: InputMaybe<Scalars['BigInt']['input']>
  publicSalePrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  publicSaleStart?: InputMaybe<Scalars['BigInt']['input']>
  publicSaleStart_gt?: InputMaybe<Scalars['BigInt']['input']>
  publicSaleStart_gte?: InputMaybe<Scalars['BigInt']['input']>
  publicSaleStart_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  publicSaleStart_lt?: InputMaybe<Scalars['BigInt']['input']>
  publicSaleStart_lte?: InputMaybe<Scalars['BigInt']['input']>
  publicSaleStart_not?: InputMaybe<Scalars['BigInt']['input']>
  publicSaleStart_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  royaltyBPS?: InputMaybe<Scalars['Int']['input']>
  royaltyBPS_gt?: InputMaybe<Scalars['Int']['input']>
  royaltyBPS_gte?: InputMaybe<Scalars['Int']['input']>
  royaltyBPS_in?: InputMaybe<Array<Scalars['Int']['input']>>
  royaltyBPS_lt?: InputMaybe<Scalars['Int']['input']>
  royaltyBPS_lte?: InputMaybe<Scalars['Int']['input']>
  royaltyBPS_not?: InputMaybe<Scalars['Int']['input']>
  royaltyBPS_not_in?: InputMaybe<Array<Scalars['Int']['input']>>
  symbol?: InputMaybe<Scalars['String']['input']>
  symbol_contains?: InputMaybe<Scalars['String']['input']>
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_gt?: InputMaybe<Scalars['String']['input']>
  symbol_gte?: InputMaybe<Scalars['String']['input']>
  symbol_in?: InputMaybe<Array<Scalars['String']['input']>>
  symbol_lt?: InputMaybe<Scalars['String']['input']>
  symbol_lte?: InputMaybe<Scalars['String']['input']>
  symbol_not?: InputMaybe<Scalars['String']['input']>
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>
  totalSalesAmount?: InputMaybe<Scalars['BigInt']['input']>
  totalSalesAmount_gt?: InputMaybe<Scalars['BigInt']['input']>
  totalSalesAmount_gte?: InputMaybe<Scalars['BigInt']['input']>
  totalSalesAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  totalSalesAmount_lt?: InputMaybe<Scalars['BigInt']['input']>
  totalSalesAmount_lte?: InputMaybe<Scalars['BigInt']['input']>
  totalSalesAmount_not?: InputMaybe<Scalars['BigInt']['input']>
  totalSalesAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>
}

export enum ZoraDrop_OrderBy {
  AnimationUri = 'animationURI',
  CreatedAt = 'createdAt',
  CreatedAtBlock = 'createdAtBlock',
  Creator = 'creator',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoCandidateCount = 'dao__candidateCount',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
  DaoMetadata = 'dao__metadata',
  DaoMetadataAddress = 'dao__metadataAddress',
  DaoName = 'dao__name',
  DaoOwnerCount = 'dao__ownerCount',
  DaoProjectUri = 'dao__projectURI',
  DaoProposalCount = 'dao__proposalCount',
  DaoSymbol = 'dao__symbol',
  DaoTokenAddress = 'dao__tokenAddress',
  DaoTokensCount = 'dao__tokensCount',
  DaoTotalAuctionSales = 'dao__totalAuctionSales',
  DaoTotalSupply = 'dao__totalSupply',
  DaoTreasuryAddress = 'dao__treasuryAddress',
  DaoVoterCount = 'dao__voterCount',
  Description = 'description',
  EditionSize = 'editionSize',
  FundsRecipient = 'fundsRecipient',
  Holders = 'holders',
  Id = 'id',
  ImageUri = 'imageURI',
  MaxSalePurchasePerAddress = 'maxSalePurchasePerAddress',
  MetadataRenderer = 'metadataRenderer',
  MintComments = 'mintComments',
  Name = 'name',
  PresaleEnd = 'presaleEnd',
  PresaleMerkleRoot = 'presaleMerkleRoot',
  PresaleStart = 'presaleStart',
  PublicSaleEnd = 'publicSaleEnd',
  PublicSalePrice = 'publicSalePrice',
  PublicSaleStart = 'publicSaleStart',
  RoyaltyBps = 'royaltyBPS',
  Symbol = 'symbol',
  TotalSalesAmount = 'totalSalesAmount',
  TransactionHash = 'transactionHash',
}

export type _Block_ = {
  __typename?: '_Block_'
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>
  /** The block number */
  number: Scalars['Int']['output']
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']['output']>
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>
}

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_'
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   */
  block: _Block_
  /** The deployment ID */
  deployment: Scalars['String']['output']
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output']
}

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny',
}

export type AuctionFragment = {
  __typename?: 'Auction'
  dao: { __typename?: 'DAO'; name: string; auctionAddress: any; tokenAddress: any }
}

export type AuctionBidFragment = {
  __typename?: 'AuctionBid'
  id: string
  amount: any
  bidder: any
  comment?: string | null
}

export type ClankerTokenFragment = {
  __typename?: 'ClankerToken'
  pairedToken: any
  poolId: any
  poolHook: any
  createdAt: any
  transactionHash: any
  msgSender: any
  tokenAddress: any
  tokenName: string
  tokenSymbol: string
  tokenImage: string
  dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
}

export type ClankerTokenCardFragment = {
  __typename?: 'ClankerToken'
  tokenAddress: any
  tokenName: string
  tokenSymbol: string
  tokenImage: string
}

export type ClankerTokenHolderFragment = {
  __typename?: 'ClankerTokenHolder'
  id: string
  holder: any
  balance: any
  updatedAt: any
  updatedAtBlock: any
  token: {
    __typename?: 'ClankerToken'
    tokenAddress: any
    tokenName: string
    tokenSymbol: string
    tokenImage: string
  }
}

export type ClankerTokenWithHoldersFragment = {
  __typename?: 'ClankerToken'
  pairedToken: any
  poolId: any
  poolHook: any
  createdAt: any
  transactionHash: any
  msgSender: any
  tokenAddress: any
  tokenName: string
  tokenSymbol: string
  tokenImage: string
  holders: Array<{
    __typename?: 'ClankerTokenHolder'
    id: string
    holder: any
    balance: any
    updatedAt: any
  }>
  dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
}

export type CurrentAuctionFragment = {
  __typename?: 'Auction'
  endTime: any
  highestBid?: { __typename?: 'AuctionBid'; amount: any; bidder: any } | null
  token: { __typename?: 'Token'; name: string; image?: string | null; tokenId: any }
}

export type DaoFragment = {
  __typename?: 'DAO'
  name: string
  contractImage: string
  tokenAddress: any
  metadataAddress: any
  treasuryAddress: any
  auctionAddress: any
  governorAddress: any
  links: Array<{ __typename?: 'DAOLink'; id: string; key: string; url: string }>
}

export type ExploreDaoFragment = {
  __typename?: 'Auction'
  endTime: any
  dao: { __typename?: 'DAO'; name: string; tokenAddress: any }
  highestBid?: { __typename?: 'AuctionBid'; amount: any; bidder: any } | null
  token: { __typename?: 'Token'; name: string; image?: string | null; tokenId: any }
}

export type PaymentOptionFragment = {
  __typename?: 'PaymentOption'
  id: string
  tokenAddress: any
  tokenType: CoinType
  tokenName: string
  tokenSymbol: string
  startHopIndex: number
  endHopIndex: number
  isDirectSwap: boolean
}

export type ProposalFragment = {
  __typename?: 'Proposal'
  abstainVotes: number
  againstVotes: number
  calldatas?: string | null
  description?: string | null
  representedAddress?: string | null
  discussionUrl?: string | null
  descriptionHash: any
  executableFrom?: any | null
  expiresAt?: any | null
  forVotes: number
  proposalId: any
  proposalNumber: number
  proposalThreshold: any
  proposer: any
  quorumVotes: any
  targets: Array<any>
  timeCreated: any
  title?: string | null
  values: Array<any>
  voteEnd: any
  voteStart: any
  snapshotBlockNumber: any
  transactionHash: any
  executedAt?: any | null
  executionTransactionHash?: any | null
  vetoTransactionHash?: any | null
  cancelTransactionHash?: any | null
  updatePeriodEnd?: any | null
  updateMessage?: string | null
  updateCount: number
  dao: { __typename?: 'DAO'; governorAddress: any; tokenAddress: any }
  candidateVersion?: {
    __typename?: 'ProposalCandidateVersion'
    candidateId: any
    computedProposalId: any
    attestationUID: any
    versionNumber: any
    proposal?: {
      __typename?: 'Proposal'
      id: string
      proposalId: any
      proposalNumber: number
    } | null
    group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
  } | null
  replaces?: { __typename?: 'Proposal'; proposalId: any; proposalNumber: number } | null
  replacedBy?: { __typename?: 'Proposal'; proposalId: any; proposalNumber: number } | null
}

export type ProposalDetailFragment = {
  __typename?: 'Proposal'
  metadata?: string | null
  abstainVotes: number
  againstVotes: number
  calldatas?: string | null
  description?: string | null
  representedAddress?: string | null
  discussionUrl?: string | null
  descriptionHash: any
  executableFrom?: any | null
  expiresAt?: any | null
  forVotes: number
  proposalId: any
  proposalNumber: number
  proposalThreshold: any
  proposer: any
  quorumVotes: any
  targets: Array<any>
  timeCreated: any
  title?: string | null
  values: Array<any>
  voteEnd: any
  voteStart: any
  snapshotBlockNumber: any
  transactionHash: any
  executedAt?: any | null
  executionTransactionHash?: any | null
  vetoTransactionHash?: any | null
  cancelTransactionHash?: any | null
  updatePeriodEnd?: any | null
  updateMessage?: string | null
  updateCount: number
  dao: { __typename?: 'DAO'; governorAddress: any; tokenAddress: any }
  candidateVersion?: {
    __typename?: 'ProposalCandidateVersion'
    candidateId: any
    computedProposalId: any
    attestationUID: any
    versionNumber: any
    proposal?: {
      __typename?: 'Proposal'
      id: string
      proposalId: any
      proposalNumber: number
    } | null
    group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
  } | null
  replaces?: { __typename?: 'Proposal'; proposalId: any; proposalNumber: number } | null
  replacedBy?: { __typename?: 'Proposal'; proposalId: any; proposalNumber: number } | null
}

export type ProposalVoteFragment = {
  __typename?: 'ProposalVote'
  voter: any
  support: ProposalVoteSupport
  weight: number
  reason?: string | null
  timestamp?: any
}

export type SnapshotFragment = {
  __typename?: 'Snapshot'
  id: string
  ownerCount: number
  voterCount: number
  proposalCount: number
  totalSupply: number
  timestamp: any
  blockNumber: any
  dao: { __typename?: 'DAO'; name: string; id: string }
}

export type SwapHopFragment = {
  __typename?: 'SwapHop'
  id: string
  tokenIn: any
  tokenOut: any
  poolId: any
  fee?: any | null
  hooks?: any | null
  tickSpacing?: number | null
  hopIndex: number
}

export type SwapRouteFragment = {
  __typename?: 'SwapRoute'
  id: string
  coinAddress: any
  createdAt: any
  updatedAt: any
  clankerToken?: {
    __typename?: 'ClankerToken'
    tokenAddress: any
    tokenName: string
    tokenSymbol: string
  } | null
  zoraCoin?: {
    __typename?: 'ZoraCoin'
    coinAddress: any
    name: string
    symbol: string
  } | null
  mainPath: Array<{
    __typename?: 'SwapHop'
    id: string
    tokenIn: any
    tokenOut: any
    poolId: any
    fee?: any | null
    hooks?: any | null
    tickSpacing?: number | null
    hopIndex: number
  }>
  paymentOptions: Array<{
    __typename?: 'PaymentOption'
    id: string
    tokenAddress: any
    tokenType: CoinType
    tokenName: string
    tokenSymbol: string
    startHopIndex: number
    endHopIndex: number
    isDirectSwap: boolean
  }>
}

export type TokenFragment = {
  __typename?: 'Token'
  tokenId: any
  tokenContract: any
  name: string
  image?: string | null
  owner: any
  mintedAt: any
  dao: { __typename?: 'DAO'; description: string }
}

export type ZoraCoinFragment = {
  __typename?: 'ZoraCoin'
  id: string
  transactionHash: any
  caller: any
  currency: any
  poolKeyHash: any
  poolHooks: any
  poolFee: any
  poolTickSpacing: number
  coinAddress: any
  name: string
  symbol: string
  uri: string
  createdAt: any
  dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
}

export type ZoraCoinCardFragment = {
  __typename?: 'ZoraCoin'
  coinAddress: any
  name: string
  symbol: string
  uri: string
  createdAt: any
  dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
}

export type ZoraCoinHolderFragment = {
  __typename?: 'ZoraCoinHolder'
  id: string
  holder: any
  balance: any
  updatedAt: any
  updatedAtBlock: any
  coin: {
    __typename?: 'ZoraCoin'
    coinAddress: any
    name: string
    symbol: string
    uri: string
  }
}

export type ZoraCoinWithHoldersFragment = {
  __typename?: 'ZoraCoin'
  id: string
  transactionHash: any
  caller: any
  currency: any
  poolKeyHash: any
  poolHooks: any
  poolFee: any
  poolTickSpacing: number
  coinAddress: any
  name: string
  symbol: string
  uri: string
  createdAt: any
  holders: Array<{
    __typename?: 'ZoraCoinHolder'
    id: string
    holder: any
    balance: any
    updatedAt: any
  }>
  dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
}

export type ZoraDropFragment = {
  __typename?: 'ZoraDrop'
  creator: any
  description: string
  royaltyBPS: number
  fundsRecipient: any
  transactionHash: any
  id: string
  name: string
  symbol: string
  imageURI: string
  animationURI: string
  createdAt: any
  publicSaleStart: any
  publicSaleEnd: any
  publicSalePrice: any
  editionSize: any
  maxSalePurchasePerAddress: any
  dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
}

export type ZoraDropCardFragment = {
  __typename?: 'ZoraDrop'
  id: string
  name: string
  symbol: string
  imageURI: string
  animationURI: string
  createdAt: any
  publicSaleStart: any
  publicSaleEnd: any
  publicSalePrice: any
  editionSize: any
  maxSalePurchasePerAddress: any
}

export type ZoraDropHolderFragment = {
  __typename?: 'ZoraDropHolder'
  id: string
  holder: any
  balance: any
  totalSpent: any
  totalPurchased: any
  updatedAt: any
  updatedAtBlock: any
  drop: {
    __typename?: 'ZoraDrop'
    id: string
    name: string
    symbol: string
    imageURI: string
  }
}

export type ZoraDropWithHoldersFragment = {
  __typename?: 'ZoraDrop'
  creator: any
  description: string
  royaltyBPS: number
  fundsRecipient: any
  transactionHash: any
  id: string
  name: string
  symbol: string
  imageURI: string
  animationURI: string
  createdAt: any
  publicSaleStart: any
  publicSaleEnd: any
  publicSalePrice: any
  editionSize: any
  maxSalePurchasePerAddress: any
  holders: Array<{
    __typename?: 'ZoraDropHolder'
    id: string
    holder: any
    balance: any
    totalSpent: any
    totalPurchased: any
    updatedAt: any
  }>
  dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
}

export type CandidateGroupFragmentFragment = {
  __typename?: 'ProposalCandidateGroup'
  id: string
  proposer: any
  salt: any
  createdAt: any
  candidateNumber: number
  versionCount: any
  commentCount: any
  latestVersionNumber: any
  currentForCount: any
  currentAgainstCount: any
  currentAbstainCount: any
  dao: { __typename?: 'DAO'; id: string; tokenAddress: any; governorAddress: any }
  versions: Array<{ __typename?: 'ProposalCandidateVersion'; title?: string | null }>
}

export type CandidateGroupDetailFragmentFragment = {
  __typename?: 'ProposalCandidateGroup'
  id: string
  proposer: any
  salt: any
  createdAt: any
  candidateNumber: number
  versionCount: any
  commentCount: any
  latestVersionNumber: any
  currentForCount: any
  currentAgainstCount: any
  currentAbstainCount: any
  dao: { __typename?: 'DAO'; id: string; tokenAddress: any; governorAddress: any }
  leadingVersion?: {
    __typename?: 'ProposalCandidateVersion'
    id: string
    candidateId: any
    salt: any
    attester: any
    versionNumber: any
    targets: Array<any>
    values: Array<any>
    calldatas: Array<any>
    title?: string | null
    description?: string | null
    metadata?: string | null
    representedAddress?: string | null
    computedProposalId: any
    attestationUID: any
    createdAt: any
    discussionUrl?: string | null
    signatureCount: any
    totalVoteWeight: any
    revoked: boolean
    group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
    proposal?: {
      __typename?: 'Proposal'
      id: string
      proposalId: any
      proposalNumber: number
    } | null
  } | null
  versions: Array<{
    __typename?: 'ProposalCandidateVersion'
    id: string
    candidateId: any
    salt: any
    attester: any
    versionNumber: any
    targets: Array<any>
    values: Array<any>
    calldatas: Array<any>
    title?: string | null
    description?: string | null
    metadata?: string | null
    representedAddress?: string | null
    computedProposalId: any
    attestationUID: any
    createdAt: any
    discussionUrl?: string | null
    signatureCount: any
    totalVoteWeight: any
    revoked: boolean
    group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
    proposal?: {
      __typename?: 'Proposal'
      id: string
      proposalId: any
      proposalNumber: number
    } | null
  }>
}

export type CandidateVersionFragmentFragment = {
  __typename?: 'ProposalCandidateVersion'
  id: string
  candidateId: any
  salt: any
  attester: any
  versionNumber: any
  targets: Array<any>
  values: Array<any>
  calldatas: Array<any>
  title?: string | null
  description?: string | null
  metadata?: string | null
  representedAddress?: string | null
  computedProposalId: any
  attestationUID: any
  createdAt: any
  discussionUrl?: string | null
  signatureCount: any
  totalVoteWeight: any
  revoked: boolean
  group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
  proposal?: {
    __typename?: 'Proposal'
    id: string
    proposalId: any
    proposalNumber: number
  } | null
}

export type CandidateCommentFragmentFragment = {
  __typename?: 'CandidateComment'
  id: string
  candidate: any
  commenter: any
  voteWeight: any
  support: CandidateVoteSupport
  comment: string
  createdAt: any
  revoked: boolean
  parentComment?: { __typename?: 'CandidateComment'; id: string } | null
}

export type CandidateSponsorSignatureFragmentFragment = {
  __typename?: 'CandidateSponsorSignature'
  id: string
  signer: any
  proposalId: any
  nonce: any
  deadline: any
  signature: any
  revoked: boolean
  createdAt: any
  voteWeight: any
}

export type CandidateGroupByNumberQueryVariables = Exact<{
  candidateNumber: Scalars['Int']['input']
  dao?: InputMaybe<Scalars['String']['input']>
}>

export type CandidateGroupByNumberQuery = {
  __typename?: 'Query'
  proposalCandidateGroups: Array<{
    __typename?: 'ProposalCandidateGroup'
    id: string
    proposer: any
    salt: any
    createdAt: any
    candidateNumber: number
    versionCount: any
    commentCount: any
    latestVersionNumber: any
    currentForCount: any
    currentAgainstCount: any
    currentAbstainCount: any
    dao: { __typename?: 'DAO'; id: string; tokenAddress: any; governorAddress: any }
    leadingVersion?: {
      __typename?: 'ProposalCandidateVersion'
      id: string
      candidateId: any
      salt: any
      attester: any
      versionNumber: any
      targets: Array<any>
      values: Array<any>
      calldatas: Array<any>
      title?: string | null
      description?: string | null
      metadata?: string | null
      representedAddress?: string | null
      computedProposalId: any
      attestationUID: any
      createdAt: any
      discussionUrl?: string | null
      signatureCount: any
      totalVoteWeight: any
      revoked: boolean
      group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
      proposal?: {
        __typename?: 'Proposal'
        id: string
        proposalId: any
        proposalNumber: number
      } | null
    } | null
    versions: Array<{
      __typename?: 'ProposalCandidateVersion'
      id: string
      candidateId: any
      salt: any
      attester: any
      versionNumber: any
      targets: Array<any>
      values: Array<any>
      calldatas: Array<any>
      title?: string | null
      description?: string | null
      metadata?: string | null
      representedAddress?: string | null
      computedProposalId: any
      attestationUID: any
      createdAt: any
      discussionUrl?: string | null
      signatureCount: any
      totalVoteWeight: any
      revoked: boolean
      group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
      proposal?: {
        __typename?: 'Proposal'
        id: string
        proposalId: any
        proposalNumber: number
      } | null
    }>
  }>
}

export type DaoMultisigUpdateFragment = {
  __typename?: 'DaoMultisigUpdate'
  id: string
  transactionHash: any
  timestamp: any
  daoMultisig: any
  creator: any
}

export type ProposalUpdateFragment = {
  __typename?: 'ProposalUpdate'
  id: string
  transactionHash: any
  timestamp: any
  messageType: number
  message: string
  creator: any
  originalMessageId: any
}

export type ActiveAuctionsQueryVariables = Exact<{
  first: Scalars['Int']['input']
  where: Auction_Filter
}>

export type ActiveAuctionsQuery = {
  __typename?: 'Query'
  auctions: Array<{
    __typename?: 'Auction'
    dao: { __typename?: 'DAO'; name: string; auctionAddress: any; tokenAddress: any }
  }>
}

export type ActiveDaosQueryVariables = Exact<{
  first: Scalars['Int']['input']
  where: Dao_Filter
}>

export type ActiveDaosQuery = {
  __typename?: 'Query'
  daos: Array<{ __typename?: 'DAO'; id: string }>
}

export type AuctionBidsQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type AuctionBidsQuery = {
  __typename?: 'Query'
  auction?: {
    __typename?: 'Auction'
    bids?: Array<{
      __typename?: 'AuctionBid'
      id: string
      amount: any
      bidder: any
      comment?: string | null
    }> | null
  } | null
}

export type AuctionHistoryQueryVariables = Exact<{
  startTime: Scalars['BigInt']['input']
  daoId: Scalars['ID']['input']
  orderBy?: InputMaybe<Auction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  first?: InputMaybe<Scalars['Int']['input']>
}>

export type AuctionHistoryQuery = {
  __typename?: 'Query'
  dao?: {
    __typename?: 'DAO'
    auctions: Array<{
      __typename?: 'Auction'
      id: string
      endTime: any
      settled: boolean
      winningBid?: { __typename?: 'AuctionBid'; amount: any } | null
    }>
  } | null
}

export type CandidateCommentsQueryVariables = Exact<{
  where?: InputMaybe<CandidateComment_Filter>
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<CandidateComment_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
}>

export type CandidateCommentsQuery = {
  __typename?: 'Query'
  candidateComments: Array<{
    __typename?: 'CandidateComment'
    id: string
    candidate: any
    commenter: any
    voteWeight: any
    support: CandidateVoteSupport
    comment: string
    createdAt: any
    revoked: boolean
    parentComment?: { __typename?: 'CandidateComment'; id: string } | null
  }>
}

export type CandidateGroupQueryVariables = Exact<{
  candidateId: Scalars['ID']['input']
}>

export type CandidateGroupQuery = {
  __typename?: 'Query'
  proposalCandidateGroup?: {
    __typename?: 'ProposalCandidateGroup'
    id: string
    proposer: any
    salt: any
    createdAt: any
    candidateNumber: number
    versionCount: any
    commentCount: any
    latestVersionNumber: any
    currentForCount: any
    currentAgainstCount: any
    currentAbstainCount: any
    dao: { __typename?: 'DAO'; id: string; tokenAddress: any; governorAddress: any }
    leadingVersion?: {
      __typename?: 'ProposalCandidateVersion'
      id: string
      candidateId: any
      salt: any
      attester: any
      versionNumber: any
      targets: Array<any>
      values: Array<any>
      calldatas: Array<any>
      title?: string | null
      description?: string | null
      metadata?: string | null
      representedAddress?: string | null
      computedProposalId: any
      attestationUID: any
      createdAt: any
      discussionUrl?: string | null
      signatureCount: any
      totalVoteWeight: any
      revoked: boolean
      group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
      proposal?: {
        __typename?: 'Proposal'
        id: string
        proposalId: any
        proposalNumber: number
      } | null
    } | null
    versions: Array<{
      __typename?: 'ProposalCandidateVersion'
      id: string
      candidateId: any
      salt: any
      attester: any
      versionNumber: any
      targets: Array<any>
      values: Array<any>
      calldatas: Array<any>
      title?: string | null
      description?: string | null
      metadata?: string | null
      representedAddress?: string | null
      computedProposalId: any
      attestationUID: any
      createdAt: any
      discussionUrl?: string | null
      signatureCount: any
      totalVoteWeight: any
      revoked: boolean
      group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
      proposal?: {
        __typename?: 'Proposal'
        id: string
        proposalId: any
        proposalNumber: number
      } | null
    }>
  } | null
}

export type CandidateGroupsQueryVariables = Exact<{
  where?: InputMaybe<ProposalCandidateGroup_Filter>
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalCandidateGroup_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
}>

export type CandidateGroupsQuery = {
  __typename?: 'Query'
  proposalCandidateGroups: Array<{
    __typename?: 'ProposalCandidateGroup'
    id: string
    proposer: any
    salt: any
    createdAt: any
    candidateNumber: number
    versionCount: any
    commentCount: any
    latestVersionNumber: any
    currentForCount: any
    currentAgainstCount: any
    currentAbstainCount: any
    dao: { __typename?: 'DAO'; id: string; tokenAddress: any; governorAddress: any }
    versions: Array<{ __typename?: 'ProposalCandidateVersion'; title?: string | null }>
  }>
}

export type CandidateSponsorSignaturesQueryVariables = Exact<{
  where?: InputMaybe<CandidateSponsorSignature_Filter>
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<CandidateSponsorSignature_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
}>

export type CandidateSponsorSignaturesQuery = {
  __typename?: 'Query'
  candidateSponsorSignatures: Array<{
    __typename?: 'CandidateSponsorSignature'
    id: string
    signer: any
    proposalId: any
    nonce: any
    deadline: any
    signature: any
    revoked: boolean
    createdAt: any
    voteWeight: any
  }>
}

export type CandidateVersionQueryVariables = Exact<{
  versionId: Scalars['ID']['input']
}>

export type CandidateVersionQuery = {
  __typename?: 'Query'
  proposalCandidateVersion?: {
    __typename?: 'ProposalCandidateVersion'
    id: string
    candidateId: any
    salt: any
    attester: any
    versionNumber: any
    targets: Array<any>
    values: Array<any>
    calldatas: Array<any>
    title?: string | null
    description?: string | null
    metadata?: string | null
    representedAddress?: string | null
    computedProposalId: any
    attestationUID: any
    createdAt: any
    discussionUrl?: string | null
    signatureCount: any
    totalVoteWeight: any
    revoked: boolean
    group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
    proposal?: {
      __typename?: 'Proposal'
      id: string
      proposalId: any
      proposalNumber: number
    } | null
  } | null
}

export type ClankerTokenQueryVariables = Exact<{
  tokenAddress: Scalars['ID']['input']
}>

export type ClankerTokenQuery = {
  __typename?: 'Query'
  clankerToken?: {
    __typename?: 'ClankerToken'
    pairedToken: any
    poolId: any
    poolHook: any
    createdAt: any
    transactionHash: any
    msgSender: any
    tokenAddress: any
    tokenName: string
    tokenSymbol: string
    tokenImage: string
    dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
  } | null
}

export type ClankerTokenHolderQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type ClankerTokenHolderQuery = {
  __typename?: 'Query'
  clankerTokenHolder?: {
    __typename?: 'ClankerTokenHolder'
    id: string
    holder: any
    balance: any
    updatedAt: any
    updatedAtBlock: any
    token: {
      __typename?: 'ClankerToken'
      tokenAddress: any
      tokenName: string
      tokenSymbol: string
      tokenImage: string
    }
  } | null
}

export type ClankerTokenHoldersQueryVariables = Exact<{
  where?: InputMaybe<ClankerTokenHolder_Filter>
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ClankerTokenHolder_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
}>

export type ClankerTokenHoldersQuery = {
  __typename?: 'Query'
  clankerTokenHolders: Array<{
    __typename?: 'ClankerTokenHolder'
    id: string
    holder: any
    balance: any
    updatedAt: any
    updatedAtBlock: any
    token: {
      __typename?: 'ClankerToken'
      tokenAddress: any
      tokenName: string
      tokenSymbol: string
      tokenImage: string
    }
  }>
}

export type ClankerTokenWithHoldersQueryVariables = Exact<{
  tokenAddress: Scalars['ID']['input']
}>

export type ClankerTokenWithHoldersQuery = {
  __typename?: 'Query'
  clankerToken?: {
    __typename?: 'ClankerToken'
    pairedToken: any
    poolId: any
    poolHook: any
    createdAt: any
    transactionHash: any
    msgSender: any
    tokenAddress: any
    tokenName: string
    tokenSymbol: string
    tokenImage: string
    holders: Array<{
      __typename?: 'ClankerTokenHolder'
      id: string
      holder: any
      balance: any
      updatedAt: any
    }>
    dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
  } | null
}

export type DaoClankerTokensQueryVariables = Exact<{
  daoId: Scalars['ID']['input']
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ClankerToken_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
}>

export type DaoClankerTokensQuery = {
  __typename?: 'Query'
  dao?: {
    __typename?: 'DAO'
    id: string
    clankerTokens: Array<{
      __typename?: 'ClankerToken'
      tokenAddress: any
      tokenName: string
      tokenSymbol: string
      tokenImage: string
    }>
  } | null
}

export type DaoClankerTokensFullQueryVariables = Exact<{
  daoId: Scalars['ID']['input']
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ClankerToken_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
}>

export type DaoClankerTokensFullQuery = {
  __typename?: 'Query'
  dao?: {
    __typename?: 'DAO'
    id: string
    clankerTokens: Array<{
      __typename?: 'ClankerToken'
      pairedToken: any
      poolId: any
      poolHook: any
      createdAt: any
      transactionHash: any
      msgSender: any
      tokenAddress: any
      tokenName: string
      tokenSymbol: string
      tokenImage: string
      dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
    }>
  } | null
}

export type DaoInfoQueryVariables = Exact<{
  tokenAddress: Scalars['ID']['input']
}>

export type DaoInfoQuery = {
  __typename?: 'Query'
  dao?: {
    __typename?: 'DAO'
    name: string
    description: string
    metadata?: string | null
    contractImage: string
    projectURI: string
    totalSupply: number
    ownerCount: number
    links: Array<{ __typename?: 'DAOLink'; id: string; key: string; url: string }>
  } | null
}

export type DaoMembersListQueryVariables = Exact<{
  where?: InputMaybe<DaoTokenOwner_Filter>
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoTokenOwner_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
}>

export type DaoMembersListQuery = {
  __typename?: 'Query'
  daotokenOwners: Array<{
    __typename?: 'DAOTokenOwner'
    id: string
    owner: any
    delegate: any
    daoTokenCount: number
    daoTokens: Array<{ __typename?: 'Token'; tokenId: any; mintedAt: any }>
  }>
}

export type DaoMembershipQueryVariables = Exact<{
  ownerId: Scalars['ID']['input']
  voterId: Scalars['ID']['input']
}>

export type DaoMembershipQuery = {
  __typename?: 'Query'
  daotokenOwner?: {
    __typename?: 'DAOTokenOwner'
    id: string
    owner: any
    delegate: any
    daoTokenCount: number
    daoTokens: Array<{ __typename?: 'Token'; owner: any; tokenId: any; mintedAt: any }>
  } | null
  daovoter?: {
    __typename?: 'DAOVoter'
    id: string
    voter: any
    daoTokenCount: number
    daoTokens: Array<{ __typename?: 'Token'; owner: any; tokenId: any; mintedAt: any }>
  } | null
}

export type DaoMetadataQueryVariables = Exact<{
  tokenAddress: Scalars['ID']['input']
  first: Scalars['Int']['input']
}>

export type DaoMetadataQuery = {
  __typename?: 'Query'
  dao?: {
    __typename?: 'DAO'
    metadataProperties?: Array<{
      __typename?: 'MetadataProperty'
      ipfsBaseUri: string
      ipfsExtension: string
      names: Array<string>
      items: Array<{
        __typename?: 'MetadataItem'
        name: string
        propertyId: any
        isNewProperty: boolean
      }>
    }> | null
  } | null
}

export type DaoMultisigsQueryVariables = Exact<{
  daoId: Scalars['String']['input']
  creators: Array<Scalars['Bytes']['input']> | Scalars['Bytes']['input']
  first: Scalars['Int']['input']
  skip: Scalars['Int']['input']
}>

export type DaoMultisigsQuery = {
  __typename?: 'Query'
  daoMultisigUpdates: Array<{
    __typename?: 'DaoMultisigUpdate'
    id: string
    transactionHash: any
    timestamp: any
    daoMultisig: any
    creator: any
  }>
}

export type DaoNextAndPreviousTokensQueryVariables = Exact<{
  tokenAddress: Scalars['String']['input']
  tokenId: Scalars['BigInt']['input']
}>

export type DaoNextAndPreviousTokensQuery = {
  __typename?: 'Query'
  prev: Array<{ __typename?: 'Token'; tokenId: any }>
  next: Array<{ __typename?: 'Token'; tokenId: any }>
  latest: Array<{ __typename?: 'Token'; tokenId: any }>
}

export type DaoOgMetadataQueryVariables = Exact<{
  tokenAddress: Scalars['ID']['input']
}>

export type DaoOgMetadataQuery = {
  __typename?: 'Query'
  dao?: {
    __typename?: 'DAO'
    name: string
    description: string
    contractImage: string
    totalSupply: number
    ownerCount: number
    proposalCount: number
    tokenAddress: any
    metadataAddress: any
    auctionAddress: any
    treasuryAddress: any
    governorAddress: any
    links: Array<{ __typename?: 'DAOLink'; id: string; key: string; url: string }>
  } | null
}

export type ExploreDaosSearchQueryVariables = Exact<{
  text: Scalars['String']['input']
  first: Scalars['Int']['input']
  skip: Scalars['Int']['input']
  where?: InputMaybe<Dao_Filter>
  whereSimple?: InputMaybe<Dao_Filter>
}>

export type ExploreDaosSearchQuery = {
  __typename?: 'Query'
  daoSearch: Array<{
    __typename?: 'DAO'
    tokenAddress: any
    name: string
    symbol: string
    description: string
    projectURI: string
    treasuryAddress: any
    auctionAddress: any
    governorAddress: any
    metadataAddress: any
    links: Array<{ __typename?: 'DAOLink'; id: string; key: string; url: string }>
    tokens: Array<{
      __typename?: 'Token'
      tokenId: any
      name: string
      image?: string | null
      auction?: {
        __typename?: 'Auction'
        endTime: any
        settled: boolean
        highestBid?: { __typename?: 'AuctionBid'; amount: any; bidder: any } | null
      } | null
    }>
  }>
  daos: Array<{
    __typename?: 'DAO'
    tokenAddress: any
    name: string
    symbol: string
    description: string
    projectURI: string
    treasuryAddress: any
    auctionAddress: any
    governorAddress: any
    metadataAddress: any
    links: Array<{ __typename?: 'DAOLink'; id: string; key: string; url: string }>
    tokens: Array<{
      __typename?: 'Token'
      tokenId: any
      name: string
      image?: string | null
      auction?: {
        __typename?: 'Auction'
        endTime: any
        settled: boolean
        highestBid?: { __typename?: 'AuctionBid'; amount: any; bidder: any } | null
      } | null
    }>
  }>
}

export type DaoVotersQueryVariables = Exact<{
  where?: InputMaybe<DaoVoter_Filter>
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoVoter_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
}>

export type DaoVotersQuery = {
  __typename?: 'Query'
  daovoters: Array<{
    __typename?: 'DAOVoter'
    id: string
    voter: any
    daoTokenCount: number
    daoTokens: Array<{ __typename?: 'Token'; tokenId: any; mintedAt: any }>
  }>
}

export type DaoZoraCoinsQueryVariables = Exact<{
  daoId: Scalars['ID']['input']
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraCoin_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
}>

export type DaoZoraCoinsQuery = {
  __typename?: 'Query'
  dao?: {
    __typename?: 'DAO'
    id: string
    zoraCoins: Array<{
      __typename?: 'ZoraCoin'
      coinAddress: any
      name: string
      symbol: string
      uri: string
      createdAt: any
      dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
    }>
  } | null
}

export type DaoZoraDropsQueryVariables = Exact<{
  daoId: Scalars['ID']['input']
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraDrop_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
}>

export type DaoZoraDropsQuery = {
  __typename?: 'Query'
  dao?: {
    __typename?: 'DAO'
    id: string
    zoraDrops: Array<{
      __typename?: 'ZoraDrop'
      id: string
      name: string
      symbol: string
      imageURI: string
      animationURI: string
      createdAt: any
      publicSaleStart: any
      publicSaleEnd: any
      publicSalePrice: any
      editionSize: any
      maxSalePurchasePerAddress: any
    }>
  } | null
}

export type DaosForDashboardQueryVariables = Exact<{
  user: Scalars['Bytes']['input']
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
}>

export type DaosForDashboardQuery = {
  __typename?: 'Query'
  daos: Array<{
    __typename?: 'DAO'
    contractImage: string
    name: string
    tokenAddress: any
    metadataAddress: any
    treasuryAddress: any
    auctionAddress: any
    governorAddress: any
    auctionConfig: {
      __typename?: 'AuctionConfig'
      minimumBidIncrement: any
      reservePrice: any
    }
    proposals: Array<{
      __typename?: 'Proposal'
      voteEnd: any
      voteStart: any
      expiresAt?: any | null
      abstainVotes: number
      againstVotes: number
      calldatas?: string | null
      description?: string | null
      representedAddress?: string | null
      discussionUrl?: string | null
      descriptionHash: any
      executableFrom?: any | null
      forVotes: number
      proposalId: any
      proposalNumber: number
      proposalThreshold: any
      proposer: any
      quorumVotes: any
      targets: Array<any>
      timeCreated: any
      title?: string | null
      values: Array<any>
      snapshotBlockNumber: any
      transactionHash: any
      executedAt?: any | null
      executionTransactionHash?: any | null
      vetoTransactionHash?: any | null
      cancelTransactionHash?: any | null
      updatePeriodEnd?: any | null
      updateMessage?: string | null
      updateCount: number
      votes: Array<{ __typename?: 'ProposalVote'; voter: any }>
      dao: { __typename?: 'DAO'; governorAddress: any; tokenAddress: any }
      candidateVersion?: {
        __typename?: 'ProposalCandidateVersion'
        candidateId: any
        computedProposalId: any
        attestationUID: any
        versionNumber: any
        proposal?: {
          __typename?: 'Proposal'
          id: string
          proposalId: any
          proposalNumber: number
        } | null
        group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
      } | null
      replaces?: {
        __typename?: 'Proposal'
        proposalId: any
        proposalNumber: number
      } | null
      replacedBy?: {
        __typename?: 'Proposal'
        proposalId: any
        proposalNumber: number
      } | null
    }>
    currentAuction?: {
      __typename?: 'Auction'
      endTime: any
      highestBid?: { __typename?: 'AuctionBid'; amount: any; bidder: any } | null
      token: { __typename?: 'Token'; name: string; image?: string | null; tokenId: any }
    } | null
    links: Array<{ __typename?: 'DAOLink'; id: string; key: string; url: string }>
  }>
}

export type DaosForUserQueryVariables = Exact<{
  user: Scalars['Bytes']['input']
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
}>

export type DaosForUserQuery = {
  __typename?: 'Query'
  daos: Array<{
    __typename?: 'DAO'
    name: string
    contractImage: string
    tokenAddress: any
    metadataAddress: any
    treasuryAddress: any
    auctionAddress: any
    governorAddress: any
    links: Array<{ __typename?: 'DAOLink'; id: string; key: string; url: string }>
  }>
}

export type DaosWithClankerTokensQueryVariables = Exact<{
  daoIds: Array<Scalars['ID']['input']> | Scalars['ID']['input']
}>

export type DaosWithClankerTokensQuery = {
  __typename?: 'Query'
  daos: Array<{
    __typename?: 'DAO'
    id: string
    clankerTokens: Array<{ __typename?: 'ClankerToken'; id: string }>
  }>
}

export type FeedEventsQueryVariables = Exact<{
  first: Scalars['Int']['input']
  where?: InputMaybe<FeedEvent_Filter>
}>

export type FeedEventsQuery = {
  __typename?: 'Query'
  feedEvents: Array<
    | {
        __typename: 'AuctionBidPlacedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        auction: {
          __typename?: 'Auction'
          id: string
          startTime: any
          endTime: any
          token: {
            __typename?: 'Token'
            tokenId: any
            owner: any
            name: string
            image?: string | null
          }
        }
        bid: {
          __typename?: 'AuctionBid'
          amount: any
          bidTime: any
          bidder: any
          comment?: string | null
        }
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'AuctionCreatedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        auction: {
          __typename?: 'Auction'
          id: string
          startTime: any
          endTime: any
          token: {
            __typename?: 'Token'
            tokenId: any
            name: string
            image?: string | null
          }
        }
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'AuctionSettledEvent'
        amount: any
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        auction: {
          __typename?: 'Auction'
          id: string
          startTime: any
          endTime: any
          token: {
            __typename?: 'Token'
            tokenId: any
            owner: any
            name: string
            image?: string | null
          }
        }
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'CandidateCommentCreatedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'CandidateSponsorSignatureCreatedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'CandidateSubmittedAsProposalEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'CandidateVersionCreatedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'ClankerTokenCreatedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        clankerToken: {
          __typename?: 'ClankerToken'
          tokenAddress: any
          tokenName: string
          tokenSymbol: string
          tokenImage: string
          poolId: any
        }
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'ClankerTokenLinkedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'ClankerTokenUnlinkedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'ProposalCreatedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        proposal: {
          __typename?: 'Proposal'
          proposalId: any
          proposalNumber: number
          timeCreated: any
          title?: string | null
          description?: string | null
          representedAddress?: string | null
          discussionUrl?: string | null
          proposer: any
        }
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'ProposalEditedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'ProposalExecutedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        proposal: {
          __typename?: 'Proposal'
          proposalId: any
          proposalNumber: number
          timeCreated: any
          title?: string | null
          description?: string | null
          representedAddress?: string | null
          discussionUrl?: string | null
          proposer: any
        }
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'ProposalUpdatedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        proposal: {
          __typename?: 'Proposal'
          proposalId: any
          proposalNumber: number
          timeCreated: any
          title?: string | null
          description?: string | null
          representedAddress?: string | null
          discussionUrl?: string | null
          proposer: any
        }
        update: {
          __typename?: 'ProposalUpdate'
          messageType: number
          message: string
          originalMessageId: any
        }
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'ProposalVotedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        proposal: {
          __typename?: 'Proposal'
          proposalId: any
          proposalNumber: number
          timeCreated: any
          title?: string | null
          description?: string | null
          representedAddress?: string | null
          discussionUrl?: string | null
          proposer: any
        }
        vote: {
          __typename?: 'ProposalVote'
          support: ProposalVoteSupport
          weight: number
          reason?: string | null
        }
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'ZoraCoinCreatedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        zoraCoin: {
          __typename?: 'ZoraCoin'
          coinAddress: any
          name: string
          symbol: string
          uri: string
          currency: any
        }
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
    | {
        __typename: 'ZoraDropCreatedEvent'
        id: string
        type: FeedEventType
        timestamp: any
        blockNumber: any
        transactionHash: any
        actor: any
        zoraDrop: {
          __typename?: 'ZoraDrop'
          id: string
          creator: any
          name: string
          symbol: string
          description: string
          imageURI: string
          animationURI: string
          editionSize: any
          metadataRenderer: any
          royaltyBPS: number
          fundsRecipient: any
          publicSalePrice: any
          maxSalePurchasePerAddress: any
          publicSaleStart: any
          publicSaleEnd: any
          presaleStart: any
          presaleEnd: any
          presaleMerkleRoot: any
        }
        dao: {
          __typename?: 'DAO'
          auctionAddress: any
          governorAddress: any
          metadataAddress: any
          tokenAddress: any
          treasuryAddress: any
          name: string
          symbol: string
          contractImage: string
        }
      }
  >
}

export type FindAuctionsQueryVariables = Exact<{
  orderBy?: InputMaybe<Auction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  where?: InputMaybe<Auction_Filter>
  skip?: InputMaybe<Scalars['Int']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
}>

export type FindAuctionsQuery = {
  __typename?: 'Query'
  auctions: Array<{
    __typename?: 'Auction'
    endTime: any
    dao: { __typename?: 'DAO'; name: string; tokenAddress: any }
    highestBid?: { __typename?: 'AuctionBid'; amount: any; bidder: any } | null
    token: { __typename?: 'Token'; name: string; image?: string | null; tokenId: any }
  }>
}

export type FindAuctionsForDaosQueryVariables = Exact<{
  daos?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>
  orderBy?: InputMaybe<Auction_OrderBy>
  skip?: InputMaybe<Scalars['Int']['input']>
}>

export type FindAuctionsForDaosQuery = {
  __typename?: 'Query'
  auctions: Array<{
    __typename?: 'Auction'
    endTime: any
    dao: { __typename?: 'DAO'; name: string; tokenAddress: any }
    highestBid?: { __typename?: 'AuctionBid'; amount: any; bidder: any } | null
    token: { __typename?: 'Token'; name: string; image?: string | null; tokenId: any }
  }>
}

export type SyncStatusQueryVariables = Exact<{ [key: string]: never }>

export type SyncStatusQuery = {
  __typename?: 'Query'
  _meta?: {
    __typename?: '_Meta_'
    hasIndexingErrors: boolean
    block: { __typename?: '_Block_'; number: number }
  } | null
}

export type PropdatesQueryVariables = Exact<{
  proposalId: Scalars['String']['input']
  first: Scalars['Int']['input']
  skip: Scalars['Int']['input']
}>

export type PropdatesQuery = {
  __typename?: 'Query'
  proposalUpdates: Array<{
    __typename?: 'ProposalUpdate'
    id: string
    transactionHash: any
    timestamp: any
    messageType: number
    message: string
    creator: any
    originalMessageId: any
  }>
}

export type ProposalQueryVariables = Exact<{
  proposalId: Scalars['ID']['input']
}>

export type ProposalQuery = {
  __typename?: 'Query'
  proposal?: {
    __typename?: 'Proposal'
    metadata?: string | null
    abstainVotes: number
    againstVotes: number
    calldatas?: string | null
    description?: string | null
    representedAddress?: string | null
    discussionUrl?: string | null
    descriptionHash: any
    executableFrom?: any | null
    expiresAt?: any | null
    forVotes: number
    proposalId: any
    proposalNumber: number
    proposalThreshold: any
    proposer: any
    quorumVotes: any
    targets: Array<any>
    timeCreated: any
    title?: string | null
    values: Array<any>
    voteEnd: any
    voteStart: any
    snapshotBlockNumber: any
    transactionHash: any
    executedAt?: any | null
    executionTransactionHash?: any | null
    vetoTransactionHash?: any | null
    cancelTransactionHash?: any | null
    updatePeriodEnd?: any | null
    updateMessage?: string | null
    updateCount: number
    votes: Array<{
      __typename?: 'ProposalVote'
      voter: any
      support: ProposalVoteSupport
      weight: number
      reason?: string | null
      timestamp?: any
    }>
    dao: { __typename?: 'DAO'; governorAddress: any; tokenAddress: any }
    candidateVersion?: {
      __typename?: 'ProposalCandidateVersion'
      candidateId: any
      computedProposalId: any
      attestationUID: any
      versionNumber: any
      proposal?: {
        __typename?: 'Proposal'
        id: string
        proposalId: any
        proposalNumber: number
      } | null
      group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
    } | null
    replaces?: { __typename?: 'Proposal'; proposalId: any; proposalNumber: number } | null
    replacedBy?: {
      __typename?: 'Proposal'
      proposalId: any
      proposalNumber: number
    } | null
  } | null
}

export type ProposalByExecutionTxHashQueryVariables = Exact<{
  executionTransactionHash: Scalars['Bytes']['input']
}>

export type ProposalByExecutionTxHashQuery = {
  __typename?: 'Query'
  proposals: Array<{
    __typename?: 'Proposal'
    proposer: any
    proposalId: any
    proposalNumber: number
    title?: string | null
    dao: { __typename?: 'DAO'; id: string; name: string; contractImage: string }
  }>
}

export type ProposalOgMetadataQueryVariables = Exact<{
  where: Proposal_Filter
  first: Scalars['Int']['input']
}>

export type ProposalOgMetadataQuery = {
  __typename?: 'Query'
  proposals: Array<{
    __typename?: 'Proposal'
    metadata?: string | null
    abstainVotes: number
    againstVotes: number
    calldatas?: string | null
    description?: string | null
    representedAddress?: string | null
    discussionUrl?: string | null
    descriptionHash: any
    executableFrom?: any | null
    expiresAt?: any | null
    forVotes: number
    proposalId: any
    proposalNumber: number
    proposalThreshold: any
    proposer: any
    quorumVotes: any
    targets: Array<any>
    timeCreated: any
    title?: string | null
    values: Array<any>
    voteEnd: any
    voteStart: any
    snapshotBlockNumber: any
    transactionHash: any
    executedAt?: any | null
    executionTransactionHash?: any | null
    vetoTransactionHash?: any | null
    cancelTransactionHash?: any | null
    updatePeriodEnd?: any | null
    updateMessage?: string | null
    updateCount: number
    votes: Array<{
      __typename?: 'ProposalVote'
      voter: any
      support: ProposalVoteSupport
      weight: number
      reason?: string | null
      timestamp?: any
    }>
    dao: {
      __typename?: 'DAO'
      name: string
      contractImage: string
      tokenAddress: any
      metadataAddress: any
      auctionAddress: any
      treasuryAddress: any
      governorAddress: any
    }
    candidateVersion?: {
      __typename?: 'ProposalCandidateVersion'
      candidateId: any
      computedProposalId: any
      attestationUID: any
      versionNumber: any
      proposal?: {
        __typename?: 'Proposal'
        id: string
        proposalId: any
        proposalNumber: number
      } | null
      group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
    } | null
    replaces?: { __typename?: 'Proposal'; proposalId: any; proposalNumber: number } | null
    replacedBy?: {
      __typename?: 'Proposal'
      proposalId: any
      proposalNumber: number
    } | null
  }>
}

export type ProposalVersionsQueryVariables = Exact<{
  where?: InputMaybe<Proposal_Filter>
}>

export type ProposalVersionsQuery = {
  __typename?: 'Query'
  proposals: Array<{
    __typename?: 'Proposal'
    abstainVotes: number
    againstVotes: number
    calldatas?: string | null
    description?: string | null
    representedAddress?: string | null
    discussionUrl?: string | null
    descriptionHash: any
    executableFrom?: any | null
    expiresAt?: any | null
    forVotes: number
    proposalId: any
    proposalNumber: number
    proposalThreshold: any
    proposer: any
    quorumVotes: any
    targets: Array<any>
    timeCreated: any
    title?: string | null
    values: Array<any>
    voteEnd: any
    voteStart: any
    snapshotBlockNumber: any
    transactionHash: any
    executedAt?: any | null
    executionTransactionHash?: any | null
    vetoTransactionHash?: any | null
    cancelTransactionHash?: any | null
    updatePeriodEnd?: any | null
    updateMessage?: string | null
    updateCount: number
    dao: { __typename?: 'DAO'; governorAddress: any; tokenAddress: any }
    candidateVersion?: {
      __typename?: 'ProposalCandidateVersion'
      candidateId: any
      computedProposalId: any
      attestationUID: any
      versionNumber: any
      proposal?: {
        __typename?: 'Proposal'
        id: string
        proposalId: any
        proposalNumber: number
      } | null
      group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
    } | null
    replaces?: { __typename?: 'Proposal'; proposalId: any; proposalNumber: number } | null
    replacedBy?: {
      __typename?: 'Proposal'
      proposalId: any
      proposalNumber: number
    } | null
  }>
}

export type ProposalsQueryVariables = Exact<{
  where?: InputMaybe<Proposal_Filter>
  first: Scalars['Int']['input']
  skip?: InputMaybe<Scalars['Int']['input']>
}>

export type ProposalsQuery = {
  __typename?: 'Query'
  proposals: Array<{
    __typename?: 'Proposal'
    abstainVotes: number
    againstVotes: number
    calldatas?: string | null
    description?: string | null
    representedAddress?: string | null
    discussionUrl?: string | null
    descriptionHash: any
    executableFrom?: any | null
    expiresAt?: any | null
    forVotes: number
    proposalId: any
    proposalNumber: number
    proposalThreshold: any
    proposer: any
    quorumVotes: any
    targets: Array<any>
    timeCreated: any
    title?: string | null
    values: Array<any>
    voteEnd: any
    voteStart: any
    snapshotBlockNumber: any
    transactionHash: any
    executedAt?: any | null
    executionTransactionHash?: any | null
    vetoTransactionHash?: any | null
    cancelTransactionHash?: any | null
    updatePeriodEnd?: any | null
    updateMessage?: string | null
    updateCount: number
    votes: Array<{
      __typename?: 'ProposalVote'
      voter: any
      support: ProposalVoteSupport
      weight: number
      reason?: string | null
      timestamp?: any
    }>
    dao: { __typename?: 'DAO'; governorAddress: any; tokenAddress: any }
    candidateVersion?: {
      __typename?: 'ProposalCandidateVersion'
      candidateId: any
      computedProposalId: any
      attestationUID: any
      versionNumber: any
      proposal?: {
        __typename?: 'Proposal'
        id: string
        proposalId: any
        proposalNumber: number
      } | null
      group: { __typename?: 'ProposalCandidateGroup'; candidateNumber: number }
    } | null
    replaces?: { __typename?: 'Proposal'; proposalId: any; proposalNumber: number } | null
    replacedBy?: {
      __typename?: 'Proposal'
      proposalId: any
      proposalNumber: number
    } | null
  }>
}

export type SnapshotsQueryVariables = Exact<{
  where?: InputMaybe<Snapshot_Filter>
  orderBy?: InputMaybe<Snapshot_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
}>

export type SnapshotsQuery = {
  __typename?: 'Query'
  snapshots: Array<{
    __typename?: 'Snapshot'
    id: string
    ownerCount: number
    voterCount: number
    proposalCount: number
    totalSupply: number
    timestamp: any
    blockNumber: any
    dao: { __typename?: 'DAO'; name: string; id: string }
  }>
}

export type SwapRouteQueryVariables = Exact<{
  coinAddress: Scalars['ID']['input']
}>

export type SwapRouteQuery = {
  __typename?: 'Query'
  swapRoute?: {
    __typename?: 'SwapRoute'
    id: string
    coinAddress: any
    createdAt: any
    updatedAt: any
    clankerToken?: {
      __typename?: 'ClankerToken'
      tokenAddress: any
      tokenName: string
      tokenSymbol: string
    } | null
    zoraCoin?: {
      __typename?: 'ZoraCoin'
      coinAddress: any
      name: string
      symbol: string
    } | null
    mainPath: Array<{
      __typename?: 'SwapHop'
      id: string
      tokenIn: any
      tokenOut: any
      poolId: any
      fee?: any | null
      hooks?: any | null
      tickSpacing?: number | null
      hopIndex: number
    }>
    paymentOptions: Array<{
      __typename?: 'PaymentOption'
      id: string
      tokenAddress: any
      tokenType: CoinType
      tokenName: string
      tokenSymbol: string
      startHopIndex: number
      endHopIndex: number
      isDirectSwap: boolean
    }>
  } | null
}

export type TokenWithDaoQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type TokenWithDaoQuery = {
  __typename?: 'Query'
  token?: {
    __typename?: 'Token'
    tokenId: any
    tokenContract: any
    name: string
    image?: string | null
    owner: any
    mintedAt: any
    auction?: {
      __typename?: 'Auction'
      winningBid?: { __typename?: 'AuctionBid'; amount: any; bidder: any } | null
    } | null
    dao: {
      __typename?: 'DAO'
      name: string
      description: string
      contractImage: string
      totalSupply: number
      ownerCount: number
      proposalCount: number
      tokenAddress: any
      metadataAddress: any
      auctionAddress: any
      treasuryAddress: any
      governorAddress: any
      links: Array<{ __typename?: 'DAOLink'; id: string; key: string; url: string }>
    }
  } | null
}

export type TokensQueryVariables = Exact<{
  where?: InputMaybe<Token_Filter>
  orderBy?: InputMaybe<Token_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
}>

export type TokensQuery = {
  __typename?: 'Query'
  tokens: Array<{
    __typename?: 'Token'
    tokenId: any
    tokenContract: any
    name: string
    image?: string | null
    owner: any
    mintedAt: any
    dao: { __typename?: 'DAO'; description: string }
  }>
}

export type TotalAuctionSalesQueryVariables = Exact<{
  tokenAddress: Scalars['ID']['input']
}>

export type TotalAuctionSalesQuery = {
  __typename?: 'Query'
  dao?: { __typename?: 'DAO'; totalAuctionSales: any } | null
}

export type TreasuryAssetPinsQueryVariables = Exact<{
  daoId: Scalars['String']['input']
  first: Scalars['Int']['input']
  skip: Scalars['Int']['input']
}>

export type TreasuryAssetPinsQuery = {
  __typename?: 'Query'
  treasuryAssetPins: Array<{
    __typename?: 'TreasuryAssetPin'
    id: string
    transactionHash: any
    timestamp: any
    tokenType: number
    token: any
    isCollection: boolean
    tokenId: any
    creator: any
    revoked: boolean
    revokedAt?: any | null
    revokedBy?: any | null
    revokedTxHash?: any | null
  }>
}

export type UserProposalVoteQueryVariables = Exact<{
  where?: InputMaybe<ProposalVote_Filter>
}>

export type UserProposalVoteQuery = {
  __typename?: 'Query'
  proposalVotes: Array<{
    __typename?: 'ProposalVote'
    voter: any
    support: ProposalVoteSupport
    weight: number
    reason?: string | null
    timestamp?: any
  }>
}

export type ZoraCoinQueryVariables = Exact<{
  coinAddress: Scalars['ID']['input']
}>

export type ZoraCoinQuery = {
  __typename?: 'Query'
  zoraCoin?: {
    __typename?: 'ZoraCoin'
    id: string
    transactionHash: any
    caller: any
    currency: any
    poolKeyHash: any
    poolHooks: any
    poolFee: any
    poolTickSpacing: number
    coinAddress: any
    name: string
    symbol: string
    uri: string
    createdAt: any
    dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
  } | null
}

export type ZoraCoinHolderQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type ZoraCoinHolderQuery = {
  __typename?: 'Query'
  zoraCoinHolder?: {
    __typename?: 'ZoraCoinHolder'
    id: string
    holder: any
    balance: any
    updatedAt: any
    updatedAtBlock: any
    coin: {
      __typename?: 'ZoraCoin'
      coinAddress: any
      name: string
      symbol: string
      uri: string
    }
  } | null
}

export type ZoraCoinHoldersQueryVariables = Exact<{
  where?: InputMaybe<ZoraCoinHolder_Filter>
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraCoinHolder_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
}>

export type ZoraCoinHoldersQuery = {
  __typename?: 'Query'
  zoraCoinHolders: Array<{
    __typename?: 'ZoraCoinHolder'
    id: string
    holder: any
    balance: any
    updatedAt: any
    updatedAtBlock: any
    coin: {
      __typename?: 'ZoraCoin'
      coinAddress: any
      name: string
      symbol: string
      uri: string
    }
  }>
}

export type ZoraCoinWithHoldersQueryVariables = Exact<{
  coinAddress: Scalars['ID']['input']
}>

export type ZoraCoinWithHoldersQuery = {
  __typename?: 'Query'
  zoraCoin?: {
    __typename?: 'ZoraCoin'
    id: string
    transactionHash: any
    caller: any
    currency: any
    poolKeyHash: any
    poolHooks: any
    poolFee: any
    poolTickSpacing: number
    coinAddress: any
    name: string
    symbol: string
    uri: string
    createdAt: any
    holders: Array<{
      __typename?: 'ZoraCoinHolder'
      id: string
      holder: any
      balance: any
      updatedAt: any
    }>
    dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
  } | null
}

export type ZoraDropQueryVariables = Exact<{
  dropAddress: Scalars['ID']['input']
}>

export type ZoraDropQuery = {
  __typename?: 'Query'
  zoraDrop?: {
    __typename?: 'ZoraDrop'
    creator: any
    description: string
    royaltyBPS: number
    fundsRecipient: any
    transactionHash: any
    id: string
    name: string
    symbol: string
    imageURI: string
    animationURI: string
    createdAt: any
    publicSaleStart: any
    publicSaleEnd: any
    publicSalePrice: any
    editionSize: any
    maxSalePurchasePerAddress: any
    dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
  } | null
}

export type ZoraDropHolderQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type ZoraDropHolderQuery = {
  __typename?: 'Query'
  zoraDropHolder?: {
    __typename?: 'ZoraDropHolder'
    id: string
    holder: any
    balance: any
    totalSpent: any
    totalPurchased: any
    updatedAt: any
    updatedAtBlock: any
    drop: {
      __typename?: 'ZoraDrop'
      id: string
      name: string
      symbol: string
      imageURI: string
    }
  } | null
}

export type ZoraDropHoldersQueryVariables = Exact<{
  where?: InputMaybe<ZoraDropHolder_Filter>
  first?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ZoraDropHolder_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
}>

export type ZoraDropHoldersQuery = {
  __typename?: 'Query'
  zoraDropHolders: Array<{
    __typename?: 'ZoraDropHolder'
    id: string
    holder: any
    balance: any
    totalSpent: any
    totalPurchased: any
    updatedAt: any
    updatedAtBlock: any
    drop: {
      __typename?: 'ZoraDrop'
      id: string
      name: string
      symbol: string
      imageURI: string
    }
  }>
}

export type ZoraDropWithHoldersQueryVariables = Exact<{
  dropAddress: Scalars['ID']['input']
}>

export type ZoraDropWithHoldersQuery = {
  __typename?: 'Query'
  zoraDrop?: {
    __typename?: 'ZoraDrop'
    creator: any
    description: string
    royaltyBPS: number
    fundsRecipient: any
    transactionHash: any
    id: string
    name: string
    symbol: string
    imageURI: string
    animationURI: string
    createdAt: any
    publicSaleStart: any
    publicSaleEnd: any
    publicSalePrice: any
    editionSize: any
    maxSalePurchasePerAddress: any
    holders: Array<{
      __typename?: 'ZoraDropHolder'
      id: string
      holder: any
      balance: any
      totalSpent: any
      totalPurchased: any
      updatedAt: any
    }>
    dao?: { __typename?: 'DAO'; id: string; name: string; contractImage: string } | null
  } | null
}

export const AuctionFragmentDoc = gql`
  fragment Auction on Auction {
    dao {
      name
      auctionAddress
      tokenAddress
    }
  }
`
export const AuctionBidFragmentDoc = gql`
  fragment AuctionBid on AuctionBid {
    id
    amount
    bidder
    comment
  }
`
export const ClankerTokenCardFragmentDoc = gql`
  fragment ClankerTokenCard on ClankerToken {
    tokenAddress
    tokenName
    tokenSymbol
    tokenImage
  }
`
export const ClankerTokenHolderFragmentDoc = gql`
  fragment ClankerTokenHolder on ClankerTokenHolder {
    id
    holder
    balance
    updatedAt
    updatedAtBlock
    token {
      ...ClankerTokenCard
    }
  }
  ${ClankerTokenCardFragmentDoc}
`
export const ClankerTokenFragmentDoc = gql`
  fragment ClankerToken on ClankerToken {
    ...ClankerTokenCard
    pairedToken
    poolId
    poolHook
    createdAt
    transactionHash
    msgSender
    dao {
      id
      name
      contractImage
    }
  }
  ${ClankerTokenCardFragmentDoc}
`
export const ClankerTokenWithHoldersFragmentDoc = gql`
  fragment ClankerTokenWithHolders on ClankerToken {
    ...ClankerToken
    holders(first: 10, orderBy: balance, orderDirection: desc) {
      id
      holder
      balance
      updatedAt
    }
  }
  ${ClankerTokenFragmentDoc}
`
export const CurrentAuctionFragmentDoc = gql`
  fragment CurrentAuction on Auction {
    endTime
    highestBid {
      amount
      bidder
    }
    token {
      name
      image
      tokenId
    }
  }
`
export const DaoFragmentDoc = gql`
  fragment DAO on DAO {
    name
    contractImage
    links {
      id
      key
      url
    }
    tokenAddress
    metadataAddress
    treasuryAddress
    auctionAddress
    governorAddress
  }
`
export const ExploreDaoFragmentDoc = gql`
  fragment ExploreDao on Auction {
    dao {
      name
      tokenAddress
    }
    endTime
    highestBid {
      amount
      bidder
    }
    token {
      name
      image
      tokenId
    }
  }
`
export const ProposalFragmentDoc = gql`
  fragment Proposal on Proposal {
    abstainVotes
    againstVotes
    calldatas
    description
    representedAddress
    discussionUrl
    descriptionHash
    executableFrom
    expiresAt
    forVotes
    proposalId
    proposalNumber
    proposalThreshold
    proposer
    quorumVotes
    targets
    timeCreated
    title
    values
    voteEnd
    voteStart
    snapshotBlockNumber
    transactionHash
    executedAt
    executionTransactionHash
    vetoTransactionHash
    cancelTransactionHash
    updatePeriodEnd
    updateMessage
    updateCount
    dao {
      governorAddress
      tokenAddress
    }
    candidateVersion {
      candidateId
      computedProposalId
      attestationUID
      proposal {
        id
        proposalId
        proposalNumber
      }
      versionNumber
      group {
        candidateNumber
      }
    }
    replaces {
      proposalId
      proposalNumber
    }
    replacedBy {
      proposalId
      proposalNumber
    }
  }
`
export const ProposalDetailFragmentDoc = gql`
  fragment ProposalDetail on Proposal {
    ...Proposal
    metadata
  }
  ${ProposalFragmentDoc}
`
export const ProposalVoteFragmentDoc = gql`
  fragment ProposalVote on ProposalVote {
    voter
    support
    weight
    reason
    timestamp
  }
`
export const SnapshotFragmentDoc = gql`
  fragment Snapshot on Snapshot {
    dao {
      name
      id
    }
    id
    ownerCount
    voterCount
    proposalCount
    totalSupply
    timestamp
    blockNumber
  }
`
export const SwapHopFragmentDoc = gql`
  fragment SwapHop on SwapHop {
    id
    tokenIn
    tokenOut
    poolId
    fee
    hooks
    tickSpacing
    hopIndex
  }
`
export const PaymentOptionFragmentDoc = gql`
  fragment PaymentOption on PaymentOption {
    id
    tokenAddress
    tokenType
    tokenName
    tokenSymbol
    startHopIndex
    endHopIndex
    isDirectSwap
  }
`
export const SwapRouteFragmentDoc = gql`
  fragment SwapRoute on SwapRoute {
    id
    coinAddress
    clankerToken {
      tokenAddress
      tokenName
      tokenSymbol
    }
    zoraCoin {
      coinAddress
      name
      symbol
    }
    mainPath(orderBy: hopIndex, orderDirection: asc) {
      ...SwapHop
    }
    paymentOptions {
      ...PaymentOption
    }
    createdAt
    updatedAt
  }
  ${SwapHopFragmentDoc}
  ${PaymentOptionFragmentDoc}
`
export const TokenFragmentDoc = gql`
  fragment Token on Token {
    tokenId
    tokenContract
    name
    dao {
      description
    }
    image
    owner
    mintedAt
  }
`
export const ZoraCoinHolderFragmentDoc = gql`
  fragment ZoraCoinHolder on ZoraCoinHolder {
    id
    holder
    balance
    updatedAt
    updatedAtBlock
    coin {
      coinAddress
      name
      symbol
      uri
    }
  }
`
export const ZoraCoinCardFragmentDoc = gql`
  fragment ZoraCoinCard on ZoraCoin {
    coinAddress
    name
    symbol
    uri
    createdAt
    dao {
      id
      name
      contractImage
    }
  }
`
export const ZoraCoinFragmentDoc = gql`
  fragment ZoraCoin on ZoraCoin {
    ...ZoraCoinCard
    id
    transactionHash
    caller
    currency
    poolKeyHash
    poolHooks
    poolFee
    poolTickSpacing
  }
  ${ZoraCoinCardFragmentDoc}
`
export const ZoraCoinWithHoldersFragmentDoc = gql`
  fragment ZoraCoinWithHolders on ZoraCoin {
    ...ZoraCoin
    holders(first: 10, orderBy: balance, orderDirection: desc) {
      id
      holder
      balance
      updatedAt
    }
  }
  ${ZoraCoinFragmentDoc}
`
export const ZoraDropHolderFragmentDoc = gql`
  fragment ZoraDropHolder on ZoraDropHolder {
    id
    holder
    balance
    totalSpent
    totalPurchased
    updatedAt
    updatedAtBlock
    drop {
      id
      name
      symbol
      imageURI
    }
  }
`
export const ZoraDropCardFragmentDoc = gql`
  fragment ZoraDropCard on ZoraDrop {
    id
    name
    symbol
    imageURI
    animationURI
    createdAt
    publicSaleStart
    publicSaleEnd
    publicSalePrice
    editionSize
    maxSalePurchasePerAddress
  }
`
export const ZoraDropFragmentDoc = gql`
  fragment ZoraDrop on ZoraDrop {
    ...ZoraDropCard
    creator
    description
    royaltyBPS
    fundsRecipient
    transactionHash
    dao {
      id
      name
      contractImage
    }
  }
  ${ZoraDropCardFragmentDoc}
`
export const ZoraDropWithHoldersFragmentDoc = gql`
  fragment ZoraDropWithHolders on ZoraDrop {
    ...ZoraDrop
    holders(first: 10, orderBy: balance, orderDirection: desc) {
      id
      holder
      balance
      totalSpent
      totalPurchased
      updatedAt
    }
  }
  ${ZoraDropFragmentDoc}
`
export const CandidateGroupFragmentFragmentDoc = gql`
  fragment CandidateGroupFragment on ProposalCandidateGroup {
    id
    dao {
      id
      tokenAddress
      governorAddress
    }
    proposer
    salt
    createdAt
    candidateNumber
    versionCount
    commentCount
    latestVersionNumber
    currentForCount
    currentAgainstCount
    currentAbstainCount
    versions(first: 1, orderBy: versionNumber, orderDirection: desc) {
      title
    }
  }
`
export const CandidateVersionFragmentFragmentDoc = gql`
  fragment CandidateVersionFragment on ProposalCandidateVersion {
    id
    candidateId
    salt
    attester
    versionNumber
    targets
    values
    calldatas
    group {
      candidateNumber
    }
    title
    description
    metadata
    representedAddress
    computedProposalId
    attestationUID
    proposal {
      id
      proposalId
      proposalNumber
    }
    createdAt
    discussionUrl
    signatureCount
    totalVoteWeight
    revoked
  }
`
export const CandidateGroupDetailFragmentFragmentDoc = gql`
  fragment CandidateGroupDetailFragment on ProposalCandidateGroup {
    id
    dao {
      id
      tokenAddress
      governorAddress
    }
    proposer
    salt
    createdAt
    candidateNumber
    versionCount
    commentCount
    latestVersionNumber
    currentForCount
    currentAgainstCount
    currentAbstainCount
    leadingVersion {
      ...CandidateVersionFragment
    }
    versions {
      ...CandidateVersionFragment
    }
  }
  ${CandidateVersionFragmentFragmentDoc}
`
export const CandidateCommentFragmentFragmentDoc = gql`
  fragment CandidateCommentFragment on CandidateComment {
    id
    candidate
    commenter
    voteWeight
    support
    comment
    parentComment {
      id
    }
    createdAt
    revoked
  }
`
export const CandidateSponsorSignatureFragmentFragmentDoc = gql`
  fragment CandidateSponsorSignatureFragment on CandidateSponsorSignature {
    id
    signer
    proposalId
    nonce
    deadline
    signature
    revoked
    createdAt
    voteWeight
  }
`
export const DaoMultisigUpdateFragmentDoc = gql`
  fragment DaoMultisigUpdate on DaoMultisigUpdate {
    id
    transactionHash
    timestamp
    daoMultisig
    creator
  }
`
export const ProposalUpdateFragmentDoc = gql`
  fragment ProposalUpdate on ProposalUpdate {
    id
    transactionHash
    timestamp
    messageType
    message
    creator
    originalMessageId
  }
`
export const CandidateGroupByNumberDocument = gql`
  query CandidateGroupByNumber($candidateNumber: Int!, $dao: String) {
    proposalCandidateGroups(
      first: 1
      where: { candidateNumber: $candidateNumber, dao: $dao }
    ) {
      ...CandidateGroupDetailFragment
    }
  }
  ${CandidateGroupDetailFragmentFragmentDoc}
`
export const ActiveAuctionsDocument = gql`
  query activeAuctions($first: Int!, $where: Auction_filter!) {
    auctions(orderBy: endTime, orderDirection: desc, first: $first, where: $where) {
      ...Auction
    }
  }
  ${AuctionFragmentDoc}
`
export const ActiveDaosDocument = gql`
  query activeDaos($first: Int!, $where: DAO_filter!) {
    daos(first: $first, where: $where) {
      id
    }
  }
`
export const AuctionBidsDocument = gql`
  query auctionBids($id: ID!) {
    auction(id: $id) {
      bids(orderBy: bidTime, orderDirection: desc) {
        ...AuctionBid
      }
    }
  }
  ${AuctionBidFragmentDoc}
`
export const AuctionHistoryDocument = gql`
  query auctionHistory(
    $startTime: BigInt!
    $daoId: ID!
    $orderBy: Auction_orderBy
    $orderDirection: OrderDirection
    $first: Int
  ) {
    dao(id: $daoId) {
      auctions(
        where: { endTime_gt: $startTime, settled: true }
        orderBy: $orderBy
        orderDirection: $orderDirection
        first: $first
      ) {
        id
        endTime
        winningBid {
          amount
        }
        settled
      }
    }
  }
`
export const CandidateCommentsDocument = gql`
  query CandidateComments(
    $where: CandidateComment_filter
    $first: Int
    $skip: Int
    $orderBy: CandidateComment_orderBy
    $orderDirection: OrderDirection
  ) {
    candidateComments(
      where: $where
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      ...CandidateCommentFragment
    }
  }
  ${CandidateCommentFragmentFragmentDoc}
`
export const CandidateGroupDocument = gql`
  query CandidateGroup($candidateId: ID!) {
    proposalCandidateGroup(id: $candidateId) {
      ...CandidateGroupDetailFragment
    }
  }
  ${CandidateGroupDetailFragmentFragmentDoc}
`
export const CandidateGroupsDocument = gql`
  query CandidateGroups(
    $where: ProposalCandidateGroup_filter
    $first: Int
    $skip: Int
    $orderBy: ProposalCandidateGroup_orderBy
    $orderDirection: OrderDirection
  ) {
    proposalCandidateGroups(
      where: $where
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      ...CandidateGroupFragment
    }
  }
  ${CandidateGroupFragmentFragmentDoc}
`
export const CandidateSponsorSignaturesDocument = gql`
  query CandidateSponsorSignatures(
    $where: CandidateSponsorSignature_filter
    $first: Int
    $skip: Int
    $orderBy: CandidateSponsorSignature_orderBy
    $orderDirection: OrderDirection
  ) {
    candidateSponsorSignatures(
      where: $where
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      ...CandidateSponsorSignatureFragment
    }
  }
  ${CandidateSponsorSignatureFragmentFragmentDoc}
`
export const CandidateVersionDocument = gql`
  query CandidateVersion($versionId: ID!) {
    proposalCandidateVersion(id: $versionId) {
      ...CandidateVersionFragment
    }
  }
  ${CandidateVersionFragmentFragmentDoc}
`
export const ClankerTokenDocument = gql`
  query clankerToken($tokenAddress: ID!) {
    clankerToken(id: $tokenAddress) {
      ...ClankerToken
    }
  }
  ${ClankerTokenFragmentDoc}
`
export const ClankerTokenHolderDocument = gql`
  query ClankerTokenHolder($id: ID!) {
    clankerTokenHolder(id: $id) {
      ...ClankerTokenHolder
    }
  }
  ${ClankerTokenHolderFragmentDoc}
`
export const ClankerTokenHoldersDocument = gql`
  query ClankerTokenHolders(
    $where: ClankerTokenHolder_filter
    $first: Int = 100
    $skip: Int = 0
    $orderBy: ClankerTokenHolder_orderBy = updatedAt
    $orderDirection: OrderDirection = desc
  ) {
    clankerTokenHolders(
      where: $where
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      ...ClankerTokenHolder
    }
  }
  ${ClankerTokenHolderFragmentDoc}
`
export const ClankerTokenWithHoldersDocument = gql`
  query clankerTokenWithHolders($tokenAddress: ID!) {
    clankerToken(id: $tokenAddress) {
      ...ClankerTokenWithHolders
    }
  }
  ${ClankerTokenWithHoldersFragmentDoc}
`
export const DaoClankerTokensDocument = gql`
  query daoClankerTokens(
    $daoId: ID!
    $first: Int = 100
    $skip: Int = 0
    $orderBy: ClankerToken_orderBy = createdAt
    $orderDirection: OrderDirection = desc
  ) {
    dao(id: $daoId) {
      id
      clankerTokens(
        first: $first
        orderBy: $orderBy
        orderDirection: $orderDirection
        skip: $skip
      ) {
        ...ClankerTokenCard
      }
    }
  }
  ${ClankerTokenCardFragmentDoc}
`
export const DaoClankerTokensFullDocument = gql`
  query daoClankerTokensFull(
    $daoId: ID!
    $first: Int = 100
    $skip: Int = 0
    $orderBy: ClankerToken_orderBy = createdAt
    $orderDirection: OrderDirection = desc
  ) {
    dao(id: $daoId) {
      id
      clankerTokens(
        first: $first
        orderBy: $orderBy
        orderDirection: $orderDirection
        skip: $skip
      ) {
        ...ClankerToken
      }
    }
  }
  ${ClankerTokenFragmentDoc}
`
export const DaoInfoDocument = gql`
  query daoInfo($tokenAddress: ID!) {
    dao(id: $tokenAddress) {
      name
      description
      metadata
      contractImage
      projectURI
      links {
        id
        key
        url
      }
      totalSupply
      ownerCount
    }
  }
`
export const DaoMembersListDocument = gql`
  query daoMembersList(
    $where: DAOTokenOwner_filter
    $first: Int
    $skip: Int
    $orderBy: DAOTokenOwner_orderBy
    $orderDirection: OrderDirection
  ) {
    daotokenOwners(
      where: $where
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      owner
      delegate
      daoTokenCount
      daoTokens(first: $first) {
        tokenId
        mintedAt
      }
    }
  }
`
export const DaoMembershipDocument = gql`
  query daoMembership($ownerId: ID!, $voterId: ID!) {
    daotokenOwner(id: $ownerId) {
      id
      owner
      delegate
      daoTokenCount
      daoTokens {
        owner
        tokenId
        mintedAt
      }
    }
    daovoter(id: $voterId) {
      id
      voter
      daoTokenCount
      daoTokens {
        owner
        tokenId
        mintedAt
      }
    }
  }
`
export const DaoMetadataDocument = gql`
  query daoMetadata($tokenAddress: ID!, $first: Int!) {
    dao(id: $tokenAddress) {
      metadataProperties(orderBy: createdAt) {
        ipfsBaseUri
        ipfsExtension
        names
        items(orderBy: index, first: $first) {
          name
          propertyId
          isNewProperty
        }
      }
    }
  }
`
export const DaoMultisigsDocument = gql`
  query daoMultisigs($daoId: String!, $creators: [Bytes!]!, $first: Int!, $skip: Int!) {
    daoMultisigUpdates(
      where: { dao: $daoId, deleted: false, creator_in: $creators }
      orderBy: timestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      ...DaoMultisigUpdate
    }
  }
  ${DaoMultisigUpdateFragmentDoc}
`
export const DaoNextAndPreviousTokensDocument = gql`
  query daoNextAndPreviousTokens($tokenAddress: String!, $tokenId: BigInt!) {
    prev: tokens(
      where: { dao: $tokenAddress, tokenId_lt: $tokenId }
      orderBy: tokenId
      orderDirection: desc
      first: 1
    ) {
      tokenId
    }
    next: tokens(
      where: { dao: $tokenAddress, tokenId_gt: $tokenId }
      orderBy: tokenId
      orderDirection: asc
      first: 1
    ) {
      tokenId
    }
    latest: tokens(
      where: { dao: $tokenAddress }
      orderBy: tokenId
      orderDirection: desc
      first: 1
    ) {
      tokenId
    }
  }
`
export const DaoOgMetadataDocument = gql`
  query daoOGMetadata($tokenAddress: ID!) {
    dao(id: $tokenAddress) {
      name
      description
      links {
        id
        key
        url
      }
      contractImage
      totalSupply
      ownerCount
      proposalCount
      tokenAddress
      metadataAddress
      auctionAddress
      treasuryAddress
      governorAddress
    }
  }
`
export const ExploreDaosSearchDocument = gql`
  query exploreDaosSearch(
    $text: String!
    $first: Int!
    $skip: Int!
    $where: DAO_filter
    $whereSimple: DAO_filter
  ) {
    daoSearch(text: $text, first: $first, skip: $skip, where: $where) {
      tokenAddress
      name
      symbol
      description
      links {
        id
        key
        url
      }
      projectURI
      treasuryAddress
      auctionAddress
      governorAddress
      metadataAddress
      tokens(first: 1, orderBy: tokenId, orderDirection: desc) {
        tokenId
        name
        image
        auction {
          endTime
          settled
          highestBid {
            amount
            bidder
          }
        }
      }
    }
    daos(first: $first, skip: $skip, where: $whereSimple) {
      tokenAddress
      name
      symbol
      description
      links {
        id
        key
        url
      }
      projectURI
      treasuryAddress
      auctionAddress
      governorAddress
      metadataAddress
      tokens(first: 1, orderBy: tokenId, orderDirection: desc) {
        tokenId
        name
        image
        auction {
          endTime
          settled
          highestBid {
            amount
            bidder
          }
        }
      }
    }
  }
`
export const DaoVotersDocument = gql`
  query daoVoters(
    $where: DAOVoter_filter
    $first: Int
    $skip: Int
    $orderBy: DAOVoter_orderBy
    $orderDirection: OrderDirection
  ) {
    daovoters(
      where: $where
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      voter
      daoTokenCount
      daoTokens(first: $first) {
        tokenId
        mintedAt
      }
    }
  }
`
export const DaoZoraCoinsDocument = gql`
  query daoZoraCoins(
    $daoId: ID!
    $first: Int = 100
    $skip: Int = 0
    $orderBy: ZoraCoin_orderBy = createdAt
    $orderDirection: OrderDirection = desc
  ) {
    dao(id: $daoId) {
      id
      zoraCoins(
        first: $first
        orderBy: $orderBy
        orderDirection: $orderDirection
        skip: $skip
      ) {
        ...ZoraCoinCard
      }
    }
  }
  ${ZoraCoinCardFragmentDoc}
`
export const DaoZoraDropsDocument = gql`
  query daoZoraDrops(
    $daoId: ID!
    $first: Int = 100
    $skip: Int = 0
    $orderBy: ZoraDrop_orderBy = createdAt
    $orderDirection: OrderDirection = desc
  ) {
    dao(id: $daoId) {
      id
      zoraDrops(
        first: $first
        orderBy: $orderBy
        orderDirection: $orderDirection
        skip: $skip
      ) {
        ...ZoraDropCard
      }
    }
  }
  ${ZoraDropCardFragmentDoc}
`
export const DaosForDashboardDocument = gql`
  query daosForDashboard($user: Bytes!, $first: Int, $skip: Int) {
    daos(
      where: { or: [{ voters_: { voter: $user } }, { owners_: { owner: $user } }] }
      first: $first
      skip: $skip
    ) {
      ...DAO
      contractImage
      auctionConfig {
        minimumBidIncrement
        reservePrice
      }
      proposals(
        where: { executed_not: true, canceled_not: true, vetoed_not: true }
        first: 10
        skip: 0
        orderBy: proposalNumber
        orderDirection: desc
      ) {
        ...Proposal
        voteEnd
        voteStart
        expiresAt
        votes {
          voter
        }
      }
      currentAuction {
        ...CurrentAuction
      }
    }
  }
  ${DaoFragmentDoc}
  ${ProposalFragmentDoc}
  ${CurrentAuctionFragmentDoc}
`
export const DaosForUserDocument = gql`
  query daosForUser($user: Bytes!, $first: Int, $skip: Int) {
    daos(
      where: { or: [{ voters_: { voter: $user } }, { owners_: { owner: $user } }] }
      first: $first
      skip: $skip
    ) {
      ...DAO
    }
  }
  ${DaoFragmentDoc}
`
export const DaosWithClankerTokensDocument = gql`
  query daosWithClankerTokens($daoIds: [ID!]!) {
    daos(where: { id_in: $daoIds }) {
      id
      clankerTokens(first: 1) {
        id
      }
    }
  }
`
export const FeedEventsDocument = gql`
  query feedEvents($first: Int!, $where: FeedEvent_filter) {
    feedEvents(first: $first, where: $where, orderBy: timestamp, orderDirection: desc) {
      __typename
      id
      type
      timestamp
      blockNumber
      transactionHash
      actor
      dao {
        auctionAddress
        governorAddress
        metadataAddress
        tokenAddress
        treasuryAddress
        name
        symbol
        contractImage
      }
      ... on ProposalCreatedEvent {
        proposal {
          proposalId
          proposalNumber
          timeCreated
          title
          description
          representedAddress
          discussionUrl
          proposer
        }
      }
      ... on ProposalVotedEvent {
        proposal {
          proposalId
          proposalNumber
          timeCreated
          title
          description
          representedAddress
          discussionUrl
          proposer
        }
        vote {
          support
          weight
          reason
        }
      }
      ... on ProposalUpdatedEvent {
        proposal {
          proposalId
          proposalNumber
          timeCreated
          title
          description
          representedAddress
          discussionUrl
          proposer
        }
        update {
          messageType
          message
          originalMessageId
        }
      }
      ... on ProposalExecutedEvent {
        proposal {
          proposalId
          proposalNumber
          timeCreated
          title
          description
          representedAddress
          discussionUrl
          proposer
        }
      }
      ... on AuctionCreatedEvent {
        auction {
          id
          startTime
          endTime
          token {
            tokenId
            name
            image
          }
        }
      }
      ... on AuctionBidPlacedEvent {
        auction {
          id
          startTime
          endTime
          token {
            tokenId
            owner
            name
            image
          }
        }
        bid {
          amount
          bidTime
          bidder
          comment
        }
      }
      ... on AuctionSettledEvent {
        auction {
          id
          startTime
          endTime
          token {
            tokenId
            owner
            name
            image
          }
        }
        amount
      }
      ... on ClankerTokenCreatedEvent {
        clankerToken {
          tokenAddress
          tokenName
          tokenSymbol
          tokenImage
          poolId
        }
      }
      ... on ZoraCoinCreatedEvent {
        zoraCoin {
          coinAddress
          name
          symbol
          uri
          currency
        }
      }
      ... on ZoraDropCreatedEvent {
        zoraDrop {
          id
          creator
          name
          symbol
          description
          imageURI
          animationURI
          editionSize
          metadataRenderer
          royaltyBPS
          fundsRecipient
          publicSalePrice
          maxSalePurchasePerAddress
          publicSaleStart
          publicSaleEnd
          presaleStart
          presaleEnd
          presaleMerkleRoot
        }
      }
    }
  }
`
export const FindAuctionsDocument = gql`
  query findAuctions(
    $orderBy: Auction_orderBy
    $orderDirection: OrderDirection
    $where: Auction_filter
    $skip: Int
    $first: Int
  ) {
    auctions(
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $first
      skip: $skip
    ) {
      ...ExploreDao
    }
  }
  ${ExploreDaoFragmentDoc}
`
export const FindAuctionsForDaosDocument = gql`
  query findAuctionsForDaos($daos: [String!], $orderBy: Auction_orderBy, $skip: Int) {
    auctions(
      where: { settled: false, dao_in: $daos }
      orderBy: $orderBy
      orderDirection: desc
      first: 30
      skip: $skip
    ) {
      ...ExploreDao
    }
  }
  ${ExploreDaoFragmentDoc}
`
export const SyncStatusDocument = gql`
  query syncStatus {
    _meta {
      block {
        number
      }
      hasIndexingErrors
    }
  }
`
export const PropdatesDocument = gql`
  query propdates($proposalId: String!, $first: Int!, $skip: Int!) {
    proposalUpdates(
      where: { proposal: $proposalId, deleted: false }
      orderBy: timestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      ...ProposalUpdate
    }
  }
  ${ProposalUpdateFragmentDoc}
`
export const ProposalDocument = gql`
  query proposal($proposalId: ID!) {
    proposal(id: $proposalId) {
      ...ProposalDetail
      votes {
        ...ProposalVote
      }
    }
  }
  ${ProposalDetailFragmentDoc}
  ${ProposalVoteFragmentDoc}
`
export const ProposalByExecutionTxHashDocument = gql`
  query proposalByExecutionTxHash($executionTransactionHash: Bytes!) {
    proposals(
      where: { executionTransactionHash: $executionTransactionHash }
      first: 1
      orderBy: timeCreated
      orderDirection: desc
    ) {
      proposer
      proposalId
      proposalNumber
      title
      dao {
        id
        name
        contractImage
      }
    }
  }
`
export const ProposalOgMetadataDocument = gql`
  query proposalOGMetadata($where: Proposal_filter!, $first: Int!) {
    proposals(where: $where, first: $first) {
      ...ProposalDetail
      votes {
        ...ProposalVote
      }
      dao {
        name
        contractImage
        tokenAddress
        metadataAddress
        auctionAddress
        treasuryAddress
        governorAddress
      }
    }
  }
  ${ProposalDetailFragmentDoc}
  ${ProposalVoteFragmentDoc}
`
export const ProposalVersionsDocument = gql`
  query proposalVersions($where: Proposal_filter) {
    proposals(where: $where, orderBy: updateCount, orderDirection: asc) {
      ...Proposal
    }
  }
  ${ProposalFragmentDoc}
`
export const ProposalsDocument = gql`
  query proposals($where: Proposal_filter, $first: Int!, $skip: Int) {
    proposals(
      where: $where
      first: $first
      skip: $skip
      orderBy: timeCreated
      orderDirection: desc
    ) {
      ...Proposal
      votes {
        ...ProposalVote
      }
    }
  }
  ${ProposalFragmentDoc}
  ${ProposalVoteFragmentDoc}
`
export const SnapshotsDocument = gql`
  query snapshots(
    $where: Snapshot_filter
    $orderBy: Snapshot_orderBy
    $orderDirection: OrderDirection
    $first: Int
    $skip: Int
  ) {
    snapshots(
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $first
      skip: $skip
    ) {
      ...Snapshot
    }
  }
  ${SnapshotFragmentDoc}
`
export const SwapRouteDocument = gql`
  query swapRoute($coinAddress: ID!) {
    swapRoute(id: $coinAddress) {
      ...SwapRoute
    }
  }
  ${SwapRouteFragmentDoc}
`
export const TokenWithDaoDocument = gql`
  query tokenWithDao($id: ID!) {
    token(id: $id) {
      ...Token
      auction {
        winningBid {
          amount
          bidder
        }
      }
      dao {
        name
        description
        links {
          id
          key
          url
        }
        contractImage
        totalSupply
        ownerCount
        proposalCount
        tokenAddress
        metadataAddress
        auctionAddress
        treasuryAddress
        governorAddress
      }
    }
  }
  ${TokenFragmentDoc}
`
export const TokensDocument = gql`
  query tokens(
    $where: Token_filter
    $orderBy: Token_orderBy
    $orderDirection: OrderDirection
    $first: Int
    $skip: Int
  ) {
    tokens(
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $first
      skip: $skip
    ) {
      ...Token
    }
  }
  ${TokenFragmentDoc}
`
export const TotalAuctionSalesDocument = gql`
  query totalAuctionSales($tokenAddress: ID!) {
    dao(id: $tokenAddress) {
      totalAuctionSales
    }
  }
`
export const TreasuryAssetPinsDocument = gql`
  query treasuryAssetPins($daoId: String!, $first: Int!, $skip: Int!) {
    treasuryAssetPins(
      where: { dao: $daoId }
      orderBy: timestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      transactionHash
      timestamp
      tokenType
      token
      isCollection
      tokenId
      creator
      revoked
      revokedAt
      revokedBy
      revokedTxHash
    }
  }
`
export const UserProposalVoteDocument = gql`
  query userProposalVote($where: ProposalVote_filter) {
    proposalVotes(where: $where, first: 1) {
      ...ProposalVote
    }
  }
  ${ProposalVoteFragmentDoc}
`
export const ZoraCoinDocument = gql`
  query zoraCoin($coinAddress: ID!) {
    zoraCoin(id: $coinAddress) {
      ...ZoraCoin
    }
  }
  ${ZoraCoinFragmentDoc}
`
export const ZoraCoinHolderDocument = gql`
  query ZoraCoinHolder($id: ID!) {
    zoraCoinHolder(id: $id) {
      ...ZoraCoinHolder
    }
  }
  ${ZoraCoinHolderFragmentDoc}
`
export const ZoraCoinHoldersDocument = gql`
  query ZoraCoinHolders(
    $where: ZoraCoinHolder_filter
    $first: Int = 100
    $skip: Int = 0
    $orderBy: ZoraCoinHolder_orderBy = updatedAt
    $orderDirection: OrderDirection = desc
  ) {
    zoraCoinHolders(
      where: $where
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      ...ZoraCoinHolder
    }
  }
  ${ZoraCoinHolderFragmentDoc}
`
export const ZoraCoinWithHoldersDocument = gql`
  query zoraCoinWithHolders($coinAddress: ID!) {
    zoraCoin(id: $coinAddress) {
      ...ZoraCoinWithHolders
    }
  }
  ${ZoraCoinWithHoldersFragmentDoc}
`
export const ZoraDropDocument = gql`
  query zoraDrop($dropAddress: ID!) {
    zoraDrop(id: $dropAddress) {
      ...ZoraDrop
    }
  }
  ${ZoraDropFragmentDoc}
`
export const ZoraDropHolderDocument = gql`
  query ZoraDropHolder($id: ID!) {
    zoraDropHolder(id: $id) {
      ...ZoraDropHolder
    }
  }
  ${ZoraDropHolderFragmentDoc}
`
export const ZoraDropHoldersDocument = gql`
  query ZoraDropHolders(
    $where: ZoraDropHolder_filter
    $first: Int = 100
    $skip: Int = 0
    $orderBy: ZoraDropHolder_orderBy = updatedAt
    $orderDirection: OrderDirection = desc
  ) {
    zoraDropHolders(
      where: $where
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      ...ZoraDropHolder
    }
  }
  ${ZoraDropHolderFragmentDoc}
`
export const ZoraDropWithHoldersDocument = gql`
  query zoraDropWithHolders($dropAddress: ID!) {
    zoraDrop(id: $dropAddress) {
      ...ZoraDropWithHolders
    }
  }
  ${ZoraDropWithHoldersFragmentDoc}
`

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any
) => Promise<T>

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
  _variables
) => action()

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    CandidateGroupByNumber(
      variables: CandidateGroupByNumberQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<CandidateGroupByNumberQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CandidateGroupByNumberQuery>({
            document: CandidateGroupByNumberDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'CandidateGroupByNumber',
        'query',
        variables
      )
    },
    activeAuctions(
      variables: ActiveAuctionsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ActiveAuctionsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ActiveAuctionsQuery>({
            document: ActiveAuctionsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'activeAuctions',
        'query',
        variables
      )
    },
    activeDaos(
      variables: ActiveDaosQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ActiveDaosQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ActiveDaosQuery>({
            document: ActiveDaosDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'activeDaos',
        'query',
        variables
      )
    },
    auctionBids(
      variables: AuctionBidsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<AuctionBidsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<AuctionBidsQuery>({
            document: AuctionBidsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'auctionBids',
        'query',
        variables
      )
    },
    auctionHistory(
      variables: AuctionHistoryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<AuctionHistoryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<AuctionHistoryQuery>({
            document: AuctionHistoryDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'auctionHistory',
        'query',
        variables
      )
    },
    CandidateComments(
      variables?: CandidateCommentsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<CandidateCommentsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CandidateCommentsQuery>({
            document: CandidateCommentsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'CandidateComments',
        'query',
        variables
      )
    },
    CandidateGroup(
      variables: CandidateGroupQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<CandidateGroupQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CandidateGroupQuery>({
            document: CandidateGroupDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'CandidateGroup',
        'query',
        variables
      )
    },
    CandidateGroups(
      variables?: CandidateGroupsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<CandidateGroupsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CandidateGroupsQuery>({
            document: CandidateGroupsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'CandidateGroups',
        'query',
        variables
      )
    },
    CandidateSponsorSignatures(
      variables?: CandidateSponsorSignaturesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<CandidateSponsorSignaturesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CandidateSponsorSignaturesQuery>({
            document: CandidateSponsorSignaturesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'CandidateSponsorSignatures',
        'query',
        variables
      )
    },
    CandidateVersion(
      variables: CandidateVersionQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<CandidateVersionQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CandidateVersionQuery>({
            document: CandidateVersionDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'CandidateVersion',
        'query',
        variables
      )
    },
    clankerToken(
      variables: ClankerTokenQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ClankerTokenQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ClankerTokenQuery>({
            document: ClankerTokenDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'clankerToken',
        'query',
        variables
      )
    },
    ClankerTokenHolder(
      variables: ClankerTokenHolderQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ClankerTokenHolderQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ClankerTokenHolderQuery>({
            document: ClankerTokenHolderDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'ClankerTokenHolder',
        'query',
        variables
      )
    },
    ClankerTokenHolders(
      variables?: ClankerTokenHoldersQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ClankerTokenHoldersQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ClankerTokenHoldersQuery>({
            document: ClankerTokenHoldersDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'ClankerTokenHolders',
        'query',
        variables
      )
    },
    clankerTokenWithHolders(
      variables: ClankerTokenWithHoldersQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ClankerTokenWithHoldersQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ClankerTokenWithHoldersQuery>({
            document: ClankerTokenWithHoldersDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'clankerTokenWithHolders',
        'query',
        variables
      )
    },
    daoClankerTokens(
      variables: DaoClankerTokensQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaoClankerTokensQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaoClankerTokensQuery>({
            document: DaoClankerTokensDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daoClankerTokens',
        'query',
        variables
      )
    },
    daoClankerTokensFull(
      variables: DaoClankerTokensFullQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaoClankerTokensFullQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaoClankerTokensFullQuery>({
            document: DaoClankerTokensFullDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daoClankerTokensFull',
        'query',
        variables
      )
    },
    daoInfo(
      variables: DaoInfoQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaoInfoQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaoInfoQuery>({
            document: DaoInfoDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daoInfo',
        'query',
        variables
      )
    },
    daoMembersList(
      variables?: DaoMembersListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaoMembersListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaoMembersListQuery>({
            document: DaoMembersListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daoMembersList',
        'query',
        variables
      )
    },
    daoMembership(
      variables: DaoMembershipQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaoMembershipQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaoMembershipQuery>({
            document: DaoMembershipDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daoMembership',
        'query',
        variables
      )
    },
    daoMetadata(
      variables: DaoMetadataQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaoMetadataQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaoMetadataQuery>({
            document: DaoMetadataDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daoMetadata',
        'query',
        variables
      )
    },
    daoMultisigs(
      variables: DaoMultisigsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaoMultisigsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaoMultisigsQuery>({
            document: DaoMultisigsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daoMultisigs',
        'query',
        variables
      )
    },
    daoNextAndPreviousTokens(
      variables: DaoNextAndPreviousTokensQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaoNextAndPreviousTokensQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaoNextAndPreviousTokensQuery>({
            document: DaoNextAndPreviousTokensDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daoNextAndPreviousTokens',
        'query',
        variables
      )
    },
    daoOGMetadata(
      variables: DaoOgMetadataQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaoOgMetadataQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaoOgMetadataQuery>({
            document: DaoOgMetadataDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daoOGMetadata',
        'query',
        variables
      )
    },
    exploreDaosSearch(
      variables: ExploreDaosSearchQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ExploreDaosSearchQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ExploreDaosSearchQuery>({
            document: ExploreDaosSearchDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'exploreDaosSearch',
        'query',
        variables
      )
    },
    daoVoters(
      variables?: DaoVotersQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaoVotersQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaoVotersQuery>({
            document: DaoVotersDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daoVoters',
        'query',
        variables
      )
    },
    daoZoraCoins(
      variables: DaoZoraCoinsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaoZoraCoinsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaoZoraCoinsQuery>({
            document: DaoZoraCoinsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daoZoraCoins',
        'query',
        variables
      )
    },
    daoZoraDrops(
      variables: DaoZoraDropsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaoZoraDropsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaoZoraDropsQuery>({
            document: DaoZoraDropsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daoZoraDrops',
        'query',
        variables
      )
    },
    daosForDashboard(
      variables: DaosForDashboardQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaosForDashboardQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaosForDashboardQuery>({
            document: DaosForDashboardDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daosForDashboard',
        'query',
        variables
      )
    },
    daosForUser(
      variables: DaosForUserQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaosForUserQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaosForUserQuery>({
            document: DaosForUserDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daosForUser',
        'query',
        variables
      )
    },
    daosWithClankerTokens(
      variables: DaosWithClankerTokensQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<DaosWithClankerTokensQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DaosWithClankerTokensQuery>({
            document: DaosWithClankerTokensDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'daosWithClankerTokens',
        'query',
        variables
      )
    },
    feedEvents(
      variables: FeedEventsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<FeedEventsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<FeedEventsQuery>({
            document: FeedEventsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'feedEvents',
        'query',
        variables
      )
    },
    findAuctions(
      variables?: FindAuctionsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<FindAuctionsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<FindAuctionsQuery>({
            document: FindAuctionsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'findAuctions',
        'query',
        variables
      )
    },
    findAuctionsForDaos(
      variables?: FindAuctionsForDaosQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<FindAuctionsForDaosQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<FindAuctionsForDaosQuery>({
            document: FindAuctionsForDaosDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'findAuctionsForDaos',
        'query',
        variables
      )
    },
    syncStatus(
      variables?: SyncStatusQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<SyncStatusQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SyncStatusQuery>({
            document: SyncStatusDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'syncStatus',
        'query',
        variables
      )
    },
    propdates(
      variables: PropdatesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<PropdatesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<PropdatesQuery>({
            document: PropdatesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'propdates',
        'query',
        variables
      )
    },
    proposal(
      variables: ProposalQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ProposalQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ProposalQuery>({
            document: ProposalDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'proposal',
        'query',
        variables
      )
    },
    proposalByExecutionTxHash(
      variables: ProposalByExecutionTxHashQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ProposalByExecutionTxHashQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ProposalByExecutionTxHashQuery>({
            document: ProposalByExecutionTxHashDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'proposalByExecutionTxHash',
        'query',
        variables
      )
    },
    proposalOGMetadata(
      variables: ProposalOgMetadataQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ProposalOgMetadataQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ProposalOgMetadataQuery>({
            document: ProposalOgMetadataDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'proposalOGMetadata',
        'query',
        variables
      )
    },
    proposalVersions(
      variables?: ProposalVersionsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ProposalVersionsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ProposalVersionsQuery>({
            document: ProposalVersionsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'proposalVersions',
        'query',
        variables
      )
    },
    proposals(
      variables: ProposalsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ProposalsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ProposalsQuery>({
            document: ProposalsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'proposals',
        'query',
        variables
      )
    },
    snapshots(
      variables?: SnapshotsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<SnapshotsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SnapshotsQuery>({
            document: SnapshotsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'snapshots',
        'query',
        variables
      )
    },
    swapRoute(
      variables: SwapRouteQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<SwapRouteQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SwapRouteQuery>({
            document: SwapRouteDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'swapRoute',
        'query',
        variables
      )
    },
    tokenWithDao(
      variables: TokenWithDaoQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<TokenWithDaoQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<TokenWithDaoQuery>({
            document: TokenWithDaoDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'tokenWithDao',
        'query',
        variables
      )
    },
    tokens(
      variables?: TokensQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<TokensQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<TokensQuery>({
            document: TokensDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'tokens',
        'query',
        variables
      )
    },
    totalAuctionSales(
      variables: TotalAuctionSalesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<TotalAuctionSalesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<TotalAuctionSalesQuery>({
            document: TotalAuctionSalesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'totalAuctionSales',
        'query',
        variables
      )
    },
    treasuryAssetPins(
      variables: TreasuryAssetPinsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<TreasuryAssetPinsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<TreasuryAssetPinsQuery>({
            document: TreasuryAssetPinsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'treasuryAssetPins',
        'query',
        variables
      )
    },
    userProposalVote(
      variables?: UserProposalVoteQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<UserProposalVoteQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UserProposalVoteQuery>({
            document: UserProposalVoteDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'userProposalVote',
        'query',
        variables
      )
    },
    zoraCoin(
      variables: ZoraCoinQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ZoraCoinQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ZoraCoinQuery>({
            document: ZoraCoinDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'zoraCoin',
        'query',
        variables
      )
    },
    ZoraCoinHolder(
      variables: ZoraCoinHolderQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ZoraCoinHolderQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ZoraCoinHolderQuery>({
            document: ZoraCoinHolderDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'ZoraCoinHolder',
        'query',
        variables
      )
    },
    ZoraCoinHolders(
      variables?: ZoraCoinHoldersQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ZoraCoinHoldersQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ZoraCoinHoldersQuery>({
            document: ZoraCoinHoldersDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'ZoraCoinHolders',
        'query',
        variables
      )
    },
    zoraCoinWithHolders(
      variables: ZoraCoinWithHoldersQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ZoraCoinWithHoldersQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ZoraCoinWithHoldersQuery>({
            document: ZoraCoinWithHoldersDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'zoraCoinWithHolders',
        'query',
        variables
      )
    },
    zoraDrop(
      variables: ZoraDropQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ZoraDropQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ZoraDropQuery>({
            document: ZoraDropDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'zoraDrop',
        'query',
        variables
      )
    },
    ZoraDropHolder(
      variables: ZoraDropHolderQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ZoraDropHolderQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ZoraDropHolderQuery>({
            document: ZoraDropHolderDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'ZoraDropHolder',
        'query',
        variables
      )
    },
    ZoraDropHolders(
      variables?: ZoraDropHoldersQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ZoraDropHoldersQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ZoraDropHoldersQuery>({
            document: ZoraDropHoldersDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'ZoraDropHolders',
        'query',
        variables
      )
    },
    zoraDropWithHolders(
      variables: ZoraDropWithHoldersQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<ZoraDropWithHoldersQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ZoraDropWithHoldersQuery>({
            document: ZoraDropWithHoldersDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'zoraDropWithHolders',
        'query',
        variables
      )
    },
  }
}
export type Sdk = ReturnType<typeof getSdk>
