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
  BidId = 'bid__id',
  BidTransactionHash = 'bid__transactionHash',
  BlockNumber = 'blockNumber',
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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

export type Dao = {
  __typename?: 'DAO'
  auctionAddress: Scalars['Bytes']['output']
  auctionConfig: AuctionConfig
  auctions: Array<Auction>
  contractImage: Scalars['String']['output']
  currentAuction?: Maybe<Auction>
  daoMultisigUpdates: Array<DaoMultisigUpdate>
  description: Scalars['String']['output']
  feedEvents: Array<FeedEvent>
  governorAddress: Scalars['Bytes']['output']
  id: Scalars['ID']['output']
  metadataAddress: Scalars['Bytes']['output']
  metadataProperties?: Maybe<Array<MetadataProperty>>
  name: Scalars['String']['output']
  ownerCount: Scalars['Int']['output']
  owners: Array<DaoTokenOwner>
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
}

export type DaoAuctionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Auction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<Auction_Filter>
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
  MetadataAddress = 'metadataAddress',
  MetadataProperties = 'metadataProperties',
  Name = 'name',
  OwnerCount = 'ownerCount',
  Owners = 'owners',
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
  ProposalCreated = 'PROPOSAL_CREATED',
  ProposalExecuted = 'PROPOSAL_EXECUTED',
  ProposalUpdated = 'PROPOSAL_UPDATED',
  ProposalVoted = 'PROPOSAL_VOTED',
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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

