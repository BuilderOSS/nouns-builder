import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'

export interface ProposalBasicInfo {
  proposer: `0x${string}`
  proposalId: string
  proposalNumber: number
  title: string
  dao: {
    id: string
    name: string
    contractImage: string | null
  }
}

export const getProposalByExecutionTxHash = async (
  chainId: CHAIN_ID,
  executionTransactionHash: string
): Promise<ProposalBasicInfo | undefined> => {
  try {
    const data = await SDK.connect(chainId).proposalByExecutionTxHash({
      executionTransactionHash: executionTransactionHash.toLowerCase(),
    })

    if (!data.proposals || data.proposals.length === 0) {
      return undefined
    }

    const proposal = data.proposals[0]
    return {
      proposalId: proposal.proposalId,
      proposalNumber: proposal.proposalNumber,
      proposer: proposal.proposer,
      title: proposal.title ?? '',
      dao: {
        id: proposal.dao.id,
        name: proposal.dao.name,
        contractImage: proposal.dao.contractImage ?? null,
      },
    }
  } catch (e) {
    console.error('Error fetching proposal by execution transaction hash', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return
  }
}
