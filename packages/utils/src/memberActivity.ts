export type ActivityThresholds = {
  /** Number of most recent completed proposals to consider for voting activity */
  recentProposalCount: number
  /** Time window in seconds for auction bid activity */
  bidWindowSeconds: number
}

export const DEFAULT_ACTIVITY_THRESHOLDS: ActivityThresholds = {
  recentProposalCount: 5,
  bidWindowSeconds: 30 * 24 * 60 * 60,
}

export type MemberVote = {
  voter: string
  proposalId: string
}

export type MemberBid = {
  bidder: string
  bidTime: number
}

export type ComputeActiveMembersInput = {
  /** proposalIds of the DAO's most recent completed proposals, most recent first */
  recentProposalIds: string[]
  /** votes cast on those proposals */
  votes: MemberVote[]
  /** auction bids placed on the DAO's auctions */
  bids: MemberBid[]
  /** current unix timestamp in seconds */
  nowSeconds: number
  thresholds?: Partial<ActivityThresholds>
}

/**
 * A member is active when they voted on at least one of the DAO's
 * `recentProposalCount` most recent completed proposals, or placed an auction
 * bid within the last `bidWindowSeconds`.
 * Returns deduplicated, lowercased, sorted addresses.
 */
export const computeActiveMembers = ({
  recentProposalIds,
  votes,
  bids,
  nowSeconds,
  thresholds,
}: ComputeActiveMembersInput): string[] => {
  const recentProposalCount =
    thresholds?.recentProposalCount ?? DEFAULT_ACTIVITY_THRESHOLDS.recentProposalCount
  const bidWindowSeconds =
    thresholds?.bidWindowSeconds ?? DEFAULT_ACTIVITY_THRESHOLDS.bidWindowSeconds

  const consideredProposalIds = new Set(
    recentProposalIds.slice(0, recentProposalCount).map((id) => id.toLowerCase())
  )
  const bidCutoff = nowSeconds - bidWindowSeconds

  const active = new Set<string>()
  for (const vote of votes) {
    if (consideredProposalIds.has(vote.proposalId.toLowerCase()))
      active.add(vote.voter.toLowerCase())
  }
  for (const bid of bids) {
    if (bid.bidTime >= bidCutoff) active.add(bid.bidder.toLowerCase())
  }

  return Array.from(active).sort()
}

export const isAddressActive = (
  activeMembers: readonly string[],
  address?: string
): boolean => !!address && activeMembers.includes(address.toLowerCase())
