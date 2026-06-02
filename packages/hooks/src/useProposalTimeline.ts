import { governorAbi } from '@buildeross/sdk/contract'
import type { AddressType, BytesType, CHAIN_ID } from '@buildeross/types'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'

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
  // Fetch all timeline data in a single batched call
  const { data, isLoading } = useReadContracts({
    allowFailure: true,
    query: {
      enabled: !!chainId && !!governorAddress && !!proposalId,
    },
    contracts: [
      {
        abi: governorAbi,
        address: governorAddress,
        chainId,
        functionName: 'proposalUpdatePeriodEnd',
        args: [proposalId],
      },
      {
        abi: governorAbi,
        address: governorAddress,
        chainId,
        functionName: 'proposalSnapshot',
        args: [proposalId],
      },
      {
        abi: governorAbi,
        address: governorAddress,
        chainId,
        functionName: 'proposalDeadline',
        args: [proposalId],
      },
      {
        abi: governorAbi,
        address: governorAddress,
        chainId,
        functionName: 'proposalEta',
        args: [proposalId],
      },
    ] as const,
  })

  const [updatePeriodEndResult, snapshotResult, deadlineResult, etaResult] =
    unpackOptionalArray(data, 4)

  const timeline = useMemo(() => {
    const now = Math.floor(Date.now() / 1000)

    // Extract values from results (handling failures gracefully)
    const updatePeriodEnd =
      updatePeriodEndResult && 'result' in updatePeriodEndResult
        ? (updatePeriodEndResult.result as bigint)
        : 0n

    const proposalSnapshot =
      snapshotResult && 'result' in snapshotResult
        ? (snapshotResult.result as bigint)
        : undefined

    const proposalDeadline =
      deadlineResult && 'result' in deadlineResult
        ? (deadlineResult.result as bigint)
        : undefined

    const proposalEta =
      etaResult && 'result' in etaResult ? (etaResult.result as bigint) : null

    // Convert timestamps to Dates
    const updateDeadline =
      updatePeriodEnd && updatePeriodEnd > 0n
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
    const isInUpdatablePeriod =
      updatePeriodEnd && updatePeriodEnd > 0n ? now < Number(updatePeriodEnd) : false
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
      isLoading,
    }
  }, [isLoading, deadlineResult, etaResult, snapshotResult, updatePeriodEndResult])

  return timeline
}
