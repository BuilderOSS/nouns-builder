export const tokenAbi = [
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
    type: 'function',
    name: 'DOMAIN_SEPARATOR',
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
    name: 'acceptOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      {
        name: '_to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'auction',
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
    name: 'balanceOf',
    inputs: [
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
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
    name: 'burn',
    inputs: [
      {
        name: '_tokenId',
        type: 'uint256',
        internalType: 'uint256',
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
    name: 'contractURI',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
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
    name: 'delegate',
    inputs: [
      {
        name: '_to',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'delegateBySig',
    inputs: [
      {
        name: '_from',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_deadline',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_v',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: '_r',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: '_s',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'delegates',
    inputs: [
      {
        name: '_account',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'getApproved',
    inputs: [
      {
        name: '_tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'getFounder',
    inputs: [
      {
        name: '_founderId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct TokenTypesV1.Founder',
        components: [
          {
            name: 'wallet',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'ownershipPct',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'vestExpiry',
            type: 'uint32',
            internalType: 'uint32',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getFounders',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct TokenTypesV1.Founder[]',
        components: [
          {
            name: 'wallet',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'ownershipPct',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'vestExpiry',
            type: 'uint32',
            internalType: 'uint32',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPastVotes',
    inputs: [
      {
        name: '_account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_timestamp',
        type: 'uint256',
        internalType: 'uint256',
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
    name: 'getScheduledRecipient',
    inputs: [
      {
        name: '_tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct TokenTypesV1.Founder',
        components: [
          {
            name: 'wallet',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'ownershipPct',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'vestExpiry',
            type: 'uint32',
            internalType: 'uint32',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVotes',
    inputs: [
      {
        name: '_account',
        type: 'address',
        internalType: 'address',
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
    name: 'initialize',
    inputs: [
      {
        name: '_founders',
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
        name: '_initStrings',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: '_reservedUntilTokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_metadataRenderer',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_auction',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_initialOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isApprovedForAll',
    inputs: [
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_operator',
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
    name: 'isMinter',
    inputs: [
      {
        name: '_minter',
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
    name: 'metadataRenderer',
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
    name: 'mint',
    inputs: [],
    outputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mintBatchTo',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'tokenIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mintFromReserveTo',
    inputs: [
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mintTo',
    inputs: [
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'minter',
    inputs: [
      {
        name: '',
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
    name: 'name',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nonce',
    inputs: [
      {
        name: '_account',
        type: 'address',
        internalType: 'address',
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
    name: 'onFirstAuctionStarted',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'ownerOf',
    inputs: [
      {
        name: '_tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'remainingTokensInReserve',
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
    name: 'reservedUntilTokenId',
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
    name: 'safeTransferFrom',
    inputs: [
      {
        name: '_from',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'safeTransferFrom',
    inputs: [
      {
        name: '_from',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_data',
        type: 'bytes',
        internalType: 'bytes',
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
    name: 'setApprovalForAll',
    inputs: [
      {
        name: '_operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_approved',
        type: 'bool',
        internalType: 'bool',
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
        name: 'newRenderer',
        type: 'address',
        internalType: 'contract IBaseMetadata',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setReservedUntilTokenId',
    inputs: [
      {
        name: 'newReservedUntilTokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [
      {
        name: '_interfaceId',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [
      {
        name: '_tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalFounderOwnership',
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
    name: 'totalFounders',
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
    name: 'totalSupply',
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
    name: 'transferFrom',
    inputs: [
      {
        name: '_from',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'updateFounders',
    inputs: [
      {
        name: 'newFounders',
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
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateMinters',
    inputs: [
      {
        name: '_minters',
        type: 'tuple[]',
        internalType: 'struct TokenTypesV2.MinterParams[]',
        components: [
          {
            name: 'minter',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'allowed',
            type: 'bool',
            internalType: 'bool',
          },
        ],
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
    name: 'Approval',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'approved',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ApprovalForAll',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'approved',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DelegateChanged',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DelegateVotesChanged',
    inputs: [
      {
        name: 'delegate',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'prevTotalVotes',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newTotalVotes',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FounderAllocationsCleared',
    inputs: [
      {
        name: 'newFounders',
        type: 'tuple[]',
        indexed: false,
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
    name: 'MintScheduled',
    inputs: [
      {
        name: 'baseTokenId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'founderId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'founder',
        type: 'tuple',
        indexed: false,
        internalType: 'struct TokenTypesV1.Founder',
        components: [
          {
            name: 'wallet',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'ownershipPct',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'vestExpiry',
            type: 'uint32',
            internalType: 'uint32',
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MintUnscheduled',
    inputs: [
      {
        name: 'baseTokenId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'founderId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'founder',
        type: 'tuple',
        indexed: false,
        internalType: 'struct TokenTypesV1.Founder',
        components: [
          {
            name: 'wallet',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'ownershipPct',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'vestExpiry',
            type: 'uint32',
            internalType: 'uint32',
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MinterUpdated',
    inputs: [
      {
        name: 'minter',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'allowed',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
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
    name: 'ReservedUntilTokenIDUpdated',
    inputs: [
      {
        name: 'reservedUntilTokenId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
        indexed: true,
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
    name: 'ALREADY_MINTED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CANNOT_CHANGE_RESERVE',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CANNOT_DECREASE_RESERVE',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DELEGATE_CALL_FAILED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EXPIRED_SIGNATURE',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INITIALIZING',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_APPROVAL',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_FOUNDER_OWNERSHIP',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_OWNER',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_RECIPIENT',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_SIGNATURE',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_TARGET',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_TIMESTAMP',
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
    name: 'NOT_MINTED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NO_METADATA_GENERATED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ONLY_AUCTION',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ONLY_AUCTION_OR_MINTER',
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
    name: 'REENTRANCY',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TOKEN_NOT_RESERVED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UNSUPPORTED_UUID',
    inputs: [],
  },
] as const
