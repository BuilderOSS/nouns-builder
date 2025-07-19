export const treasuryAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_manager',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'receive',
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'acceptOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancel',
    inputs: [
      {
        name: '_proposalId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelOwnershipTransfer',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'contractVersion',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'delay',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'execute',
    inputs: [
      {
        name: '_targets',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: '_values',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '_calldatas',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
      {
        name: '_descriptionHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: '_proposer',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'gracePeriod',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hashProposal',
    inputs: [
      {
        name: '_targets',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: '_values',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '_calldatas',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
      {
        name: '_descriptionHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: '_proposer',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: '_governor',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_delay',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isExpired',
    inputs: [
      {
        name: '_proposalId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isQueued',
    inputs: [
      {
        name: '_proposalId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isReady',
    inputs: [
      {
        name: '_proposalId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'onERC1155BatchReceived',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'onERC1155Received',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'onERC721Received',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pendingOwner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'proxiableUUID',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'queue',
    inputs: [
      {
        name: '_proposalId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'eta',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'safeTransferOwnership',
    inputs: [
      {
        name: '_newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'timestamp',
    inputs: [
      {
        name: '_proposalId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: '_newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateDelay',
    inputs: [
      {
        name: '_newDelay',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateGracePeriod',
    inputs: [
      {
        name: '_newGracePeriod',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'upgradeTo',
    inputs: [
      {
        name: '_newImpl',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'upgradeToAndCall',
    inputs: [
      {
        name: '_newImpl',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_data',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'DelayUpdated',
    inputs: [
      {
        name: 'prevDelay',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newDelay',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'GracePeriodUpdated',
    inputs: [
      {
        name: 'prevGracePeriod',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newGracePeriod',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'version',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnerCanceled',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'canceledOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnerPending',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'pendingOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnerUpdated',
    inputs: [
      {
        name: 'prevOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TransactionCanceled',
    inputs: [
      {
        name: 'proposalId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TransactionExecuted',
    inputs: [
      {
        name: 'proposalId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'targets',
        type: 'address[]',
        indexed: false,
        internalType: 'address[]',
      },
      {
        name: 'values',
        type: 'uint256[]',
        indexed: false,
        internalType: 'uint256[]',
      },
      {
        name: 'payloads',
        type: 'bytes[]',
        indexed: false,
        internalType: 'bytes[]',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TransactionScheduled',
    inputs: [
      {
        name: 'proposalId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Upgraded',
    inputs: [
      {
        name: 'impl',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'ADDRESS_ZERO',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ALREADY_INITIALIZED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DELEGATE_CALL_FAILED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EXECUTION_EXPIRED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EXECUTION_FAILED',
    inputs: [
      {
        name: 'txIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'EXECUTION_NOT_READY',
    inputs: [
      {
        name: 'proposalId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'INITIALIZING',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_TARGET',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_UPGRADE',
    inputs: [
      {
        name: 'impl',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'NOT_INITIALIZING',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ONLY_CALL',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ONLY_DELEGATECALL',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ONLY_MANAGER',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ONLY_OWNER',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ONLY_PENDING_OWNER',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ONLY_PROXY',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ONLY_TREASURY',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ONLY_UUPS',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PROPOSAL_ALREADY_QUEUED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PROPOSAL_NOT_QUEUED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UNSAFE_CAST',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UNSUPPORTED_UUID',
    inputs: [],
  },
] as const
