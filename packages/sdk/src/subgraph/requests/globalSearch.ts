import { CHAIN_ID, ProposalState } from '@buildeross/types'

import { SDK } from '../client'
import {
  AuctionBid_Filter,
  Dao_Filter,
  Proposal_Filter,
  ProposalCandidateVersion_Filter,
  ProposalVote_Filter,
  SearchBidFragment,
  SearchCandidateFragment,
  SearchDaoFragment,
  SearchDaoRefFragment,
  SearchProfileFragment,
  SearchProposalFragment,
  SearchVoteFragment,
} from '../sdk.generated'

export const GLOBAL_SEARCH_TYPES = [
  'daos',
  'profiles',
  'proposals',
  'candidates',
  'votes',
  'bids',
] as const

export type GlobalSearchType = (typeof GLOBAL_SEARCH_TYPES)[number]

/** Types that are backed by a subgraph fulltext index */
export type GlobalSearchTextType = Exclude<GlobalSearchType, 'profiles'>

export type SearchDaoRef = {
  id: string
  name: string
  symbol: string
  tokenAddress: string
  image: string
}

export type DaoGlobalSearchResult = {
  type: 'dao'
  chainId: CHAIN_ID
  id: string
  dao: SearchDaoRef & {
    description: string
    projectURI: string
    totalSupply: number
    proposalCount: number
    ownerCount: number
    metadataAddress: string
    treasuryAddress: string
    governorAddress: string
    auctionAddress: string
  }
}

export type ProposalGlobalSearchResult = {
  type: 'proposal'
  chainId: CHAIN_ID
  id: string
  proposalId: string
  proposalNumber: number
  title: string
  proposer: string
  timeCreated: number
  state: ProposalState
  forVotes: number
  againstVotes: number
  abstainVotes: number
  voteCount: number
  dao: SearchDaoRef
}

export type CandidateGlobalSearchResult = {
  type: 'candidate'
  chainId: CHAIN_ID
  id: string
  groupId: string
  candidateNumber: number
  title: string
  proposer: string
  createdAt: number
  versionNumber: number
  proposalNumber?: number
  dao: SearchDaoRef
}

export type VoteGlobalSearchResult = {
  type: 'vote'
  chainId: CHAIN_ID
  id: string
  transactionHash: string
  timestamp: number
  voter: string
  support: 'FOR' | 'AGAINST' | 'ABSTAIN'
  weight: number
  reason: string | null
  proposalNumber: number
  proposalTitle: string
  dao: SearchDaoRef
}

export type BidGlobalSearchResult = {
  type: 'bid'
  chainId: CHAIN_ID
  id: string
  transactionHash: string
  /** wei, as a decimal string */
  amount: string
  bidder: string
  comment: string | null
  bidTime: number
  tokenId: string
  tokenName: string
  tokenImage: string | null
  dao: SearchDaoRef
}

export type ProfileChainStats = Omit<SearchProfileFragment, '__typename' | 'id'> & {
  chainId: CHAIN_ID
}

export type GlobalSearchChainResults = {
  daos: DaoGlobalSearchResult[]
  proposals: ProposalGlobalSearchResult[]
  candidates: CandidateGlobalSearchResult[]
  votes: VoteGlobalSearchResult[]
  bids: BidGlobalSearchResult[]
}

export type GlobalSearchOptions = {
  types: readonly GlobalSearchTextType[]
  /** Number of results per type; one extra is fetched to detect a next page */
  first: number
  skip?: number
  /** Restrict proposals/candidates/votes/bids to a single DAO (token address) */
  daoId?: string
}

const toNumber = (value: unknown): number => Number(value ?? 0)

const toDaoRef = (dao: SearchDaoRefFragment): SearchDaoRef => ({
  id: dao.id,
  name: dao.name,
  symbol: dao.symbol,
  tokenAddress: String(dao.tokenAddress),
  image: dao.contractImage,
})

/**
 * Derives a proposal state from subgraph fields only (no RPC).
 * Good enough for a search result badge; the proposal page remains authoritative.
 */
