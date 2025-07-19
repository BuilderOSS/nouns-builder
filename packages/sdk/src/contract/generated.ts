import {
  createReadContract,
  createSimulateContract,
  createWatchContractEvent,
  createWriteContract,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Auction
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const auctionAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_manager', internalType: 'address', type: 'address' },
      { name: '_rewardsManager', internalType: 'address', type: 'address' },
      { name: '_weth', internalType: 'address', type: 'address' },
      { name: '_builderRewardsBPS', internalType: 'uint16', type: 'uint16' },
      { name: '_referralRewardsBPS', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REWARDS_REASON',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'auction',
    outputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'highestBid', internalType: 'uint256', type: 'uint256' },
      { name: 'highestBidder', internalType: 'address', type: 'address' },
      { name: 'startTime', internalType: 'uint40', type: 'uint40' },
      { name: 'endTime', internalType: 'uint40', type: 'uint40' },
      { name: 'settled', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'builderRewardsBPS',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancelOwnershipTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractVersion',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'createBid',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_referral', internalType: 'address', type: 'address' },
    ],
    name: 'createBidWithReferral',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currentBidReferral',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'duration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'founderReward',
    outputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'percentBps', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_founder', internalType: 'address', type: 'address' },
      { name: '_treasury', internalType: 'address', type: 'address' },
      { name: '_duration', internalType: 'uint256', type: 'uint256' },
      { name: '_reservePrice', internalType: 'uint256', type: 'uint256' },
      { name: '_founderRewardRecipient', internalType: 'address', type: 'address' },
      { name: '_founderRewardBps', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minBidIncrement',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'referralRewardsBPS',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'reservePrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'safeTransferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_duration', internalType: 'uint256', type: 'uint256' }],
    name: 'setDuration',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'reward',
        internalType: 'struct AuctionTypesV2.FounderReward',
        type: 'tuple',
        components: [
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'percentBps', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    name: 'setFounderReward',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_percentage', internalType: 'uint256', type: 'uint256' }],
    name: 'setMinimumBidIncrement',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_reservePrice', internalType: 'uint256', type: 'uint256' }],
    name: 'setReservePrice',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_timeBuffer', internalType: 'uint256', type: 'uint256' }],
    name: 'setTimeBuffer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'settleAuction',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'settleCurrentAndCreateNewAuction',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'timeBuffer',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'contract Token', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newImpl', internalType: 'address', type: 'address' }],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newImpl', internalType: 'address', type: 'address' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'bidder', internalType: 'address', type: 'address', indexed: false },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'extended', internalType: 'bool', type: 'bool', indexed: false },
      { name: 'endTime', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'AuctionBid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'startTime', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'endTime', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'AuctionCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'winner', internalType: 'address', type: 'address', indexed: false },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'AuctionSettled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'duration', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'DurationUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reward',
        internalType: 'struct AuctionTypesV2.FounderReward',
        type: 'tuple',
        components: [
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'percentBps', internalType: 'uint16', type: 'uint16' },
        ],
        indexed: false,
      },
    ],
    name: 'FounderRewardUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'minBidIncrementPercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MinBidIncrementPercentageUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'canceledOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'pendingOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerPending',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'user', internalType: 'address', type: 'address', indexed: false }],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'reservePrice', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ReservePriceUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'timeBuffer', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'TimeBufferUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'user', internalType: 'address', type: 'address', indexed: false }],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'impl', internalType: 'address', type: 'address', indexed: false }],
    name: 'Upgraded',
  },
  { type: 'error', inputs: [], name: 'ADDRESS_ZERO' },
  { type: 'error', inputs: [], name: 'ALREADY_INITIALIZED' },
  { type: 'error', inputs: [], name: 'AUCTION_ACTIVE' },
  { type: 'error', inputs: [], name: 'AUCTION_CREATE_FAILED_TO_LAUNCH' },
  { type: 'error', inputs: [], name: 'AUCTION_NOT_STARTED' },
  { type: 'error', inputs: [], name: 'AUCTION_OVER' },
  { type: 'error', inputs: [], name: 'AUCTION_SETTLED' },
  { type: 'error', inputs: [], name: 'CANNOT_CREATE_AUCTION' },
  { type: 'error', inputs: [], name: 'DELEGATE_CALL_FAILED' },
  { type: 'error', inputs: [], name: 'FAILING_WETH_TRANSFER' },
  { type: 'error', inputs: [], name: 'INITIALIZING' },
  { type: 'error', inputs: [], name: 'INSOLVENT' },
  { type: 'error', inputs: [], name: 'INVALID_REWARDS_BPS' },
  { type: 'error', inputs: [], name: 'INVALID_REWARDS_RECIPIENT' },
  { type: 'error', inputs: [], name: 'INVALID_REWARD_TOTAL' },
  { type: 'error', inputs: [], name: 'INVALID_TARGET' },
  { type: 'error', inputs: [], name: 'INVALID_TOKEN_ID' },
  {
    type: 'error',
    inputs: [{ name: 'impl', internalType: 'address', type: 'address' }],
    name: 'INVALID_UPGRADE',
  },
  { type: 'error', inputs: [], name: 'MINIMUM_BID_NOT_MET' },
  { type: 'error', inputs: [], name: 'MIN_BID_INCREMENT_1_PERCENT' },
  { type: 'error', inputs: [], name: 'NOT_INITIALIZING' },
  { type: 'error', inputs: [], name: 'ONLY_CALL' },
  { type: 'error', inputs: [], name: 'ONLY_DELEGATECALL' },
  { type: 'error', inputs: [], name: 'ONLY_MANAGER' },
  { type: 'error', inputs: [], name: 'ONLY_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PENDING_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PROXY' },
  { type: 'error', inputs: [], name: 'ONLY_UUPS' },
  { type: 'error', inputs: [], name: 'PAUSED' },
  { type: 'error', inputs: [], name: 'REENTRANCY' },
  { type: 'error', inputs: [], name: 'RESERVE_PRICE_NOT_MET' },
  { type: 'error', inputs: [], name: 'UNPAUSED' },
  { type: 'error', inputs: [], name: 'UNSAFE_CAST' },
  { type: 'error', inputs: [], name: 'UNSUPPORTED_UUID' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC1155
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc1155Abi = [
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256' }],
    name: 'uri',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721Abi = [
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Governor
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const governorAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_manager', internalType: 'address', type: 'address' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_DELAYED_GOVERNANCE_EXPIRATION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_PROPOSAL_THRESHOLD_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_QUORUM_THRESHOLD_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_VOTING_DELAY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_VOTING_PERIOD',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_PROPOSAL_THRESHOLD_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_QUORUM_THRESHOLD_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_VOTING_DELAY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_VOTING_PERIOD',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VOTE_TYPEHASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'burnVetoer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancelOwnershipTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_proposalId', internalType: 'bytes32', type: 'bytes32' },
      { name: '_support', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'castVote',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_voter', internalType: 'address', type: 'address' },
      { name: '_proposalId', internalType: 'bytes32', type: 'bytes32' },
      { name: '_support', internalType: 'uint256', type: 'uint256' },
      { name: '_deadline', internalType: 'uint256', type: 'uint256' },
      { name: '_v', internalType: 'uint8', type: 'uint8' },
      { name: '_r', internalType: 'bytes32', type: 'bytes32' },
      { name: '_s', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'castVoteBySig',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_proposalId', internalType: 'bytes32', type: 'bytes32' },
      { name: '_support', internalType: 'uint256', type: 'uint256' },
      { name: '_reason', internalType: 'string', type: 'string' },
    ],
    name: 'castVoteWithReason',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractVersion',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'delayedGovernanceExpirationTimestamp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_targets', internalType: 'address[]', type: 'address[]' },
      { name: '_values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: '_descriptionHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_proposer', internalType: 'address', type: 'address' },
    ],
    name: 'execute',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getProposal',
    outputs: [
      {
        name: '',
        internalType: 'struct GovernorTypesV1.Proposal',
        type: 'tuple',
        components: [
          { name: 'proposer', internalType: 'address', type: 'address' },
          { name: 'timeCreated', internalType: 'uint32', type: 'uint32' },
          { name: 'againstVotes', internalType: 'uint32', type: 'uint32' },
          { name: 'forVotes', internalType: 'uint32', type: 'uint32' },
          { name: 'abstainVotes', internalType: 'uint32', type: 'uint32' },
          { name: 'voteStart', internalType: 'uint32', type: 'uint32' },
          { name: 'voteEnd', internalType: 'uint32', type: 'uint32' },
          { name: 'proposalThreshold', internalType: 'uint32', type: 'uint32' },
          { name: 'quorumVotes', internalType: 'uint32', type: 'uint32' },
          { name: 'executed', internalType: 'bool', type: 'bool' },
          { name: 'canceled', internalType: 'bool', type: 'bool' },
          { name: 'vetoed', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_account', internalType: 'address', type: 'address' },
      { name: '_timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_targets', internalType: 'address[]', type: 'address[]' },
      { name: '_values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: '_descriptionHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_proposer', internalType: 'address', type: 'address' },
    ],
    name: 'hashProposal',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '_treasury', internalType: 'address', type: 'address' },
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_vetoer', internalType: 'address', type: 'address' },
      { name: '_votingDelay', internalType: 'uint256', type: 'uint256' },
      { name: '_votingPeriod', internalType: 'uint256', type: 'uint256' },
      { name: '_proposalThresholdBps', internalType: 'uint256', type: 'uint256' },
      { name: '_quorumThresholdBps', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'nonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'proposalDeadline',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'proposalEta',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'proposalSnapshot',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proposalThreshold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proposalThresholdBps',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'proposalVotes',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_targets', internalType: 'address[]', type: 'address[]' },
      { name: '_values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: '_description', internalType: 'string', type: 'string' },
    ],
    name: 'propose',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'queue',
    outputs: [{ name: 'eta', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'quorum',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'quorumThresholdBps',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'safeTransferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'state',
    outputs: [
      { name: '', internalType: 'enum GovernorTypesV1.ProposalState', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newDelayedTimestamp', internalType: 'uint256', type: 'uint256' }],
    name: 'updateDelayedGovernanceExpirationTimestamp',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newProposalThresholdBps', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateProposalThresholdBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newQuorumVotesBps', internalType: 'uint256', type: 'uint256' }],
    name: 'updateQuorumThresholdBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newVetoer', internalType: 'address', type: 'address' }],
    name: 'updateVetoer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newVotingDelay', internalType: 'uint256', type: 'uint256' }],
    name: 'updateVotingDelay',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newVotingPeriod', internalType: 'uint256', type: 'uint256' }],
    name: 'updateVotingPeriod',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newImpl', internalType: 'address', type: 'address' }],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newImpl', internalType: 'address', type: 'address' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'veto',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'vetoer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'votingDelay',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'votingPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevTimestamp', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newTimestamp', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'DelayedGovernanceExpirationTimestampUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'canceledOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'pendingOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerPending',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'proposalId', internalType: 'bytes32', type: 'bytes32', indexed: false },
    ],
    name: 'ProposalCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'proposalId', internalType: 'bytes32', type: 'bytes32', indexed: false },
      { name: 'targets', internalType: 'address[]', type: 'address[]', indexed: false },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]', indexed: false },
      { name: 'description', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'descriptionHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'proposal',
        internalType: 'struct GovernorTypesV1.Proposal',
        type: 'tuple',
        components: [
          { name: 'proposer', internalType: 'address', type: 'address' },
          { name: 'timeCreated', internalType: 'uint32', type: 'uint32' },
          { name: 'againstVotes', internalType: 'uint32', type: 'uint32' },
          { name: 'forVotes', internalType: 'uint32', type: 'uint32' },
          { name: 'abstainVotes', internalType: 'uint32', type: 'uint32' },
          { name: 'voteStart', internalType: 'uint32', type: 'uint32' },
          { name: 'voteEnd', internalType: 'uint32', type: 'uint32' },
          { name: 'proposalThreshold', internalType: 'uint32', type: 'uint32' },
          { name: 'quorumVotes', internalType: 'uint32', type: 'uint32' },
          { name: 'executed', internalType: 'bool', type: 'bool' },
          { name: 'canceled', internalType: 'bool', type: 'bool' },
          { name: 'vetoed', internalType: 'bool', type: 'bool' },
        ],
        indexed: false,
      },
    ],
    name: 'ProposalCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'proposalId', internalType: 'bytes32', type: 'bytes32', indexed: false },
    ],
    name: 'ProposalExecuted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'proposalId', internalType: 'bytes32', type: 'bytes32', indexed: false },
      { name: 'eta', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ProposalQueued',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevBps', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newBps', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ProposalThresholdBpsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'proposalId', internalType: 'bytes32', type: 'bytes32', indexed: false },
    ],
    name: 'ProposalVetoed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevBps', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newBps', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'QuorumVotesBpsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'impl', internalType: 'address', type: 'address', indexed: false }],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevVetoer', internalType: 'address', type: 'address', indexed: false },
      { name: 'newVetoer', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'VetoerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'voter', internalType: 'address', type: 'address', indexed: false },
      { name: 'proposalId', internalType: 'bytes32', type: 'bytes32', indexed: false },
      { name: 'support', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'weight', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'VoteCast',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'prevVotingDelay',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newVotingDelay',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'VotingDelayUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'prevVotingPeriod',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newVotingPeriod',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'VotingPeriodUpdated',
  },
  { type: 'error', inputs: [], name: 'ADDRESS_ZERO' },
  { type: 'error', inputs: [], name: 'ALREADY_INITIALIZED' },
  { type: 'error', inputs: [], name: 'ALREADY_VOTED' },
  { type: 'error', inputs: [], name: 'BELOW_PROPOSAL_THRESHOLD' },
  { type: 'error', inputs: [], name: 'CANNOT_DELAY_GOVERNANCE' },
  { type: 'error', inputs: [], name: 'DELEGATE_CALL_FAILED' },
  { type: 'error', inputs: [], name: 'EXPIRED_SIGNATURE' },
  { type: 'error', inputs: [], name: 'INITIALIZING' },
  { type: 'error', inputs: [], name: 'INVALID_CANCEL' },
  { type: 'error', inputs: [], name: 'INVALID_DELAYED_GOVERNANCE_EXPIRATION' },
  { type: 'error', inputs: [], name: 'INVALID_PROPOSAL_THRESHOLD_BPS' },
  { type: 'error', inputs: [], name: 'INVALID_QUORUM_THRESHOLD_BPS' },
  { type: 'error', inputs: [], name: 'INVALID_SIGNATURE' },
  { type: 'error', inputs: [], name: 'INVALID_TARGET' },
  {
    type: 'error',
    inputs: [{ name: 'impl', internalType: 'address', type: 'address' }],
    name: 'INVALID_UPGRADE',
  },
  { type: 'error', inputs: [], name: 'INVALID_VOTE' },
  { type: 'error', inputs: [], name: 'INVALID_VOTING_DELAY' },
  { type: 'error', inputs: [], name: 'INVALID_VOTING_PERIOD' },
  { type: 'error', inputs: [], name: 'NOT_INITIALIZING' },
  { type: 'error', inputs: [], name: 'ONLY_CALL' },
  { type: 'error', inputs: [], name: 'ONLY_DELEGATECALL' },
  { type: 'error', inputs: [], name: 'ONLY_MANAGER' },
  { type: 'error', inputs: [], name: 'ONLY_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PENDING_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PROXY' },
  { type: 'error', inputs: [], name: 'ONLY_TOKEN_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_UUPS' },
  { type: 'error', inputs: [], name: 'ONLY_VETOER' },
  { type: 'error', inputs: [], name: 'PROPOSAL_ALREADY_EXECUTED' },
  { type: 'error', inputs: [], name: 'PROPOSAL_DOES_NOT_EXIST' },
  {
    type: 'error',
    inputs: [{ name: 'proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PROPOSAL_EXISTS',
  },
  { type: 'error', inputs: [], name: 'PROPOSAL_LENGTH_MISMATCH' },
  {
    type: 'error',
    inputs: [{ name: 'proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PROPOSAL_NOT_QUEUED',
  },
  { type: 'error', inputs: [], name: 'PROPOSAL_TARGET_MISSING' },
  { type: 'error', inputs: [], name: 'PROPOSAL_UNSUCCESSFUL' },
  { type: 'error', inputs: [], name: 'UNSAFE_CAST' },
  { type: 'error', inputs: [], name: 'UNSUPPORTED_UUID' },
  { type: 'error', inputs: [], name: 'VOTING_NOT_STARTED' },
  { type: 'error', inputs: [], name: 'WAITING_FOR_TOKENS_TO_CLAIM_OR_EXPIRATION' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// L2MigrationDeployer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const l2MigrationDeployerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_manager', internalType: 'address', type: 'address' },
      { name: '_merkleMinter', internalType: 'address', type: 'address' },
      { name: '_crossDomainMessenger', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'DAO_ALREADY_DEPLOYED' },
  { type: 'error', inputs: [], name: 'METADATA_CALLS_NOT_EXECUTED' },
  { type: 'error', inputs: [], name: 'METADATA_CALL_FAILED' },
  { type: 'error', inputs: [], name: 'NOT_CROSS_DOMAIN_MESSENGER' },
  { type: 'error', inputs: [], name: 'NO_DAO_DEPLOYED' },
  { type: 'error', inputs: [], name: 'TRANSFER_FAILED' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'token', internalType: 'address', type: 'address', indexed: true },
      { name: 'deployer', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'DeployerSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'token', internalType: 'address', type: 'address', indexed: true },
      { name: 'deployer', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipRenounced',
  },
  {
    type: 'function',
    inputs: [{ name: 'l1Address', internalType: 'address', type: 'address' }],
    name: 'applyL1ToL2Alias',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '_data', internalType: 'bytes', type: 'bytes' }],
    name: 'callMetadataRenderer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'crossDomainDeployerToMigration',
    outputs: [
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'minimumMetadataCalls', internalType: 'uint256', type: 'uint256' },
      { name: 'executedMetadataCalls', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'crossDomainMessenger',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_founderParams',
        internalType: 'struct IManager.FounderParams[]',
        type: 'tuple[]',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint256', type: 'uint256' },
          { name: 'vestExpiry', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: '_tokenParams',
        internalType: 'struct IManager.TokenParams',
        type: 'tuple',
        components: [
          { name: 'initStrings', internalType: 'bytes', type: 'bytes' },
          { name: 'metadataRenderer', internalType: 'address', type: 'address' },
          { name: 'reservedUntilTokenId', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: '_auctionParams',
        internalType: 'struct IManager.AuctionParams',
        type: 'tuple',
        components: [
          { name: 'reservePrice', internalType: 'uint256', type: 'uint256' },
          { name: 'duration', internalType: 'uint256', type: 'uint256' },
          { name: 'founderRewardRecipent', internalType: 'address', type: 'address' },
          { name: 'founderRewardBps', internalType: 'uint16', type: 'uint16' },
        ],
      },
      {
        name: '_govParams',
        internalType: 'struct IManager.GovParams',
        type: 'tuple',
        components: [
          { name: 'timelockDelay', internalType: 'uint256', type: 'uint256' },
          { name: 'votingDelay', internalType: 'uint256', type: 'uint256' },
          { name: 'votingPeriod', internalType: 'uint256', type: 'uint256' },
          { name: 'proposalThresholdBps', internalType: 'uint256', type: 'uint256' },
          { name: 'quorumThresholdBps', internalType: 'uint256', type: 'uint256' },
          { name: 'vetoer', internalType: 'address', type: 'address' },
        ],
      },
      {
        name: '_minterParams',
        internalType: 'struct MerkleReserveMinter.MerkleMinterSettings',
        type: 'tuple',
        components: [
          { name: 'mintStart', internalType: 'uint64', type: 'uint64' },
          { name: 'mintEnd', internalType: 'uint64', type: 'uint64' },
          { name: 'pricePerToken', internalType: 'uint64', type: 'uint64' },
          { name: 'merkleRoot', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      { name: '_delayedGovernanceAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_minimumMetadataCalls', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'deploy',
    outputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'depositToTreasury',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'manager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'merkleMinter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'resetDeployment',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Manager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const managerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_tokenImpl', internalType: 'address', type: 'address' },
      { name: '_metadataImpl', internalType: 'address', type: 'address' },
      { name: '_auctionImpl', internalType: 'address', type: 'address' },
      { name: '_treasuryImpl', internalType: 'address', type: 'address' },
      { name: '_governorImpl', internalType: 'address', type: 'address' },
      { name: '_builderRewardsRecipient', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'auctionImpl',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'builderRewardsRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancelOwnershipTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractVersion',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_founderParams',
        internalType: 'struct IManager.FounderParams[]',
        type: 'tuple[]',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint256', type: 'uint256' },
          { name: 'vestExpiry', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: '_tokenParams',
        internalType: 'struct IManager.TokenParams',
        type: 'tuple',
        components: [
          { name: 'initStrings', internalType: 'bytes', type: 'bytes' },
          { name: 'metadataRenderer', internalType: 'address', type: 'address' },
          { name: 'reservedUntilTokenId', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: '_auctionParams',
        internalType: 'struct IManager.AuctionParams',
        type: 'tuple',
        components: [
          { name: 'reservePrice', internalType: 'uint256', type: 'uint256' },
          { name: 'duration', internalType: 'uint256', type: 'uint256' },
          { name: 'founderRewardRecipent', internalType: 'address', type: 'address' },
          { name: 'founderRewardBps', internalType: 'uint16', type: 'uint16' },
        ],
      },
      {
        name: '_govParams',
        internalType: 'struct IManager.GovParams',
        type: 'tuple',
        components: [
          { name: 'timelockDelay', internalType: 'uint256', type: 'uint256' },
          { name: 'votingDelay', internalType: 'uint256', type: 'uint256' },
          { name: 'votingPeriod', internalType: 'uint256', type: 'uint256' },
          { name: 'proposalThresholdBps', internalType: 'uint256', type: 'uint256' },
          { name: 'quorumThresholdBps', internalType: 'uint256', type: 'uint256' },
          { name: 'vetoer', internalType: 'address', type: 'address' },
        ],
      },
    ],
    name: 'deploy',
    outputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'metadata', internalType: 'address', type: 'address' },
      { name: 'auction', internalType: 'address', type: 'address' },
      { name: 'treasury', internalType: 'address', type: 'address' },
      { name: 'governor', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_token', internalType: 'address', type: 'address' }],
    name: 'getAddresses',
    outputs: [
      { name: 'metadata', internalType: 'address', type: 'address' },
      { name: 'auction', internalType: 'address', type: 'address' },
      { name: 'treasury', internalType: 'address', type: 'address' },
      { name: 'governor', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'getDAOVersions',
    outputs: [
      {
        name: '',
        internalType: 'struct IManager.DAOVersionInfo',
        type: 'tuple',
        components: [
          { name: 'token', internalType: 'string', type: 'string' },
          { name: 'metadata', internalType: 'string', type: 'string' },
          { name: 'auction', internalType: 'string', type: 'string' },
          { name: 'treasury', internalType: 'string', type: 'string' },
          { name: 'governor', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getLatestVersions',
    outputs: [
      {
        name: '',
        internalType: 'struct IManager.DAOVersionInfo',
        type: 'tuple',
        components: [
          { name: 'token', internalType: 'string', type: 'string' },
          { name: 'metadata', internalType: 'string', type: 'string' },
          { name: 'auction', internalType: 'string', type: 'string' },
          { name: 'treasury', internalType: 'string', type: 'string' },
          { name: 'governor', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'governorImpl',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_baseImpl', internalType: 'address', type: 'address' },
      { name: '_upgradeImpl', internalType: 'address', type: 'address' },
    ],
    name: 'isRegisteredUpgrade',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'metadataImpl',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_baseImpl', internalType: 'address', type: 'address' },
      { name: '_upgradeImpl', internalType: 'address', type: 'address' },
    ],
    name: 'registerUpgrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_baseImpl', internalType: 'address', type: 'address' },
      { name: '_upgradeImpl', internalType: 'address', type: 'address' },
    ],
    name: 'removeUpgrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'safeTransferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_newRendererImpl', internalType: 'address', type: 'address' },
      { name: '_setupRenderer', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setMetadataRenderer',
    outputs: [{ name: 'metadata', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tokenImpl',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasuryImpl',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newImpl', internalType: 'address', type: 'address' }],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newImpl', internalType: 'address', type: 'address' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'token', internalType: 'address', type: 'address', indexed: false },
      { name: 'metadata', internalType: 'address', type: 'address', indexed: false },
      { name: 'auction', internalType: 'address', type: 'address', indexed: false },
      { name: 'treasury', internalType: 'address', type: 'address', indexed: false },
      { name: 'governor', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'DAODeployed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address', indexed: false },
      { name: 'renderer', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'MetadataRendererUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'canceledOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'pendingOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerPending',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'baseImpl', internalType: 'address', type: 'address', indexed: false },
      { name: 'upgradeImpl', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'UpgradeRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'baseImpl', internalType: 'address', type: 'address', indexed: false },
      { name: 'upgradeImpl', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'UpgradeRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'impl', internalType: 'address', type: 'address', indexed: false }],
    name: 'Upgraded',
  },
  { type: 'error', inputs: [], name: 'ADDRESS_ZERO' },
  { type: 'error', inputs: [], name: 'ALREADY_INITIALIZED' },
  { type: 'error', inputs: [], name: 'DELEGATE_CALL_FAILED' },
  { type: 'error', inputs: [], name: 'FOUNDER_REQUIRED' },
  { type: 'error', inputs: [], name: 'INITIALIZING' },
  { type: 'error', inputs: [], name: 'INVALID_TARGET' },
  {
    type: 'error',
    inputs: [{ name: 'impl', internalType: 'address', type: 'address' }],
    name: 'INVALID_UPGRADE',
  },
  { type: 'error', inputs: [], name: 'NOT_INITIALIZING' },
  { type: 'error', inputs: [], name: 'ONLY_CALL' },
  { type: 'error', inputs: [], name: 'ONLY_DELEGATECALL' },
  { type: 'error', inputs: [], name: 'ONLY_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PENDING_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PROXY' },
  { type: 'error', inputs: [], name: 'ONLY_TOKEN_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_UUPS' },
  { type: 'error', inputs: [], name: 'UNSUPPORTED_UUID' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ManagerV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const managerV2Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_tokenImpl', internalType: 'address', type: 'address' },
      { name: '_metadataImpl', internalType: 'address', type: 'address' },
      { name: '_auctionImpl', internalType: 'address', type: 'address' },
      { name: '_treasuryImpl', internalType: 'address', type: 'address' },
      { name: '_governorImpl', internalType: 'address', type: 'address' },
      { name: '_builderRewardsRecipient', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'payable',
  },
  { type: 'error', inputs: [], name: 'ADDRESS_ZERO' },
  { type: 'error', inputs: [], name: 'ALREADY_INITIALIZED' },
  { type: 'error', inputs: [], name: 'DELEGATE_CALL_FAILED' },
  { type: 'error', inputs: [], name: 'FOUNDER_REQUIRED' },
  { type: 'error', inputs: [], name: 'INITIALIZING' },
  { type: 'error', inputs: [], name: 'INVALID_TARGET' },
  {
    type: 'error',
    inputs: [{ name: 'impl', internalType: 'address', type: 'address' }],
    name: 'INVALID_UPGRADE',
  },
  { type: 'error', inputs: [], name: 'NOT_INITIALIZING' },
  { type: 'error', inputs: [], name: 'ONLY_CALL' },
  { type: 'error', inputs: [], name: 'ONLY_DELEGATECALL' },
  { type: 'error', inputs: [], name: 'ONLY_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PENDING_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PROXY' },
  { type: 'error', inputs: [], name: 'ONLY_TOKEN_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_UUPS' },
  { type: 'error', inputs: [], name: 'UNSUPPORTED_UUID' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'token', internalType: 'address', type: 'address', indexed: false },
      { name: 'metadata', internalType: 'address', type: 'address', indexed: false },
      { name: 'auction', internalType: 'address', type: 'address', indexed: false },
      { name: 'treasury', internalType: 'address', type: 'address', indexed: false },
      { name: 'governor', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'DAODeployed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address', indexed: false },
      { name: 'renderer', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'MetadataRendererUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'canceledOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'pendingOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerPending',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'baseImpl', internalType: 'address', type: 'address', indexed: false },
      { name: 'upgradeImpl', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'UpgradeRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'baseImpl', internalType: 'address', type: 'address', indexed: false },
      { name: 'upgradeImpl', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'UpgradeRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'impl', internalType: 'address', type: 'address', indexed: false }],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'auctionImpl',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'builderRewardsRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancelOwnershipTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractVersion',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_founderParams',
        internalType: 'struct IManager.FounderParams[]',
        type: 'tuple[]',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint256', type: 'uint256' },
          { name: 'vestExpiry', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: '_tokenParams',
        internalType: 'struct IManager.TokenParams',
        type: 'tuple',
        components: [
          { name: 'initStrings', internalType: 'bytes', type: 'bytes' },
          { name: 'metadataRenderer', internalType: 'address', type: 'address' },
          { name: 'reservedUntilTokenId', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: '_auctionParams',
        internalType: 'struct IManager.AuctionParams',
        type: 'tuple',
        components: [
          { name: 'reservePrice', internalType: 'uint256', type: 'uint256' },
          { name: 'duration', internalType: 'uint256', type: 'uint256' },
          { name: 'founderRewardRecipent', internalType: 'address', type: 'address' },
          { name: 'founderRewardBps', internalType: 'uint16', type: 'uint16' },
        ],
      },
      {
        name: '_govParams',
        internalType: 'struct IManager.GovParams',
        type: 'tuple',
        components: [
          { name: 'timelockDelay', internalType: 'uint256', type: 'uint256' },
          { name: 'votingDelay', internalType: 'uint256', type: 'uint256' },
          { name: 'votingPeriod', internalType: 'uint256', type: 'uint256' },
          { name: 'proposalThresholdBps', internalType: 'uint256', type: 'uint256' },
          { name: 'quorumThresholdBps', internalType: 'uint256', type: 'uint256' },
          { name: 'vetoer', internalType: 'address', type: 'address' },
        ],
      },
    ],
    name: 'deploy',
    outputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'metadata', internalType: 'address', type: 'address' },
      { name: 'auction', internalType: 'address', type: 'address' },
      { name: 'treasury', internalType: 'address', type: 'address' },
      { name: 'governor', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_token', internalType: 'address', type: 'address' }],
    name: 'getAddresses',
    outputs: [
      { name: 'metadata', internalType: 'address', type: 'address' },
      { name: 'auction', internalType: 'address', type: 'address' },
      { name: 'treasury', internalType: 'address', type: 'address' },
      { name: 'governor', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'getDAOVersions',
    outputs: [
      {
        name: '',
        internalType: 'struct IManager.DAOVersionInfo',
        type: 'tuple',
        components: [
          { name: 'token', internalType: 'string', type: 'string' },
          { name: 'metadata', internalType: 'string', type: 'string' },
          { name: 'auction', internalType: 'string', type: 'string' },
          { name: 'treasury', internalType: 'string', type: 'string' },
          { name: 'governor', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getLatestVersions',
    outputs: [
      {
        name: '',
        internalType: 'struct IManager.DAOVersionInfo',
        type: 'tuple',
        components: [
          { name: 'token', internalType: 'string', type: 'string' },
          { name: 'metadata', internalType: 'string', type: 'string' },
          { name: 'auction', internalType: 'string', type: 'string' },
          { name: 'treasury', internalType: 'string', type: 'string' },
          { name: 'governor', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'governorImpl',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_baseImpl', internalType: 'address', type: 'address' },
      { name: '_upgradeImpl', internalType: 'address', type: 'address' },
    ],
    name: 'isRegisteredUpgrade',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'metadataImpl',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_baseImpl', internalType: 'address', type: 'address' },
      { name: '_upgradeImpl', internalType: 'address', type: 'address' },
    ],
    name: 'registerUpgrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_baseImpl', internalType: 'address', type: 'address' },
      { name: '_upgradeImpl', internalType: 'address', type: 'address' },
    ],
    name: 'removeUpgrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'safeTransferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_newRendererImpl', internalType: 'address', type: 'address' },
      { name: '_setupRenderer', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setMetadataRenderer',
    outputs: [{ name: 'metadata', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tokenImpl',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasuryImpl',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newImpl', internalType: 'address', type: 'address' }],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newImpl', internalType: 'address', type: 'address' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MerklePropertyMetadata
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const merklePropertyMetadataAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_manager', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [{ name: 'implementation', internalType: 'address', type: 'address' }],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  {
    type: 'error',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'INVALID_MERKLE_PROOF',
  },
  {
    type: 'error',
    inputs: [{ name: 'selectedPropertyId', internalType: 'uint256', type: 'uint256' }],
    name: 'INVALID_PROPERTY_SELECTED',
  },
  {
    type: 'error',
    inputs: [{ name: 'impl', internalType: 'address', type: 'address' }],
    name: 'INVALID_UPGRADE',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'ONE_PROPERTY_AND_ITEM_REQUIRED' },
  { type: 'error', inputs: [], name: 'ONLY_MANAGER' },
  { type: 'error', inputs: [], name: 'ONLY_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_TOKEN' },
  {
    type: 'error',
    inputs: [
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'length', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'StringsInsufficientHexLength',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'TOKEN_NOT_MINTED',
  },
  { type: 'error', inputs: [], name: 'TOO_MANY_PROPERTIES' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_additionalJsonProperties',
        internalType: 'struct IBaseMetadata.AdditionalTokenProperty[]',
        type: 'tuple[]',
        components: [
          { name: 'key', internalType: 'string', type: 'string' },
          { name: 'value', internalType: 'string', type: 'string' },
          { name: 'quote', internalType: 'bool', type: 'bool' },
        ],
        indexed: false,
      },
    ],
    name: 'AdditionalTokenPropertiesSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevImage', internalType: 'string', type: 'string', indexed: false },
      { name: 'newImage', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'ContractImageUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevDescription', internalType: 'string', type: 'string', indexed: false },
      { name: 'newDescription', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'DescriptionUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'version', internalType: 'uint64', type: 'uint64', indexed: false }],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'PropertyAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'prevRendererBase',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      { name: 'newRendererBase', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'RendererBaseUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'lastURI', internalType: 'string', type: 'string', indexed: false },
      { name: 'newURI', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'WebsiteURIUpdated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_names', internalType: 'string[]', type: 'string[]' },
      {
        name: '_items',
        internalType: 'struct IPropertyIPFS.ItemParam[]',
        type: 'tuple[]',
        components: [
          { name: 'propertyId', internalType: 'uint256', type: 'uint256' },
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'isNewProperty', internalType: 'bool', type: 'bool' },
        ],
      },
      {
        name: '_ipfsGroup',
        internalType: 'struct IPropertyIPFS.IPFSGroup',
        type: 'tuple',
        components: [
          { name: 'baseUri', internalType: 'string', type: 'string' },
          { name: 'extension', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'addProperties',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'attributeMerkleRoot',
    outputs: [{ name: 'root', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractImage',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_names', internalType: 'string[]', type: 'string[]' },
      {
        name: '_items',
        internalType: 'struct IPropertyIPFS.ItemParam[]',
        type: 'tuple[]',
        components: [
          { name: 'propertyId', internalType: 'uint256', type: 'uint256' },
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'isNewProperty', internalType: 'bool', type: 'bool' },
        ],
      },
      {
        name: '_ipfsGroup',
        internalType: 'struct IPropertyIPFS.IPFSGroup',
        type: 'tuple',
        components: [
          { name: 'baseUri', internalType: 'string', type: 'string' },
          { name: 'extension', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'deleteAndRecreateProperties',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'description',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAdditionalTokenProperties',
    outputs: [
      {
        name: '_additionalTokenProperties',
        internalType: 'struct IBaseMetadata.AdditionalTokenProperty[]',
        type: 'tuple[]',
        components: [
          { name: 'key', internalType: 'string', type: 'string' },
          { name: 'value', internalType: 'string', type: 'string' },
          { name: 'quote', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getAttributes',
    outputs: [
      { name: 'resultAttributes', internalType: 'string', type: 'string' },
      { name: 'queryString', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getRawAttributes',
    outputs: [{ name: 'attributes', internalType: 'uint16[16]', type: 'uint16[16]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_initStrings', internalType: 'bytes', type: 'bytes' },
      { name: '_token', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ipfsDataCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_propertyId', internalType: 'uint256', type: 'uint256' }],
    name: 'itemsCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'onMinted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'projectURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'propertiesCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rendererBase',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_additionalTokenProperties',
        internalType: 'struct IBaseMetadata.AdditionalTokenProperty[]',
        type: 'tuple[]',
        components: [
          { name: 'key', internalType: 'string', type: 'string' },
          { name: 'value', internalType: 'string', type: 'string' },
          { name: 'quote', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    name: 'setAdditionalTokenProperties',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'attributeMerkleRoot_', internalType: 'bytes32', type: 'bytes32' }],
    name: 'setAttributeMerkleRoot',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_params',
        internalType: 'struct IMerklePropertyIPFS.SetAttributeParams',
        type: 'tuple',
        components: [
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'attributes', internalType: 'uint16[16]', type: 'uint16[16]' },
          { name: 'proof', internalType: 'bytes32[]', type: 'bytes32[]' },
        ],
      },
    ],
    name: 'setAttributes',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_params',
        internalType: 'struct IMerklePropertyIPFS.SetAttributeParams[]',
        type: 'tuple[]',
        components: [
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'attributes', internalType: 'uint16[16]', type: 'uint16[16]' },
          { name: 'proof', internalType: 'bytes32[]', type: 'bytes32[]' },
        ],
      },
    ],
    name: 'setManyAttributes',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newContractImage', internalType: 'string', type: 'string' }],
    name: 'updateContractImage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newDescription', internalType: 'string', type: 'string' }],
    name: 'updateDescription',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newProjectURI', internalType: 'string', type: 'string' }],
    name: 'updateProjectURI',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newRendererBase', internalType: 'string', type: 'string' }],
    name: 'updateRendererBase',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Messenger
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const messengerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_portal', internalType: 'contract OptimismPortal', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'msgHash', internalType: 'bytes32', type: 'bytes32', indexed: true },
    ],
    name: 'FailedRelayedMessage',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'version', internalType: 'uint8', type: 'uint8', indexed: false }],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'msgHash', internalType: 'bytes32', type: 'bytes32', indexed: true },
    ],
    name: 'RelayedMessage',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'target', internalType: 'address', type: 'address', indexed: true },
      { name: 'sender', internalType: 'address', type: 'address', indexed: false },
      { name: 'message', internalType: 'bytes', type: 'bytes', indexed: false },
      { name: 'messageNonce', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'gasLimit', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'SentMessage',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address', indexed: true },
      { name: 'value', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'SentMessageExtension1',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MESSAGE_VERSION',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_GAS_CALLDATA_OVERHEAD',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_GAS_DYNAMIC_OVERHEAD_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_GAS_DYNAMIC_OVERHEAD_NUMERATOR',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'OTHER_MESSENGER',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PORTAL',
    outputs: [{ name: '', internalType: 'contract OptimismPortal', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RELAY_CALL_OVERHEAD',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RELAY_CONSTANT_OVERHEAD',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RELAY_GAS_CHECK_BUFFER',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RELAY_RESERVED_GAS',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_message', internalType: 'bytes', type: 'bytes' },
      { name: '_minGasLimit', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'baseGas',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'failedMessages',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'messageNonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_nonce', internalType: 'uint256', type: 'uint256' },
      { name: '_sender', internalType: 'address', type: 'address' },
      { name: '_target', internalType: 'address', type: 'address' },
      { name: '_value', internalType: 'uint256', type: 'uint256' },
      { name: '_minGasLimit', internalType: 'uint256', type: 'uint256' },
      { name: '_message', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'relayMessage',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_target', internalType: 'address', type: 'address' },
      { name: '_message', internalType: 'bytes', type: 'bytes' },
      { name: '_minGasLimit', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'sendMessage',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'successfulMessages',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'xDomainMessageSender',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Metadata
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const metadataAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_manager', internalType: 'address', type: 'address' }],
    stateMutability: 'payable',
  },
  { type: 'error', inputs: [], name: 'ADDRESS_ZERO' },
  { type: 'error', inputs: [], name: 'ALREADY_INITIALIZED' },
  { type: 'error', inputs: [], name: 'DELEGATE_CALL_FAILED' },
  { type: 'error', inputs: [], name: 'INITIALIZING' },
  {
    type: 'error',
    inputs: [{ name: 'selectedPropertyId', internalType: 'uint256', type: 'uint256' }],
    name: 'INVALID_PROPERTY_SELECTED',
  },
  { type: 'error', inputs: [], name: 'INVALID_TARGET' },
  {
    type: 'error',
    inputs: [{ name: 'impl', internalType: 'address', type: 'address' }],
    name: 'INVALID_UPGRADE',
  },
  { type: 'error', inputs: [], name: 'NOT_INITIALIZING' },
  { type: 'error', inputs: [], name: 'ONE_PROPERTY_AND_ITEM_REQUIRED' },
  { type: 'error', inputs: [], name: 'ONLY_CALL' },
  { type: 'error', inputs: [], name: 'ONLY_DELEGATECALL' },
  { type: 'error', inputs: [], name: 'ONLY_MANAGER' },
  { type: 'error', inputs: [], name: 'ONLY_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PROXY' },
  { type: 'error', inputs: [], name: 'ONLY_TOKEN' },
  { type: 'error', inputs: [], name: 'ONLY_UUPS' },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'TOKEN_NOT_MINTED',
  },
  { type: 'error', inputs: [], name: 'TOO_MANY_PROPERTIES' },
  { type: 'error', inputs: [], name: 'UNSUPPORTED_UUID' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_additionalJsonProperties',
        internalType: 'struct MetadataRendererTypesV2.AdditionalTokenProperty[]',
        type: 'tuple[]',
        components: [
          { name: 'key', internalType: 'string', type: 'string' },
          { name: 'value', internalType: 'string', type: 'string' },
          { name: 'quote', internalType: 'bool', type: 'bool' },
        ],
        indexed: false,
      },
    ],
    name: 'AdditionalTokenPropertiesSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevImage', internalType: 'string', type: 'string', indexed: false },
      { name: 'newImage', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'ContractImageUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevDescription', internalType: 'string', type: 'string', indexed: false },
      { name: 'newDescription', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'DescriptionUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'PropertyAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'prevRendererBase',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      { name: 'newRendererBase', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'RendererBaseUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'impl', internalType: 'address', type: 'address', indexed: false }],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'lastURI', internalType: 'string', type: 'string', indexed: false },
      { name: 'newURI', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'WebsiteURIUpdated',
  },
  {
    type: 'function',
    inputs: [
      { name: '_names', internalType: 'string[]', type: 'string[]' },
      {
        name: '_items',
        internalType: 'struct MetadataRendererTypesV1.ItemParam[]',
        type: 'tuple[]',
        components: [
          { name: 'propertyId', internalType: 'uint256', type: 'uint256' },
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'isNewProperty', internalType: 'bool', type: 'bool' },
        ],
      },
      {
        name: '_ipfsGroup',
        internalType: 'struct MetadataRendererTypesV1.IPFSGroup',
        type: 'tuple',
        components: [
          { name: 'baseUri', internalType: 'string', type: 'string' },
          { name: 'extension', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'addProperties',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'attributes',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractImage',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractVersion',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '_names', internalType: 'string[]', type: 'string[]' },
      {
        name: '_items',
        internalType: 'struct MetadataRendererTypesV1.ItemParam[]',
        type: 'tuple[]',
        components: [
          { name: 'propertyId', internalType: 'uint256', type: 'uint256' },
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'isNewProperty', internalType: 'bool', type: 'bool' },
        ],
      },
      {
        name: '_ipfsGroup',
        internalType: 'struct MetadataRendererTypesV1.IPFSGroup',
        type: 'tuple',
        components: [
          { name: 'baseUri', internalType: 'string', type: 'string' },
          { name: 'extension', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'deleteAndRecreateProperties',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'description',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getAttributes',
    outputs: [
      { name: 'resultAttributes', internalType: 'string', type: 'string' },
      { name: 'queryString', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_initStrings', internalType: 'bytes', type: 'bytes' },
      { name: '_token', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'ipfsData',
    outputs: [
      { name: 'baseUri', internalType: 'string', type: 'string' },
      { name: 'extension', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ipfsDataCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_propertyId', internalType: 'uint256', type: 'uint256' }],
    name: 'itemsCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'onMinted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'projectURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'properties',
    outputs: [{ name: 'name', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'propertiesCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rendererBase',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_additionalTokenProperties',
        internalType: 'struct MetadataRendererTypesV2.AdditionalTokenProperty[]',
        type: 'tuple[]',
        components: [
          { name: 'key', internalType: 'string', type: 'string' },
          { name: 'value', internalType: 'string', type: 'string' },
          { name: 'quote', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    name: 'setAdditionalTokenProperties',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'settings',
    outputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'projectURI', internalType: 'string', type: 'string' },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'contractImage', internalType: 'string', type: 'string' },
      { name: 'rendererBase', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newContractImage', internalType: 'string', type: 'string' }],
    name: 'updateContractImage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newDescription', internalType: 'string', type: 'string' }],
    name: 'updateDescription',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newProjectURI', internalType: 'string', type: 'string' }],
    name: 'updateProjectURI',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newRendererBase', internalType: 'string', type: 'string' }],
    name: 'updateRendererBase',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newImpl', internalType: 'address', type: 'address' }],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newImpl', internalType: 'address', type: 'address' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Token
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tokenAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_manager', internalType: 'address', type: 'address' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'auction',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancelOwnershipTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractVersion',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '_to', internalType: 'address', type: 'address' }],
    name: 'delegate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', internalType: 'address', type: 'address' },
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_deadline', internalType: 'uint256', type: 'uint256' },
      { name: '_v', internalType: 'uint8', type: 'uint8' },
      { name: '_r', internalType: 'bytes32', type: 'bytes32' },
      { name: '_s', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'delegateBySig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'delegates',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_founderId', internalType: 'uint256', type: 'uint256' }],
    name: 'getFounder',
    outputs: [
      {
        name: '',
        internalType: 'struct TokenTypesV1.Founder',
        type: 'tuple',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint8', type: 'uint8' },
          { name: 'vestExpiry', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getFounders',
    outputs: [
      {
        name: '',
        internalType: 'struct TokenTypesV1.Founder[]',
        type: 'tuple[]',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint8', type: 'uint8' },
          { name: 'vestExpiry', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_account', internalType: 'address', type: 'address' },
      { name: '_timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getPastVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getScheduledRecipient',
    outputs: [
      {
        name: '',
        internalType: 'struct TokenTypesV1.Founder',
        type: 'tuple',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint8', type: 'uint8' },
          { name: 'vestExpiry', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'getVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_founders',
        internalType: 'struct IManager.FounderParams[]',
        type: 'tuple[]',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint256', type: 'uint256' },
          { name: 'vestExpiry', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: '_initStrings', internalType: 'bytes', type: 'bytes' },
      { name: '_reservedUntilTokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_metadataRenderer', internalType: 'address', type: 'address' },
      { name: '_auction', internalType: 'address', type: 'address' },
      { name: '_initialOwner', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_minter', internalType: 'address', type: 'address' }],
    name: 'isMinter',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'metadataRenderer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'mint',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'mintBatchTo',
    outputs: [{ name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mintFromReserveTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'recipient', internalType: 'address', type: 'address' }],
    name: 'mintTo',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'minter',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'nonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'onFirstAuctionStarted',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'remainingTokensInReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'reservedUntilTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', internalType: 'address', type: 'address' },
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', internalType: 'address', type: 'address' },
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'safeTransferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_operator', internalType: 'address', type: 'address' },
      { name: '_approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newRenderer', internalType: 'contract IBaseMetadata', type: 'address' },
    ],
    name: 'setMetadataRenderer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newReservedUntilTokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setReservedUntilTokenId',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalFounderOwnership',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalFounders',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', internalType: 'address', type: 'address' },
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newFounders',
        internalType: 'struct IManager.FounderParams[]',
        type: 'tuple[]',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint256', type: 'uint256' },
          { name: 'vestExpiry', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'updateFounders',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_minters',
        internalType: 'struct TokenTypesV2.MinterParams[]',
        type: 'tuple[]',
        components: [
          { name: 'minter', internalType: 'address', type: 'address' },
          { name: 'allowed', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    name: 'updateMinters',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newImpl', internalType: 'address', type: 'address' }],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newImpl', internalType: 'address', type: 'address' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'approved', internalType: 'address', type: 'address', indexed: true },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'operator', internalType: 'address', type: 'address', indexed: true },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'delegator', internalType: 'address', type: 'address', indexed: true },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'DelegateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'delegate', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'prevTotalVotes',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'newTotalVotes', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'DelegateVotesChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newFounders',
        internalType: 'struct IManager.FounderParams[]',
        type: 'tuple[]',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint256', type: 'uint256' },
          { name: 'vestExpiry', internalType: 'uint256', type: 'uint256' },
        ],
        indexed: false,
      },
    ],
    name: 'FounderAllocationsCleared',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'renderer', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'MetadataRendererUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'baseTokenId', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'founderId', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'founder',
        internalType: 'struct TokenTypesV1.Founder',
        type: 'tuple',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint8', type: 'uint8' },
          { name: 'vestExpiry', internalType: 'uint32', type: 'uint32' },
        ],
        indexed: false,
      },
    ],
    name: 'MintScheduled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'baseTokenId', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'founderId', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'founder',
        internalType: 'struct TokenTypesV1.Founder',
        type: 'tuple',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint8', type: 'uint8' },
          { name: 'vestExpiry', internalType: 'uint32', type: 'uint32' },
        ],
        indexed: false,
      },
    ],
    name: 'MintUnscheduled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'minter', internalType: 'address', type: 'address', indexed: false },
      { name: 'allowed', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'MinterUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'canceledOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'pendingOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerPending',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reservedUntilTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ReservedUntilTokenIDUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'impl', internalType: 'address', type: 'address', indexed: false }],
    name: 'Upgraded',
  },
  { type: 'error', inputs: [], name: 'ADDRESS_ZERO' },
  { type: 'error', inputs: [], name: 'ALREADY_INITIALIZED' },
  { type: 'error', inputs: [], name: 'ALREADY_MINTED' },
  { type: 'error', inputs: [], name: 'CANNOT_CHANGE_RESERVE' },
  { type: 'error', inputs: [], name: 'CANNOT_DECREASE_RESERVE' },
  { type: 'error', inputs: [], name: 'DELEGATE_CALL_FAILED' },
  { type: 'error', inputs: [], name: 'EXPIRED_SIGNATURE' },
  { type: 'error', inputs: [], name: 'INITIALIZING' },
  { type: 'error', inputs: [], name: 'INVALID_APPROVAL' },
  { type: 'error', inputs: [], name: 'INVALID_FOUNDER_OWNERSHIP' },
  { type: 'error', inputs: [], name: 'INVALID_OWNER' },
  { type: 'error', inputs: [], name: 'INVALID_RECIPIENT' },
  { type: 'error', inputs: [], name: 'INVALID_SIGNATURE' },
  { type: 'error', inputs: [], name: 'INVALID_TARGET' },
  { type: 'error', inputs: [], name: 'INVALID_TIMESTAMP' },
  {
    type: 'error',
    inputs: [{ name: 'impl', internalType: 'address', type: 'address' }],
    name: 'INVALID_UPGRADE',
  },
  { type: 'error', inputs: [], name: 'NOT_INITIALIZING' },
  { type: 'error', inputs: [], name: 'NOT_MINTED' },
  { type: 'error', inputs: [], name: 'NO_METADATA_GENERATED' },
  { type: 'error', inputs: [], name: 'ONLY_AUCTION' },
  { type: 'error', inputs: [], name: 'ONLY_AUCTION_OR_MINTER' },
  { type: 'error', inputs: [], name: 'ONLY_CALL' },
  { type: 'error', inputs: [], name: 'ONLY_DELEGATECALL' },
  { type: 'error', inputs: [], name: 'ONLY_MANAGER' },
  { type: 'error', inputs: [], name: 'ONLY_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PENDING_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PROXY' },
  { type: 'error', inputs: [], name: 'ONLY_TOKEN_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_UUPS' },
  { type: 'error', inputs: [], name: 'REENTRANCY' },
  { type: 'error', inputs: [], name: 'TOKEN_NOT_RESERVED' },
  { type: 'error', inputs: [], name: 'UNSUPPORTED_UUID' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Treasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const treasuryAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_manager', internalType: 'address', type: 'address' }],
    stateMutability: 'payable',
  },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancelOwnershipTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractVersion',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'delay',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_targets', internalType: 'address[]', type: 'address[]' },
      { name: '_values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: '_descriptionHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_proposer', internalType: 'address', type: 'address' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gracePeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_targets', internalType: 'address[]', type: 'address[]' },
      { name: '_values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: '_descriptionHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_proposer', internalType: 'address', type: 'address' },
    ],
    name: 'hashProposal',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '_governor', internalType: 'address', type: 'address' },
      { name: '_delay', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isExpired',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isQueued',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isReady',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC1155Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'queue',
    outputs: [{ name: 'eta', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'safeTransferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'timestamp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newDelay', internalType: 'uint256', type: 'uint256' }],
    name: 'updateDelay',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newGracePeriod', internalType: 'uint256', type: 'uint256' }],
    name: 'updateGracePeriod',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newImpl', internalType: 'address', type: 'address' }],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newImpl', internalType: 'address', type: 'address' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevDelay', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newDelay', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'DelayUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'prevGracePeriod',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newGracePeriod',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'GracePeriodUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'canceledOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'pendingOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerPending',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'proposalId', internalType: 'bytes32', type: 'bytes32', indexed: false },
    ],
    name: 'TransactionCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'proposalId', internalType: 'bytes32', type: 'bytes32', indexed: false },
      { name: 'targets', internalType: 'address[]', type: 'address[]', indexed: false },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'payloads', internalType: 'bytes[]', type: 'bytes[]', indexed: false },
    ],
    name: 'TransactionExecuted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'proposalId', internalType: 'bytes32', type: 'bytes32', indexed: false },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'TransactionScheduled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'impl', internalType: 'address', type: 'address', indexed: false }],
    name: 'Upgraded',
  },
  { type: 'error', inputs: [], name: 'ADDRESS_ZERO' },
  { type: 'error', inputs: [], name: 'ALREADY_INITIALIZED' },
  { type: 'error', inputs: [], name: 'DELEGATE_CALL_FAILED' },
  { type: 'error', inputs: [], name: 'EXECUTION_EXPIRED' },
  {
    type: 'error',
    inputs: [{ name: 'txIndex', internalType: 'uint256', type: 'uint256' }],
    name: 'EXECUTION_FAILED',
  },
  {
    type: 'error',
    inputs: [{ name: 'proposalId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'EXECUTION_NOT_READY',
  },
  { type: 'error', inputs: [], name: 'INITIALIZING' },
  { type: 'error', inputs: [], name: 'INVALID_TARGET' },
  {
    type: 'error',
    inputs: [{ name: 'impl', internalType: 'address', type: 'address' }],
    name: 'INVALID_UPGRADE',
  },
  { type: 'error', inputs: [], name: 'NOT_INITIALIZING' },
  { type: 'error', inputs: [], name: 'ONLY_CALL' },
  { type: 'error', inputs: [], name: 'ONLY_DELEGATECALL' },
  { type: 'error', inputs: [], name: 'ONLY_MANAGER' },
  { type: 'error', inputs: [], name: 'ONLY_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PENDING_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PROXY' },
  { type: 'error', inputs: [], name: 'ONLY_TREASURY' },
  { type: 'error', inputs: [], name: 'ONLY_UUPS' },
  { type: 'error', inputs: [], name: 'PROPOSAL_ALREADY_QUEUED' },
  { type: 'error', inputs: [], name: 'PROPOSAL_NOT_QUEUED' },
  { type: 'error', inputs: [], name: 'UNSAFE_CAST' },
  { type: 'error', inputs: [], name: 'UNSUPPORTED_UUID' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ZoraNFTCreator
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const zoraNftCreatorAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_implementation', internalType: 'address', type: 'address' },
      {
        name: '_editionMetadataRenderer',
        internalType: 'contract EditionMetadataRenderer',
        type: 'address',
      },
      {
        name: '_dropMetadataRenderer',
        internalType: 'contract DropMetadataRenderer',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousAdmin', internalType: 'address', type: 'address', indexed: false },
      { name: 'newAdmin', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'beacon', internalType: 'address', type: 'address', indexed: true }],
    name: 'BeaconUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'creator', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'editionContractAddress',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'editionSize', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'CreatedDrop',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractVersion',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'defaultAdmin', internalType: 'address', type: 'address' },
      { name: 'editionSize', internalType: 'uint64', type: 'uint64' },
      { name: 'royaltyBPS', internalType: 'uint16', type: 'uint16' },
      { name: 'fundsRecipient', internalType: 'address payable', type: 'address' },
      { name: 'setupCalls', internalType: 'bytes[]', type: 'bytes[]' },
      {
        name: 'metadataRenderer',
        internalType: 'contract IMetadataRenderer',
        type: 'address',
      },
      { name: 'metadataInitializer', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'createAndConfigureDrop',
    outputs: [
      { name: 'newDropAddress', internalType: 'address payable', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'defaultAdmin', internalType: 'address', type: 'address' },
      { name: 'editionSize', internalType: 'uint64', type: 'uint64' },
      { name: 'royaltyBPS', internalType: 'uint16', type: 'uint16' },
      { name: 'fundsRecipient', internalType: 'address payable', type: 'address' },
      {
        name: 'saleConfig',
        internalType: 'struct IERC721Drop.SalesConfiguration',
        type: 'tuple',
        components: [
          { name: 'publicSalePrice', internalType: 'uint104', type: 'uint104' },
          { name: 'maxSalePurchasePerAddress', internalType: 'uint32', type: 'uint32' },
          { name: 'publicSaleStart', internalType: 'uint64', type: 'uint64' },
          { name: 'publicSaleEnd', internalType: 'uint64', type: 'uint64' },
          { name: 'presaleStart', internalType: 'uint64', type: 'uint64' },
          { name: 'presaleEnd', internalType: 'uint64', type: 'uint64' },
          { name: 'presaleMerkleRoot', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      { name: 'metadataURIBase', internalType: 'string', type: 'string' },
      { name: 'metadataContractURI', internalType: 'string', type: 'string' },
    ],
    name: 'createDrop',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'editionSize', internalType: 'uint64', type: 'uint64' },
      { name: 'royaltyBPS', internalType: 'uint16', type: 'uint16' },
      { name: 'fundsRecipient', internalType: 'address payable', type: 'address' },
      { name: 'defaultAdmin', internalType: 'address', type: 'address' },
      {
        name: 'saleConfig',
        internalType: 'struct IERC721Drop.SalesConfiguration',
        type: 'tuple',
        components: [
          { name: 'publicSalePrice', internalType: 'uint104', type: 'uint104' },
          { name: 'maxSalePurchasePerAddress', internalType: 'uint32', type: 'uint32' },
          { name: 'publicSaleStart', internalType: 'uint64', type: 'uint64' },
          { name: 'publicSaleEnd', internalType: 'uint64', type: 'uint64' },
          { name: 'presaleStart', internalType: 'uint64', type: 'uint64' },
          { name: 'presaleEnd', internalType: 'uint64', type: 'uint64' },
          { name: 'presaleMerkleRoot', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'animationURI', internalType: 'string', type: 'string' },
      { name: 'imageURI', internalType: 'string', type: 'string' },
    ],
    name: 'createEdition',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'dropMetadataRenderer',
    outputs: [
      { name: '', internalType: 'contract DropMetadataRenderer', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'editionMetadataRenderer',
    outputs: [
      { name: '', internalType: 'contract EditionMetadataRenderer', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'implementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'defaultAdmin', internalType: 'address', type: 'address' },
      { name: 'editionSize', internalType: 'uint64', type: 'uint64' },
      { name: 'royaltyBPS', internalType: 'uint16', type: 'uint16' },
      { name: 'fundsRecipient', internalType: 'address payable', type: 'address' },
      {
        name: 'saleConfig',
        internalType: 'struct IERC721Drop.SalesConfiguration',
        type: 'tuple',
        components: [
          { name: 'publicSalePrice', internalType: 'uint104', type: 'uint104' },
          { name: 'maxSalePurchasePerAddress', internalType: 'uint32', type: 'uint32' },
          { name: 'publicSaleStart', internalType: 'uint64', type: 'uint64' },
          { name: 'publicSaleEnd', internalType: 'uint64', type: 'uint64' },
          { name: 'presaleStart', internalType: 'uint64', type: 'uint64' },
          { name: 'presaleEnd', internalType: 'uint64', type: 'uint64' },
          { name: 'presaleMerkleRoot', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      {
        name: 'metadataRenderer',
        internalType: 'contract IMetadataRenderer',
        type: 'address',
      },
      { name: 'metadataInitializer', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setupDropsContract',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newImplementation', internalType: 'address', type: 'address' }],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__
 */
export const readAuction = /*#__PURE__*/ createReadContract({ abi: auctionAbi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"REWARDS_REASON"`
 */
export const readAuctionRewardsReason = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'REWARDS_REASON',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"auction"`
 */
export const readAuctionAuction = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'auction',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"builderRewardsBPS"`
 */
export const readAuctionBuilderRewardsBps = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'builderRewardsBPS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"contractVersion"`
 */
export const readAuctionContractVersion = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'contractVersion',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"currentBidReferral"`
 */
export const readAuctionCurrentBidReferral = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'currentBidReferral',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"duration"`
 */
export const readAuctionDuration = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'duration',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"founderReward"`
 */
export const readAuctionFounderReward = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'founderReward',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"minBidIncrement"`
 */
export const readAuctionMinBidIncrement = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'minBidIncrement',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"owner"`
 */
export const readAuctionOwner = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"paused"`
 */
export const readAuctionPaused = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const readAuctionPendingOwner = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const readAuctionProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"referralRewardsBPS"`
 */
export const readAuctionReferralRewardsBps = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'referralRewardsBPS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"reservePrice"`
 */
export const readAuctionReservePrice = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'reservePrice',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"timeBuffer"`
 */
export const readAuctionTimeBuffer = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'timeBuffer',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"token"`
 */
export const readAuctionToken = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'token',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"treasury"`
 */
export const readAuctionTreasury = /*#__PURE__*/ createReadContract({
  abi: auctionAbi,
  functionName: 'treasury',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__
 */
export const writeAuction = /*#__PURE__*/ createWriteContract({ abi: auctionAbi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const writeAuctionAcceptOwnership = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const writeAuctionCancelOwnershipTransfer = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'cancelOwnershipTransfer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"createBid"`
 */
export const writeAuctionCreateBid = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'createBid',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"createBidWithReferral"`
 */
export const writeAuctionCreateBidWithReferral = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'createBidWithReferral',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"initialize"`
 */
export const writeAuctionInitialize = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"pause"`
 */
export const writeAuctionPause = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const writeAuctionSafeTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'safeTransferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setDuration"`
 */
export const writeAuctionSetDuration = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'setDuration',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setFounderReward"`
 */
export const writeAuctionSetFounderReward = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'setFounderReward',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setMinimumBidIncrement"`
 */
export const writeAuctionSetMinimumBidIncrement = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'setMinimumBidIncrement',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setReservePrice"`
 */
export const writeAuctionSetReservePrice = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'setReservePrice',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setTimeBuffer"`
 */
export const writeAuctionSetTimeBuffer = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'setTimeBuffer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"settleAuction"`
 */
export const writeAuctionSettleAuction = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'settleAuction',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"settleCurrentAndCreateNewAuction"`
 */
export const writeAuctionSettleCurrentAndCreateNewAuction =
  /*#__PURE__*/ createWriteContract({
    abi: auctionAbi,
    functionName: 'settleCurrentAndCreateNewAuction',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const writeAuctionTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"unpause"`
 */
export const writeAuctionUnpause = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'unpause',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const writeAuctionUpgradeTo = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const writeAuctionUpgradeToAndCall = /*#__PURE__*/ createWriteContract({
  abi: auctionAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__
 */
export const simulateAuction = /*#__PURE__*/ createSimulateContract({ abi: auctionAbi })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const simulateAuctionAcceptOwnership = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const simulateAuctionCancelOwnershipTransfer =
  /*#__PURE__*/ createSimulateContract({
    abi: auctionAbi,
    functionName: 'cancelOwnershipTransfer',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"createBid"`
 */
export const simulateAuctionCreateBid = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'createBid',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"createBidWithReferral"`
 */
export const simulateAuctionCreateBidWithReferral = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'createBidWithReferral',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateAuctionInitialize = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"pause"`
 */
export const simulateAuctionPause = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const simulateAuctionSafeTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'safeTransferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setDuration"`
 */
export const simulateAuctionSetDuration = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'setDuration',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setFounderReward"`
 */
export const simulateAuctionSetFounderReward = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'setFounderReward',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setMinimumBidIncrement"`
 */
export const simulateAuctionSetMinimumBidIncrement = /*#__PURE__*/ createSimulateContract(
  { abi: auctionAbi, functionName: 'setMinimumBidIncrement' },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setReservePrice"`
 */
export const simulateAuctionSetReservePrice = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'setReservePrice',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setTimeBuffer"`
 */
export const simulateAuctionSetTimeBuffer = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'setTimeBuffer',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"settleAuction"`
 */
export const simulateAuctionSettleAuction = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'settleAuction',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"settleCurrentAndCreateNewAuction"`
 */
export const simulateAuctionSettleCurrentAndCreateNewAuction =
  /*#__PURE__*/ createSimulateContract({
    abi: auctionAbi,
    functionName: 'settleCurrentAndCreateNewAuction',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const simulateAuctionTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"unpause"`
 */
export const simulateAuctionUnpause = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'unpause',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const simulateAuctionUpgradeTo = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const simulateAuctionUpgradeToAndCall = /*#__PURE__*/ createSimulateContract({
  abi: auctionAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__
 */
export const watchAuctionEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"AuctionBid"`
 */
export const watchAuctionAuctionBidEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
  eventName: 'AuctionBid',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"AuctionCreated"`
 */
export const watchAuctionAuctionCreatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
  eventName: 'AuctionCreated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"AuctionSettled"`
 */
export const watchAuctionAuctionSettledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
  eventName: 'AuctionSettled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"DurationUpdated"`
 */
export const watchAuctionDurationUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
  eventName: 'DurationUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"FounderRewardUpdated"`
 */
export const watchAuctionFounderRewardUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: auctionAbi,
    eventName: 'FounderRewardUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"Initialized"`
 */
export const watchAuctionInitializedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
  eventName: 'Initialized',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"MinBidIncrementPercentageUpdated"`
 */
export const watchAuctionMinBidIncrementPercentageUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: auctionAbi,
    eventName: 'MinBidIncrementPercentageUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"OwnerCanceled"`
 */
export const watchAuctionOwnerCanceledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
  eventName: 'OwnerCanceled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"OwnerPending"`
 */
export const watchAuctionOwnerPendingEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
  eventName: 'OwnerPending',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"OwnerUpdated"`
 */
export const watchAuctionOwnerUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
  eventName: 'OwnerUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"Paused"`
 */
export const watchAuctionPausedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
  eventName: 'Paused',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"ReservePriceUpdated"`
 */
export const watchAuctionReservePriceUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: auctionAbi,
    eventName: 'ReservePriceUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"TimeBufferUpdated"`
 */
export const watchAuctionTimeBufferUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
  eventName: 'TimeBufferUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"Unpaused"`
 */
export const watchAuctionUnpausedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
  eventName: 'Unpaused',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"Upgraded"`
 */
export const watchAuctionUpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: auctionAbi,
  eventName: 'Upgraded',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc1155Abi}__
 */
export const readErc1155 = /*#__PURE__*/ createReadContract({ abi: erc1155Abi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc1155Abi}__ and `functionName` set to `"balanceOf"`
 */
export const readErc1155BalanceOf = /*#__PURE__*/ createReadContract({
  abi: erc1155Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc1155Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const readErc1155SupportsInterface = /*#__PURE__*/ createReadContract({
  abi: erc1155Abi,
  functionName: 'supportsInterface',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc1155Abi}__ and `functionName` set to `"uri"`
 */
export const readErc1155Uri = /*#__PURE__*/ createReadContract({
  abi: erc1155Abi,
  functionName: 'uri',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc1155Abi}__
 */
export const writeErc1155 = /*#__PURE__*/ createWriteContract({ abi: erc1155Abi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc1155Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const writeErc1155SafeTransferFrom = /*#__PURE__*/ createWriteContract({
  abi: erc1155Abi,
  functionName: 'safeTransferFrom',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc1155Abi}__
 */
export const simulateErc1155 = /*#__PURE__*/ createSimulateContract({ abi: erc1155Abi })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc1155Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const simulateErc1155SafeTransferFrom = /*#__PURE__*/ createSimulateContract({
  abi: erc1155Abi,
  functionName: 'safeTransferFrom',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const readErc20 = /*#__PURE__*/ createReadContract({ abi: erc20Abi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const readErc20BalanceOf = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const readErc20Name = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const readErc20Symbol = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const readErc20Decimals = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const writeErc20 = /*#__PURE__*/ createWriteContract({ abi: erc20Abi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const writeErc20Transfer = /*#__PURE__*/ createWriteContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const simulateErc20 = /*#__PURE__*/ createSimulateContract({ abi: erc20Abi })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const simulateErc20Transfer = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc721Abi}__
 */
export const readErc721 = /*#__PURE__*/ createReadContract({ abi: erc721Abi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"ownerOf"`
 */
export const readErc721OwnerOf = /*#__PURE__*/ createReadContract({
  abi: erc721Abi,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"name"`
 */
export const readErc721Name = /*#__PURE__*/ createReadContract({
  abi: erc721Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"symbol"`
 */
export const readErc721Symbol = /*#__PURE__*/ createReadContract({
  abi: erc721Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"tokenURI"`
 */
export const readErc721TokenUri = /*#__PURE__*/ createReadContract({
  abi: erc721Abi,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const readErc721SupportsInterface = /*#__PURE__*/ createReadContract({
  abi: erc721Abi,
  functionName: 'supportsInterface',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc721Abi}__
 */
export const writeErc721 = /*#__PURE__*/ createWriteContract({ abi: erc721Abi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const writeErc721SafeTransferFrom = /*#__PURE__*/ createWriteContract({
  abi: erc721Abi,
  functionName: 'safeTransferFrom',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc721Abi}__
 */
export const simulateErc721 = /*#__PURE__*/ createSimulateContract({ abi: erc721Abi })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const simulateErc721SafeTransferFrom = /*#__PURE__*/ createSimulateContract({
  abi: erc721Abi,
  functionName: 'safeTransferFrom',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__
 */
export const readGovernor = /*#__PURE__*/ createReadContract({ abi: governorAbi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const readGovernorDomainSeparator = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'DOMAIN_SEPARATOR',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"MAX_DELAYED_GOVERNANCE_EXPIRATION"`
 */
export const readGovernorMaxDelayedGovernanceExpiration =
  /*#__PURE__*/ createReadContract({
    abi: governorAbi,
    functionName: 'MAX_DELAYED_GOVERNANCE_EXPIRATION',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"MAX_PROPOSAL_THRESHOLD_BPS"`
 */
export const readGovernorMaxProposalThresholdBps = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'MAX_PROPOSAL_THRESHOLD_BPS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"MAX_QUORUM_THRESHOLD_BPS"`
 */
export const readGovernorMaxQuorumThresholdBps = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'MAX_QUORUM_THRESHOLD_BPS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"MAX_VOTING_DELAY"`
 */
export const readGovernorMaxVotingDelay = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'MAX_VOTING_DELAY',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"MAX_VOTING_PERIOD"`
 */
export const readGovernorMaxVotingPeriod = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'MAX_VOTING_PERIOD',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"MIN_PROPOSAL_THRESHOLD_BPS"`
 */
export const readGovernorMinProposalThresholdBps = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'MIN_PROPOSAL_THRESHOLD_BPS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"MIN_QUORUM_THRESHOLD_BPS"`
 */
export const readGovernorMinQuorumThresholdBps = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'MIN_QUORUM_THRESHOLD_BPS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"MIN_VOTING_DELAY"`
 */
export const readGovernorMinVotingDelay = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'MIN_VOTING_DELAY',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"MIN_VOTING_PERIOD"`
 */
export const readGovernorMinVotingPeriod = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'MIN_VOTING_PERIOD',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"VOTE_TYPEHASH"`
 */
export const readGovernorVoteTypehash = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'VOTE_TYPEHASH',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"contractVersion"`
 */
export const readGovernorContractVersion = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'contractVersion',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"delayedGovernanceExpirationTimestamp"`
 */
export const readGovernorDelayedGovernanceExpirationTimestamp =
  /*#__PURE__*/ createReadContract({
    abi: governorAbi,
    functionName: 'delayedGovernanceExpirationTimestamp',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"getProposal"`
 */
export const readGovernorGetProposal = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'getProposal',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"getVotes"`
 */
export const readGovernorGetVotes = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'getVotes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"hashProposal"`
 */
export const readGovernorHashProposal = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'hashProposal',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"nonce"`
 */
export const readGovernorNonce = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'nonce',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"owner"`
 */
export const readGovernorOwner = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const readGovernorPendingOwner = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"proposalDeadline"`
 */
export const readGovernorProposalDeadline = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'proposalDeadline',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"proposalEta"`
 */
export const readGovernorProposalEta = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'proposalEta',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"proposalSnapshot"`
 */
export const readGovernorProposalSnapshot = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'proposalSnapshot',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"proposalThreshold"`
 */
export const readGovernorProposalThreshold = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'proposalThreshold',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"proposalThresholdBps"`
 */
export const readGovernorProposalThresholdBps = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'proposalThresholdBps',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"proposalVotes"`
 */
export const readGovernorProposalVotes = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'proposalVotes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const readGovernorProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"quorum"`
 */
export const readGovernorQuorum = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'quorum',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"quorumThresholdBps"`
 */
export const readGovernorQuorumThresholdBps = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'quorumThresholdBps',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"state"`
 */
export const readGovernorState = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'state',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"token"`
 */
export const readGovernorToken = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'token',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"treasury"`
 */
export const readGovernorTreasury = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'treasury',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"vetoer"`
 */
export const readGovernorVetoer = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'vetoer',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"votingDelay"`
 */
export const readGovernorVotingDelay = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'votingDelay',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"votingPeriod"`
 */
export const readGovernorVotingPeriod = /*#__PURE__*/ createReadContract({
  abi: governorAbi,
  functionName: 'votingPeriod',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__
 */
export const writeGovernor = /*#__PURE__*/ createWriteContract({ abi: governorAbi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const writeGovernorAcceptOwnership = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"burnVetoer"`
 */
export const writeGovernorBurnVetoer = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'burnVetoer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"cancel"`
 */
export const writeGovernorCancel = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'cancel',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const writeGovernorCancelOwnershipTransfer = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'cancelOwnershipTransfer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"castVote"`
 */
export const writeGovernorCastVote = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'castVote',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"castVoteBySig"`
 */
export const writeGovernorCastVoteBySig = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'castVoteBySig',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"castVoteWithReason"`
 */
export const writeGovernorCastVoteWithReason = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'castVoteWithReason',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"execute"`
 */
export const writeGovernorExecute = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'execute',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"initialize"`
 */
export const writeGovernorInitialize = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"propose"`
 */
export const writeGovernorPropose = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'propose',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"queue"`
 */
export const writeGovernorQueue = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'queue',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const writeGovernorSafeTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'safeTransferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const writeGovernorTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"updateDelayedGovernanceExpirationTimestamp"`
 */
export const writeGovernorUpdateDelayedGovernanceExpirationTimestamp =
  /*#__PURE__*/ createWriteContract({
    abi: governorAbi,
    functionName: 'updateDelayedGovernanceExpirationTimestamp',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"updateProposalThresholdBps"`
 */
export const writeGovernorUpdateProposalThresholdBps = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'updateProposalThresholdBps',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"updateQuorumThresholdBps"`
 */
export const writeGovernorUpdateQuorumThresholdBps = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'updateQuorumThresholdBps',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"updateVetoer"`
 */
export const writeGovernorUpdateVetoer = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'updateVetoer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"updateVotingDelay"`
 */
export const writeGovernorUpdateVotingDelay = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'updateVotingDelay',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"updateVotingPeriod"`
 */
export const writeGovernorUpdateVotingPeriod = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'updateVotingPeriod',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const writeGovernorUpgradeTo = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const writeGovernorUpgradeToAndCall = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"veto"`
 */
export const writeGovernorVeto = /*#__PURE__*/ createWriteContract({
  abi: governorAbi,
  functionName: 'veto',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__
 */
export const simulateGovernor = /*#__PURE__*/ createSimulateContract({ abi: governorAbi })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const simulateGovernorAcceptOwnership = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"burnVetoer"`
 */
export const simulateGovernorBurnVetoer = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'burnVetoer',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"cancel"`
 */
export const simulateGovernorCancel = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'cancel',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const simulateGovernorCancelOwnershipTransfer =
  /*#__PURE__*/ createSimulateContract({
    abi: governorAbi,
    functionName: 'cancelOwnershipTransfer',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"castVote"`
 */
export const simulateGovernorCastVote = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'castVote',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"castVoteBySig"`
 */
export const simulateGovernorCastVoteBySig = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'castVoteBySig',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"castVoteWithReason"`
 */
export const simulateGovernorCastVoteWithReason = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'castVoteWithReason',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"execute"`
 */
export const simulateGovernorExecute = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'execute',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateGovernorInitialize = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"propose"`
 */
export const simulateGovernorPropose = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'propose',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"queue"`
 */
export const simulateGovernorQueue = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'queue',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const simulateGovernorSafeTransferOwnership = /*#__PURE__*/ createSimulateContract(
  { abi: governorAbi, functionName: 'safeTransferOwnership' },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const simulateGovernorTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"updateDelayedGovernanceExpirationTimestamp"`
 */
export const simulateGovernorUpdateDelayedGovernanceExpirationTimestamp =
  /*#__PURE__*/ createSimulateContract({
    abi: governorAbi,
    functionName: 'updateDelayedGovernanceExpirationTimestamp',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"updateProposalThresholdBps"`
 */
export const simulateGovernorUpdateProposalThresholdBps =
  /*#__PURE__*/ createSimulateContract({
    abi: governorAbi,
    functionName: 'updateProposalThresholdBps',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"updateQuorumThresholdBps"`
 */
export const simulateGovernorUpdateQuorumThresholdBps =
  /*#__PURE__*/ createSimulateContract({
    abi: governorAbi,
    functionName: 'updateQuorumThresholdBps',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"updateVetoer"`
 */
export const simulateGovernorUpdateVetoer = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'updateVetoer',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"updateVotingDelay"`
 */
export const simulateGovernorUpdateVotingDelay = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'updateVotingDelay',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"updateVotingPeriod"`
 */
export const simulateGovernorUpdateVotingPeriod = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'updateVotingPeriod',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const simulateGovernorUpgradeTo = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const simulateGovernorUpgradeToAndCall = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link governorAbi}__ and `functionName` set to `"veto"`
 */
export const simulateGovernorVeto = /*#__PURE__*/ createSimulateContract({
  abi: governorAbi,
  functionName: 'veto',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__
 */
export const watchGovernorEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"DelayedGovernanceExpirationTimestampUpdated"`
 */
export const watchGovernorDelayedGovernanceExpirationTimestampUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: governorAbi,
    eventName: 'DelayedGovernanceExpirationTimestampUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"Initialized"`
 */
export const watchGovernorInitializedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
  eventName: 'Initialized',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"OwnerCanceled"`
 */
export const watchGovernorOwnerCanceledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
  eventName: 'OwnerCanceled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"OwnerPending"`
 */
export const watchGovernorOwnerPendingEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
  eventName: 'OwnerPending',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"OwnerUpdated"`
 */
export const watchGovernorOwnerUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
  eventName: 'OwnerUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"ProposalCanceled"`
 */
export const watchGovernorProposalCanceledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
  eventName: 'ProposalCanceled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"ProposalCreated"`
 */
export const watchGovernorProposalCreatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
  eventName: 'ProposalCreated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"ProposalExecuted"`
 */
export const watchGovernorProposalExecutedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
  eventName: 'ProposalExecuted',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"ProposalQueued"`
 */
export const watchGovernorProposalQueuedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
  eventName: 'ProposalQueued',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"ProposalThresholdBpsUpdated"`
 */
export const watchGovernorProposalThresholdBpsUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: governorAbi,
    eventName: 'ProposalThresholdBpsUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"ProposalVetoed"`
 */
export const watchGovernorProposalVetoedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
  eventName: 'ProposalVetoed',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"QuorumVotesBpsUpdated"`
 */
export const watchGovernorQuorumVotesBpsUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: governorAbi,
    eventName: 'QuorumVotesBpsUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"Upgraded"`
 */
export const watchGovernorUpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
  eventName: 'Upgraded',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"VetoerUpdated"`
 */
export const watchGovernorVetoerUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
  eventName: 'VetoerUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"VoteCast"`
 */
export const watchGovernorVoteCastEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: governorAbi,
  eventName: 'VoteCast',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"VotingDelayUpdated"`
 */
export const watchGovernorVotingDelayUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: governorAbi,
    eventName: 'VotingDelayUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link governorAbi}__ and `eventName` set to `"VotingPeriodUpdated"`
 */
export const watchGovernorVotingPeriodUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: governorAbi,
    eventName: 'VotingPeriodUpdated',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__
 */
export const readL2MigrationDeployer = /*#__PURE__*/ createReadContract({
  abi: l2MigrationDeployerAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"applyL1ToL2Alias"`
 */
export const readL2MigrationDeployerApplyL1ToL2Alias = /*#__PURE__*/ createReadContract({
  abi: l2MigrationDeployerAbi,
  functionName: 'applyL1ToL2Alias',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"crossDomainDeployerToMigration"`
 */
export const readL2MigrationDeployerCrossDomainDeployerToMigration =
  /*#__PURE__*/ createReadContract({
    abi: l2MigrationDeployerAbi,
    functionName: 'crossDomainDeployerToMigration',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"crossDomainMessenger"`
 */
export const readL2MigrationDeployerCrossDomainMessenger =
  /*#__PURE__*/ createReadContract({
    abi: l2MigrationDeployerAbi,
    functionName: 'crossDomainMessenger',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"manager"`
 */
export const readL2MigrationDeployerManager = /*#__PURE__*/ createReadContract({
  abi: l2MigrationDeployerAbi,
  functionName: 'manager',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"merkleMinter"`
 */
export const readL2MigrationDeployerMerkleMinter = /*#__PURE__*/ createReadContract({
  abi: l2MigrationDeployerAbi,
  functionName: 'merkleMinter',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__
 */
export const writeL2MigrationDeployer = /*#__PURE__*/ createWriteContract({
  abi: l2MigrationDeployerAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"callMetadataRenderer"`
 */
export const writeL2MigrationDeployerCallMetadataRenderer =
  /*#__PURE__*/ createWriteContract({
    abi: l2MigrationDeployerAbi,
    functionName: 'callMetadataRenderer',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"deploy"`
 */
export const writeL2MigrationDeployerDeploy = /*#__PURE__*/ createWriteContract({
  abi: l2MigrationDeployerAbi,
  functionName: 'deploy',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"depositToTreasury"`
 */
export const writeL2MigrationDeployerDepositToTreasury =
  /*#__PURE__*/ createWriteContract({
    abi: l2MigrationDeployerAbi,
    functionName: 'depositToTreasury',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const writeL2MigrationDeployerRenounceOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: l2MigrationDeployerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"resetDeployment"`
 */
export const writeL2MigrationDeployerResetDeployment = /*#__PURE__*/ createWriteContract({
  abi: l2MigrationDeployerAbi,
  functionName: 'resetDeployment',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__
 */
export const simulateL2MigrationDeployer = /*#__PURE__*/ createSimulateContract({
  abi: l2MigrationDeployerAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"callMetadataRenderer"`
 */
export const simulateL2MigrationDeployerCallMetadataRenderer =
  /*#__PURE__*/ createSimulateContract({
    abi: l2MigrationDeployerAbi,
    functionName: 'callMetadataRenderer',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"deploy"`
 */
export const simulateL2MigrationDeployerDeploy = /*#__PURE__*/ createSimulateContract({
  abi: l2MigrationDeployerAbi,
  functionName: 'deploy',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"depositToTreasury"`
 */
export const simulateL2MigrationDeployerDepositToTreasury =
  /*#__PURE__*/ createSimulateContract({
    abi: l2MigrationDeployerAbi,
    functionName: 'depositToTreasury',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const simulateL2MigrationDeployerRenounceOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: l2MigrationDeployerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `functionName` set to `"resetDeployment"`
 */
export const simulateL2MigrationDeployerResetDeployment =
  /*#__PURE__*/ createSimulateContract({
    abi: l2MigrationDeployerAbi,
    functionName: 'resetDeployment',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link l2MigrationDeployerAbi}__
 */
export const watchL2MigrationDeployerEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: l2MigrationDeployerAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `eventName` set to `"DeployerSet"`
 */
export const watchL2MigrationDeployerDeployerSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: l2MigrationDeployerAbi,
    eventName: 'DeployerSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link l2MigrationDeployerAbi}__ and `eventName` set to `"OwnershipRenounced"`
 */
export const watchL2MigrationDeployerOwnershipRenouncedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: l2MigrationDeployerAbi,
    eventName: 'OwnershipRenounced',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__
 */
export const readManager = /*#__PURE__*/ createReadContract({ abi: managerAbi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"auctionImpl"`
 */
export const readManagerAuctionImpl = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'auctionImpl',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"builderRewardsRecipient"`
 */
export const readManagerBuilderRewardsRecipient = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'builderRewardsRecipient',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"contractVersion"`
 */
export const readManagerContractVersion = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'contractVersion',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"getAddresses"`
 */
export const readManagerGetAddresses = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'getAddresses',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"getDAOVersions"`
 */
export const readManagerGetDaoVersions = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'getDAOVersions',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"getLatestVersions"`
 */
export const readManagerGetLatestVersions = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'getLatestVersions',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"governorImpl"`
 */
export const readManagerGovernorImpl = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'governorImpl',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"isRegisteredUpgrade"`
 */
export const readManagerIsRegisteredUpgrade = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'isRegisteredUpgrade',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"metadataImpl"`
 */
export const readManagerMetadataImpl = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'metadataImpl',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"owner"`
 */
export const readManagerOwner = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const readManagerPendingOwner = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const readManagerProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"tokenImpl"`
 */
export const readManagerTokenImpl = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'tokenImpl',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"treasuryImpl"`
 */
export const readManagerTreasuryImpl = /*#__PURE__*/ createReadContract({
  abi: managerAbi,
  functionName: 'treasuryImpl',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerAbi}__
 */
export const writeManager = /*#__PURE__*/ createWriteContract({ abi: managerAbi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const writeManagerAcceptOwnership = /*#__PURE__*/ createWriteContract({
  abi: managerAbi,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const writeManagerCancelOwnershipTransfer = /*#__PURE__*/ createWriteContract({
  abi: managerAbi,
  functionName: 'cancelOwnershipTransfer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"deploy"`
 */
export const writeManagerDeploy = /*#__PURE__*/ createWriteContract({
  abi: managerAbi,
  functionName: 'deploy',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"initialize"`
 */
export const writeManagerInitialize = /*#__PURE__*/ createWriteContract({
  abi: managerAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"registerUpgrade"`
 */
export const writeManagerRegisterUpgrade = /*#__PURE__*/ createWriteContract({
  abi: managerAbi,
  functionName: 'registerUpgrade',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"removeUpgrade"`
 */
export const writeManagerRemoveUpgrade = /*#__PURE__*/ createWriteContract({
  abi: managerAbi,
  functionName: 'removeUpgrade',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const writeManagerSafeTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: managerAbi,
  functionName: 'safeTransferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"setMetadataRenderer"`
 */
export const writeManagerSetMetadataRenderer = /*#__PURE__*/ createWriteContract({
  abi: managerAbi,
  functionName: 'setMetadataRenderer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const writeManagerTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: managerAbi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const writeManagerUpgradeTo = /*#__PURE__*/ createWriteContract({
  abi: managerAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const writeManagerUpgradeToAndCall = /*#__PURE__*/ createWriteContract({
  abi: managerAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerAbi}__
 */
export const simulateManager = /*#__PURE__*/ createSimulateContract({ abi: managerAbi })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const simulateManagerAcceptOwnership = /*#__PURE__*/ createSimulateContract({
  abi: managerAbi,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const simulateManagerCancelOwnershipTransfer =
  /*#__PURE__*/ createSimulateContract({
    abi: managerAbi,
    functionName: 'cancelOwnershipTransfer',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"deploy"`
 */
export const simulateManagerDeploy = /*#__PURE__*/ createSimulateContract({
  abi: managerAbi,
  functionName: 'deploy',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateManagerInitialize = /*#__PURE__*/ createSimulateContract({
  abi: managerAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"registerUpgrade"`
 */
export const simulateManagerRegisterUpgrade = /*#__PURE__*/ createSimulateContract({
  abi: managerAbi,
  functionName: 'registerUpgrade',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"removeUpgrade"`
 */
export const simulateManagerRemoveUpgrade = /*#__PURE__*/ createSimulateContract({
  abi: managerAbi,
  functionName: 'removeUpgrade',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const simulateManagerSafeTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: managerAbi,
  functionName: 'safeTransferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"setMetadataRenderer"`
 */
export const simulateManagerSetMetadataRenderer = /*#__PURE__*/ createSimulateContract({
  abi: managerAbi,
  functionName: 'setMetadataRenderer',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const simulateManagerTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: managerAbi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const simulateManagerUpgradeTo = /*#__PURE__*/ createSimulateContract({
  abi: managerAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const simulateManagerUpgradeToAndCall = /*#__PURE__*/ createSimulateContract({
  abi: managerAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerAbi}__
 */
export const watchManagerEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerAbi}__ and `eventName` set to `"DAODeployed"`
 */
export const watchManagerDaoDeployedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerAbi,
  eventName: 'DAODeployed',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerAbi}__ and `eventName` set to `"Initialized"`
 */
export const watchManagerInitializedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerAbi,
  eventName: 'Initialized',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerAbi}__ and `eventName` set to `"MetadataRendererUpdated"`
 */
export const watchManagerMetadataRendererUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: managerAbi,
    eventName: 'MetadataRendererUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerAbi}__ and `eventName` set to `"OwnerCanceled"`
 */
export const watchManagerOwnerCanceledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerAbi,
  eventName: 'OwnerCanceled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerAbi}__ and `eventName` set to `"OwnerPending"`
 */
export const watchManagerOwnerPendingEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerAbi,
  eventName: 'OwnerPending',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerAbi}__ and `eventName` set to `"OwnerUpdated"`
 */
export const watchManagerOwnerUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerAbi,
  eventName: 'OwnerUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerAbi}__ and `eventName` set to `"UpgradeRegistered"`
 */
export const watchManagerUpgradeRegisteredEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerAbi,
  eventName: 'UpgradeRegistered',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerAbi}__ and `eventName` set to `"UpgradeRemoved"`
 */
export const watchManagerUpgradeRemovedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerAbi,
  eventName: 'UpgradeRemoved',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerAbi}__ and `eventName` set to `"Upgraded"`
 */
export const watchManagerUpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerAbi,
  eventName: 'Upgraded',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__
 */
export const readManagerV2 = /*#__PURE__*/ createReadContract({ abi: managerV2Abi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"auctionImpl"`
 */
export const readManagerV2AuctionImpl = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'auctionImpl',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"builderRewardsRecipient"`
 */
export const readManagerV2BuilderRewardsRecipient = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'builderRewardsRecipient',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"contractVersion"`
 */
export const readManagerV2ContractVersion = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'contractVersion',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"getAddresses"`
 */
export const readManagerV2GetAddresses = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'getAddresses',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"getDAOVersions"`
 */
export const readManagerV2GetDaoVersions = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'getDAOVersions',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"getLatestVersions"`
 */
export const readManagerV2GetLatestVersions = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'getLatestVersions',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"governorImpl"`
 */
export const readManagerV2GovernorImpl = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'governorImpl',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"isRegisteredUpgrade"`
 */
export const readManagerV2IsRegisteredUpgrade = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'isRegisteredUpgrade',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"metadataImpl"`
 */
export const readManagerV2MetadataImpl = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'metadataImpl',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"owner"`
 */
export const readManagerV2Owner = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"pendingOwner"`
 */
export const readManagerV2PendingOwner = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"proxiableUUID"`
 */
export const readManagerV2ProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"tokenImpl"`
 */
export const readManagerV2TokenImpl = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'tokenImpl',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"treasuryImpl"`
 */
export const readManagerV2TreasuryImpl = /*#__PURE__*/ createReadContract({
  abi: managerV2Abi,
  functionName: 'treasuryImpl',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerV2Abi}__
 */
export const writeManagerV2 = /*#__PURE__*/ createWriteContract({ abi: managerV2Abi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"acceptOwnership"`
 */
export const writeManagerV2AcceptOwnership = /*#__PURE__*/ createWriteContract({
  abi: managerV2Abi,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const writeManagerV2CancelOwnershipTransfer = /*#__PURE__*/ createWriteContract({
  abi: managerV2Abi,
  functionName: 'cancelOwnershipTransfer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"deploy"`
 */
export const writeManagerV2Deploy = /*#__PURE__*/ createWriteContract({
  abi: managerV2Abi,
  functionName: 'deploy',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"initialize"`
 */
export const writeManagerV2Initialize = /*#__PURE__*/ createWriteContract({
  abi: managerV2Abi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"registerUpgrade"`
 */
export const writeManagerV2RegisterUpgrade = /*#__PURE__*/ createWriteContract({
  abi: managerV2Abi,
  functionName: 'registerUpgrade',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"removeUpgrade"`
 */
export const writeManagerV2RemoveUpgrade = /*#__PURE__*/ createWriteContract({
  abi: managerV2Abi,
  functionName: 'removeUpgrade',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const writeManagerV2SafeTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: managerV2Abi,
  functionName: 'safeTransferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"setMetadataRenderer"`
 */
export const writeManagerV2SetMetadataRenderer = /*#__PURE__*/ createWriteContract({
  abi: managerV2Abi,
  functionName: 'setMetadataRenderer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const writeManagerV2TransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: managerV2Abi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"upgradeTo"`
 */
export const writeManagerV2UpgradeTo = /*#__PURE__*/ createWriteContract({
  abi: managerV2Abi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const writeManagerV2UpgradeToAndCall = /*#__PURE__*/ createWriteContract({
  abi: managerV2Abi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerV2Abi}__
 */
export const simulateManagerV2 = /*#__PURE__*/ createSimulateContract({
  abi: managerV2Abi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"acceptOwnership"`
 */
export const simulateManagerV2AcceptOwnership = /*#__PURE__*/ createSimulateContract({
  abi: managerV2Abi,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const simulateManagerV2CancelOwnershipTransfer =
  /*#__PURE__*/ createSimulateContract({
    abi: managerV2Abi,
    functionName: 'cancelOwnershipTransfer',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"deploy"`
 */
export const simulateManagerV2Deploy = /*#__PURE__*/ createSimulateContract({
  abi: managerV2Abi,
  functionName: 'deploy',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"initialize"`
 */
export const simulateManagerV2Initialize = /*#__PURE__*/ createSimulateContract({
  abi: managerV2Abi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"registerUpgrade"`
 */
export const simulateManagerV2RegisterUpgrade = /*#__PURE__*/ createSimulateContract({
  abi: managerV2Abi,
  functionName: 'registerUpgrade',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"removeUpgrade"`
 */
export const simulateManagerV2RemoveUpgrade = /*#__PURE__*/ createSimulateContract({
  abi: managerV2Abi,
  functionName: 'removeUpgrade',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const simulateManagerV2SafeTransferOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: managerV2Abi,
    functionName: 'safeTransferOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"setMetadataRenderer"`
 */
export const simulateManagerV2SetMetadataRenderer = /*#__PURE__*/ createSimulateContract({
  abi: managerV2Abi,
  functionName: 'setMetadataRenderer',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const simulateManagerV2TransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: managerV2Abi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"upgradeTo"`
 */
export const simulateManagerV2UpgradeTo = /*#__PURE__*/ createSimulateContract({
  abi: managerV2Abi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link managerV2Abi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const simulateManagerV2UpgradeToAndCall = /*#__PURE__*/ createSimulateContract({
  abi: managerV2Abi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerV2Abi}__
 */
export const watchManagerV2Event = /*#__PURE__*/ createWatchContractEvent({
  abi: managerV2Abi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerV2Abi}__ and `eventName` set to `"DAODeployed"`
 */
export const watchManagerV2DaoDeployedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerV2Abi,
  eventName: 'DAODeployed',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerV2Abi}__ and `eventName` set to `"Initialized"`
 */
export const watchManagerV2InitializedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerV2Abi,
  eventName: 'Initialized',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerV2Abi}__ and `eventName` set to `"MetadataRendererUpdated"`
 */
export const watchManagerV2MetadataRendererUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: managerV2Abi,
    eventName: 'MetadataRendererUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerV2Abi}__ and `eventName` set to `"OwnerCanceled"`
 */
export const watchManagerV2OwnerCanceledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerV2Abi,
  eventName: 'OwnerCanceled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerV2Abi}__ and `eventName` set to `"OwnerPending"`
 */
export const watchManagerV2OwnerPendingEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerV2Abi,
  eventName: 'OwnerPending',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerV2Abi}__ and `eventName` set to `"OwnerUpdated"`
 */
export const watchManagerV2OwnerUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerV2Abi,
  eventName: 'OwnerUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerV2Abi}__ and `eventName` set to `"UpgradeRegistered"`
 */
export const watchManagerV2UpgradeRegisteredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: managerV2Abi,
    eventName: 'UpgradeRegistered',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerV2Abi}__ and `eventName` set to `"UpgradeRemoved"`
 */
export const watchManagerV2UpgradeRemovedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerV2Abi,
  eventName: 'UpgradeRemoved',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link managerV2Abi}__ and `eventName` set to `"Upgraded"`
 */
export const watchManagerV2UpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: managerV2Abi,
  eventName: 'Upgraded',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__
 */
export const readMerklePropertyMetadata = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const readMerklePropertyMetadataUpgradeInterfaceVersion =
  /*#__PURE__*/ createReadContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"attributeMerkleRoot"`
 */
export const readMerklePropertyMetadataAttributeMerkleRoot =
  /*#__PURE__*/ createReadContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'attributeMerkleRoot',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"contractImage"`
 */
export const readMerklePropertyMetadataContractImage = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'contractImage',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"contractURI"`
 */
export const readMerklePropertyMetadataContractUri = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'contractURI',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"description"`
 */
export const readMerklePropertyMetadataDescription = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'description',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"getAdditionalTokenProperties"`
 */
export const readMerklePropertyMetadataGetAdditionalTokenProperties =
  /*#__PURE__*/ createReadContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'getAdditionalTokenProperties',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"getAttributes"`
 */
export const readMerklePropertyMetadataGetAttributes = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'getAttributes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"getRawAttributes"`
 */
export const readMerklePropertyMetadataGetRawAttributes =
  /*#__PURE__*/ createReadContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'getRawAttributes',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"ipfsDataCount"`
 */
export const readMerklePropertyMetadataIpfsDataCount = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'ipfsDataCount',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"itemsCount"`
 */
export const readMerklePropertyMetadataItemsCount = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'itemsCount',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"owner"`
 */
export const readMerklePropertyMetadataOwner = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"projectURI"`
 */
export const readMerklePropertyMetadataProjectUri = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'projectURI',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"propertiesCount"`
 */
export const readMerklePropertyMetadataPropertiesCount = /*#__PURE__*/ createReadContract(
  { abi: merklePropertyMetadataAbi, functionName: 'propertiesCount' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const readMerklePropertyMetadataProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"rendererBase"`
 */
export const readMerklePropertyMetadataRendererBase = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'rendererBase',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const readMerklePropertyMetadataSupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"token"`
 */
export const readMerklePropertyMetadataToken = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'token',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"tokenURI"`
 */
export const readMerklePropertyMetadataTokenUri = /*#__PURE__*/ createReadContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__
 */
export const writeMerklePropertyMetadata = /*#__PURE__*/ createWriteContract({
  abi: merklePropertyMetadataAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"addProperties"`
 */
export const writeMerklePropertyMetadataAddProperties = /*#__PURE__*/ createWriteContract(
  { abi: merklePropertyMetadataAbi, functionName: 'addProperties' },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"deleteAndRecreateProperties"`
 */
export const writeMerklePropertyMetadataDeleteAndRecreateProperties =
  /*#__PURE__*/ createWriteContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'deleteAndRecreateProperties',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"initialize"`
 */
export const writeMerklePropertyMetadataInitialize = /*#__PURE__*/ createWriteContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"onMinted"`
 */
export const writeMerklePropertyMetadataOnMinted = /*#__PURE__*/ createWriteContract({
  abi: merklePropertyMetadataAbi,
  functionName: 'onMinted',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"setAdditionalTokenProperties"`
 */
export const writeMerklePropertyMetadataSetAdditionalTokenProperties =
  /*#__PURE__*/ createWriteContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'setAdditionalTokenProperties',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"setAttributeMerkleRoot"`
 */
export const writeMerklePropertyMetadataSetAttributeMerkleRoot =
  /*#__PURE__*/ createWriteContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'setAttributeMerkleRoot',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"setAttributes"`
 */
export const writeMerklePropertyMetadataSetAttributes = /*#__PURE__*/ createWriteContract(
  { abi: merklePropertyMetadataAbi, functionName: 'setAttributes' },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"setManyAttributes"`
 */
export const writeMerklePropertyMetadataSetManyAttributes =
  /*#__PURE__*/ createWriteContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'setManyAttributes',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"updateContractImage"`
 */
export const writeMerklePropertyMetadataUpdateContractImage =
  /*#__PURE__*/ createWriteContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'updateContractImage',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"updateDescription"`
 */
export const writeMerklePropertyMetadataUpdateDescription =
  /*#__PURE__*/ createWriteContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'updateDescription',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"updateProjectURI"`
 */
export const writeMerklePropertyMetadataUpdateProjectUri =
  /*#__PURE__*/ createWriteContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'updateProjectURI',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"updateRendererBase"`
 */
export const writeMerklePropertyMetadataUpdateRendererBase =
  /*#__PURE__*/ createWriteContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'updateRendererBase',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const writeMerklePropertyMetadataUpgradeToAndCall =
  /*#__PURE__*/ createWriteContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__
 */
export const simulateMerklePropertyMetadata = /*#__PURE__*/ createSimulateContract({
  abi: merklePropertyMetadataAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"addProperties"`
 */
export const simulateMerklePropertyMetadataAddProperties =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'addProperties',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"deleteAndRecreateProperties"`
 */
export const simulateMerklePropertyMetadataDeleteAndRecreateProperties =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'deleteAndRecreateProperties',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateMerklePropertyMetadataInitialize =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"onMinted"`
 */
export const simulateMerklePropertyMetadataOnMinted =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'onMinted',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"setAdditionalTokenProperties"`
 */
export const simulateMerklePropertyMetadataSetAdditionalTokenProperties =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'setAdditionalTokenProperties',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"setAttributeMerkleRoot"`
 */
export const simulateMerklePropertyMetadataSetAttributeMerkleRoot =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'setAttributeMerkleRoot',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"setAttributes"`
 */
export const simulateMerklePropertyMetadataSetAttributes =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'setAttributes',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"setManyAttributes"`
 */
export const simulateMerklePropertyMetadataSetManyAttributes =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'setManyAttributes',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"updateContractImage"`
 */
export const simulateMerklePropertyMetadataUpdateContractImage =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'updateContractImage',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"updateDescription"`
 */
export const simulateMerklePropertyMetadataUpdateDescription =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'updateDescription',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"updateProjectURI"`
 */
export const simulateMerklePropertyMetadataUpdateProjectUri =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'updateProjectURI',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"updateRendererBase"`
 */
export const simulateMerklePropertyMetadataUpdateRendererBase =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'updateRendererBase',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const simulateMerklePropertyMetadataUpgradeToAndCall =
  /*#__PURE__*/ createSimulateContract({
    abi: merklePropertyMetadataAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link merklePropertyMetadataAbi}__
 */
export const watchMerklePropertyMetadataEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: merklePropertyMetadataAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `eventName` set to `"AdditionalTokenPropertiesSet"`
 */
export const watchMerklePropertyMetadataAdditionalTokenPropertiesSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: merklePropertyMetadataAbi,
    eventName: 'AdditionalTokenPropertiesSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `eventName` set to `"ContractImageUpdated"`
 */
export const watchMerklePropertyMetadataContractImageUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: merklePropertyMetadataAbi,
    eventName: 'ContractImageUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `eventName` set to `"DescriptionUpdated"`
 */
export const watchMerklePropertyMetadataDescriptionUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: merklePropertyMetadataAbi,
    eventName: 'DescriptionUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `eventName` set to `"Initialized"`
 */
export const watchMerklePropertyMetadataInitializedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: merklePropertyMetadataAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `eventName` set to `"PropertyAdded"`
 */
export const watchMerklePropertyMetadataPropertyAddedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: merklePropertyMetadataAbi,
    eventName: 'PropertyAdded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `eventName` set to `"RendererBaseUpdated"`
 */
export const watchMerklePropertyMetadataRendererBaseUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: merklePropertyMetadataAbi,
    eventName: 'RendererBaseUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `eventName` set to `"Upgraded"`
 */
export const watchMerklePropertyMetadataUpgradedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: merklePropertyMetadataAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link merklePropertyMetadataAbi}__ and `eventName` set to `"WebsiteURIUpdated"`
 */
export const watchMerklePropertyMetadataWebsiteUriUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: merklePropertyMetadataAbi,
    eventName: 'WebsiteURIUpdated',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__
 */
export const readMessenger = /*#__PURE__*/ createReadContract({ abi: messengerAbi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"MESSAGE_VERSION"`
 */
export const readMessengerMessageVersion = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'MESSAGE_VERSION',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"MIN_GAS_CALLDATA_OVERHEAD"`
 */
export const readMessengerMinGasCalldataOverhead = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'MIN_GAS_CALLDATA_OVERHEAD',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"MIN_GAS_DYNAMIC_OVERHEAD_DENOMINATOR"`
 */
export const readMessengerMinGasDynamicOverheadDenominator =
  /*#__PURE__*/ createReadContract({
    abi: messengerAbi,
    functionName: 'MIN_GAS_DYNAMIC_OVERHEAD_DENOMINATOR',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"MIN_GAS_DYNAMIC_OVERHEAD_NUMERATOR"`
 */
export const readMessengerMinGasDynamicOverheadNumerator =
  /*#__PURE__*/ createReadContract({
    abi: messengerAbi,
    functionName: 'MIN_GAS_DYNAMIC_OVERHEAD_NUMERATOR',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"OTHER_MESSENGER"`
 */
export const readMessengerOtherMessenger = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'OTHER_MESSENGER',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"PORTAL"`
 */
export const readMessengerPortal = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'PORTAL',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"RELAY_CALL_OVERHEAD"`
 */
export const readMessengerRelayCallOverhead = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'RELAY_CALL_OVERHEAD',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"RELAY_CONSTANT_OVERHEAD"`
 */
export const readMessengerRelayConstantOverhead = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'RELAY_CONSTANT_OVERHEAD',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"RELAY_GAS_CHECK_BUFFER"`
 */
export const readMessengerRelayGasCheckBuffer = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'RELAY_GAS_CHECK_BUFFER',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"RELAY_RESERVED_GAS"`
 */
export const readMessengerRelayReservedGas = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'RELAY_RESERVED_GAS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"baseGas"`
 */
export const readMessengerBaseGas = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'baseGas',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"failedMessages"`
 */
export const readMessengerFailedMessages = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'failedMessages',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"messageNonce"`
 */
export const readMessengerMessageNonce = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'messageNonce',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"successfulMessages"`
 */
export const readMessengerSuccessfulMessages = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'successfulMessages',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"version"`
 */
export const readMessengerVersion = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'version',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"xDomainMessageSender"`
 */
export const readMessengerXDomainMessageSender = /*#__PURE__*/ createReadContract({
  abi: messengerAbi,
  functionName: 'xDomainMessageSender',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link messengerAbi}__
 */
export const writeMessenger = /*#__PURE__*/ createWriteContract({ abi: messengerAbi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"initialize"`
 */
export const writeMessengerInitialize = /*#__PURE__*/ createWriteContract({
  abi: messengerAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"relayMessage"`
 */
export const writeMessengerRelayMessage = /*#__PURE__*/ createWriteContract({
  abi: messengerAbi,
  functionName: 'relayMessage',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"sendMessage"`
 */
export const writeMessengerSendMessage = /*#__PURE__*/ createWriteContract({
  abi: messengerAbi,
  functionName: 'sendMessage',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link messengerAbi}__
 */
export const simulateMessenger = /*#__PURE__*/ createSimulateContract({
  abi: messengerAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateMessengerInitialize = /*#__PURE__*/ createSimulateContract({
  abi: messengerAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"relayMessage"`
 */
export const simulateMessengerRelayMessage = /*#__PURE__*/ createSimulateContract({
  abi: messengerAbi,
  functionName: 'relayMessage',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link messengerAbi}__ and `functionName` set to `"sendMessage"`
 */
export const simulateMessengerSendMessage = /*#__PURE__*/ createSimulateContract({
  abi: messengerAbi,
  functionName: 'sendMessage',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link messengerAbi}__
 */
export const watchMessengerEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: messengerAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link messengerAbi}__ and `eventName` set to `"FailedRelayedMessage"`
 */
export const watchMessengerFailedRelayedMessageEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: messengerAbi,
    eventName: 'FailedRelayedMessage',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link messengerAbi}__ and `eventName` set to `"Initialized"`
 */
export const watchMessengerInitializedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: messengerAbi,
  eventName: 'Initialized',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link messengerAbi}__ and `eventName` set to `"RelayedMessage"`
 */
export const watchMessengerRelayedMessageEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: messengerAbi,
  eventName: 'RelayedMessage',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link messengerAbi}__ and `eventName` set to `"SentMessage"`
 */
export const watchMessengerSentMessageEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: messengerAbi,
  eventName: 'SentMessage',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link messengerAbi}__ and `eventName` set to `"SentMessageExtension1"`
 */
export const watchMessengerSentMessageExtension1Event =
  /*#__PURE__*/ createWatchContractEvent({
    abi: messengerAbi,
    eventName: 'SentMessageExtension1',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__
 */
export const readMetadata = /*#__PURE__*/ createReadContract({ abi: metadataAbi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"attributes"`
 */
export const readMetadataAttributes = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'attributes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"contractImage"`
 */
export const readMetadataContractImage = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'contractImage',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"contractURI"`
 */
export const readMetadataContractUri = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'contractURI',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"contractVersion"`
 */
export const readMetadataContractVersion = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'contractVersion',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"description"`
 */
export const readMetadataDescription = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'description',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"getAttributes"`
 */
export const readMetadataGetAttributes = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'getAttributes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"ipfsData"`
 */
export const readMetadataIpfsData = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'ipfsData',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"ipfsDataCount"`
 */
export const readMetadataIpfsDataCount = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'ipfsDataCount',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"itemsCount"`
 */
export const readMetadataItemsCount = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'itemsCount',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"owner"`
 */
export const readMetadataOwner = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"projectURI"`
 */
export const readMetadataProjectUri = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'projectURI',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"properties"`
 */
export const readMetadataProperties = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'properties',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"propertiesCount"`
 */
export const readMetadataPropertiesCount = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'propertiesCount',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const readMetadataProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"rendererBase"`
 */
export const readMetadataRendererBase = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'rendererBase',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"settings"`
 */
export const readMetadataSettings = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'settings',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"token"`
 */
export const readMetadataToken = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'token',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"tokenURI"`
 */
export const readMetadataTokenUri = /*#__PURE__*/ createReadContract({
  abi: metadataAbi,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link metadataAbi}__
 */
export const writeMetadata = /*#__PURE__*/ createWriteContract({ abi: metadataAbi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"addProperties"`
 */
export const writeMetadataAddProperties = /*#__PURE__*/ createWriteContract({
  abi: metadataAbi,
  functionName: 'addProperties',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"deleteAndRecreateProperties"`
 */
export const writeMetadataDeleteAndRecreateProperties = /*#__PURE__*/ createWriteContract(
  { abi: metadataAbi, functionName: 'deleteAndRecreateProperties' },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"initialize"`
 */
export const writeMetadataInitialize = /*#__PURE__*/ createWriteContract({
  abi: metadataAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"onMinted"`
 */
export const writeMetadataOnMinted = /*#__PURE__*/ createWriteContract({
  abi: metadataAbi,
  functionName: 'onMinted',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"setAdditionalTokenProperties"`
 */
export const writeMetadataSetAdditionalTokenProperties =
  /*#__PURE__*/ createWriteContract({
    abi: metadataAbi,
    functionName: 'setAdditionalTokenProperties',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"updateContractImage"`
 */
export const writeMetadataUpdateContractImage = /*#__PURE__*/ createWriteContract({
  abi: metadataAbi,
  functionName: 'updateContractImage',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"updateDescription"`
 */
export const writeMetadataUpdateDescription = /*#__PURE__*/ createWriteContract({
  abi: metadataAbi,
  functionName: 'updateDescription',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"updateProjectURI"`
 */
export const writeMetadataUpdateProjectUri = /*#__PURE__*/ createWriteContract({
  abi: metadataAbi,
  functionName: 'updateProjectURI',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"updateRendererBase"`
 */
export const writeMetadataUpdateRendererBase = /*#__PURE__*/ createWriteContract({
  abi: metadataAbi,
  functionName: 'updateRendererBase',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const writeMetadataUpgradeTo = /*#__PURE__*/ createWriteContract({
  abi: metadataAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const writeMetadataUpgradeToAndCall = /*#__PURE__*/ createWriteContract({
  abi: metadataAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link metadataAbi}__
 */
export const simulateMetadata = /*#__PURE__*/ createSimulateContract({ abi: metadataAbi })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"addProperties"`
 */
export const simulateMetadataAddProperties = /*#__PURE__*/ createSimulateContract({
  abi: metadataAbi,
  functionName: 'addProperties',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"deleteAndRecreateProperties"`
 */
export const simulateMetadataDeleteAndRecreateProperties =
  /*#__PURE__*/ createSimulateContract({
    abi: metadataAbi,
    functionName: 'deleteAndRecreateProperties',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateMetadataInitialize = /*#__PURE__*/ createSimulateContract({
  abi: metadataAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"onMinted"`
 */
export const simulateMetadataOnMinted = /*#__PURE__*/ createSimulateContract({
  abi: metadataAbi,
  functionName: 'onMinted',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"setAdditionalTokenProperties"`
 */
export const simulateMetadataSetAdditionalTokenProperties =
  /*#__PURE__*/ createSimulateContract({
    abi: metadataAbi,
    functionName: 'setAdditionalTokenProperties',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"updateContractImage"`
 */
export const simulateMetadataUpdateContractImage = /*#__PURE__*/ createSimulateContract({
  abi: metadataAbi,
  functionName: 'updateContractImage',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"updateDescription"`
 */
export const simulateMetadataUpdateDescription = /*#__PURE__*/ createSimulateContract({
  abi: metadataAbi,
  functionName: 'updateDescription',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"updateProjectURI"`
 */
export const simulateMetadataUpdateProjectUri = /*#__PURE__*/ createSimulateContract({
  abi: metadataAbi,
  functionName: 'updateProjectURI',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"updateRendererBase"`
 */
export const simulateMetadataUpdateRendererBase = /*#__PURE__*/ createSimulateContract({
  abi: metadataAbi,
  functionName: 'updateRendererBase',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const simulateMetadataUpgradeTo = /*#__PURE__*/ createSimulateContract({
  abi: metadataAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link metadataAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const simulateMetadataUpgradeToAndCall = /*#__PURE__*/ createSimulateContract({
  abi: metadataAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link metadataAbi}__
 */
export const watchMetadataEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: metadataAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link metadataAbi}__ and `eventName` set to `"AdditionalTokenPropertiesSet"`
 */
export const watchMetadataAdditionalTokenPropertiesSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: metadataAbi,
    eventName: 'AdditionalTokenPropertiesSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link metadataAbi}__ and `eventName` set to `"ContractImageUpdated"`
 */
export const watchMetadataContractImageUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: metadataAbi,
    eventName: 'ContractImageUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link metadataAbi}__ and `eventName` set to `"DescriptionUpdated"`
 */
export const watchMetadataDescriptionUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: metadataAbi,
    eventName: 'DescriptionUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link metadataAbi}__ and `eventName` set to `"Initialized"`
 */
export const watchMetadataInitializedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: metadataAbi,
  eventName: 'Initialized',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link metadataAbi}__ and `eventName` set to `"PropertyAdded"`
 */
export const watchMetadataPropertyAddedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: metadataAbi,
  eventName: 'PropertyAdded',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link metadataAbi}__ and `eventName` set to `"RendererBaseUpdated"`
 */
export const watchMetadataRendererBaseUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: metadataAbi,
    eventName: 'RendererBaseUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link metadataAbi}__ and `eventName` set to `"Upgraded"`
 */
export const watchMetadataUpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: metadataAbi,
  eventName: 'Upgraded',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link metadataAbi}__ and `eventName` set to `"WebsiteURIUpdated"`
 */
export const watchMetadataWebsiteUriUpdatedEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: metadataAbi, eventName: 'WebsiteURIUpdated' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__
 */
export const readToken = /*#__PURE__*/ createReadContract({ abi: tokenAbi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const readTokenDomainSeparator = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'DOMAIN_SEPARATOR',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"auction"`
 */
export const readTokenAuction = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'auction',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const readTokenBalanceOf = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"contractURI"`
 */
export const readTokenContractUri = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'contractURI',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"contractVersion"`
 */
export const readTokenContractVersion = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'contractVersion',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"delegates"`
 */
export const readTokenDelegates = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'delegates',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"getApproved"`
 */
export const readTokenGetApproved = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'getApproved',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"getFounder"`
 */
export const readTokenGetFounder = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'getFounder',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"getFounders"`
 */
export const readTokenGetFounders = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'getFounders',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"getPastVotes"`
 */
export const readTokenGetPastVotes = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'getPastVotes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"getScheduledRecipient"`
 */
export const readTokenGetScheduledRecipient = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'getScheduledRecipient',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"getVotes"`
 */
export const readTokenGetVotes = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'getVotes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const readTokenIsApprovedForAll = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'isApprovedForAll',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"isMinter"`
 */
export const readTokenIsMinter = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'isMinter',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"metadataRenderer"`
 */
export const readTokenMetadataRenderer = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'metadataRenderer',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"minter"`
 */
export const readTokenMinter = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'minter',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"name"`
 */
export const readTokenName = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"nonce"`
 */
export const readTokenNonce = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'nonce',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"owner"`
 */
export const readTokenOwner = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"ownerOf"`
 */
export const readTokenOwnerOf = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const readTokenPendingOwner = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const readTokenProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"remainingTokensInReserve"`
 */
export const readTokenRemainingTokensInReserve = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'remainingTokensInReserve',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"reservedUntilTokenId"`
 */
export const readTokenReservedUntilTokenId = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'reservedUntilTokenId',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const readTokenSupportsInterface = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'supportsInterface',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"symbol"`
 */
export const readTokenSymbol = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"tokenURI"`
 */
export const readTokenTokenUri = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"totalFounderOwnership"`
 */
export const readTokenTotalFounderOwnership = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'totalFounderOwnership',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"totalFounders"`
 */
export const readTokenTotalFounders = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'totalFounders',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"totalSupply"`
 */
export const readTokenTotalSupply = /*#__PURE__*/ createReadContract({
  abi: tokenAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__
 */
export const writeToken = /*#__PURE__*/ createWriteContract({ abi: tokenAbi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const writeTokenAcceptOwnership = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"approve"`
 */
export const writeTokenApprove = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"burn"`
 */
export const writeTokenBurn = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const writeTokenCancelOwnershipTransfer = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'cancelOwnershipTransfer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"delegate"`
 */
export const writeTokenDelegate = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'delegate',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"delegateBySig"`
 */
export const writeTokenDelegateBySig = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'delegateBySig',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"initialize"`
 */
export const writeTokenInitialize = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mint"`
 */
export const writeTokenMint = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mintBatchTo"`
 */
export const writeTokenMintBatchTo = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'mintBatchTo',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mintFromReserveTo"`
 */
export const writeTokenMintFromReserveTo = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'mintFromReserveTo',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mintTo"`
 */
export const writeTokenMintTo = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'mintTo',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"onFirstAuctionStarted"`
 */
export const writeTokenOnFirstAuctionStarted = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'onFirstAuctionStarted',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const writeTokenSafeTransferFrom = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'safeTransferFrom',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const writeTokenSafeTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'safeTransferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const writeTokenSetApprovalForAll = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'setApprovalForAll',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"setMetadataRenderer"`
 */
export const writeTokenSetMetadataRenderer = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'setMetadataRenderer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"setReservedUntilTokenId"`
 */
export const writeTokenSetReservedUntilTokenId = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'setReservedUntilTokenId',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const writeTokenTransferFrom = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const writeTokenTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"updateFounders"`
 */
export const writeTokenUpdateFounders = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'updateFounders',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"updateMinters"`
 */
export const writeTokenUpdateMinters = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'updateMinters',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const writeTokenUpgradeTo = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const writeTokenUpgradeToAndCall = /*#__PURE__*/ createWriteContract({
  abi: tokenAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__
 */
export const simulateToken = /*#__PURE__*/ createSimulateContract({ abi: tokenAbi })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const simulateTokenAcceptOwnership = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"approve"`
 */
export const simulateTokenApprove = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"burn"`
 */
export const simulateTokenBurn = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const simulateTokenCancelOwnershipTransfer = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'cancelOwnershipTransfer',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"delegate"`
 */
export const simulateTokenDelegate = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'delegate',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"delegateBySig"`
 */
export const simulateTokenDelegateBySig = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'delegateBySig',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateTokenInitialize = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mint"`
 */
export const simulateTokenMint = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mintBatchTo"`
 */
export const simulateTokenMintBatchTo = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'mintBatchTo',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mintFromReserveTo"`
 */
export const simulateTokenMintFromReserveTo = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'mintFromReserveTo',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mintTo"`
 */
export const simulateTokenMintTo = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'mintTo',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"onFirstAuctionStarted"`
 */
export const simulateTokenOnFirstAuctionStarted = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'onFirstAuctionStarted',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const simulateTokenSafeTransferFrom = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'safeTransferFrom',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const simulateTokenSafeTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'safeTransferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const simulateTokenSetApprovalForAll = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'setApprovalForAll',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"setMetadataRenderer"`
 */
export const simulateTokenSetMetadataRenderer = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'setMetadataRenderer',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"setReservedUntilTokenId"`
 */
export const simulateTokenSetReservedUntilTokenId = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'setReservedUntilTokenId',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const simulateTokenTransferFrom = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const simulateTokenTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"updateFounders"`
 */
export const simulateTokenUpdateFounders = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'updateFounders',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"updateMinters"`
 */
export const simulateTokenUpdateMinters = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'updateMinters',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const simulateTokenUpgradeTo = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const simulateTokenUpgradeToAndCall = /*#__PURE__*/ createSimulateContract({
  abi: tokenAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__
 */
export const watchTokenEvent = /*#__PURE__*/ createWatchContractEvent({ abi: tokenAbi })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"Approval"`
 */
export const watchTokenApprovalEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: tokenAbi,
  eventName: 'Approval',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const watchTokenApprovalForAllEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: tokenAbi,
  eventName: 'ApprovalForAll',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"DelegateChanged"`
 */
export const watchTokenDelegateChangedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: tokenAbi,
  eventName: 'DelegateChanged',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"DelegateVotesChanged"`
 */
export const watchTokenDelegateVotesChangedEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: tokenAbi, eventName: 'DelegateVotesChanged' },
)

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"FounderAllocationsCleared"`
 */
export const watchTokenFounderAllocationsClearedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: tokenAbi,
    eventName: 'FounderAllocationsCleared',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"Initialized"`
 */
export const watchTokenInitializedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: tokenAbi,
  eventName: 'Initialized',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"MetadataRendererUpdated"`
 */
export const watchTokenMetadataRendererUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: tokenAbi,
    eventName: 'MetadataRendererUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"MintScheduled"`
 */
export const watchTokenMintScheduledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: tokenAbi,
  eventName: 'MintScheduled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"MintUnscheduled"`
 */
export const watchTokenMintUnscheduledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: tokenAbi,
  eventName: 'MintUnscheduled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"MinterUpdated"`
 */
export const watchTokenMinterUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: tokenAbi,
  eventName: 'MinterUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"OwnerCanceled"`
 */
export const watchTokenOwnerCanceledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: tokenAbi,
  eventName: 'OwnerCanceled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"OwnerPending"`
 */
export const watchTokenOwnerPendingEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: tokenAbi,
  eventName: 'OwnerPending',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"OwnerUpdated"`
 */
export const watchTokenOwnerUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: tokenAbi,
  eventName: 'OwnerUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"ReservedUntilTokenIDUpdated"`
 */
export const watchTokenReservedUntilTokenIdUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: tokenAbi,
    eventName: 'ReservedUntilTokenIDUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"Transfer"`
 */
export const watchTokenTransferEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: tokenAbi,
  eventName: 'Transfer',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"Upgraded"`
 */
export const watchTokenUpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: tokenAbi,
  eventName: 'Upgraded',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__
 */
export const readTreasury = /*#__PURE__*/ createReadContract({ abi: treasuryAbi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"contractVersion"`
 */
export const readTreasuryContractVersion = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'contractVersion',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"delay"`
 */
export const readTreasuryDelay = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'delay',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"gracePeriod"`
 */
export const readTreasuryGracePeriod = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'gracePeriod',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"hashProposal"`
 */
export const readTreasuryHashProposal = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'hashProposal',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"isExpired"`
 */
export const readTreasuryIsExpired = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'isExpired',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"isQueued"`
 */
export const readTreasuryIsQueued = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'isQueued',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"isReady"`
 */
export const readTreasuryIsReady = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'isReady',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const readTreasuryOnErc1155BatchReceived = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'onERC1155BatchReceived',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const readTreasuryOnErc1155Received = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'onERC1155Received',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const readTreasuryOnErc721Received = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'onERC721Received',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"owner"`
 */
export const readTreasuryOwner = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const readTreasuryPendingOwner = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const readTreasuryProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"timestamp"`
 */
export const readTreasuryTimestamp = /*#__PURE__*/ createReadContract({
  abi: treasuryAbi,
  functionName: 'timestamp',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__
 */
export const writeTreasury = /*#__PURE__*/ createWriteContract({ abi: treasuryAbi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const writeTreasuryAcceptOwnership = /*#__PURE__*/ createWriteContract({
  abi: treasuryAbi,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"cancel"`
 */
export const writeTreasuryCancel = /*#__PURE__*/ createWriteContract({
  abi: treasuryAbi,
  functionName: 'cancel',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const writeTreasuryCancelOwnershipTransfer = /*#__PURE__*/ createWriteContract({
  abi: treasuryAbi,
  functionName: 'cancelOwnershipTransfer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"execute"`
 */
export const writeTreasuryExecute = /*#__PURE__*/ createWriteContract({
  abi: treasuryAbi,
  functionName: 'execute',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"initialize"`
 */
export const writeTreasuryInitialize = /*#__PURE__*/ createWriteContract({
  abi: treasuryAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"queue"`
 */
export const writeTreasuryQueue = /*#__PURE__*/ createWriteContract({
  abi: treasuryAbi,
  functionName: 'queue',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const writeTreasurySafeTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: treasuryAbi,
  functionName: 'safeTransferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const writeTreasuryTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: treasuryAbi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"updateDelay"`
 */
export const writeTreasuryUpdateDelay = /*#__PURE__*/ createWriteContract({
  abi: treasuryAbi,
  functionName: 'updateDelay',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"updateGracePeriod"`
 */
export const writeTreasuryUpdateGracePeriod = /*#__PURE__*/ createWriteContract({
  abi: treasuryAbi,
  functionName: 'updateGracePeriod',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const writeTreasuryUpgradeTo = /*#__PURE__*/ createWriteContract({
  abi: treasuryAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const writeTreasuryUpgradeToAndCall = /*#__PURE__*/ createWriteContract({
  abi: treasuryAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__
 */
export const simulateTreasury = /*#__PURE__*/ createSimulateContract({ abi: treasuryAbi })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const simulateTreasuryAcceptOwnership = /*#__PURE__*/ createSimulateContract({
  abi: treasuryAbi,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"cancel"`
 */
export const simulateTreasuryCancel = /*#__PURE__*/ createSimulateContract({
  abi: treasuryAbi,
  functionName: 'cancel',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const simulateTreasuryCancelOwnershipTransfer =
  /*#__PURE__*/ createSimulateContract({
    abi: treasuryAbi,
    functionName: 'cancelOwnershipTransfer',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"execute"`
 */
export const simulateTreasuryExecute = /*#__PURE__*/ createSimulateContract({
  abi: treasuryAbi,
  functionName: 'execute',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateTreasuryInitialize = /*#__PURE__*/ createSimulateContract({
  abi: treasuryAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"queue"`
 */
export const simulateTreasuryQueue = /*#__PURE__*/ createSimulateContract({
  abi: treasuryAbi,
  functionName: 'queue',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const simulateTreasurySafeTransferOwnership = /*#__PURE__*/ createSimulateContract(
  { abi: treasuryAbi, functionName: 'safeTransferOwnership' },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const simulateTreasuryTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: treasuryAbi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"updateDelay"`
 */
export const simulateTreasuryUpdateDelay = /*#__PURE__*/ createSimulateContract({
  abi: treasuryAbi,
  functionName: 'updateDelay',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"updateGracePeriod"`
 */
export const simulateTreasuryUpdateGracePeriod = /*#__PURE__*/ createSimulateContract({
  abi: treasuryAbi,
  functionName: 'updateGracePeriod',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const simulateTreasuryUpgradeTo = /*#__PURE__*/ createSimulateContract({
  abi: treasuryAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link treasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const simulateTreasuryUpgradeToAndCall = /*#__PURE__*/ createSimulateContract({
  abi: treasuryAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link treasuryAbi}__
 */
export const watchTreasuryEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: treasuryAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link treasuryAbi}__ and `eventName` set to `"DelayUpdated"`
 */
export const watchTreasuryDelayUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: treasuryAbi,
  eventName: 'DelayUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link treasuryAbi}__ and `eventName` set to `"GracePeriodUpdated"`
 */
export const watchTreasuryGracePeriodUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: treasuryAbi,
    eventName: 'GracePeriodUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link treasuryAbi}__ and `eventName` set to `"Initialized"`
 */
export const watchTreasuryInitializedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: treasuryAbi,
  eventName: 'Initialized',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link treasuryAbi}__ and `eventName` set to `"OwnerCanceled"`
 */
export const watchTreasuryOwnerCanceledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: treasuryAbi,
  eventName: 'OwnerCanceled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link treasuryAbi}__ and `eventName` set to `"OwnerPending"`
 */
export const watchTreasuryOwnerPendingEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: treasuryAbi,
  eventName: 'OwnerPending',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link treasuryAbi}__ and `eventName` set to `"OwnerUpdated"`
 */
export const watchTreasuryOwnerUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: treasuryAbi,
  eventName: 'OwnerUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link treasuryAbi}__ and `eventName` set to `"TransactionCanceled"`
 */
export const watchTreasuryTransactionCanceledEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: treasuryAbi,
    eventName: 'TransactionCanceled',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link treasuryAbi}__ and `eventName` set to `"TransactionExecuted"`
 */
export const watchTreasuryTransactionExecutedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: treasuryAbi,
    eventName: 'TransactionExecuted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link treasuryAbi}__ and `eventName` set to `"TransactionScheduled"`
 */
export const watchTreasuryTransactionScheduledEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: treasuryAbi,
    eventName: 'TransactionScheduled',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link treasuryAbi}__ and `eventName` set to `"Upgraded"`
 */
export const watchTreasuryUpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: treasuryAbi,
  eventName: 'Upgraded',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__
 */
export const readZoraNftCreator = /*#__PURE__*/ createReadContract({
  abi: zoraNftCreatorAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"contractVersion"`
 */
export const readZoraNftCreatorContractVersion = /*#__PURE__*/ createReadContract({
  abi: zoraNftCreatorAbi,
  functionName: 'contractVersion',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"dropMetadataRenderer"`
 */
export const readZoraNftCreatorDropMetadataRenderer = /*#__PURE__*/ createReadContract({
  abi: zoraNftCreatorAbi,
  functionName: 'dropMetadataRenderer',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"editionMetadataRenderer"`
 */
export const readZoraNftCreatorEditionMetadataRenderer = /*#__PURE__*/ createReadContract(
  { abi: zoraNftCreatorAbi, functionName: 'editionMetadataRenderer' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"implementation"`
 */
export const readZoraNftCreatorImplementation = /*#__PURE__*/ createReadContract({
  abi: zoraNftCreatorAbi,
  functionName: 'implementation',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"owner"`
 */
export const readZoraNftCreatorOwner = /*#__PURE__*/ createReadContract({
  abi: zoraNftCreatorAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const readZoraNftCreatorProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: zoraNftCreatorAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__
 */
export const writeZoraNftCreator = /*#__PURE__*/ createWriteContract({
  abi: zoraNftCreatorAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"createAndConfigureDrop"`
 */
export const writeZoraNftCreatorCreateAndConfigureDrop =
  /*#__PURE__*/ createWriteContract({
    abi: zoraNftCreatorAbi,
    functionName: 'createAndConfigureDrop',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"createDrop"`
 */
export const writeZoraNftCreatorCreateDrop = /*#__PURE__*/ createWriteContract({
  abi: zoraNftCreatorAbi,
  functionName: 'createDrop',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"createEdition"`
 */
export const writeZoraNftCreatorCreateEdition = /*#__PURE__*/ createWriteContract({
  abi: zoraNftCreatorAbi,
  functionName: 'createEdition',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"initialize"`
 */
export const writeZoraNftCreatorInitialize = /*#__PURE__*/ createWriteContract({
  abi: zoraNftCreatorAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const writeZoraNftCreatorRenounceOwnership = /*#__PURE__*/ createWriteContract({
  abi: zoraNftCreatorAbi,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"setupDropsContract"`
 */
export const writeZoraNftCreatorSetupDropsContract = /*#__PURE__*/ createWriteContract({
  abi: zoraNftCreatorAbi,
  functionName: 'setupDropsContract',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const writeZoraNftCreatorTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: zoraNftCreatorAbi,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const writeZoraNftCreatorUpgradeTo = /*#__PURE__*/ createWriteContract({
  abi: zoraNftCreatorAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const writeZoraNftCreatorUpgradeToAndCall = /*#__PURE__*/ createWriteContract({
  abi: zoraNftCreatorAbi,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__
 */
export const simulateZoraNftCreator = /*#__PURE__*/ createSimulateContract({
  abi: zoraNftCreatorAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"createAndConfigureDrop"`
 */
export const simulateZoraNftCreatorCreateAndConfigureDrop =
  /*#__PURE__*/ createSimulateContract({
    abi: zoraNftCreatorAbi,
    functionName: 'createAndConfigureDrop',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"createDrop"`
 */
export const simulateZoraNftCreatorCreateDrop = /*#__PURE__*/ createSimulateContract({
  abi: zoraNftCreatorAbi,
  functionName: 'createDrop',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"createEdition"`
 */
export const simulateZoraNftCreatorCreateEdition = /*#__PURE__*/ createSimulateContract({
  abi: zoraNftCreatorAbi,
  functionName: 'createEdition',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateZoraNftCreatorInitialize = /*#__PURE__*/ createSimulateContract({
  abi: zoraNftCreatorAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const simulateZoraNftCreatorRenounceOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: zoraNftCreatorAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"setupDropsContract"`
 */
export const simulateZoraNftCreatorSetupDropsContract =
  /*#__PURE__*/ createSimulateContract({
    abi: zoraNftCreatorAbi,
    functionName: 'setupDropsContract',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const simulateZoraNftCreatorTransferOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: zoraNftCreatorAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const simulateZoraNftCreatorUpgradeTo = /*#__PURE__*/ createSimulateContract({
  abi: zoraNftCreatorAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const simulateZoraNftCreatorUpgradeToAndCall =
  /*#__PURE__*/ createSimulateContract({
    abi: zoraNftCreatorAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link zoraNftCreatorAbi}__
 */
export const watchZoraNftCreatorEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: zoraNftCreatorAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `eventName` set to `"AdminChanged"`
 */
export const watchZoraNftCreatorAdminChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: zoraNftCreatorAbi,
    eventName: 'AdminChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `eventName` set to `"BeaconUpgraded"`
 */
export const watchZoraNftCreatorBeaconUpgradedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: zoraNftCreatorAbi,
    eventName: 'BeaconUpgraded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `eventName` set to `"CreatedDrop"`
 */
export const watchZoraNftCreatorCreatedDropEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: zoraNftCreatorAbi, eventName: 'CreatedDrop' },
)

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const watchZoraNftCreatorOwnershipTransferredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: zoraNftCreatorAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link zoraNftCreatorAbi}__ and `eventName` set to `"Upgraded"`
 */
export const watchZoraNftCreatorUpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: zoraNftCreatorAbi,
  eventName: 'Upgraded',
})
