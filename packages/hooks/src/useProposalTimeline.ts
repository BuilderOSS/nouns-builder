import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { governorAbi } from '@buildeross/sdk/contract'
import type { AddressType, BytesType, CHAIN_ID } from '@buildeross/types'
import { useMemo } from 'react'
import useSWR from 'swr'
import { useConfig } from 'wagmi'
import { readContract } from 'wagmi/actions'

interface UseProposalTimelineParams {
  chainId: CHAIN_ID
  governorAddress: AddressType
  proposalId: BytesType
}

interface ProposalTimeline {
  created?: Date
  updateDeadline?: Date
  votingStarts?: Date
  votingEnds?: Date
  executionETA?: Date | null
  isInUpdatablePeriod: boolean
  isInVotingPeriod: boolean
  canExecute: boolean
  isLoading: boolean
  error?: Error
}

export const useProposalTimeline = ({
  chainId,
  governorAddress,
  proposalId,
}: UseProposalTimelineParams): ProposalTimeline => {
  const config = useConfig()

  // Fetch proposal update period end timestamp
  const { data: updatePeriodEnd, isLoading: isLoadingUpdatePeriod } = useSWR(
    chainId && governorAddress && proposalId
      ? ([
          SWR_KEYS.PROPOSAL,
          'proposalUpdatePeriodEnd',
          chainId,
          governorAddress,
          proposalId,
        ] as const)
      : null,
    async ([, , _chainId, _governorAddress, _proposalId]) => {
      try {
        const result = await readContract(config, {
          abi: governorAbi,
          address: _governorAddress as AddressType,
          functionName: 'proposalUpdatePeriodEnd',
          args: [_proposalId],
          chainId: _chainId,
        })
        return result as bigint
      } catch (error) {
        // If function doesn't exist (v2.x Governor), return 0
        return 0n
      }
    },
    { revalidateOnFocus: false }
  )

  // Fetch proposal snapshot (when voting starts)
  const { data: proposalSnapshot, isLoading: isLoadingSnapshot } = useSWR(
    chainId && governorAddress && proposalId
      ? ([
          SWR_KEYS.PROPOSAL,
          'proposalSnapshot',
          chainId,
          governorAddress,
          proposalId,
        ] as const)
      : null,
    async ([, , _chainId, _governorAddress, _proposalId]) => {
      const result = await readContract(config, {
        abi: governorAbi,
        address: _governorAddress as AddressType,
        functionName: 'proposalSnapshot',
        args: [_proposalId],
        chainId: _chainId,
      })
      return result as bigint
    },
    { revalidateOnFocus: false }
  )

  // Fetch proposal deadline (when voting ends)
  const { data: proposalDeadline, isLoading: isLoadingDeadline } = useSWR(
    chainId && governorAddress && proposalId
      ? ([
          SWR_KEYS.PROPOSAL,
          'proposalDeadline',
          chainId,
          governorAddress,
          proposalId,
        ] as const)
      : null,
    async ([, , _chainId, _governorAddress, _proposalId]) => {
      const result = await readContract(config, {
        abi: governorAbi,
        address: _governorAddress as AddressType,
        functionName: 'proposalDeadline',
        args: [_proposalId],
        chainId: _chainId,
      })
      return result as bigint
    },
    { revalidateOnFocus: false }
  )

  // Fetch proposal ETA (execution time)
  const { data: proposalEta, isLoading: isLoadingEta } = useSWR(
    chainId && governorAddress && proposalId
      ? ([
          SWR_KEYS.PROPOSAL,
          'proposalEta',
          chainId,
          governorAddress,
          proposalId,
        ] as const)
      : null,
    async ([, , _chainId, _governorAddress, _proposalId]) => {
      try {
        const result = await readContract(config, {
          abi: governorAbi,
          address: _governorAddress as AddressType,
          functionName: 'proposalEta',
          args: [_proposalId],
          chainId: _chainId,
        })
        return result as bigint
      } catch (error) {
        // Proposal not queued yet
        return null
      }
    },
    { revalidateOnFocus: false }
  )

  const timeline = useMemo(() => {
    const now = Math.floor(Date.now() / 1000)

    // Convert timestamps to Dates
    const updateDeadline = updatePeriodEnd
      ? new Date(Number(updatePeriodEnd) * 1000)
      : undefined
    const votingStarts = proposalSnapshot
      ? new Date(Number(proposalSnapshot) * 1000)
      : undefined
    const votingEnds = proposalDeadline
      ? new Date(Number(proposalDeadline) * 1000)
      : undefined
    const executionETA =
      proposalEta && proposalEta !== 0n ? new Date(Number(proposalEta) * 1000) : null

    // Calculate period flags
    const isInUpdatablePeriod = updatePeriodEnd ? now < Number(updatePeriodEnd) : false
    const isInVotingPeriod =
      proposalSnapshot && proposalDeadline
        ? now >= Number(proposalSnapshot) && now <= Number(proposalDeadline)
        : false
    const canExecute =
      proposalEta && proposalEta !== 0n ? now >= Number(proposalEta) : false

    return {
      updateDeadline,
      votingStarts,
      votingEnds,
      executionETA,
      isInUpdatablePeriod,
      isInVotingPeriod,
      canExecute,
      isLoading:
        isLoadingUpdatePeriod || isLoadingSnapshot || isLoadingDeadline || isLoadingEta,
    }
  }, [
    updatePeriodEnd,
    proposalSnapshot,
    proposalDeadline,
    proposalEta,
    isLoadingUpdatePeriod,
    isLoadingSnapshot,
    isLoadingDeadline,
    isLoadingEta,
  ])

  return timeline
}
