import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import {
  CandidateGroupDetailFragmentFragment,
  CandidateVersionFragmentFragment,
} from '../sdk.generated'

export type CandidateGroup = Omit<
  CandidateGroupDetailFragmentFragment,
  'createdAt' | 'values' | 'calldatas'
> & {
  createdAt: number
  versions?: CandidateVersion[]
  leadingVersion?: CandidateVersion
}

export type CandidateVersion = Omit<
  CandidateVersionFragmentFragment,
  'createdAt' | 'values' | 'calldatas'
> & {
  createdAt: number
  values: string[]
  calldatas: string[]
}

const formatCandidateVersion = (
  version: CandidateVersionFragmentFragment
): CandidateVersion => {
  return {
    ...version,
    createdAt: Number(version.createdAt),
    values: version.values.map((v: any) => v.toString()),
    calldatas: version.calldatas,
  }
}

export const getCandidateGroup = async (
  chainId: CHAIN_ID,
  candidateIdentifier: string,
  dao?: string
): Promise<CandidateGroup | undefined> => {
  try {
    const isNumericCandidateNumber = /^\d+$/.test(candidateIdentifier)

    const group = isNumericCandidateNumber
      ? (
          await SDK.connect(chainId).CandidateGroupByNumber({
            candidateNumber: Number(candidateIdentifier),
            dao: dao?.toLowerCase(),
          })
        ).proposalCandidateGroups[0]
      : (
          await SDK.connect(chainId).CandidateGroup({
            candidateId: candidateIdentifier.toLowerCase(),
          })
        ).proposalCandidateGroup

    if (!group) {
      return undefined
    }

    return {
      ...group,
      createdAt: Number(group.createdAt),
      versions: group.versions?.map(formatCandidateVersion),
      leadingVersion: group.leadingVersion
        ? formatCandidateVersion(group.leadingVersion)
        : undefined,
    }
  } catch (e) {
    console.error('Error fetching candidate group', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return undefined
  }
}
