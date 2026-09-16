import { CHAIN_ID } from '@buildeross/types'
import { Address } from 'viem'

import { SDK } from '../client'
import { Proposal_OrderBy } from '../sdk.generated'

export type RecentVote = {
  voter: Address
  proposalId: string
  timestamp: number
}

export type DaoActivityResponse = {
  recentProposalIds: string[]
  votes: RecentVote[]
}

export type DaoActivityOptions = {
  recentProposalCount?: number
  nowSeconds?: number
}

/** Voting activity on the DAO's most recent completed, non-canceled proposals. */
export const daoActivityRequest = async (
  chainId: CHAIN_ID,
  collectionAddress: string,
  options?: DaoActivityOptions
): Promise<DaoActivityResponse> => {
  const nowSeconds = options?.nowSeconds ?? Math.floor(Date.now() / 1000)
  const recentProposalCount = options?.recentProposalCount ?? 5

  const dao = collectionAddress.toLowerCase()

  const proposalsData = await SDK.connect(chainId).proposals({
    where: { dao, voteEnd_lt: nowSeconds.toString(), canceled_not: true },
    first: recentProposalCount,
    orderBy: Proposal_OrderBy.VoteEnd,
  })

  let recentProposals = proposalsData.proposals
  // Resolve ties at the limit before truncation, including proposals omitted
  // by the voteEnd-only query. proposalNumber is unique within a DAO.
  if (recentProposals.length && recentProposals.length === recentProposalCount) {
    const voteEnd = recentProposals[recentProposals.length - 1].voteEnd
    const newer = recentProposals.filter((proposal) => proposal.voteEnd !== voteEnd)
    const boundary = await SDK.connect(chainId).proposals({
      where: { dao, voteEnd, voteEnd_lt: nowSeconds.toString(), canceled_not: true },
      first: recentProposalCount - newer.length,
      orderBy: Proposal_OrderBy.ProposalNumber,
    })
    recentProposals = [...newer, ...boundary.proposals]
  }
  recentProposals.sort(
    (a, b) => Number(b.voteEnd) - Number(a.voteEnd) || b.proposalNumber - a.proposalNumber
  )
  const recentProposalIds = recentProposals.map((p) => String(p.proposalId))

  // Extract votes directly from the proposals
  const votes: RecentVote[] = recentProposals.flatMap((proposal) =>
    proposal.votes.map((vote) => ({
      voter: vote.voter as Address,
      proposalId: String(proposal.proposalId),
      timestamp: Number(vote.timestamp),
    }))
  )

  return { recentProposalIds, votes }
}
