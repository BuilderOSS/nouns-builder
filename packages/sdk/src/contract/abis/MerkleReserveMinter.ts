export const merkleReserveMinterAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_manager', type: 'address' },
      { internalType: 'address', name: '_protocolRewards', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'CLAIM_ALREADY_USED', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ERROR_MINTING_TOKEN',
    type: 'error',
  },
  { inputs: [], name: 'INVALID_CLAIM_COUNT', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: 'mintTo', type: 'address' },
      { internalType: 'bytes32[]', name: 'merkleProof', type: 'bytes32[]' },
      { internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
    ],
    name: 'INVALID_MERKLE_PROOF',
    type: 'error',
  },
  { inputs: [], name: 'INVALID_VALUE', type: 'error' },
  { inputs: [], name: 'MINT_ENDED', type: 'error' },
  { inputs: [], name: 'MINT_NOT_STARTED', type: 'error' },
  { inputs: [], name: 'NOT_TOKEN_OWNER', type: 'error' },
  { inputs: [], name: 'NO_TOKENS_MINTED', type: 'error' },
  { inputs: [], name: 'TRANSFER_FAILED', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'tokenContract', type: 'address' },
      {
        components: [
          { internalType: 'uint64', name: 'mintStart', type: 'uint64' },
          { internalType: 'uint64', name: 'mintEnd', type: 'uint64' },
          { internalType: 'uint64', name: 'pricePerToken', type: 'uint64' },
          { internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
        ],
        indexed: false,
        internalType: 'struct MerkleReserveMinter.MerkleMinterSettings',
        name: 'merkleSaleSettings',
        type: 'tuple',
      },
    ],
    name: 'MinterSet',
    type: 'event',
  },
  {
    inputs: [],
    name: 'BUILDER_DAO_FEE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'allowedMerkles',
    outputs: [
      { internalType: 'uint64', name: 'mintStart', type: 'uint64' },
      { internalType: 'uint64', name: 'mintEnd', type: 'uint64' },
      { internalType: 'uint64', name: 'pricePerToken', type: 'uint64' },
      { internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenContract', type: 'address' },
      { internalType: 'uint256', name: 'quantity', type: 'uint256' },
    ],
    name: 'getTotalFeesForMint',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenContract', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'mintTo', type: 'address' },
          { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
          { internalType: 'bytes32[]', name: 'merkleProof', type: 'bytes32[]' },
        ],
        internalType: 'struct MerkleReserveMinter.MerkleClaim[]',
        name: 'claims',
        type: 'tuple[]',
      },
    ],
    name: 'mintFromReserve',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'tokenContract', type: 'address' }],
    name: 'resetMintSettings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenContract', type: 'address' },
      {
        components: [
          { internalType: 'uint64', name: 'mintStart', type: 'uint64' },
          { internalType: 'uint64', name: 'mintEnd', type: 'uint64' },
          { internalType: 'uint64', name: 'pricePerToken', type: 'uint64' },
          { internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
        ],
        internalType: 'struct MerkleReserveMinter.MerkleMinterSettings',
        name: 'settings',
        type: 'tuple',
      },
    ],
    name: 'setMintSettings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'usedClaims',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
