import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import {
  daoMembershipRequest,
  type DaoMembershipResponse,
} from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import useSWR, { KeyedMutator } from 'swr'

import { type EnsData, useEnsData } from './useEnsData'

export type DaoMembership = Omit<DaoMembershipResponse, 'member' | 'delegate'> & {
  member: EnsData
  delegate: EnsData
  voteDescription: string
}

const describeVotePower = (
  membership: DaoMembershipResponse,
  delegateName: string
): string => {
  const { tokenCount, voteCount, voteDistribution, member } = membership

  const userOwnedVotes = voteDistribution[member] ?? 0
  const delegatedVotes = Object.entries(voteDistribution)
    .filter(([addr]) => addr.toLowerCase() !== member.toLowerCase())
    .reduce((sum, [, count]) => sum + count, 0)

  if (tokenCount > 0 && voteCount === 0) {
    return `Your ${tokenCount} votes have been delegated to ${delegateName}.`
  }

  if (tokenCount === 0 && voteCount > 0) {
    return `You have been delegated a total of ${voteCount} votes from the community.`
  }

  if (tokenCount > 0 && voteCount > 0 && delegatedVotes > 0) {
    return `You have ${voteCount} votes: you own ${userOwnedVotes}, and ${delegatedVotes} have been delegated to you by other community members.`
  }

  if (tokenCount > 0 && voteCount === tokenCount) {
    return `You own ${tokenCount} token${tokenCount === 1 ? '' : 's'} and have not delegated your vote${tokenCount === 1 ? '' : 's'}.`
  }

  if (voteCount === 0 && tokenCount === 0) {
    return `You do not currently own any tokens or voting power.`
  }

  return `You have a total of ${voteCount} votes with ${userOwnedVotes} owned and ${delegatedVotes} delegated to you.`
}

export const useDaoMembership = ({
  chainId,
  collectionAddress,
  signerAddress,
  enabled = true,
}: {
  chainId: CHAIN_ID
  collectionAddress?: AddressType
  signerAddress?: AddressType
  enabled?: boolean
}): {
  data: DaoMembership | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<DaoMembershipResponse | null>
} => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    !!collectionAddress && !!signerAddress && enabled
      ? ([SWR_KEYS.DAO_MEMBERSHIP, chainId, collectionAddress, signerAddress] as const)
      : null,
    async ([, _chainId, _collectionAddress, _signerAddress]) =>
      daoMembershipRequest(
        _chainId as CHAIN_ID,
        _collectionAddress as `0x${string}`,
        _signerAddress as `0x${string}`
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const memberData = useEnsData(data?.member)
  const delegateData = useEnsData(data?.delegate)
  const voteDescription =
    !!data && !!delegateData.displayName
      ? describeVotePower(data, delegateData.displayName)
      : ''

  return {
    data:
      data && !memberData.isLoading && !delegateData.isLoading
        ? { ...data, member: memberData, delegate: delegateData, voteDescription }
        : undefined,
    isLoading:
      data === undefined || isLoading || !!memberData.isLoading || delegateData.isLoading,
    isValidating,
    error,
    mutate,
  }
}
