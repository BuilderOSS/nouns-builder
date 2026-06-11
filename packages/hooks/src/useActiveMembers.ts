import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { daoActivityRequest } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import {
  type ActivityThresholds,
  computeActiveMembers,
  DEFAULT_ACTIVITY_THRESHOLDS,
} from '@buildeross/utils/memberActivity'
import { useCallback, useMemo } from 'react'
import useSWR from 'swr'

export type UseActiveMembersProps = {
  chainId: CHAIN_ID
  collectionAddress?: AddressType
  thresholds?: Partial<ActivityThresholds>
  enabled?: boolean
}

export type UseActiveMembersReturn = {
  /** lowercased, sorted addresses of active members; undefined while loading or on error */
  activeMembers: string[] | undefined
  /** case-insensitive membership check; returns false until data is loaded */
  isActiveMember: (address?: string) => boolean
  isLoading: boolean
  error: Error | undefined
}

export const useActiveMembers = ({
  chainId,
  collectionAddress,
  thresholds,
  enabled = true,
}: UseActiveMembersProps): UseActiveMembersReturn => {
  const recentProposalCount =
    thresholds?.recentProposalCount ?? DEFAULT_ACTIVITY_THRESHOLDS.recentProposalCount
  const bidWindowSeconds =
    thresholds?.bidWindowSeconds ?? DEFAULT_ACTIVITY_THRESHOLDS.bidWindowSeconds

  const { data, error, isLoading } = useSWR(
    !!collectionAddress && enabled
      ? ([
          SWR_KEYS.ACTIVE_MEMBERS,
          chainId,
          collectionAddress,
          recentProposalCount,
          bidWindowSeconds,
        ] as const)
      : null,
    async ([, _chainId, _collectionAddress, _recentProposalCount, _bidWindowSeconds]) => {
      const nowSeconds = Math.floor(Date.now() / 1000)
      const activity = await daoActivityRequest(_chainId, _collectionAddress, {
        recentProposalCount: _recentProposalCount,
        bidWindowSeconds: _bidWindowSeconds,
        nowSeconds,
      })
      return computeActiveMembers({
        recentProposalIds: activity.recentProposalIds,
        votes: activity.votes,
        bids: activity.bids,
        nowSeconds,
        thresholds: {
          recentProposalCount: _recentProposalCount,
          bidWindowSeconds: _bidWindowSeconds,
        },
      })
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const activeSet = useMemo(() => (data ? new Set(data) : undefined), [data])

  const isActiveMember = useCallback(
    (address?: string): boolean =>
      !!address && !!activeSet && activeSet.has(address.toLowerCase()),
    [activeSet]
  )

  return { activeMembers: data, isActiveMember, isLoading, error }
}
