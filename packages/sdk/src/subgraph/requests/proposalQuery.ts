import { ProposalState, getProposalState } from '../../contract/requests/getProposalState'
import { SDK } from '../client'
import { ProposalFragment, ProposalVoteFragment as ProposalVote } from '../sdk.generated'
import { CHAIN_ID } from '@buildeross/types'
import * as Sentry from '@sentry/nextjs'

export type Proposal = Omit<
  ProposalFragment,
  | 'transactionHash'
  | 'executionTransactionHash'
  | 'cancelTransactionHash'
  | 'vetoTransactionHash'
  | 'executableFrom'
  | 'expiresAt'
  | 'calldatas'
  | 'executedAt'
> & {
  calldatas: string[]
  state: ProposalState
  transactionHash: string
  executionTransactionHash?: string
  cancelTransactionHash?: string
  vetoTransactionHash?: string
  executableFrom?: number
  expiresAt?: number
  executedAt?: number
  votes?: ProposalVote[]
}

export const formatAndFetchState = async (chainId: CHAIN_ID, data: ProposalFragment) => {
  const { executableFrom, expiresAt, calldatas, executionTransactionHash, ...proposal } =
    data

  const baseProposal = {
    ...proposal,
    calldatas: calldatas ? calldatas.split(':') : [],
    state: await getProposalState(
      chainId,
      proposal.dao.governorAddress,
      proposal.proposalId,
    ),
  }

  // executableFrom and expiresAt will always either be both defined, or neither defined
  if (executableFrom && expiresAt) {
    return {
      ...baseProposal,
      executableFrom,
      expiresAt,
      executionTransactionHash,
    }
  }
  return baseProposal
}

export const getProposal = async (
  chainId: CHAIN_ID,
  proposalId: string,
): Promise<Proposal | undefined> => {
  try {
    const data = await SDK.connect(chainId).proposal({
      proposalId,
    })

    return await formatAndFetchState(chainId, data.proposal!)
  } catch (e) {
    console.error('Error fetching proposal', e)
    Sentry.captureException(e)
    await Sentry.flush(2000)
    return
  }
}
