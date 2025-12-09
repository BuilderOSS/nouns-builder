import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import { ProposalVoteFragment } from '../sdk.generated'

export const getUserProposalVote = async (
  chainId: CHAIN_ID,
  proposalId: string,
  voterAddress: string
): Promise<ProposalVoteFragment | undefined> => {
  try {
    const data = await SDK.connect(chainId).userProposalVote({
      where: {
        voter: voterAddress.toLowerCase(),
        proposal: proposalId.toLowerCase(),
      },
    })

    return data.proposalVotes[0]
  } catch (e) {
    console.error('Error fetching user proposal vote', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return undefined
  }
}
