export const governorAbi = [
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
    name: 'ALREADY_VOTED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BELOW_PROPOSAL_THRESHOLD',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CANNOT_DELAY_GOVERNANCE',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DELEGATE_CALL_FAILED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EXPIRED_SIGNATURE',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INITIALIZING',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_CANCEL',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_DELAYED_GOVERNANCE_EXPIRATION',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_PROPOSAL_THRESHOLD_BPS',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_QUORUM_THRESHOLD_BPS',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_SIGNATURE',
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
    name: 'INVALID_VOTE',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_VOTING_DELAY',
    type: 'error',
  },
  {
    inputs: [],
    name: 'INVALID_VOTING_PERIOD',
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
    name: 'ONLY_TOKEN_OWNER',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_UUPS',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_VETOER',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PROPOSAL_ALREADY_EXECUTED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PROPOSAL_DOES_NOT_EXIST',
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
    name: 'PROPOSAL_EXISTS',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PROPOSAL_LENGTH_MISMATCH',
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
    name: 'PROPOSAL_NOT_QUEUED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PROPOSAL_TARGET_MISSING',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PROPOSAL_UNSUCCESSFUL',
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
    inputs: [],
    name: 'VOTING_NOT_STARTED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WAITING_FOR_TOKENS_TO_CLAIM_OR_EXPIRATION',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevTimestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newTimestamp',
        type: 'uint256',
      },
    ],
    name: 'DelayedGovernanceExpirationTimestampUpdated',
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
    name: 'ProposalCanceled',
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
        name: 'calldatas',
        type: 'bytes[]',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'description',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'descriptionHash',
        type: 'bytes32',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'proposer',
            type: 'address',
          },
          {
            internalType: 'uint32',
            name: 'timeCreated',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'againstVotes',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'forVotes',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'abstainVotes',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'voteStart',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'voteEnd',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'proposalThreshold',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'quorumVotes',
            type: 'uint32',
          },
          {
            internalType: 'bool',
            name: 'executed',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'canceled',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'vetoed',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct GovernorTypesV1.Proposal',
        name: 'proposal',
        type: 'tuple',
      },
    ],
    name: 'ProposalCreated',
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
    name: 'ProposalExecuted',
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
        name: 'eta',
        type: 'uint256',
      },
    ],
    name: 'ProposalQueued',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevBps',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newBps',
        type: 'uint256',
      },
    ],
    name: 'ProposalThresholdBpsUpdated',
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
    name: 'ProposalVetoed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevBps',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newBps',
        type: 'uint256',
      },
    ],
    name: 'QuorumVotesBpsUpdated',
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
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'prevVetoer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newVetoer',
        type: 'address',
      },
    ],
    name: 'VetoerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'voter',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'proposalId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'support',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'weight',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'reason',
        type: 'string',
      },
    ],
    name: 'VoteCast',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevVotingDelay',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newVotingDelay',
        type: 'uint256',
      },
    ],
    name: 'VotingDelayUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevVotingPeriod',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newVotingPeriod',
        type: 'uint256',
      },
    ],
    name: 'VotingPeriodUpdated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
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
    name: 'MAX_DELAYED_GOVERNANCE_EXPIRATION',
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
    name: 'MAX_PROPOSAL_THRESHOLD_BPS',
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
    name: 'MAX_QUORUM_THRESHOLD_BPS',
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
    name: 'MAX_VOTING_DELAY',
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
    name: 'MAX_VOTING_PERIOD',
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
    name: 'MIN_PROPOSAL_THRESHOLD_BPS',
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
    name: 'MIN_QUORUM_THRESHOLD_BPS',
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
    name: 'MIN_VOTING_DELAY',
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
    name: 'MIN_VOTING_PERIOD',
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
    name: 'VOTE_TYPEHASH',
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
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'burnVetoer',
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
    inputs: [
      {
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '_support',
        type: 'uint256',
      },
    ],
    name: 'castVote',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
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
        name: '_voter',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '_support',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_deadline',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: '_v',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: '_r',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '_s',
        type: 'bytes32',
      },
    ],
    name: 'castVoteBySig',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
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
      {
        internalType: 'uint256',
        name: '_support',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_reason',
        type: 'string',
      },
    ],
    name: 'castVoteWithReason',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
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
    name: 'delayedGovernanceExpirationTimestamp',
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
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'payable',
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
    name: 'getProposal',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'proposer',
            type: 'address',
          },
          {
            internalType: 'uint32',
            name: 'timeCreated',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'againstVotes',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'forVotes',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'abstainVotes',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'voteStart',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'voteEnd',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'proposalThreshold',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'quorumVotes',
            type: 'uint32',
          },
          {
            internalType: 'bool',
            name: 'executed',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'canceled',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'vetoed',
            type: 'bool',
          },
        ],
        internalType: 'struct GovernorTypesV1.Proposal',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_timestamp',
        type: 'uint256',
      },
    ],
    name: 'getVotes',
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
        name: '_treasury',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_vetoer',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_votingDelay',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_votingPeriod',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_proposalThresholdBps',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_quorumThresholdBps',
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
        internalType: 'address',
        name: '_account',
        type: 'address',
      },
    ],
    name: 'nonce',
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
    inputs: [
      {
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
    ],
    name: 'proposalDeadline',
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
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
    ],
    name: 'proposalEta',
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
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
    ],
    name: 'proposalSnapshot',
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
    name: 'proposalThreshold',
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
    name: 'proposalThresholdBps',
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
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
    ],
    name: 'proposalVotes',
    outputs: [
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
        internalType: 'string',
        name: '_description',
        type: 'string',
      },
    ],
    name: 'propose',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'quorum',
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
    name: 'quorumThresholdBps',
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
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
    ],
    name: 'state',
    outputs: [
      {
        internalType: 'enum GovernorTypesV1.ProposalState',
        name: '',
        type: 'uint8',
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
    inputs: [
      {
        internalType: 'uint256',
        name: '_newDelayedTimestamp',
        type: 'uint256',
      },
    ],
    name: 'updateDelayedGovernanceExpirationTimestamp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_newProposalThresholdBps',
        type: 'uint256',
      },
    ],
    name: 'updateProposalThresholdBps',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_newQuorumVotesBps',
        type: 'uint256',
      },
    ],
    name: 'updateQuorumThresholdBps',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newVetoer',
        type: 'address',
      },
    ],
    name: 'updateVetoer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_newVotingDelay',
        type: 'uint256',
      },
    ],
    name: 'updateVotingDelay',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_newVotingPeriod',
        type: 'uint256',
      },
    ],
    name: 'updateVotingPeriod',
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
    inputs: [
      {
        internalType: 'bytes32',
        name: '_proposalId',
        type: 'bytes32',
      },
    ],
    name: 'veto',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vetoer',
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
    name: 'votingDelay',
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
    name: 'votingPeriod',
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
] as const
