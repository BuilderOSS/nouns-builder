export const managerAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_tokenImpl',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_metadataImpl',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_auctionImpl',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_treasuryImpl',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_governorImpl',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_builderRewardsRecipient',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'auctionImpl',
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
    name: 'builderRewardsRecipient',
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
    name: 'deploy',
    inputs: [
      {
        name: '_founderParams',
        type: 'tuple[]',
        internalType: 'struct IManager.FounderParams[]',
        components: [
          {
            name: 'wallet',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'ownershipPct',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'vestExpiry',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_tokenParams',
        type: 'tuple',
        internalType: 'struct IManager.TokenParams',
        components: [
          {
            name: 'initStrings',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'metadataRenderer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'reservedUntilTokenId',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_auctionParams',
        type: 'tuple',
        internalType: 'struct IManager.AuctionParams',
        components: [
          {
            name: 'reservePrice',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'duration',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'founderRewardRecipent',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'founderRewardBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
      {
        name: '_govParams',
        type: 'tuple',
        internalType: 'struct IManager.GovParams',
        components: [
          {
            name: 'timelockDelay',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'votingDelay',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'votingPeriod',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'proposalThresholdBps',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'quorumThresholdBps',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'vetoer',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'metadata',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'auction',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'treasury',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'governor',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAddresses',
    inputs: [
      {
        name: '_token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'metadata',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'auction',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'treasury',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'governor',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getDAOVersions',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct IManager.DAOVersionInfo',
        components: [
          {
            name: 'token',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'metadata',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'auction',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'treasury',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'governor',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLatestVersions',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct IManager.DAOVersionInfo',
        components: [
          {
            name: 'token',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'metadata',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'auction',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'treasury',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'governor',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'governorImpl',
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
    name: 'initialize',
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
    name: 'isRegisteredUpgrade',
    inputs: [
      {
        name: '_baseImpl',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_upgradeImpl',
        type: 'address',
        internalType: 'address',
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
    name: 'metadataImpl',
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
    name: 'registerUpgrade',
    inputs: [
      {
        name: '_baseImpl',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_upgradeImpl',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeUpgrade',
    inputs: [
      {
        name: '_baseImpl',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_upgradeImpl',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
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
    name: 'setMetadataRenderer',
    inputs: [
      {
        name: '_token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_newRendererImpl',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_setupRenderer',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'metadata',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'tokenImpl',
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
    name: 'treasuryImpl',
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
    name: 'DAODeployed',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'metadata',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'auction',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'treasury',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'governor',
        type: 'address',
        indexed: false,
        internalType: 'address',
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
    name: 'MetadataRendererUpdated',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'renderer',
        type: 'address',
        indexed: false,
        internalType: 'address',
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
    name: 'UpgradeRegistered',
    inputs: [
      {
        name: 'baseImpl',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'upgradeImpl',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'UpgradeRemoved',
    inputs: [
      {
        name: 'baseImpl',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'upgradeImpl',
        type: 'address',
        indexed: false,
        internalType: 'address',
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
    name: 'FOUNDER_REQUIRED',
    inputs: [],
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
    name: 'ONLY_TOKEN_OWNER',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ONLY_UUPS',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UNSUPPORTED_UUID',
    inputs: [],
  },
] as const
