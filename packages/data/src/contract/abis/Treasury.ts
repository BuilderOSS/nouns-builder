export const treasuryAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_manager',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'ADDRESS_ZERO',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ALREADY_INITIALIZED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DELEGATE_CALL_FAILED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EXECUTION_EXPIRED',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'txIndex',
        type: 'uint256',
      },
    ],
    name: 'EXECUTION_FAILED',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'proposalId',
        type: 'bytes32',
      },
    ],
    name: 'EXECUTION_NOT_READY',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INITIALIZING',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_TARGET',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'impl',
        type: 'address',
      },
    ],
    name: 'INVALID_UPGRADE',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NOT_INITIALIZING',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_CALL',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_DELEGATECALL',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_MANAGER',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_OWNER',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_PENDING_OWNER',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_PROXY',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_TREASURY',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_UUPS',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PROPOSAL_ALREADY_QUEUED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PROPOSAL_NOT_QUEUED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UNSAFE_CAST',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UNSUPPORTED_UUID',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevDelay',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newDelay',
        type: 'uint256',
      },
    ],
    name: 'DelayUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevGracePeriod',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newGracePeriod',
        type: 'uint256',
      },
    ],
    name: 'GracePeriodUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'version',
        type: 'uint256',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'canceledOwner',
        type: 'address',
      },
    ],
    name: 'OwnerCanceled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'pendingOwner',
        type: 'address',
      },
    ],
    name: 'OwnerPending',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'prevOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'proposalId',
        type: 'bytes32',
      },
    ],
    name: 'TransactionCanceled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'proposalId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address[]',
        name: 'targets',
        type: 'address[]',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'values',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'bytes[]',
        name: 'payloads',
        type: 'bytes[]',
      },
    ],
    name: 'TransactionExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'proposalId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'TransactionScheduled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'impl',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
    ],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cancelOwnershipTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'contractVersion',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'delay',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_targets',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: '_values',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes[]',
        name: '_calldatas',
        type: 'bytes[]',
      },
      {
        internalType: 'bytes32',
        name: '_descriptionHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_proposer',
        type: 'address',
      },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'gracePeriod',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_targets',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: '_values',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes[]',
        name: '_calldatas',
        type: 'bytes[]',
      },
      {
        internalType: 'bytes32',
        name: '_descriptionHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_proposer',
        type: 'address',
      },
    ],
    name: 'hashProposal',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_governor',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_delay',
        type: 'uint256',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
    ],
    name: 'isExpired',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
    ],
    name: 'isQueued',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
    ],
    name: 'isReady',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC1155Received',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC721Received',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingOwner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
    ],
    name: 'queue',
    outputs: [
      {
        internalType: 'uint256',
        name: 'eta',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newOwner',
        type: 'address',
      },
    ],
    name: 'safeTransferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
    ],
    name: 'timestamp',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_newDelay',
        type: 'uint256',
      },
    ],
    name: 'updateDelay',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_newGracePeriod',
        type: 'uint256',
      },
    ],
    name: 'updateGracePeriod',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newImpl',
        type: 'address',
      },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newImpl',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const
