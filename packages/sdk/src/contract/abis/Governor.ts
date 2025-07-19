export const governorAbi = [
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
    name: 'MAX_DELAYED_GOVERNANCE_EXPIRATION',
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
    name: 'MAX_PROPOSAL_THRESHOLD_BPS',
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
    name: 'MAX_QUORUM_THRESHOLD_BPS',
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
    name: 'MAX_VOTING_DELAY',
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
    name: 'MAX_VOTING_PERIOD',
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
    name: 'MIN_PROPOSAL_THRESHOLD_BPS',
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
    name: 'MIN_QUORUM_THRESHOLD_BPS',
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
    name: 'MIN_VOTING_DELAY',
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
    name: 'MIN_VOTING_PERIOD',
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
    name: 'VOTE_TYPEHASH',
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
    name: 'burnVetoer',
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
    name: 'castVote',
    inputs: [
      {
        name: '_proposalId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: '_support',
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
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'castVoteBySig',
    inputs: [
      {
        name: '_voter',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_proposalId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: '_support',
        type: 'uint256',
        internalType: 'uint256',
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
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'castVoteWithReason',
    inputs: [
      {
        name: '_proposalId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: '_support',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_reason',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'delayedGovernanceExpirationTimestamp',
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
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getProposal',
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
        type: 'tuple',
        internalType: 'struct GovernorTypesV1.Proposal',
        components: [
          {
            name: 'proposer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timeCreated',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'againstVotes',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'forVotes',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'abstainVotes',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'voteStart',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'voteEnd',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'proposalThreshold',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'quorumVotes',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'executed',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'canceled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'vetoed',
            type: 'bool',
            internalType: 'bool',
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
        name: '_treasury',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_vetoer',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_votingDelay',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_votingPeriod',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_proposalThresholdBps',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_quorumThresholdBps',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'proposalDeadline',
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
    name: 'proposalEta',
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
    name: 'proposalSnapshot',
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
    name: 'proposalThreshold',
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
    name: 'proposalThresholdBps',
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
    name: 'proposalVotes',
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
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'propose',
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
        name: '_description',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'nonpayable',
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
    name: 'quorum',
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
    name: 'quorumThresholdBps',
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
    name: 'state',
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
        type: 'uint8',
        internalType: 'enum GovernorTypesV1.ProposalState',
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
    name: 'updateDelayedGovernanceExpirationTimestamp',
    inputs: [
      {
        name: '_newDelayedTimestamp',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateProposalThresholdBps',
    inputs: [
      {
        name: '_newProposalThresholdBps',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateQuorumThresholdBps',
    inputs: [
      {
        name: '_newQuorumVotesBps',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateVetoer',
    inputs: [
      {
        name: '_newVetoer',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateVotingDelay',
    inputs: [
      {
        name: '_newVotingDelay',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateVotingPeriod',
    inputs: [
      {
        name: '_newVotingPeriod',
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
    type: 'function',
    name: 'veto',
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
    name: 'vetoer',
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
    name: 'votingDelay',
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
    name: 'votingPeriod',
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
    type: 'event',
    name: 'DelayedGovernanceExpirationTimestampUpdated',
    inputs: [
      {
        name: 'prevTimestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newTimestamp',
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
    name: 'ProposalCanceled',
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
    name: 'ProposalCreated',
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
        name: 'calldatas',
        type: 'bytes[]',
        indexed: false,
        internalType: 'bytes[]',
      },
      {
        name: 'description',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'descriptionHash',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'proposal',
        type: 'tuple',
        indexed: false,
        internalType: 'struct GovernorTypesV1.Proposal',
        components: [
          {
            name: 'proposer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timeCreated',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'againstVotes',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'forVotes',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'abstainVotes',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'voteStart',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'voteEnd',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'proposalThreshold',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'quorumVotes',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'executed',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'canceled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'vetoed',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ProposalExecuted',
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
    name: 'ProposalQueued',
    inputs: [
      {
        name: 'proposalId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'eta',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ProposalThresholdBpsUpdated',
    inputs: [
      {
        name: 'prevBps',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newBps',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ProposalVetoed',
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
    name: 'QuorumVotesBpsUpdated',
    inputs: [
      {
        name: 'prevBps',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newBps',
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
    type: 'event',
    name: 'VetoerUpdated',
    inputs: [
      {
        name: 'prevVetoer',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'newVetoer',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'VoteCast',
    inputs: [
      {
        name: 'voter',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'proposalId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'support',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'weight',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'reason',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'VotingDelayUpdated',
    inputs: [
      {
        name: 'prevVotingDelay',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newVotingDelay',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'VotingPeriodUpdated',
    inputs: [
      {
        name: 'prevVotingPeriod',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newVotingPeriod',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
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
    name: 'ALREADY_VOTED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BELOW_PROPOSAL_THRESHOLD',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CANNOT_DELAY_GOVERNANCE',
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
    name: 'INVALID_CANCEL',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_DELAYED_GOVERNANCE_EXPIRATION',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_PROPOSAL_THRESHOLD_BPS',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_QUORUM_THRESHOLD_BPS',
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
    name: 'INVALID_VOTE',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_VOTING_DELAY',
    inputs: [],
  },
  {
    type: 'error',
    name: 'INVALID_VOTING_PERIOD',
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
    name: 'ONLY_VETOER',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PROPOSAL_ALREADY_EXECUTED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PROPOSAL_DOES_NOT_EXIST',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PROPOSAL_EXISTS',
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
    name: 'PROPOSAL_LENGTH_MISMATCH',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PROPOSAL_NOT_QUEUED',
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
    name: 'PROPOSAL_TARGET_MISSING',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PROPOSAL_UNSUCCESSFUL',
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
  {
    type: 'error',
    name: 'VOTING_NOT_STARTED',
    inputs: [],
  },
  {
    type: 'error',
    name: 'WAITING_FOR_TOKENS_TO_CLAIM_OR_EXPIRATION',
    inputs: [],
  },
] as const
