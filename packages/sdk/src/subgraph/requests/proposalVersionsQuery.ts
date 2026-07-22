import { supportsUpdatableProposals } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'

import { getProposalState, ProposalState } from '../../contract/requests/getProposalState'
import { SDK } from '../client'
import { ProposalFragment, ProposalUpdatableFragment } from '../sdk.generated'

export type ProposalVersion = Omit<
  ProposalFragment | ProposalUpdatableFragment,
  | 'calldatas'
  | 'values'
  | 'proposer'
  | 'transactionHash'
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
  transactionHash: string
  updatePeriodEnd?: number | null
  updateMessage?: string | null
  updateCount?: number | null
  candidateVersion?: ProposalUpdatableFragment['candidateVersion'] | null
  replaces?: ProposalUpdatableFragment['replaces'] | null
  replacedBy?: ProposalUpdatableFragment['replacedBy'] | null
  state: ProposalState
}

export const getProposalVersions = async (
  chainId: CHAIN_ID,
  daoAddress: string,
  proposalNumber: number
): Promise<ProposalVersion[]> => {
  try {
    const sdk = SDK.connect(chainId)
    const data = supportsUpdatableProposals(chainId)
      ? await sdk.proposalVersionsUpdatable({
          where: {
            dao: daoAddress.toLowerCase(),
            proposalNumber: proposalNumber,
          },
        })
      : await sdk.proposalVersions({
          where: {
            dao: daoAddress.toLowerCase(),
            proposalNumber: proposalNumber,
          },
        })

    const versions = await Promise.all(
      data?.proposals.map(async (p) => {
        const { calldatas, ...proposal } = p

        // Get state for each version
        const state = await getProposalState(
          chainId,
          proposal.dao.governorAddress,
          proposal.proposalId
        )

        const version: any = {
          ...proposal,
          calldatas: calldatas ? calldatas.split(':') : [],
          state,
        }

        // Add updatable proposal fields (v0.1.17+) with explicit defaults (null, not undefined)
        version.updatePeriodEnd =
          'updatePeriodEnd' in p && p.updatePeriodEnd ? Number(p.updatePeriodEnd) : null
        version.updateMessage = 'updateMessage' in p ? (p.updateMessage ?? null) : null
        version.updateCount = 'updateCount' in p ? (p.updateCount ?? null) : null
        version.candidateVersion =
          'candidateVersion' in p ? (p.candidateVersion ?? null) : null
        version.replaces = 'replaces' in p ? (p.replaces ?? null) : null
        version.replacedBy = 'replacedBy' in p ? (p.replacedBy ?? null) : null

        return version
      }) || []
    )

    return versions
  } catch (e) {
    console.error('Error fetching proposal versions', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return []
  }
}
