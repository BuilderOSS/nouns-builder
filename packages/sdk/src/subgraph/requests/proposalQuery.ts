import { supportsUpdatableProposals } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'

import { getProposalState, ProposalState } from '../../contract/requests/getProposalState'
import { SDK } from '../client'
import {
  ProposalDetailFragment,
  ProposalDetailUpdatableFragment,
  ProposalFragment,
  ProposalUpdatableFragment,
  ProposalVoteFragment as ProposalVote,
} from '../sdk.generated'

export type Proposal = Omit<
  ProposalDetailFragment | ProposalDetailUpdatableFragment,
  | 'transactionHash'
  | 'executionTransactionHash'
  | 'cancelTransactionHash'
  | 'vetoTransactionHash'
  | 'executableFrom'
  | 'expiresAt'
  | 'calldatas'
  | 'values'
  | 'executedAt'
  | 'proposer'
  | 'updatePeriodEnd'
  | 'updateMessage'
  | 'updateCount'
  | 'candidateVersion'
  | 'replaces'
  | 'replacedBy'
> & {
  proposer: string
  values: string[]
  calldatas: string[]
  state: ProposalState
  transactionHash: string
  executionTransactionHash?: string
  cancelTransactionHash?: string
  vetoTransactionHash?: string
  executableFrom?: number
  expiresAt?: number
  executedAt?: number
  updatePeriodEnd?: number | null
  updateMessage?: string | null
  updateCount?: number | null
  candidateVersion?: ProposalDetailUpdatableFragment['candidateVersion'] | null
  replaces?: ProposalDetailUpdatableFragment['replaces'] | null
  replacedBy?: ProposalDetailUpdatableFragment['replacedBy'] | null
  votes?: ProposalVote[]
}

export const formatAndFetchState = async (
  chainId: CHAIN_ID,
  data:
    | ProposalFragment
    | ProposalDetailFragment
    | ProposalUpdatableFragment
    | ProposalDetailUpdatableFragment
) => {
  const { executableFrom, expiresAt, calldatas, executionTransactionHash, ...proposal } =
    data

  const baseProposal: any = {
    ...proposal,
    calldatas: calldatas ? calldatas.split(':') : [],
    state: await getProposalState(
      chainId,
      proposal.dao.governorAddress,
      proposal.proposalId
    ),
  }

  // Add updatable proposal fields (v0.1.17+) with explicit defaults (null, not undefined)
  baseProposal.updatePeriodEnd =
    'updatePeriodEnd' in data && data.updatePeriodEnd
      ? Number(data.updatePeriodEnd)
      : null
  baseProposal.updateMessage =
    'updateMessage' in data ? (data.updateMessage ?? null) : null
  baseProposal.updateCount = 'updateCount' in data ? (data.updateCount ?? null) : null
  baseProposal.candidateVersion =
    'candidateVersion' in data ? (data.candidateVersion ?? null) : null
  baseProposal.replaces = 'replaces' in data ? (data.replaces ?? null) : null
  baseProposal.replacedBy = 'replacedBy' in data ? (data.replacedBy ?? null) : null

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
  proposalId: string
): Promise<Proposal | undefined> => {
  try {
    const sdk = SDK.connect(chainId)
    const data = supportsUpdatableProposals(chainId)
      ? await sdk.proposalUpdatable({ proposalId: proposalId.toLowerCase() })
      : await sdk.proposal({ proposalId: proposalId.toLowerCase() })

    return await formatAndFetchState(chainId, data.proposal!)
  } catch (e) {
    console.error('Error fetching proposal', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return
  }
}