export type Proposal = {
  __typename?: 'Proposal'
  abstainVotes: Scalars['Int']['output']
  againstVotes: Scalars['Int']['output']
  calldatas?: Maybe<Scalars['String']['output']>
  cancelTransactionHash?: Maybe<Scalars['Bytes']['output']>
  canceled: Scalars['Boolean']['output']
  canceledAt?: Maybe<Scalars['BigInt']['output']>
  dao: Dao
  description?: Maybe<Scalars['String']['output']>
  descriptionHash: Scalars['Bytes']['output']
  executableFrom?: Maybe<Scalars['BigInt']['output']>
  executed: Scalars['Boolean']['output']
  executedAt?: Maybe<Scalars['BigInt']['output']>
  executionTransactionHash?: Maybe<Scalars['Bytes']['output']>
  expiresAt?: Maybe<Scalars['BigInt']['output']>
  forVotes: Scalars['Int']['output']
  id: Scalars['ID']['output']
  proposalId: Scalars['Bytes']['output']
  proposalNumber: Scalars['Int']['output']
  proposalThreshold: Scalars['BigInt']['output']
  proposer: Scalars['Bytes']['output']
  queued: Scalars['Boolean']['output']
  queuedAt?: Maybe<Scalars['BigInt']['output']>
  queuedTransactionHash?: Maybe<Scalars['Bytes']['output']>
  quorumVotes: Scalars['BigInt']['output']
  snapshotBlockNumber: Scalars['BigInt']['output']
  targets: Array<Scalars['Bytes']['output']>
  timeCreated: Scalars['BigInt']['output']
  title?: Maybe<Scalars['String']['output']>
  transactionHash: Scalars['Bytes']['output']
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
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
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
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
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
  ProposalExecutableFrom = 'proposal__executableFrom',
  ProposalExecuted = 'proposal__executed',
  ProposalExecutedAt = 'proposal__executedAt',
  ProposalExecutionTransactionHash = 'proposal__executionTransactionHash',
  ProposalExpiresAt = 'proposal__expiresAt',
  ProposalForVotes = 'proposal__forVotes',
  ProposalId = 'proposal__id',
  ProposalProposalId = 'proposal__proposalId',
  ProposalProposalNumber = 'proposal__proposalNumber',
  ProposalProposalThreshold = 'proposal__proposalThreshold',
  ProposalProposer = 'proposal__proposer',
  ProposalQueued = 'proposal__queued',
  ProposalQueuedAt = 'proposal__queuedAt',
  ProposalQueuedTransactionHash = 'proposal__queuedTransactionHash',
  ProposalQuorumVotes = 'proposal__quorumVotes',
  ProposalSnapshotBlockNumber = 'proposal__snapshotBlockNumber',
  ProposalTimeCreated = 'proposal__timeCreated',
  ProposalTitle = 'proposal__title',
  ProposalTransactionHash = 'proposal__transactionHash',
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
  targets_contains_nocase?: InputMaybe<Array<Scalars['Bytes']['input']>>
  targets_not?: InputMaybe<Array<Scalars['Bytes']['input']>>
  targets_not_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>
  targets_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']['input']>>
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
  updates_?: InputMaybe<ProposalUpdate_Filter>
  values?: InputMaybe<Array<Scalars['BigInt']['input']>>
  values_contains?: InputMaybe<Array<Scalars['BigInt']['input']>>
  values_contains_nocase?: InputMaybe<Array<Scalars['BigInt']['input']>>
  values_not?: InputMaybe<Array<Scalars['BigInt']['input']>>
  values_not_contains?: InputMaybe<Array<Scalars['BigInt']['input']>>
  values_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']['input']>>
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
  Dao = 'dao',
  DaoAuctionAddress = 'dao__auctionAddress',
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
  ExecutableFrom = 'executableFrom',
  Executed = 'executed',
  ExecutedAt = 'executedAt',
  ExecutionTransactionHash = 'executionTransactionHash',
  ExpiresAt = 'expiresAt',
  ForVotes = 'forVotes',
  Id = 'id',
  ProposalId = 'proposalId',
  ProposalNumber = 'proposalNumber',
  ProposalThreshold = 'proposalThreshold',
  Proposer = 'proposer',
  Queued = 'queued',
  QueuedAt = 'queuedAt',
  QueuedTransactionHash = 'queuedTransactionHash',
  QuorumVotes = 'quorumVotes',
  SnapshotBlockNumber = 'snapshotBlockNumber',
  Targets = 'targets',
  TimeCreated = 'timeCreated',
  Title = 'title',
  TransactionHash = 'transactionHash',
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
  dao?: Maybe<Dao>
  daoMultisigUpdate?: Maybe<DaoMultisigUpdate>
  daoMultisigUpdates: Array<DaoMultisigUpdate>
  daoSearch: Array<Dao>
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
  proposal?: Maybe<Proposal>
  proposalCreatedEvent?: Maybe<ProposalCreatedEvent>
  proposalCreatedEvents: Array<ProposalCreatedEvent>
  proposalExecutedEvent?: Maybe<ProposalExecutedEvent>
  proposalExecutedEvents: Array<ProposalExecutedEvent>
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
  token?: Maybe<Token>
  tokens: Array<Token>
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

export type QueryProposalArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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

export type Subscription = {
  __typename?: 'Subscription'
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
  dao?: Maybe<Dao>
  daoMultisigUpdate?: Maybe<DaoMultisigUpdate>
  daoMultisigUpdates: Array<DaoMultisigUpdate>
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
  proposal?: Maybe<Proposal>
  proposalCreatedEvent?: Maybe<ProposalCreatedEvent>
  proposalCreatedEvents: Array<ProposalCreatedEvent>
  proposalExecutedEvent?: Maybe<ProposalExecutedEvent>
  proposalExecutedEvents: Array<ProposalExecutedEvent>
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
  token?: Maybe<Token>
  tokens: Array<Token>
}

export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>
}

export type SubscriptionAuctionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionAuctionBidArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionAuctionBidPlacedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionAuctionBidPlacedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<AuctionBidPlacedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<AuctionBidPlacedEvent_Filter>
}

export type SubscriptionAuctionBidsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<AuctionBid_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<AuctionBid_Filter>
}

export type SubscriptionAuctionConfigArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionAuctionConfigsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<AuctionConfig_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<AuctionConfig_Filter>
}

export type SubscriptionAuctionCreatedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionAuctionCreatedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<AuctionCreatedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<AuctionCreatedEvent_Filter>
}

export type SubscriptionAuctionSettledEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionAuctionSettledEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<AuctionSettledEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<AuctionSettledEvent_Filter>
}

export type SubscriptionAuctionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Auction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Auction_Filter>
}

export type SubscriptionDaoArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionDaoMultisigUpdateArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionDaoMultisigUpdatesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoMultisigUpdate_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<DaoMultisigUpdate_Filter>
}

export type SubscriptionDaosArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Dao_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Dao_Filter>
}

export type SubscriptionDaotokenOwnerArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionDaotokenOwnersArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoTokenOwner_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<DaoTokenOwner_Filter>
}

export type SubscriptionDaovoterArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionDaovotersArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<DaoVoter_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<DaoVoter_Filter>
}

