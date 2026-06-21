import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import {
  CandidateSponsorSignature_OrderBy,
  CandidateSponsorSignatureFragmentFragment,
  OrderDirection,
} from '../sdk.generated'

export type CandidateSponsorSignature = Omit<
  CandidateSponsorSignatureFragmentFragment,
  | 'createdAt'
  | 'voteWeight'
  | 'nonce'
  | 'deadline'
  | 'candidateId'
  | 'proposalHash'
  | 'signer'
  | 'signature'
> & {
  createdAt: number
  voteWeight: bigint
  nonce: bigint
  deadline: bigint
  candidateId: `0x${string}`
  proposalHash: `0x${string}`
  signer: `0x${string}`
  signature: `0x${string}`
}

export interface CandidateSponsorSignaturesResponse {
  signatures: CandidateSponsorSignature[]
}

export const getCandidateSponsorSignatures = async (
  chainId: CHAIN_ID,
  candidateId: string,
  proposalHash: string,
  limit: number = 100,
  page?: number
): Promise<CandidateSponsorSignaturesResponse> => {
  try {
    const versionId = candidateId
      .toLowerCase()
      .concat('-')
      .concat(proposalHash.toLowerCase())
    const data = await SDK.connect(chainId).CandidateSponsorSignatures({
      where: {
        version_: {
          id: versionId,
        },
        revoked: false,
      },
      first: limit,
      skip: page ? (page - 1) * limit : 0,
      orderBy: CandidateSponsorSignature_OrderBy.CreatedAt,
      orderDirection: OrderDirection.Desc,
    })

    return {
      signatures: data.candidateSponsorSignatures.map((signature) => ({
        ...signature,
        createdAt: Number(signature.createdAt),
        voteWeight: BigInt(signature.voteWeight),
        nonce: BigInt(signature.nonce),
        deadline: BigInt(signature.deadline),
        candidateId: signature.candidateId as `0x${string}`,
        proposalHash: signature.proposalHash as `0x${string}`,
        signer: signature.signer as `0x${string}`,
        signature: signature.signature as `0x${string}`,
      })),
    }
  } catch (e) {
    console.error('Error fetching candidate sponsor signatures', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return { signatures: [] }
  }
}
