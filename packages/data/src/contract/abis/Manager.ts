export const managerAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_tokenImpl',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_metadataImpl',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_auctionImpl',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_treasuryImpl',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_governorImpl',
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
    name: 'FOUNDER_REQUIRED',
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
    name: 'ONLY_UUPS',
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
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'metadata',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'auction',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'treasury',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'governor',
        type: 'address',
      },
    ],
    name: 'DAODeployed',
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
        internalType: 'address',
        name: 'baseImpl',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'upgradeImpl',
        type: 'address',
      },
    ],
    name: 'UpgradeRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'baseImpl',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'upgradeImpl',
        type: 'address',
      },
    ],
    name: 'UpgradeRemoved',
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
    inputs: [],
    name: 'auctionImpl',
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
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'wallet',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'ownershipPct',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'vestExpiry',
            type: 'uint256',
          },
        ],
        internalType: 'struct IManager.FounderParams[]',
        name: '_founderParams',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'bytes',
            name: 'initStrings',
            type: 'bytes',
          },
        ],
        internalType: 'struct IManager.TokenParams',
        name: '_tokenParams',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'reservePrice',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'duration',
            type: 'uint256',
          },
        ],
        internalType: 'struct IManager.AuctionParams',
        name: '_auctionParams',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'timelockDelay',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'votingDelay',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'votingPeriod',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'proposalThresholdBps',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'quorumThresholdBps',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'vetoer',
            type: 'address',
          },
        ],
        internalType: 'struct IManager.GovParams',
        name: '_govParams',
        type: 'tuple',
      },
    ],
    name: 'deploy',
    outputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'metadata',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'auction',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'treasury',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'governor',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    name: 'getAddresses',
    outputs: [
      {
        internalType: 'address',
        name: 'metadata',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'auction',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'treasury',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'governor',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'getDAOVersions',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'token',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'metadata',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'auction',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'treasury',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'governor',
            type: 'string',
          },
        ],
        internalType: 'struct IManager.DAOVersionInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getLatestVersions',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'token',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'metadata',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'auction',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'treasury',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'governor',
            type: 'string',
          },
        ],
        internalType: 'struct IManager.DAOVersionInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'governorImpl',
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
    inputs: [
      {
        internalType: 'address',
        name: '_newOwner',
        type: 'address',
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
        internalType: 'address',
        name: '_baseImpl',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_upgradeImpl',
        type: 'address',
      },
    ],
    name: 'isRegisteredUpgrade',
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
    inputs: [],
    name: 'metadataImpl',
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
        internalType: 'address',
        name: '_baseImpl',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_upgradeImpl',
        type: 'address',
      },
    ],
    name: 'registerUpgrade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_baseImpl',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_upgradeImpl',
        type: 'address',
      },
    ],
    name: 'removeUpgrade',
    outputs: [],
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
    inputs: [],
    name: 'tokenImpl',
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
    inputs: [],
    name: 'treasuryImpl',
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
] as const
