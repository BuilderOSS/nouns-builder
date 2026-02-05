import { CHAIN_ID } from '@buildeross/types'
import { Address, decodeFunctionData, Hex } from 'viem'

import { batchLockupAbi } from './constants'
import { getSablierContract } from './contracts'

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

export type StreamConfig = StreamConfigDurations | StreamConfigTimestamps

export interface StreamData {
  lockupAddress: Address
  tokenAddress: Address
  streams: StreamConfig[]
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
  minFeeWei: bigint
  streamedAmount: bigint
}

export const parseStreamDataConfigDurations = (streamData: any): StreamConfigDurations =>
  ({
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
  }) as StreamConfigDurations

export const parseStreamDataConfigTimestamps = (
  streamData: any
): StreamConfigTimestamps =>
  ({
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
  }) as StreamConfigTimestamps

/**
 * Extract stream configuration from calldata
 */
export function extractStreamData(calldata: Hex): StreamData | null {
  if (!calldata) return null

  try {
    const decoded = decodeFunctionData({
      abi: batchLockupAbi,
      data: calldata,
    })

    if (
      decoded.functionName !== 'createWithDurationsLL' &&
      decoded.functionName !== 'createWithTimestampsLL'
    ) {
      throw new Error('unknown function name: ' + decoded.functionName)
    }

    if (!decoded.args) {
      throw new Error('no args')
    }

    const [lockupAddress, tokenAddress, batchArray] = decoded.args as [
      Hex,
      Hex,
      unknown[],
    ]

    const isDurationsMode = decoded.functionName === 'createWithDurationsLL'
    const parser: (_data: any) => StreamConfig = isDurationsMode
      ? parseStreamDataConfigDurations
      : parseStreamDataConfigTimestamps

    const streams = batchArray.map(parser)

    return {
      lockupAddress,
      tokenAddress,
      streams,
      isDurationsMode,
    }
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
export function createSablierStreamUrl(opts: {
  chainId: CHAIN_ID
  streamId: bigint
  contractAddress?: Address
  contractName?: string
}): string {
  const contract = getSablierContract(opts)
  if (!contract?.alias) return ''
  return `https://app.sablier.com/vesting/stream/${contract.alias}-${opts.chainId}-${opts.streamId}`
}
