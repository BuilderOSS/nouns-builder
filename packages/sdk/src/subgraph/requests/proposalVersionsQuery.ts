import { CHAIN_ID } from '@buildeross/types'

import { getProposalState, ProposalState } from '../../contract/requests/getProposalState'
import { SDK } from '../client'
import { ProposalFragment } from '../sdk.generated'

export type ProposalVersion = Omit<
  ProposalFragment,
  'calldatas' | 'values' | 'proposer' | 'transactionHash' | 'updatePeriodEnd'
> & {
  proposer: string
  values: string[]
  calldatas: string[]
  transactionHash: string
  updatePeriodEnd?: number
  state: ProposalState
}

export const getProposalVersions = async (
  chainId: CHAIN_ID,
  daoAddress: string,
  proposalNumber: number
): Promise<ProposalVersion[]> => {
  try {
    const data = await SDK.connect(chainId).proposalVersions({
      where: {
        dao: daoAddress.toLowerCase(),
        proposalNumber: proposalNumber,
      },
    })

    const versions = await Promise.all(
      data?.proposals.map(async (p) => {
        const { calldatas, updatePeriodEnd, ...proposal } = p

        // Get state for each version
        const state = await getProposalState(
          chainId,
          proposal.dao.governorAddress,
          proposal.proposalId
        )

        return {
          ...proposal,
          calldatas: calldatas ? calldatas.split(':') : [],
          updatePeriodEnd: updatePeriodEnd ? Number(updatePeriodEnd) : undefined,
          state,
        }
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
