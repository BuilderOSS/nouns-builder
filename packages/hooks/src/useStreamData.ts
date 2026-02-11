import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type { Proposal } from '@buildeross/sdk/subgraph'
import type { CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import { lockupAbi, StreamStatus } from '@buildeross/utils/sablier/constants'
import { getSablierContracts } from '@buildeross/utils/sablier/contracts'
import {
  calculateStreamedAmountLD,
  calculateStreamedAmountLL,
  Segment,
} from '@buildeross/utils/sablier/math'
import {
  extractStreamData,
  StreamData,
  StreamLiveData,
} from '@buildeross/utils/sablier/streams'
import get from 'lodash/get'
import toLower from 'lodash/toLower'
import { useMemo } from 'react'
import useSWR from 'swr'
import { Abi, Address, decodeEventLog, Hex, isHex } from 'viem'
import { useReadContracts } from 'wagmi'

import { useNowSeconds } from './useNowSeconds'

export type StreamBatchData = {
  streamData: StreamData
  streamIds: bigint[] | null
  liveStreams: (StreamLiveData | null)[] | null
}

export type StreamDataResult = {
  isCreateTx: boolean
  streamBatches: StreamBatchData[]
  lockupAddress: Address | null
  isLoadingStreamIds: boolean
  isLoadingLiveData: boolean
  refetchLiveData: () => Promise<unknown>
}

function clampSub(a: bigint, b: bigint): bigint {
  return a > b ? a - b : 0n
}

type FlattenedStaticStream = {
  sender: Address
  recipient: Address
  depositAmount: bigint
  cancelable: boolean
  transferable: boolean
  startTime: number
  cliffTime: number
  endTime: number
  unlockStart: bigint
  unlockCliff: bigint
  tokenAddress: Address
  exponent?: number // For exponential (LD) streams
}

export const useStreamData = (
  chainId: CHAIN_ID,
  proposal: Proposal
): StreamDataResult => {
  // Get Sablier contract addresses for this chain (synchronous)
  const sablierContracts = useMemo(() => getSablierContracts(chainId), [chainId])

  // Find all Sablier transaction indices in proposal calldatas
  const sablierTransactionIndices = useMemo(() => {
    if (!proposal.targets) return []

    const indices: number[] = []
    proposal.targets.forEach((target, index) => {
      if (
        (sablierContracts.batchLockup &&
          toLower(target) === toLower(sablierContracts.batchLockup)) ||
        (sablierContracts.lockup && toLower(target) === toLower(sablierContracts.lockup))
      ) {
        indices.push(index)
      }
    })

    return indices
  }, [proposal.targets, sablierContracts])

  // Extract static stream configuration from all Sablier calldatas
  const streamsStaticData = useMemo(() => {
    if (sablierTransactionIndices.length === 0 || !proposal.calldatas) return []

    return sablierTransactionIndices
      .map((index) => {
        const calldata = proposal.calldatas?.[index]
        if (!calldata) return null
        return extractStreamData(calldata as Hex)
      })
      .filter((data): data is StreamData => data !== null)
  }, [sablierTransactionIndices, proposal.calldatas])

  const lockupAddress = sablierContracts.lockup

  /**
   * Fetch stream IDs AND execution block timestamp from execution transaction receipt.
   * We need the timestamp to convert durations-mode configs into absolute timestamps.
   */
  const { data: streamIdFetch, isValidating: isLoadingStreamIds } = useSWR(
    proposal.executionTransactionHash &&
      isHex(proposal.executionTransactionHash) &&
      lockupAddress &&
      streamsStaticData.length > 0
      ? ([
          SWR_KEYS.SABLIER_STREAM_IDS,
          chainId,
          proposal.executionTransactionHash,
        ] as const)
      : null,
    async ([, _chainId, _txHash]) => {
      const provider = getProvider(_chainId)

      const receipt = await provider.getTransactionReceipt({ hash: _txHash })
      const block = await provider.getBlock({ blockHash: receipt.blockHash })
      const executedAt = Number(block.timestamp) // seconds

      const parsedLogs = receipt.logs
        .map((log) => {
          try {
            return decodeEventLog({
              abi: lockupAbi,
              data: log?.data,
              topics: log?.topics,
            })
          } catch {
            return null
          }
        })
        .filter(
          (log) =>
            log !== null &&
            (log.eventName === 'CreateLockupLinearStream' ||
              log.eventName === 'CreateLockupDynamicStream')
        )

      // Extract stream IDs from events
      const streamIds: bigint[] = []
      for (const event of parsedLogs) {
        const streamId = get(event, 'args.streamId')
        if (typeof streamId === 'bigint') streamIds.push(streamId)
      }

      return { streamIds, executedAt }
    }
  )

  const allStreamIds = streamIdFetch?.streamIds ?? null
  const executedAt = streamIdFetch?.executedAt ?? null

  // Group stream IDs by batch based on expected stream counts
  const streamIdsByBatch = useMemo(() => {
    if (!allStreamIds || allStreamIds.length === 0) return []

    const batches: bigint[][] = []
    let currentIndex = 0

    streamsStaticData.forEach((streamData) => {
      const batchSize = streamData.streams.length
      const batchStreamIds = allStreamIds.slice(currentIndex, currentIndex + batchSize)
      batches.push(batchStreamIds)
      currentIndex += batchSize
    })

    return batches
  }, [allStreamIds, streamsStaticData])

  /**
   * Flatten static streams in the exact same order we expect IDs to be emitted:
   * batch0 stream0..n, batch1 stream0..n, ...
   */
  const flattenedStaticStreams: FlattenedStaticStream[] = useMemo(() => {
    if (!streamsStaticData.length) return []
    if (!executedAt) return [] // needed for durations-mode

    const out: FlattenedStaticStream[] = []

    for (const batch of streamsStaticData) {
      for (const s of batch.streams as any[]) {
        const sender = s.sender as Address
        const recipient = s.recipient as Address
        const depositAmount = s.depositAmount as bigint
        const cancelable = s.cancelable as boolean
        const transferable = s.transferable as boolean
        const unlockStart = (s.unlockAmounts?.start ?? 0n) as bigint
        const unlockCliff = (s.unlockAmounts?.cliff ?? 0n) as bigint

        let startTime: number
        let endTime: number
        let cliffTime: number
        let exponent: number | undefined

        // Check if this is a LockupDynamic stream (has segments)
        const isLDStream = 'segmentsWithDuration' in s || 'segments' in s

        if (isLDStream) {
          // LockupDynamic (exponential) stream
          if (batch.isDurationsMode) {
            // LD with durations
            const segments = s.segmentsWithDuration || []
            const totalDur = segments.reduce(
              (sum: number, seg: any) => sum + Number(seg.duration ?? 0),
              0
            )
            startTime = executedAt
            endTime = executedAt + totalDur
            cliffTime = 0 // LD streams don't support cliff

            // Extract exponent from first segment (convert from UD2x18)
            if (segments.length > 0 && segments[0].exponent) {
              const exponentUD2x18 = BigInt(segments[0].exponent)
              exponent = Number(exponentUD2x18 / BigInt(10 ** 18))
            }
          } else {
            // LD with timestamps
            const segments = s.segments || []
            startTime = Number(s.startTime ?? 0)
            endTime =
              segments.length > 0
                ? Number(segments[segments.length - 1].timestamp ?? 0)
                : 0
            cliffTime = 0 // LD streams don't support cliff

            // Extract exponent from first segment (convert from UD2x18)
            if (segments.length > 0 && segments[0].exponent) {
              const exponentUD2x18 = BigInt(segments[0].exponent)
              exponent = Number(exponentUD2x18 / BigInt(10 ** 18))
            }
          }
        } else {
          // LockupLinear (linear) stream
          if (batch.isDurationsMode) {
            // LL durations-mode: derive absolute times from execution timestamp
            const cliffDur = Number(s.durations?.cliff ?? 0)
            const totalDur = Number(s.durations?.total ?? 0)

            startTime = executedAt
            endTime = executedAt + totalDur
            cliffTime = cliffDur === 0 ? 0 : executedAt + cliffDur
          } else {
            // LL timestamps-mode: use explicit timestamps
            startTime = Number(s.timestamps?.start ?? 0)
            endTime = Number(s.timestamps?.end ?? 0)
            cliffTime = Number(s.cliffTime ?? 0)
          }
        }

        out.push({
          sender,
          recipient,
          depositAmount,
          cancelable,
          transferable,
          startTime,
          cliffTime,
          endTime,
          unlockStart,
          unlockCliff,
          tokenAddress: batch.tokenAddress,
          exponent,
        })
      }
    }

    return out
  }, [streamsStaticData, executedAt])

  // Build array of all contract calls (4 calls per stream) for useReadContracts
  const contractCalls = useMemo(() => {
    if (!allStreamIds || allStreamIds.length === 0 || !lockupAddress) return []

    return allStreamIds.flatMap((streamId) => [
      {
        address: lockupAddress,
        abi: lockupAbi as Abi,
        functionName: 'withdrawableAmountOf' as const,
        args: [streamId] as const,
        chainId,
      },
      {
        address: lockupAddress,
        abi: lockupAbi as Abi,
        functionName: 'getWithdrawnAmount' as const,
        args: [streamId] as const,
        chainId,
      },
      {
        address: lockupAddress,
        abi: lockupAbi as Abi,
        functionName: 'statusOf' as const,
        args: [streamId] as const,
        chainId,
      },
      {
        address: lockupAddress,
        abi: lockupAbi as Abi,
        functionName: 'calculateMinFeeWei' as const,
        args: [streamId] as const,
        chainId,
      },
    ])
  }, [allStreamIds, lockupAddress, chainId])

  // Fetch live stream data using wagmi's useReadContracts
  const {
    data: contractResults,
    isLoading: isLoadingLiveData,
    refetch: refetchLiveData,
  } = useReadContracts({
    contracts: contractCalls,
    allowFailure: false,
    query: {
      enabled: contractCalls.length > 0,
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
    },
  })

  const tickEnabled = Boolean(
    allStreamIds?.length && flattenedStaticStreams.length && contractResults?.length
  )
  const now = useNowSeconds(tickEnabled)

  // Parse contract results into StreamLiveData (built from static + withdrawn/status)
  const allLiveStreams = useMemo(() => {
    if (!contractResults || !allStreamIds || allStreamIds.length === 0) return null
    if (!flattenedStaticStreams.length) return null

    return allStreamIds.map((streamId, index) => {
      const offset = index * 4
      const withdrawableAmountFromContract = contractResults[offset]
      const withdrawnAmount = contractResults[offset + 1]
      const status = contractResults[offset + 2]
      const minFeeWei = contractResults[offset + 3]

      const staticStream = flattenedStaticStreams[index]
      if (!staticStream) {
        console.error(
          `Missing static stream config for stream index ${index} (${streamId})`
        )
        return null
      }

      if (
        withdrawableAmountFromContract === undefined ||
        withdrawnAmount === undefined ||
        status === undefined
      ) {
        console.error(`Failed to fetch complete data for stream ${streamId}`)
        return null
      }

      try {
        const depositedAmount = staticStream.depositAmount
        const numericStatus = status as number
        const wasCanceled = numericStatus === StreamStatus.CANCELED
        const isDepleted = numericStatus === StreamStatus.DEPLETED

        // Use different calculation strategies based on stream status:
        // - CANCELED/DEPLETED: Use contract's withdrawableAmountOf (frozen at cancellation/depletion)
        // - Others: Calculate locally for real-time updates
        let streamedAmount: bigint
        let withdrawableAmount: bigint

        if (wasCanceled || isDepleted) {
          // For canceled/depleted streams, use the contract's frozen withdrawableAmount
          // and calculate streamed amount from it
          withdrawableAmount = withdrawableAmountFromContract as bigint
          streamedAmount = (withdrawnAmount as bigint) + withdrawableAmount
        } else {
          // For active/settled/pending streams, calculate based on time for real-time updates
          if (staticStream.exponent && staticStream.exponent >= 2) {
            // Exponential (LockupDynamic) stream - use LD calculation
            // Build single segment with full amount at end
            const segments: Segment[] = [
              {
                timestamp: staticStream.endTime,
                amount: depositedAmount,
                exponent: staticStream.exponent, // Regular number (2-100), NOT UD2x18
              },
            ]

            streamedAmount = calculateStreamedAmountLD({
              depositedAmount,
              endTime: staticStream.endTime,
              segments,
              startTime: staticStream.startTime,
              withdrawnAmount: withdrawnAmount as bigint,
              now,
            })
          } else {
            // Linear (LockupLinear) stream - use LL calculation
            streamedAmount = calculateStreamedAmountLL({
              now,
              cliffTime: staticStream.cliffTime,
              depositedAmount,
              endTime: staticStream.endTime,
              startTime: staticStream.startTime,
              unlockStart: staticStream.unlockStart,
              unlockCliff: staticStream.unlockCliff,
              withdrawnAmount: withdrawnAmount as bigint,
            })
          }
          withdrawableAmount = clampSub(streamedAmount, withdrawnAmount as bigint)
        }

        // StreamLiveData type compatibility: hybrid approach for accurate withdrawable amounts.
        // For canceled/depleted streams, we use the contract's frozen value.
        // For active streams, we calculate locally for real-time updates.
        return {
          streamId,
          depositedAmount,
          withdrawnAmount: withdrawnAmount as bigint,
          withdrawableAmount,
          streamedAmount,
          status: numericStatus,
          sender: staticStream.sender,
          recipient: staticStream.recipient,
          startTime: staticStream.startTime,
          cliffTime: staticStream.cliffTime,
          endTime: staticStream.endTime,
          isCancelable: staticStream.cancelable,
          wasCanceled,
          isTransferable: staticStream.transferable,
          isDepleted,
          asset: staticStream.tokenAddress,
          minFeeWei: minFeeWei as bigint,
          exponent: staticStream.exponent,
          shape:
            staticStream.exponent && staticStream.exponent >= 2
              ? 'dynamicExponential'
              : staticStream.cliffTime > 0
                ? 'cliff'
                : 'linear',
        } as StreamLiveData
      } catch (error) {
        console.error(`Failed to parse stream ${streamId}:`, error)
        return null
      }
    })
  }, [contractResults, allStreamIds, flattenedStaticStreams, now])

  // Group live streams by batch
  const liveStreamsByBatch = useMemo(() => {
    if (!allLiveStreams || allLiveStreams.length === 0) return []

    const batches: (StreamLiveData | null)[][] = []
    let currentIndex = 0

    streamsStaticData.forEach((streamData) => {
      const batchSize = streamData.streams.length
      const batchLiveStreams = allLiveStreams.slice(
        currentIndex,
        currentIndex + batchSize
      )
      batches.push(batchLiveStreams)
      currentIndex += batchSize
    })

    return batches
  }, [allLiveStreams, streamsStaticData])

  // Combine static data with fetched data into stream batches
  const streamBatches = useMemo(() => {
    return streamsStaticData.map((streamData, index) => ({
      streamData,
      streamIds: streamIdsByBatch[index] ?? null,
      liveStreams: liveStreamsByBatch[index] ?? null,
    }))
  }, [streamsStaticData, streamIdsByBatch, liveStreamsByBatch])

  return {
    isCreateTx: streamsStaticData.length > 0,
    streamBatches,
    lockupAddress,
    isLoadingStreamIds,
    isLoadingLiveData,
    refetchLiveData,
  }
}