export const deriveSearchProposalState = (
  proposal: Pick<
    SearchProposalFragment,
    | 'canceled'
    | 'vetoed'
    | 'executed'
    | 'queued'
    | 'voteStart'
    | 'voteEnd'
    | 'expiresAt'
    | 'forVotes'
    | 'againstVotes'
    | 'quorumVotes'
  >,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): ProposalState => {
  if (proposal.canceled) return ProposalState.Canceled
  if (proposal.vetoed) return ProposalState.Vetoed
  if (proposal.executed) return ProposalState.Executed
  if (proposal.queued) {
    const expiresAt = toNumber(proposal.expiresAt)
    return expiresAt > 0 && nowSeconds >= expiresAt
      ? ProposalState.Expired
      : ProposalState.Queued
  }
  if (nowSeconds < toNumber(proposal.voteStart)) return ProposalState.Pending
  if (nowSeconds < toNumber(proposal.voteEnd)) return ProposalState.Active
  const passed =
    proposal.forVotes > proposal.againstVotes &&
    proposal.forVotes >= toNumber(proposal.quorumVotes)
  return passed ? ProposalState.Succeeded : ProposalState.Defeated
}

export const mapSearchDao = (
  chainId: CHAIN_ID,
  dao: SearchDaoFragment
): DaoGlobalSearchResult => ({
  type: 'dao',
  chainId,
  id: `${chainId}:${dao.id}`,
  dao: {
    ...toDaoRef(dao),
    description: dao.description,
    projectURI: dao.projectURI,
    totalSupply: dao.totalSupply,
    proposalCount: dao.proposalCount,
    ownerCount: dao.ownerCount,
    metadataAddress: String(dao.metadataAddress),
    treasuryAddress: String(dao.treasuryAddress),
    governorAddress: String(dao.governorAddress),
    auctionAddress: String(dao.auctionAddress),
  },
})

export const mapSearchProposal = (
  chainId: CHAIN_ID,
  proposal: SearchProposalFragment,
  nowSeconds?: number
): ProposalGlobalSearchResult => ({
  type: 'proposal',
  chainId,
  id: `${chainId}:${proposal.id}`,
  proposalId: String(proposal.proposalId),
  proposalNumber: proposal.proposalNumber,
  title: proposal.title || `Proposal ${proposal.proposalNumber}`,
  proposer: String(proposal.proposer),
  timeCreated: toNumber(proposal.timeCreated),
  state: deriveSearchProposalState(proposal, nowSeconds),
  forVotes: proposal.forVotes,
  againstVotes: proposal.againstVotes,
  abstainVotes: proposal.abstainVotes,
  voteCount: proposal.voteCount,
  dao: toDaoRef(proposal.dao),
})

export const mapSearchCandidate = (
  chainId: CHAIN_ID,
  candidate: SearchCandidateFragment
): CandidateGlobalSearchResult => ({
  type: 'candidate',
  chainId,
  id: `${chainId}:${candidate.group.id}`,
  groupId: candidate.group.id,
  candidateNumber: candidate.group.candidateNumber,
  title: candidate.title || `Candidate ${candidate.group.candidateNumber}`,
  proposer: String(candidate.group.proposer),
  createdAt: toNumber(candidate.createdAt),
  versionNumber: toNumber(candidate.versionNumber),
  proposalNumber: candidate.proposal?.proposalNumber ?? undefined,
  dao: toDaoRef(candidate.group.dao),
})

export const mapSearchVote = (
  chainId: CHAIN_ID,
  vote: SearchVoteFragment
): VoteGlobalSearchResult => ({
  type: 'vote',
  chainId,
  id: `${chainId}:${vote.id}`,
  transactionHash: String(vote.transactionHash),
  timestamp: toNumber(vote.timestamp),
  voter: String(vote.voter),
  support: vote.support as VoteGlobalSearchResult['support'],
  weight: vote.weight,
  reason: vote.reason ?? null,
  proposalNumber: vote.proposal.proposalNumber,
  proposalTitle: vote.proposal.title || `Proposal ${vote.proposal.proposalNumber}`,
  dao: toDaoRef(vote.dao),
})