export type SubscriptionFeedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionFeedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<FeedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<FeedEvent_Filter>
}

export type SubscriptionMetadataItemArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionMetadataItemsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<MetadataItem_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<MetadataItem_Filter>
}

export type SubscriptionMetadataPropertiesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<MetadataProperty_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<MetadataProperty_Filter>
}

export type SubscriptionMetadataPropertyArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionProposalArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionProposalCreatedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionProposalCreatedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalCreatedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalCreatedEvent_Filter>
}

export type SubscriptionProposalExecutedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionProposalExecutedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalExecutedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalExecutedEvent_Filter>
}

export type SubscriptionProposalUpdateArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionProposalUpdatedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionProposalUpdatedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalUpdatedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalUpdatedEvent_Filter>
}

export type SubscriptionProposalUpdatesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalUpdate_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalUpdate_Filter>
}

export type SubscriptionProposalVoteArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionProposalVotedEventArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionProposalVotedEventsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalVotedEvent_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalVotedEvent_Filter>
}

export type SubscriptionProposalVotesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<ProposalVote_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<ProposalVote_Filter>
}

export type SubscriptionProposalsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Proposal_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Proposal_Filter>
}

export type SubscriptionSnapshotArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSnapshotsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Snapshot_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Snapshot_Filter>
}

export type SubscriptionTokenArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']['input']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionTokensArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Token_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']['input']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Token_Filter>
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
  DaoContractImage = 'dao__contractImage',
  DaoDescription = 'dao__description',
  DaoGovernorAddress = 'dao__governorAddress',
  DaoId = 'dao__id',
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
   *
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
  treasuryAddress: any
  auctionAddress: any
  governorAddress: any
}

export type ExploreDaoFragment = {
  __typename?: 'Auction'
  endTime: any
  dao: { __typename?: 'DAO'; name: string; tokenAddress: any }
  highestBid?: { __typename?: 'AuctionBid'; amount: any; bidder: any } | null
  token: { __typename?: 'Token'; name: string; image?: string | null; tokenId: any }
}

export type ProposalFragment = {
  __typename?: 'Proposal'
  abstainVotes: number
  againstVotes: number
  calldatas?: string | null
  description?: string | null
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
  dao: { __typename?: 'DAO'; governorAddress: any; tokenAddress: any }
}

export type ProposalVoteFragment = {
  __typename?: 'ProposalVote'
  voter: any
  support: ProposalVoteSupport
  weight: number
  reason?: string | null
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

export type DaoInfoQueryVariables = Exact<{
  tokenAddress: Scalars['ID']['input']
}>

export type DaoInfoQuery = {
  __typename?: 'Query'
  dao?: { __typename?: 'DAO'; totalSupply: number; ownerCount: number } | null
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
  } | null
}

export type ExploreDaosSearchQueryVariables = Exact<{
  text: Scalars['String']['input']
  first: Scalars['Int']['input']
  skip: Scalars['Int']['input']
  where?: InputMaybe<Dao_Filter>
}>

export type ExploreDaosSearchQuery = {
  __typename?: 'Query'
  daoSearch: Array<{
    __typename?: 'DAO'
    name: string
    symbol: string
    description: string
    projectURI: string
    tokenAddress: any
    auctions: Array<{
      __typename?: 'Auction'
      endTime: any
      highestBid?: { __typename?: 'AuctionBid'; amount: any; bidder: any } | null
      token: { __typename?: 'Token'; name: string; image?: string | null; tokenId: any }
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
      votes: Array<{ __typename?: 'ProposalVote'; voter: any }>
      dao: { __typename?: 'DAO'; governorAddress: any; tokenAddress: any }
    }>
    currentAuction?: {
      __typename?: 'Auction'
      endTime: any
      highestBid?: { __typename?: 'AuctionBid'; amount: any; bidder: any } | null
      token: { __typename?: 'Token'; name: string; image?: string | null; tokenId: any }
    } | null
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
    treasuryAddress: any
    auctionAddress: any
    governorAddress: any
  }>
}

export type FeedDataQueryVariables = Exact<{
  first: Scalars['Int']['input']
  skip?: InputMaybe<Scalars['Int']['input']>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  dao?: InputMaybe<Scalars['String']['input']>
}>

