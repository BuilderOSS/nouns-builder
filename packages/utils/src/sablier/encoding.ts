import { Address, encodeFunctionData, Hex } from 'viem'

import { batchLockupAbi } from './constants'

export interface CreateWithDurationsLLParams {
  sender: Address
  recipient: Address
  depositAmount: bigint
  cliffDuration: number // in seconds
  totalDuration: number // in seconds
}

export interface CreateWithTimestampsLLParams {
  sender: Address
  recipient: Address
  depositAmount: bigint
  startTime: number // unix timestamp
  cliffTime: number // unix timestamp (0 if no cliff)
  endTime: number // unix timestamp
}

/**
 * Encode createWithDurationsLL calldata for batch stream creation
 */
export function encodeCreateWithDurationsLL(
  lockupLinearAddress: Address,
  tokenAddress: Address,
  streams: CreateWithDurationsLLParams[],
  cancelable: boolean = true,
  transferable: boolean = false
): Hex {
  const batch = streams.map((stream) => {
    // Determine shape based on whether there's a cliff
    // Using Sablier's Lockup enum values for proper display in their UI
    const shape = stream.cliffDuration > 0 ? 'cliff' : 'linear'

    return {
      sender: stream.sender,
      recipient: stream.recipient,
      depositAmount: stream.depositAmount,
      cancelable,
      transferable,
      durations: {
        cliff: stream.cliffDuration,
        total: stream.totalDuration,
      },
      unlockAmounts: {
        start: 0n,
        cliff: 0n,
      },
      shape,
    }
  })

  return encodeFunctionData({
    abi: batchLockupAbi,
    functionName: 'createWithDurationsLL',
    args: [lockupLinearAddress, tokenAddress, batch],
  })
}

/**
 * Encode createWithTimestampsLL calldata for batch stream creation
 */
export function encodeCreateWithTimestampsLL(
  lockupLinearAddress: Address,
  tokenAddress: Address,
  streams: CreateWithTimestampsLLParams[],
  cancelable: boolean = true,
  transferable: boolean = false
): Hex {
  const batch = streams.map((stream) => {
    // Determine shape based on whether there's a cliff
    // Using Sablier's Lockup enum values for proper display in their UI
    const shape = stream.cliffTime > 0 ? 'cliff' : 'linear'

    return {
      sender: stream.sender,
      recipient: stream.recipient,
      depositAmount: stream.depositAmount,
      cancelable,
      transferable,
      timestamps: {
        start: stream.startTime,
        end: stream.endTime,
      },
      cliffTime: stream.cliffTime,
      unlockAmounts: {
        start: 0n,
        cliff: 0n,
      },
      shape,
    }
  })

  return encodeFunctionData({
    abi: batchLockupAbi,
    functionName: 'createWithTimestampsLL',
    args: [lockupLinearAddress, tokenAddress, batch],
  })
}
