import { Address, decodeFunctionData, Hex } from 'viem'

import {
  batchLockupCreateWithDurationsLLAbi,
  batchLockupCreateWithTimestampsLLAbi,
} from './encoding'

export interface StreamConfigDurations {
  sender: Address
  recipient: Address
  depositAmount: bigint
  cancelable: boolean
  transferable: boolean
  durations: {
    cliff: number // seconds
    total: number // seconds
  }
  unlockAmounts: {
    start: bigint
    cliff: bigint
  }
  shape: string
}

export interface StreamConfigTimestamps {
  sender: Address
  recipient: Address
  depositAmount: bigint
  cancelable: boolean
  transferable: boolean
  timestamps: {
    start: number // unix timestamp
    end: number // unix timestamp
  }
  cliffTime: number // unix timestamp
  unlockAmounts: {
    start: bigint
    cliff: bigint
  }
  shape: string
}

export interface StreamData {
  lockupAddress: Address
  tokenAddress: Address
  streams: (StreamConfigDurations | StreamConfigTimestamps)[]
  isDurationsMode: boolean
}

export interface StreamLiveData {
  streamId: bigint
  depositedAmount: bigint
  withdrawnAmount: bigint
  withdrawableAmount: bigint
  status: number
  sender: Address
  recipient: Address
  startTime: number
  cliffTime: number
  endTime: number
  isCancelable: boolean
  wasCanceled: boolean
  isTransferable: boolean
  isDepleted: boolean
  asset: Address
}

/**
 * Extract stream configuration from calldata
 */
export function extractStreamData(calldata: Hex): StreamData | null {
  if (!calldata) return null

  try {
    // Try decoding with durations ABI first
    try {
      const decoded = decodeFunctionData({
        abi: batchLockupCreateWithDurationsLLAbi,
        data: calldata,
      })

      if (decoded.functionName === 'createWithDurationsLL') {
        const [lockupAddress, tokenAddress, batchArray] = decoded.args

        const streams = batchArray.map((streamData: any) => ({
          sender: streamData.sender as Address,
          recipient: streamData.recipient as Address,
          depositAmount: BigInt(streamData.depositAmount),
          cancelable: streamData.cancelable as boolean,
          transferable: streamData.transferable as boolean,
          durations: {
            cliff: Number(streamData.durations.cliff),
            total: Number(streamData.durations.total),
          },
          unlockAmounts: {
            start: BigInt(streamData.unlockAmounts.start),
            cliff: BigInt(streamData.unlockAmounts.cliff),
          },
          shape: streamData.shape as string,
        })) as StreamConfigDurations[]

        return {
          lockupAddress,
          tokenAddress,
          streams,
          isDurationsMode: true,
        }
      }
    } catch {
      // Not durations mode, try timestamps
    }

    // Try decoding with timestamps ABI
    const decoded = decodeFunctionData({
      abi: batchLockupCreateWithTimestampsLLAbi,
      data: calldata,
    })

    if (decoded.functionName === 'createWithTimestampsLL') {
      const [lockupAddress, tokenAddress, batchArray] = decoded.args

      const streams = batchArray.map((streamData: any) => ({
        sender: streamData.sender as Address,
        recipient: streamData.recipient as Address,
        depositAmount: BigInt(streamData.depositAmount),
        cancelable: streamData.cancelable as boolean,
        transferable: streamData.transferable as boolean,
        timestamps: {
          start: Number(streamData.timestamps.start),
          end: Number(streamData.timestamps.end),
        },
        cliffTime: Number(streamData.cliffTime),
        unlockAmounts: {
          start: BigInt(streamData.unlockAmounts.start),
          cliff: BigInt(streamData.unlockAmounts.cliff),
        },
        shape: streamData.shape as string,
      })) as StreamConfigTimestamps[]

      return {
        lockupAddress,
        tokenAddress,
        streams,
        isDurationsMode: false,
      }
    }

    return null
  } catch (error) {
    console.error('Failed to decode stream calldata:', error)
    return null
  }
}

/**
 * Calculate start, cliff, and end times for a stream
 */
export function calculateStreamTimes(
  stream: StreamConfigDurations | StreamConfigTimestamps,
  isDurationsMode: boolean,
  creationTimestamp?: number
): { startTime: number; cliffTime: number; endTime: number } {
  if (!isDurationsMode) {
    const timestampStream = stream as StreamConfigTimestamps
    return {
      startTime: timestampStream.timestamps.start,
      cliffTime: timestampStream.cliffTime,
      endTime: timestampStream.timestamps.end,
    }
  }

  const durationStream = stream as StreamConfigDurations
  const startTime = creationTimestamp || Math.floor(Date.now() / 1000)
  const cliffTime =
    durationStream.durations.cliff > 0 ? startTime + durationStream.durations.cliff : 0
  const endTime = startTime + durationStream.durations.total

  return { startTime, cliffTime, endTime }
}

/**
 * Format stream duration in human-readable format
 */
export function formatStreamDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)

  return parts.length > 0 ? parts.join(' ') : '< 1m'
}

/**
 * Get status label from status enum
 */
export function getStatusLabel(status: number): string {
  const labels = ['Pending', 'Streaming', 'Settled', 'Canceled', 'Depleted']
  return labels[status] || 'Unknown'
}

/**
 * Create Sablier app URL for a stream
 */
export function createSablierStreamUrl(chainId: number, streamId: bigint): string {
  return `https://app.sablier.com/stream/${chainId}/${streamId}`
}