export const mapSearchBid = (
  chainId: CHAIN_ID,
  bid: SearchBidFragment
): BidGlobalSearchResult => ({
  type: 'bid',
  chainId,
  id: `${chainId}:${bid.id}`,
  transactionHash: String(bid.transactionHash),
  amount: String(bid.amount),
  bidder: String(bid.bidder),
  comment: bid.comment ?? null,
  bidTime: toNumber(bid.bidTime),
  tokenId: String(bid.auction.token.tokenId),
  tokenName: bid.auction.token.name,
  tokenImage: bid.auction.token.image ?? null,
  dao: toDaoRef(bid.dao),
})

const dedupeBy = <T>(items: T[], key: (item: T) => string): T[] => {
  const seen = new Set<string>()
  return items.filter((item) => {
    const k = key(item)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const emptyChainResults = (): GlobalSearchChainResults => ({
  daos: [],
  proposals: [],
  candidates: [],
  votes: [],
  bids: [],
})

/**
 * Runs every requested fulltext index for one chain in a single subgraph request.
 * `text` should already be a Graph fulltext expression (see buildSearchText);
 * `rawText` is used for the DAO substring fallback.
 */
export const globalSearchRequest = async (
  chainId: CHAIN_ID,
  text: string,
  rawText: string,
  { types, first, skip = 0, daoId }: GlobalSearchOptions
): Promise<GlobalSearchChainResults> => {
  if (!Number.isInteger(first) || first < 1 || first > 100) {
    throw new Error('first must be an integer between 1 and 100')
  }
  if (!Number.isInteger(skip) || skip < 0) {
    throw new Error('skip must be a non-negative integer')
  }
  if (!text.trim() || types.length === 0) return emptyChainResults()

  const dao = daoId?.toLowerCase()
  const withDaos = types.includes('daos') && !dao

  const daoWhere: Dao_Filter = { totalSupply_gt: 0 }
  const daoWhereSimple: Dao_Filter = {
    and: [
      daoWhere,
      {
        or: [
          { name_contains_nocase: rawText },
          { symbol_contains_nocase: rawText },
          { description_contains_nocase: rawText },
        ],
      },
    ],
  }
  const proposalWhere: Proposal_Filter = { replacedBy: null, ...(dao && { dao }) }
  const candidateWhere: ProposalCandidateVersion_Filter = {
    revoked: false,
    ...(dao && { group_: { dao } }),
  }
  const voteWhere: ProposalVote_Filter = dao ? { dao } : {}
  const bidWhere: AuctionBid_Filter = dao ? { dao } : {}

  const data = await SDK.connect(chainId).globalSearch({
    text,
    first: first + 1,
    skip,
    withDaos,
    withProposals: types.includes('proposals'),
    withCandidates: types.includes('candidates'),
    withVotes: types.includes('votes'),
    withBids: types.includes('bids'),
    daoWhere,
    daoWhereSimple,
    proposalWhere,
    candidateWhere,
    voteWhere,
    bidWhere,
  })

  const nowSeconds = Math.floor(Date.now() / 1000)

  return {
    daos: dedupeBy([...(data.daoSearch ?? []), ...(data.daos ?? [])], (d) =>
      String(d.tokenAddress).toLowerCase()
    ).map((d) => mapSearchDao(chainId, d)),
    proposals: (data.proposalSearch ?? []).map((p) =>
      mapSearchProposal(chainId, p, nowSeconds)
    ),
    // Each candidate group can have many versions; keep the best-ranked one per group
    candidates: dedupeBy(data.candidateSearch ?? [], (c) => c.group.id).map((c) =>
      mapSearchCandidate(chainId, c)
    ),
    votes: (data.voteSearch ?? []).map((v) => mapSearchVote(chainId, v)),
    bids: (data.bidSearch ?? []).map((b) => mapSearchBid(chainId, b)),
  }
}

export type AddressLookupChainResult = {
  profile: ProfileChainStats | null
  daos: DaoGlobalSearchResult[]
  proposals: ProposalGlobalSearchResult[]
  votes: VoteGlobalSearchResult[]
  bids: BidGlobalSearchResult[]
}

/** Looks up everything an address is associated with on one chain. */
export const globalAddressLookupRequest = async (
  chainId: CHAIN_ID,
  address: string,
  first: number
): Promise<AddressLookupChainResult> => {
  const id = address.toLowerCase()
  const data = await SDK.connect(chainId).globalAddressLookup({
    id,
    address: id,
    first,
  })
  const nowSeconds = Math.floor(Date.now() / 1000)
  let profile: ProfileChainStats | null = null
  if (data.profile) {
    const { __typename, id: _id, ...stats } = data.profile
    profile = { ...stats, chainId }
  }
  return {
    profile,
    daos: data.daos.map((d) => mapSearchDao(chainId, d)),
    proposals: data.proposals.map((p) => mapSearchProposal(chainId, p, nowSeconds)),
    votes: data.proposalVotes.map((v) => mapSearchVote(chainId, v)),
    bids: data.auctionBids.map((b) => mapSearchBid(chainId, b)),
  }
}

export type TxLookupChainResult = Pick<
  GlobalSearchChainResults,
  'proposals' | 'votes' | 'bids'
>

/** Finds proposals, votes and bids created by a transaction hash on one chain. */
export const globalTxLookupRequest = async (
  chainId: CHAIN_ID,
  hash: string
): Promise<TxLookupChainResult> => {
  const data = await SDK.connect(chainId).globalTxLookup({ hash: hash.toLowerCase() })
  const nowSeconds = Math.floor(Date.now() / 1000)
  return {
    proposals: data.proposals.map((p) => mapSearchProposal(chainId, p, nowSeconds)),
    votes: data.proposalVotes.map((v) => mapSearchVote(chainId, v)),
    bids: data.auctionBids.map((b) => mapSearchBid(chainId, b)),
  }
}

export type ProfileMatch = ProfileChainStats & { address: string }

export type AddressPrefixLookupChainResult = {
  profiles: ProfileMatch[]
  daos: DaoGlobalSearchResult[]
}

/** Finds profiles and DAOs whose address starts with a partial 0x prefix on one chain. */
export const globalAddressPrefixLookupRequest = async (
  chainId: CHAIN_ID,
  prefix: string,
  first: number
): Promise<AddressPrefixLookupChainResult> => {
  const lower = prefix.toLowerCase()
  // IDs are lowercase hex, so [prefix, prefix + 'g') is exactly the set of IDs starting with prefix
  const data = await SDK.connect(chainId).globalAddressPrefixLookup({
    prefix: lower,
    prefixEnd: `${lower}g`,
    first,
  })
  return {
    profiles: data.profiles.map(({ __typename, id, ...stats }) => ({
      ...stats,
      chainId,
      address: id,
    })),
    daos: data.daos.map((d) => mapSearchDao(chainId, d)),
  }
}

export type ProfileGlobalSearchResult = {
  type: 'profile'
  id: string
  address: string
  /** ENS / Basename the user searched for, when the query was a name */
  name?: string
  /** Per-chain activity; empty when the address has no indexed activity */
  chains: ProfileChainStats[]
}

export type GlobalSearchResultsByType = {
  daos: DaoGlobalSearchResult[]
  profiles: ProfileGlobalSearchResult[]
  proposals: ProposalGlobalSearchResult[]
  candidates: CandidateGlobalSearchResult[]
  votes: VoteGlobalSearchResult[]
  bids: BidGlobalSearchResult[]
}

export type GlobalSearchResult = GlobalSearchResultsByType[GlobalSearchType][number]

export type GlobalSearchResponse = {
  query: string
  kind: 'address' | 'addressPrefix' | 'txHash' | 'name' | 'text'
  resolvedAddress?: string
  results: GlobalSearchResultsByType
  hasMore: Record<GlobalSearchType, boolean>
  /** Chains whose subgraph request failed (results may be incomplete) */
  failedChainIds: CHAIN_ID[]
}
