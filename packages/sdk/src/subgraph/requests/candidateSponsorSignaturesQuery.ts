import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import {
  CandidateSponsorSignature_OrderBy,
  CandidateSponsorSignatureFragmentFragment,
  OrderDirection,
} from '../sdk.generated'

export type CandidateSponsorSignature = Omit<
  CandidateSponsorSignatureFragmentFragment,
  'createdAt'
> & {
  createdAt: number
}

export interface CandidateSponsorSignaturesResponse {
  signatures: CandidateSponsorSignature[]
}

export const getCandidateSponsorSignatures = async (
  chainId: CHAIN_ID,
  candidateVersionUID: string,
  limit: number = 100,
  page?: number
): Promise<CandidateSponsorSignaturesResponse> => {
  try {
    const data = await SDK.connect(chainId).CandidateSponsorSignatures({
      where: {
        version_: {
          id: candidateVersionUID.toLowerCase(),
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
