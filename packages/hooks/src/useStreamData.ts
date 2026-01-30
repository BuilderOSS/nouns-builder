import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type { Proposal } from '@buildeross/sdk/subgraph'
import type { CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import {
  createLockupLinearStreamEventAbi,
  lockupLinearAbi,
} from '@buildeross/utils/sablier/constants'
import { getSablierContracts } from '@buildeross/utils/sablier/contracts'
import {
  extractStreamData,
  StreamData,
  StreamLiveData,
} from '@buildeross/utils/sablier/streams'
import get from 'lodash/get'
import toLower from 'lodash/toLower'
import { useMemo } from 'react'
import useSWR from 'swr'
import { Address, decodeEventLog, Hex, isHex } from 'viem'

export type StreamBatchData = {
  streamData: StreamData
  streamIds: bigint[] | null
  liveStreams: (StreamLiveData | null)[] | null
}

export type StreamDataResult = {
  streamBatches: StreamBatchData[]
  lockupLinearAddress: Address | null
  isLoadingStreamIds: boolean
  isLoadingLiveData: boolean
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

  const lockupLinearAddress = sablierContracts.lockup

  // Fetch all stream IDs from execution transaction logs (if executed)
  const { data: allStreamIds, isValidating: isLoadingStreamIds } = useSWR(
    proposal.executionTransactionHash &&
      isHex(proposal.executionTransactionHash) &&
      lockupLinearAddress &&
      streamsStaticData.length > 0
      ? ([
          SWR_KEYS.SABLIER_STREAM_IDS,
          chainId,
          proposal.executionTransactionHash,
        ] as const)
      : null,
    async ([, _chainId, _txHash]) => {
      const provider = getProvider(_chainId)
      const { logs } = await provider.getTransactionReceipt({
        hash: _txHash,
      })

      const parsedLogs = logs
        .map((log) => {
          try {
            return decodeEventLog({
              abi: createLockupLinearStreamEventAbi,
              data: log?.data,
              topics: log?.topics,
            })
          } catch {
            return null
          }
        })
        .filter((log) => log !== null && log.eventName === 'CreateLockupLinearStream')

      // Extract stream IDs from events
      return parsedLogs.map((event) => get(event, 'args.streamId') as bigint)
    }
  )

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

  // Fetch live stream data for all stream IDs (if executed)
  const { data: allLiveStreams, isValidating: isLoadingLiveData } = useSWR(
    allStreamIds && allStreamIds.length > 0 && lockupLinearAddress
      ? ([
          SWR_KEYS.SABLIER_LIVE_STREAMS,
          chainId,
          allStreamIds,
          lockupLinearAddress,
        ] as const)
      : null,
    async ([, _chainId, _streamIds, _lockupAddress]) => {
      const provider = getProvider(_chainId)

      // Fetch data for each stream
      return Promise.all(
        _streamIds.map(async (streamId) => {
          try {
            // Get stream details
            const streamResult = (await provider.readContract({
              address: _lockupAddress as Address,
              abi: lockupLinearAbi,
              functionName: 'getStream',
              args: [streamId],
            })) as any

            // Get deposited amount
            const depositedAmount = (await provider.readContract({
              address: _lockupAddress as Address,
              abi: lockupLinearAbi,
              functionName: 'getDepositedAmount',
              args: [streamId],
            })) as bigint

            // Get withdrawn amount
            const withdrawnAmount = (await provider.readContract({
              address: _lockupAddress as Address,
              abi: lockupLinearAbi,
              functionName: 'getWithdrawnAmount',
              args: [streamId],
            })) as bigint

            // Get withdrawable amount
            const withdrawableAmount = (await provider.readContract({
              address: _lockupAddress as Address,
              abi: lockupLinearAbi,
              functionName: 'withdrawableAmountOf',
              args: [streamId],
            })) as bigint

            // Get status
            const status = (await provider.readContract({
              address: _lockupAddress as Address,
              abi: lockupLinearAbi,
              functionName: 'statusOf',
              args: [streamId],
            })) as number

            return {
              streamId,
              depositedAmount,
              withdrawnAmount,
              withdrawableAmount,
              status,
              sender: streamResult.sender as Address,
              recipient: streamResult.recipient as Address,
              startTime: Number(streamResult.startTime),
              cliffTime: Number(streamResult.cliffTime),
              endTime: Number(streamResult.endTime),
              isCancelable: streamResult.isCancelable as boolean,
              wasCanceled: streamResult.wasCanceled as boolean,
              isTransferable: streamResult.isTransferable as boolean,
              isDepleted: streamResult.isDepleted as boolean,
              asset: streamResult.asset as Address,
            } as StreamLiveData
          } catch (error) {
            console.error(`Failed to fetch stream ${streamId}:`, error)
            return null
          }
        })
      )
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds for live balances
    }
  )

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
    streamBatches,
    lockupLinearAddress,
    isLoadingStreamIds,
    isLoadingLiveData,
  }
}