export type FeedDataQuery = {
  __typename?: 'Query'
  proposals: Array<{
    __typename?: 'Proposal'
    abstainVotes: number
    againstVotes: number
    calldatas?: string | null
    description?: string | null
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
    dao: { __typename?: 'DAO'; governorAddress: any; tokenAddress: any }
  }>
  proposalVotes: Array<{
    __typename?: 'ProposalVote'
    timestamp: any
    transactionHash: any
    voter: any
    support: ProposalVoteSupport
    weight: number
    reason?: string | null
    proposal: {
      __typename?: 'Proposal'
      proposalId: any
      dao: { __typename?: 'DAO'; tokenAddress: any }
    }
  }>
  proposalUpdates: Array<{
    __typename?: 'ProposalUpdate'
    id: string
    transactionHash: any
    timestamp: any
    messageType: number
    message: string
    creator: any
    originalMessageId: any
    proposal: {
      __typename?: 'Proposal'
      proposalId: any
      dao: { __typename?: 'DAO'; tokenAddress: any }
    }
  }>
  auctionBids: Array<{
    __typename?: 'AuctionBid'
    bidTime: any
    transactionHash: any
    id: string
    amount: any
    bidder: any
    auction: {
      __typename?: 'Auction'
      dao: { __typename?: 'DAO'; tokenAddress: any }
      token: { __typename?: 'Token'; tokenId: any; name: string; image?: string | null }
    }
  }>
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

export type GlobalFeedDataQueryVariables = Exact<{
  first: Scalars['Int']['input']
  skip?: InputMaybe<Scalars['Int']['input']>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
}>

export type GlobalFeedDataQuery = {
  __typename?: 'Query'
  proposals: Array<{
    __typename?: 'Proposal'
    abstainVotes: number
    againstVotes: number
    calldatas?: string | null
    description?: string | null
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
    dao: { __typename?: 'DAO'; governorAddress: any; tokenAddress: any }
  }>
  proposalVotes: Array<{
    __typename?: 'ProposalVote'
    timestamp: any
    transactionHash: any
    voter: any
    support: ProposalVoteSupport
    weight: number
    reason?: string | null
    proposal: {
      __typename?: 'Proposal'
      proposalId: any
      dao: { __typename?: 'DAO'; tokenAddress: any }
    }
  }>
  proposalUpdates: Array<{
    __typename?: 'ProposalUpdate'
    id: string
    transactionHash: any
    timestamp: any
    messageType: number
    message: string
    creator: any
    originalMessageId: any
    proposal: {
      __typename?: 'Proposal'
      proposalId: any
      dao: { __typename?: 'DAO'; tokenAddress: any }
    }
  }>
  auctionBids: Array<{
    __typename?: 'AuctionBid'
    bidTime: any
    transactionHash: any
    id: string
    amount: any
    bidder: any
    auction: {
      __typename?: 'Auction'
      dao: { __typename?: 'DAO'; tokenAddress: any }
      token: { __typename?: 'Token'; tokenId: any; name: string; image?: string | null }
    }
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
    abstainVotes: number
    againstVotes: number
    calldatas?: string | null
    description?: string | null
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
    votes: Array<{
      __typename?: 'ProposalVote'
      voter: any
      support: ProposalVoteSupport
      weight: number
      reason?: string | null
    }>
    dao: { __typename?: 'DAO'; governorAddress: any; tokenAddress: any }
  } | null
}

export type ProposalOgMetadataQueryVariables = Exact<{
  where: Proposal_Filter
  first: Scalars['Int']['input']
}>

export type ProposalOgMetadataQuery = {
  __typename?: 'Query'
  proposals: Array<{
    __typename?: 'Proposal'
    abstainVotes: number
    againstVotes: number
    calldatas?: string | null
    description?: string | null
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
    votes: Array<{
      __typename?: 'ProposalVote'
      voter: any
      support: ProposalVoteSupport
      weight: number
      reason?: string | null
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
    votes: Array<{
      __typename?: 'ProposalVote'
      voter: any
      support: ProposalVoteSupport
      weight: number
      reason?: string | null
    }>
    dao: { __typename?: 'DAO'; governorAddress: any; tokenAddress: any }
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
  }
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
    tokenAddress
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
    dao {
      governorAddress
      tokenAddress
    }
  }
`
export const ProposalVoteFragmentDoc = gql`
  fragment ProposalVote on ProposalVote {
    voter
    support
    weight
    reason
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
export const DaoInfoDocument = gql`
  query daoInfo($tokenAddress: ID!) {
    dao(id: $tokenAddress) {
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
  query exploreDaosSearch($text: String!, $first: Int!, $skip: Int!, $where: DAO_filter) {
    daoSearch(text: $text, first: $first, skip: $skip, where: $where) {
      name
      symbol
      description
      projectURI
      tokenAddress
      auctions(
        first: 1
        orderBy: endTime
        orderDirection: desc
        where: { settled: false }
      ) {
        ...CurrentAuction
      }
    }
  }
  ${CurrentAuctionFragmentDoc}
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
export const FeedDataDocument = gql`
  query feedData($first: Int!, $skip: Int, $timestamp_lt: BigInt, $dao: String) {
    proposals(
      first: $first
      skip: $skip
      where: { timeCreated_lt: $timestamp_lt, dao: $dao }
      orderBy: timeCreated
      orderDirection: desc
    ) {
      ...Proposal
    }
    proposalVotes(
      first: $first
      skip: $skip
      where: { timestamp_lt: $timestamp_lt, proposal_: { dao: $dao } }
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...ProposalVote
      timestamp
      transactionHash
      proposal {
        proposalId
        dao {
          tokenAddress
        }
      }
    }
    proposalUpdates(
      first: $first
      skip: $skip
      where: { timestamp_lt: $timestamp_lt, proposal_: { dao: $dao } }
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...ProposalUpdate
      proposal {
        proposalId
        dao {
          tokenAddress
        }
      }
    }
    auctionBids(
      first: $first
      skip: $skip
      where: { bidTime_lt: $timestamp_lt, auction_: { dao: $dao } }
      orderBy: bidTime
      orderDirection: desc
    ) {
      ...AuctionBid
      bidTime
      transactionHash
      auction {
        dao {
          tokenAddress
        }
        token {
          tokenId
          name
          image
        }
      }
    }
  }
  ${ProposalFragmentDoc}
  ${ProposalVoteFragmentDoc}
  ${ProposalUpdateFragmentDoc}
  ${AuctionBidFragmentDoc}
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
export const GlobalFeedDataDocument = gql`
  query globalFeedData($first: Int!, $skip: Int, $timestamp_lt: BigInt) {
    proposals(
      first: $first
      skip: $skip
      where: { timeCreated_lt: $timestamp_lt }
      orderBy: timeCreated
      orderDirection: desc
    ) {
      ...Proposal
    }
    proposalVotes(
      first: $first
      skip: $skip
      where: { timestamp_lt: $timestamp_lt }
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...ProposalVote
      timestamp
      transactionHash
      proposal {
        proposalId
        dao {
          tokenAddress
        }
      }
    }
    proposalUpdates(
      first: $first
      skip: $skip
      where: { timestamp_lt: $timestamp_lt }
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...ProposalUpdate
      proposal {
        proposalId
        dao {
          tokenAddress
        }
      }
    }
    auctionBids(
      first: $first
      skip: $skip
      where: { bidTime_lt: $timestamp_lt }
      orderBy: bidTime
      orderDirection: desc
    ) {
      ...AuctionBid
      bidTime
      transactionHash
      auction {
        dao {
          tokenAddress
        }
        token {
          tokenId
          name
          image
        }
      }
    }
  }
  ${ProposalFragmentDoc}
  ${ProposalVoteFragmentDoc}
  ${ProposalUpdateFragmentDoc}
  ${AuctionBidFragmentDoc}
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
      ...Proposal
      votes {
        ...ProposalVote
      }
    }
  }
  ${ProposalFragmentDoc}
  ${ProposalVoteFragmentDoc}
`
export const ProposalOgMetadataDocument = gql`
  query proposalOGMetadata($where: Proposal_filter!, $first: Int!) {
    proposals(where: $where, first: $first) {
      ...Proposal
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
  ${ProposalFragmentDoc}
  ${ProposalVoteFragmentDoc}
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
    feedData(
      variables: FeedDataQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<FeedDataQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<FeedDataQuery>({
            document: FeedDataDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'feedData',
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
    globalFeedData(
      variables: GlobalFeedDataQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal']
    ): Promise<GlobalFeedDataQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GlobalFeedDataQuery>({
            document: GlobalFeedDataDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'globalFeedData',
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
  }
}
export type Sdk = ReturnType<typeof getSdk>
