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

export interface StreamSegmentWithDuration {
  amount: bigint
  exponent: bigint // UD2x18 format
  duration: number // seconds
}

export interface StreamSegmentWithTimestamp {
  amount: bigint
  exponent: bigint // UD2x18 format
  timestamp: number // unix timestamp
}

export interface StreamConfigDurationsLD {
  sender: Address
  recipient: Address
  depositAmount: bigint
  cancelable: boolean
  transferable: boolean
  segmentsWithDuration: StreamSegmentWithDuration[]
  shape: string
  exponent?: number // Decoded exponent value (UD2x18: 0 to ~18.446)
}

export interface StreamConfigTimestampsLD {
  sender: Address
  recipient: Address
  depositAmount: bigint
  cancelable: boolean
  transferable: boolean
  startTime: number // unix timestamp
  segments: StreamSegmentWithTimestamp[]
  shape: string
  exponent?: number // Decoded exponent value (UD2x18: 0 to ~18.446)
}

export type StreamConfig =
  | StreamConfigDurations
  | StreamConfigTimestamps
  | StreamConfigDurationsLD
  | StreamConfigTimestampsLD

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
  exponent?: number // Exponent value for exponential streams (UD2x18: 0 to ~18.446)
  shape?: string // Stream shape (e.g., 'linear', 'cliff', 'dynamicExponential')
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

export const parseStreamDataConfigDurationsLD = (
  streamData: any
): StreamConfigDurationsLD => {
  const segmentsWithDuration: StreamSegmentWithDuration[] =
    streamData.segmentsWithDuration.map((seg: any) => ({
      amount: BigInt(seg.amount),
      exponent: BigInt(seg.exponent),
      duration: Number(seg.duration),
    }))

  // Extract exponent value from segments (convert from UD2x18 to number)
  const exponentUD2x18 =
    segmentsWithDuration.length > 0 ? segmentsWithDuration[0].exponent : 0n
  // Use floating-point division to preserve decimal precision for fractional exponents
  const exponent = exponentUD2x18 > 0n ? Number(exponentUD2x18) / 10 ** 18 : undefined

  return {
    sender: streamData.sender as Address,
    recipient: streamData.recipient as Address,
    depositAmount: BigInt(streamData.depositAmount),
    cancelable: streamData.cancelable as boolean,
    transferable: streamData.transferable as boolean,
    segmentsWithDuration,
    shape: streamData.shape as string,
    exponent,
  } as StreamConfigDurationsLD
}

export const parseStreamDataConfigTimestampsLD = (
  streamData: any
): StreamConfigTimestampsLD => {
  const segments: StreamSegmentWithTimestamp[] = streamData.segments.map((seg: any) => ({
    amount: BigInt(seg.amount),
    exponent: BigInt(seg.exponent),
    timestamp: Number(seg.timestamp),
  }))

  // Extract exponent value from segments (convert from UD2x18 to number)
  const exponentUD2x18 = segments.length > 0 ? segments[0].exponent : 0n
  // Use floating-point division to preserve decimal precision for fractional exponents
  const exponent = exponentUD2x18 > 0n ? Number(exponentUD2x18) / 10 ** 18 : undefined

  return {
    sender: streamData.sender as Address,
    recipient: streamData.recipient as Address,
    depositAmount: BigInt(streamData.depositAmount),
    cancelable: streamData.cancelable as boolean,
    transferable: streamData.transferable as boolean,
    startTime: Number(streamData.startTime),
    segments,
    cliffTime: Number(streamData.cliffTime),
    shape: streamData.shape as string,
    exponent,
  } as StreamConfigTimestampsLD
}

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
      decoded.functionName !== 'createWithTimestampsLL' &&
      decoded.functionName !== 'createWithDurationsLD' &&
      decoded.functionName !== 'createWithTimestampsLD'
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

    const isDurationsMode =
      decoded.functionName === 'createWithDurationsLL' ||
      decoded.functionName === 'createWithDurationsLD'

    let parser: (_data: any) => StreamConfig

    if (decoded.functionName === 'createWithDurationsLL') {
      parser = parseStreamDataConfigDurations
    } else if (decoded.functionName === 'createWithTimestampsLL') {
      parser = parseStreamDataConfigTimestamps
    } else if (decoded.functionName === 'createWithDurationsLD') {
      parser = parseStreamDataConfigDurationsLD
    } else {
      // createWithTimestampsLD
      parser = parseStreamDataConfigTimestampsLD
    }

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
  stream: StreamConfig,
  isDurationsMode: boolean,
  creationTimestamp?: number
): { startTime: number; cliffTime: number; endTime: number } {
  // Handle LockupDynamic streams with timestamps
  if ('segments' in stream && !isDurationsMode) {
    const ldTimestampStream = stream as StreamConfigTimestampsLD
    const segments = ldTimestampStream.segments
    // For single segment: use startTime from config and timestamp from segment as endTime
    const startTime =
      'startTime' in stream && typeof stream.startTime === 'number'
        ? stream.startTime
        : creationTimestamp || Math.floor(Date.now() / 1000)
    return {
      startTime,
      cliffTime: 0, // LD streams don't support cliff
      endTime: segments.length > 0 ? segments[segments.length - 1].timestamp : 0,
    }
  }

  // Handle LockupDynamic streams with durations
  if ('segmentsWithDuration' in stream && isDurationsMode) {
    const ldDurationStream = stream as StreamConfigDurationsLD
    const segments = ldDurationStream.segmentsWithDuration
    const startTime = creationTimestamp || Math.floor(Date.now() / 1000)
    // For LD with durations, calculate end time from segment durations
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0)
    return {
      startTime,
      cliffTime: 0, // LD streams don't support cliff
      endTime: startTime + totalDuration,
    }
  }

  // Handle LockupLinear streams with timestamps
  if (!isDurationsMode) {
    const timestampStream = stream as StreamConfigTimestamps
    return {
      startTime: timestampStream.timestamps.start,
      cliffTime: timestampStream.cliffTime,
      endTime: timestampStream.timestamps.end,
    }
  }

  // Handle LockupLinear streams with durations
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
