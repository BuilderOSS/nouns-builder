import { CHAIN_ID } from '@buildeross/types'

// Chains where Sablier is NOT supported
export const UNSUPPORTED_SABLIER_CHAINS = [CHAIN_ID.ZORA, CHAIN_ID.ZORA_SEPOLIA]

// Check if a chain supports Sablier
export function isSablierSupported(chainId: CHAIN_ID): boolean {
  return !UNSUPPORTED_SABLIER_CHAINS.includes(chainId)
}

// Error message for unsupported chains
export const UNSUPPORTED_CHAIN_ERROR =
  'Sablier streams are not supported on this network. Please switch to a supported chain.'

// Sablier LockupLinear contract ABI for reading stream data
export const lockupLinearAbi = [
  {
    type: 'function',
    name: 'getStream',
    inputs: [{ name: 'streamId', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      {
        name: 'stream',
        type: 'tuple',
        internalType: 'struct LockupLinear.StreamLL',
        components: [
          { name: 'sender', type: 'address', internalType: 'address' },
          { name: 'startTime', type: 'uint40', internalType: 'uint40' },
          { name: 'cliffTime', type: 'uint40', internalType: 'uint40' },
          { name: 'endTime', type: 'uint40', internalType: 'uint40' },
          { name: 'isCancelable', type: 'bool', internalType: 'bool' },
          { name: 'wasCanceled', type: 'bool', internalType: 'bool' },
          { name: 'asset', type: 'address', internalType: 'contract IERC20' },
          { name: 'isTransferable', type: 'bool', internalType: 'bool' },
          { name: 'isDepleted', type: 'bool', internalType: 'bool' },
          { name: 'isStream', type: 'bool', internalType: 'bool' },
          { name: 'recipient', type: 'address', internalType: 'address' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'withdrawableAmountOf',
    inputs: [{ name: 'streamId', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'uint128', internalType: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [
      { name: 'streamId', type: 'uint256', internalType: 'uint256' },
      { name: 'to', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint128', internalType: 'uint128' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancel',
    inputs: [{ name: 'streamId', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'statusOf',
    inputs: [{ name: 'streamId', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'uint8',
        internalType: 'enum Lockup.Status',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getDepositedAmount',
    inputs: [{ name: 'streamId', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'uint128', internalType: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWithdrawnAmount',
    inputs: [{ name: 'streamId', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'uint128', internalType: 'uint128' }],
    stateMutability: 'view',
  },
] as const

// Event ABI for CreateLockupLinearStream
export const createLockupLinearStreamEventAbi = [
  {
    type: 'event',
    name: 'CreateLockupLinearStream',
    inputs: [
      {
        name: 'streamId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'funder',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'recipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amounts',
        type: 'tuple',
        indexed: false,
        internalType: 'struct Lockup.CreateAmounts',
        components: [
          { name: 'deposit', type: 'uint128', internalType: 'uint128' },
          { name: 'brokerFee', type: 'uint128', internalType: 'uint128' },
        ],
      },
      {
        name: 'asset',
        type: 'address',
        indexed: false,
        internalType: 'contract IERC20',
      },
      {
        name: 'cancelable',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'transferable',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'timestamps',
        type: 'tuple',
        indexed: false,
        internalType: 'struct LockupLinear.Timestamps',
        components: [
          { name: 'start', type: 'uint40', internalType: 'uint40' },
          { name: 'cliff', type: 'uint40', internalType: 'uint40' },
          { name: 'end', type: 'uint40', internalType: 'uint40' },
        ],
      },
      {
        name: 'unlockAmounts',
        type: 'tuple',
        indexed: false,
        internalType: 'struct LockupLinear.UnlockAmounts',
        components: [
          { name: 'start', type: 'uint128', internalType: 'uint128' },
          { name: 'cliff', type: 'uint128', internalType: 'uint128' },
        ],
      },
      {
        name: 'shape',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
] as const

// Stream status enum
export enum StreamStatus {
  PENDING = 0,
  STREAMING = 1,
  SETTLED = 2,
  CANCELED = 3,
  DEPLETED = 4,
}
