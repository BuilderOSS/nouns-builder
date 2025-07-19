export const auctionAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_manager',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_rewardsManager',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_weth',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_builderRewardsBPS',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '_referralRewardsBPS',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'REWARDS_REASON',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
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
    name: 'auction',
    inputs: [],
    outputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'highestBid',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'highestBidder',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'startTime',
        type: 'uint40',
        internalType: 'uint40',
      },
      {
        name: 'endTime',
        type: 'uint40',
        internalType: 'uint40',
      },
      {
        name: 'settled',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'builderRewardsBPS',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
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
    name: 'createBid',
    inputs: [
      {
        name: '_tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createBidWithReferral',
    inputs: [
      {
        name: '_tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_referral',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'currentBidReferral',
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
    name: 'duration',
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
    name: 'founderReward',
    inputs: [],
    outputs: [
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'percentBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: '_token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_founder',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_treasury',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_duration',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_reservePrice',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_founderRewardRecipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_founderRewardBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'minBidIncrement',
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
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'paused',
    inputs: [],
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
    name: 'referralRewardsBPS',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'reservePrice',
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
    name: 'setDuration',
    inputs: [
      {
        name: '_duration',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setFounderReward',
    inputs: [
      {
        name: 'reward',
        type: 'tuple',
        internalType: 'struct AuctionTypesV2.FounderReward',
        components: [
          {
            name: 'recipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'percentBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMinimumBidIncrement',
    inputs: [
      {
        name: '_percentage',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setReservePrice',
    inputs: [
      {
        name: '_reservePrice',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTimeBuffer',
    inputs: [
      {
        name: '_timeBuffer',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'settleAuction',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'settleCurrentAndCreateNewAuction',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'timeBuffer',
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
    name: 'token',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract Token',
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
    name: 'treasury',
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
    name: 'unpause',
    inputs: [],
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
    name: 'AuctionBid',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'bidder',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'extended',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'endTime',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AuctionCreated',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'startTime',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'endTime',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AuctionSettled',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'winner',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DurationUpdated',
    inputs: [
      {
        name: 'duration',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FounderRewardUpdated',
    inputs: [
      {
        name: 'reward',
        type: 'tuple',
        indexed: false,
        internalType: 'struct AuctionTypesV2.FounderReward',
        components: [
          {
            name: 'recipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'percentBps',
            type: 'uint16',
            internalType: 'uint16',
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
    name: 'MinBidIncrementPercentageUpdated',
    inputs: [
      {
        name: 'minBidIncrementPercentage',
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
    name: 'Paused',
    inputs: [
      {
        name: 'user',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ReservePriceUpdated',
    inputs: [
      {
        name: 'reservePrice',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TimeBufferUpdated',
    inputs: [
      {
        name: 'timeBuffer',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Unpaused',
    inputs: [
      {
        name: 'user',
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
    name: 'AUCTION_ACTIVE',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AUCTION_CREATE_FAILED_TO_LAUNCH',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AUCTION_NOT_STARTED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AUCTION_OVER',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AUCTION_SETTLED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CANNOT_CREATE_AUCTION',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DELEGATE_CALL_FAILED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FAILING_WETH_TRANSFER',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INITIALIZING',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INSOLVENT',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_REWARDS_BPS',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_REWARDS_RECIPIENT',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_REWARD_TOTAL',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_TARGET',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_TOKEN_ID',
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
    name: 'MINIMUM_BID_NOT_MET',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MIN_BID_INCREMENT_1_PERCENT',
    inputs: [],
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
    name: 'ONLY_UUPS',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PAUSED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'REENTRANCY',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RESERVE_PRICE_NOT_MET',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UNPAUSED',
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
