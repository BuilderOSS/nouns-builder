export const L2DeployerABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_manager',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_merkleMinter',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_crossDomainMessenger',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'DAO_ALREADY_DEPLOYED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'METADATA_CALLS_NOT_EXECUTED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'METADATA_CALL_FAILED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NOT_CROSS_DOMAIN_MESSENGER',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NO_DAO_DEPLOYED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TRANSFER_FAILED',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'deployer',
        type: 'address',
      },
    ],
    name: 'DeployerSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'deployer',
        type: 'address',
      },
    ],
    name: 'OwnershipRenounced',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'l1Address',
        type: 'address',
      },
    ],
    name: 'applyL1ToL2Alias',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'callMetadataRenderer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'crossDomainDeployerToMigration',
    outputs: [
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'minimumMetadataCalls',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'executedMetadataCalls',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'crossDomainMessenger',
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
          {
            internalType: 'address',
            name: 'metadataRenderer',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'reservedUntilTokenId',
            type: 'uint256',
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
          {
            internalType: 'address',
            name: 'founderRewardRecipent',
            type: 'address',
          },
          {
            internalType: 'uint16',
            name: 'founderRewardBps',
            type: 'uint16',
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
      {
        components: [
          {
            internalType: 'uint64',
            name: 'mintStart',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'mintEnd',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'pricePerToken',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'merkleRoot',
            type: 'bytes32',
          },
        ],
        internalType: 'struct MerkleReserveMinter.MerkleMinterSettings',
        name: '_minterParams',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: '_delayedGovernanceAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_minimumMetadataCalls',
        type: 'uint256',
      },
    ],
    name: 'deploy',
    outputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'depositToTreasury',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'manager',
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
    name: 'merkleMinter',
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
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'resetDeployment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
