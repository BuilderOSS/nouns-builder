import { Address, encodeFunctionData, Hex } from 'viem'

// Sablier BatchLockup ABI - createWithDurationsLL function
export const batchLockupCreateWithDurationsLLAbi = [
  {
    type: 'function',
    name: 'createWithDurationsLL',
    inputs: [
      {
        name: 'lockup',
        type: 'address',
        internalType: 'contract ISablierLockup',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'contract IERC20',
      },
      {
        name: 'batch',
        type: 'tuple[]',
        internalType: 'struct BatchLockup.CreateWithDurationsLL[]',
        components: [
          {
            name: 'sender',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'recipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'depositAmount',
            type: 'uint128',
            internalType: 'uint128',
          },
          {
            name: 'cancelable',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'transferable',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'durations',
            type: 'tuple',
            internalType: 'struct LockupLinear.Durations',
            components: [
              {
                name: 'cliff',
                type: 'uint40',
                internalType: 'uint40',
              },
              {
                name: 'total',
                type: 'uint40',
                internalType: 'uint40',
              },
            ],
          },
          {
            name: 'unlockAmounts',
            type: 'tuple',
            internalType: 'struct LockupLinear.UnlockAmounts',
            components: [
              {
                name: 'start',
                type: 'uint128',
                internalType: 'uint128',
              },
              {
                name: 'cliff',
                type: 'uint128',
                internalType: 'uint128',
              },
            ],
          },
          {
            name: 'shape',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'streamIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
] as const

// Sablier BatchLockup ABI - createWithTimestampsLL function
export const batchLockupCreateWithTimestampsLLAbi = [
  {
    type: 'function',
    name: 'createWithTimestampsLL',
    inputs: [
      {
        name: 'lockup',
        type: 'address',
        internalType: 'contract ISablierLockup',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'contract IERC20',
      },
      {
        name: 'batch',
        type: 'tuple[]',
        internalType: 'struct BatchLockup.CreateWithTimestampsLL[]',
        components: [
          {
            name: 'sender',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'recipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'depositAmount',
            type: 'uint128',
            internalType: 'uint128',
          },
          {
            name: 'cancelable',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'transferable',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'timestamps',
            type: 'tuple',
            internalType: 'struct Lockup.Timestamps',
            components: [
              {
                name: 'start',
                type: 'uint40',
                internalType: 'uint40',
              },
              {
                name: 'end',
                type: 'uint40',
                internalType: 'uint40',
              },
            ],
          },
          {
            name: 'cliffTime',
            type: 'uint40',
            internalType: 'uint40',
          },
          {
            name: 'unlockAmounts',
            type: 'tuple',
            internalType: 'struct LockupLinear.UnlockAmounts',
            components: [
              {
                name: 'start',
                type: 'uint128',
                internalType: 'uint128',
              },
              {
                name: 'cliff',
                type: 'uint128',
                internalType: 'uint128',
              },
            ],
          },
          {
            name: 'shape',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'streamIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
] as const

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
  const batch = streams.map((stream) => ({
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
    shape: '',
  }))

  return encodeFunctionData({
    abi: batchLockupCreateWithDurationsLLAbi,
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
  const batch = streams.map((stream) => ({
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
    shape: '',
  }))

  return encodeFunctionData({
    abi: batchLockupCreateWithTimestampsLLAbi,
    functionName: 'createWithTimestampsLL',
    args: [lockupLinearAddress, tokenAddress, batch],
  })
}
