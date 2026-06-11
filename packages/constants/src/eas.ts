import { CHAIN_ID } from '@buildeross/types'
import { zeroAddress } from 'viem'

export const EAS_CONTRACT_ADDRESS: Partial<Record<CHAIN_ID, `0x${string}`>> = {
  [CHAIN_ID.ETHEREUM]: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587',
  [CHAIN_ID.SEPOLIA]: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
  [CHAIN_ID.OPTIMISM]: '0x4200000000000000000000000000000000000021',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: '0x4200000000000000000000000000000000000021',
  [CHAIN_ID.BASE]: '0x4200000000000000000000000000000000000021',
  [CHAIN_ID.BASE_SEPOLIA]: '0x4200000000000000000000000000000000000021',
}

export const EAS_SUPPORTED_CHAIN_IDS = Object.entries(EAS_CONTRACT_ADDRESS)
  .filter(([, addr]) => addr !== undefined && addr !== zeroAddress)
  .map(([chainId]) => Number(chainId) as CHAIN_ID)

export const PROPDATE_SCHEMA_UID = `0x8bd0d42901ce3cd9898dbea6ae2fbf1e796ef0923e7cbb0a1cecac2e42d47cb3`

export const PROPDATE_SCHEMA = `bytes32 proposalId, bytes32 originalMessageId, uint8 messageType, string message`

export const ESCROW_DELEGATE_SCHEMA_UID = `0x1289c5f988998891af7416d83820c40ba1c6f5ba31467f2e611172334dc53a0e`

export const ESCROW_DELEGATE_SCHEMA = `address daoMultiSig`

/**
 * Canonical Rules for Treasury Asset Pinning:
 * - token != address(0) (don't overload 0x0 to mean native token; handle native separately)
 * - If tokenType == ERC20:
 *   - isCollection MUST be true (or ignored)
 *   - tokenId MUST be 0
 * - If tokenType == ERC721 or ERC1155:
 *   - If isCollection == true: tokenId MUST be 0 (ignored)
 *   - If isCollection == false: tokenId is the NFT id (can be 0+)
 *
 * This avoids the "ERC721 starts at tokenId 0" ambiguity by never using tokenId=0
 * as a sentinel unless isCollection=true.
 */
export const TREASURY_ASSET_PIN_SCHEMA_UID = `0xc384fd4fdacb670667c07759423132a193053742b58d5a056b61d72ba1a09e26`

export const TREASURY_ASSET_PIN_SCHEMA = `uint8 tokenType, address token, bool isCollection, uint256 tokenId`

export const PROPOSAL_CANDIDATE_SCHEMA_UID = `0x5d1c687645ae02fa0f235cc55ce24ab4e6c1d729f82c281689fd3f9f150932f3`

export const PROPOSAL_CANDIDATE_SCHEMA = `bytes32 candidateId,bytes32 salt,uint64 versionNumber,address[] targets,uint256[] values,bytes[] calldatas,string description,bytes32 proposalId`

export const CANDIDATE_COMMENT_SCHEMA_UID = `0x1decf999b02cbecd8697ae7cf0c4017bc0115adbee476da79634332fdff965b2`

export const CANDIDATE_COMMENT_SCHEMA = `bytes32 candidateId,uint8 support,string comment,bytes32 parentCommentUID`

export const CANDIDATE_SPONSOR_SIGNATURE_SCHEMA_UID = `0xeb66ca8d752474c808c9922734355ea6ec385c2515d66433aeabbf2a7b9fcaa5`

export const CANDIDATE_SPONSOR_SIGNATURE_SCHEMA = `bytes32 candidateVersionUID,bytes32 proposalId,uint256 nonce,uint256 deadline,bytes signature`

export type AttestationParams = {
  schema: `0x${string}`
  data: {
    recipient: `0x${string}`
    expirationTime: bigint
    revocable: boolean
    refUID: `0x${string}`
    data: `0x${string}`
    value: bigint
  }
}

export const easAbi = [
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'schema', type: 'bytes32' },
          {
            components: [
              { internalType: 'address', name: 'recipient', type: 'address' },
              { internalType: 'uint64', name: 'expirationTime', type: 'uint64' },
              { internalType: 'bool', name: 'revocable', type: 'bool' },
              { internalType: 'bytes32', name: 'refUID', type: 'bytes32' },
              { internalType: 'bytes', name: 'data', type: 'bytes' },
              { internalType: 'uint256', name: 'value', type: 'uint256' },
            ],
            internalType: 'struct AttestationRequestData',
            name: 'data',
            type: 'tuple',
          },
        ],
        internalType: 'struct AttestationRequest',
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'attest',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'schema', type: 'bytes32' },
          {
            components: [
              { internalType: 'address', name: 'recipient', type: 'address' },
              { internalType: 'uint64', name: 'expirationTime', type: 'uint64' },
              { internalType: 'bool', name: 'revocable', type: 'bool' },
              { internalType: 'bytes32', name: 'refUID', type: 'bytes32' },
              { internalType: 'bytes', name: 'data', type: 'bytes' },
              { internalType: 'uint256', name: 'value', type: 'uint256' },
            ],
            internalType: 'struct AttestationRequestData[]',
            name: 'data',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct MultiAttestationRequest[]',
        name: 'multiRequests',
        type: 'tuple[]',
      },
    ],
    name: 'multiAttest',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
]
