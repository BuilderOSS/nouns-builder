export const auctionAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_manager',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_rewardsManager',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_weth',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: '_builderRewardsBPS',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: '_referralRewardsBPS',
        type: 'uint16',
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
    name: 'AUCTION_ACTIVE',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AUCTION_CREATE_FAILED_TO_LAUNCH',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AUCTION_NOT_STARTED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AUCTION_OVER',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AUCTION_SETTLED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CANNOT_CREATE_AUCTION',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DELEGATE_CALL_FAILED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FAILING_WETH_TRANSFER',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INITIALIZING',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INSOLVENT',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_REWARDS_BPS',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_REWARDS_RECIPIENT',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_REWARD_TOTAL',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_TARGET',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_TOKEN_ID',
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
    name: 'MINIMUM_BID_NOT_MET',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MIN_BID_INCREMENT_1_PERCENT',
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
    name: 'ONLY_UUPS',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PAUSED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'REENTRANCY',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RESERVE_PRICE_NOT_MET',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UNPAUSED',
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
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'bidder',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'extended',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
    ],
    name: 'AuctionBid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'startTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
    ],
    name: 'AuctionCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'winner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'AuctionSettled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'DurationUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address',
          },
          {
            internalType: 'uint16',
            name: 'percentBps',
            type: 'uint16',
          },
        ],
        indexed: false,
        internalType: 'struct AuctionTypesV2.FounderReward',
        name: 'reward',
        type: 'tuple',
      },
    ],
    name: 'FounderRewardUpdated',
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
        indexed: false,
        internalType: 'uint256',
        name: 'minBidIncrementPercentage',
        type: 'uint256',
      },
    ],
    name: 'MinBidIncrementPercentageUpdated',
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
        name: 'user',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reservePrice',
        type: 'uint256',
      },
    ],
    name: 'ReservePriceUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timeBuffer',
        type: 'uint256',
      },
    ],
    name: 'TimeBufferUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'Unpaused',
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
    name: 'auction',
    outputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'highestBid',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'highestBidder',
        type: 'address',
      },
      {
        internalType: 'uint40',
        name: 'startTime',
        type: 'uint40',
      },
      {
        internalType: 'uint40',
        name: 'endTime',
        type: 'uint40',
      },
      {
        internalType: 'bool',
        name: 'settled',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'builderRewardsBPS',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
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
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'createBid',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_referral',
        type: 'address',
      },
    ],
    name: 'createBidWithReferral',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentBidReferral',
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
    name: 'duration',
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
    inputs: [],
    name: 'founderReward',
    outputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: 'percentBps',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_founder',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_treasury',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_reservePrice',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_founderRewardRecipient',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: '_founderRewardBps',
        type: 'uint16',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minBidIncrement',
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
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
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
    inputs: [],
    name: 'referralRewardsBPS',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'reservePrice',
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
    name: 'safeTransferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
    ],
    name: 'setDuration',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address',
          },
          {
            internalType: 'uint16',
            name: 'percentBps',
            type: 'uint16',
          },
        ],
        internalType: 'struct AuctionTypesV2.FounderReward',
        name: 'reward',
        type: 'tuple',
      },
    ],
    name: 'setFounderReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_percentage',
        type: 'uint256',
      },
    ],
    name: 'setMinimumBidIncrement',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_reservePrice',
        type: 'uint256',
      },
    ],
    name: 'setReservePrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_timeBuffer',
        type: 'uint256',
      },
    ],
    name: 'setTimeBuffer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'settleAuction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'settleCurrentAndCreateNewAuction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'timeBuffer',
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
    inputs: [],
    name: 'token',
    outputs: [
      {
        internalType: 'contract Token',
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
    name: 'treasury',
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
    name: 'unpause',
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
] as const
