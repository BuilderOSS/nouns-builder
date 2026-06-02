import type { AddressType, BytesType, CHAIN_ID } from '@buildeross/types'
import type { Hex, WalletClient } from 'viem'

export interface VoteSignatureParams {
  voter: AddressType
  proposalId: BytesType
  support: 0 | 1 | 2 // 0 = Against, 1 = For, 2 = Abstain
  nonce: bigint
  deadline: number
  chainId: CHAIN_ID
  governorAddress: AddressType
  tokenSymbol: string
}

export interface VoteSignatureResult {
  voter: AddressType
  nonce: bigint
  deadline: number
  signature: Hex
}

/**
 * Generate an EIP-712 signature for casting a vote via castVoteBySig
 *
 * This is the v3.0.0 version that includes nonce parameter
 *
 * @param params - Signature parameters
 * @param walletClient - Viem wallet client for signing
 * @returns Signature data including voter address, nonce, deadline, and signature
 */
export async function generateVoteSignature(
  params: VoteSignatureParams,
  walletClient: WalletClient
): Promise<VoteSignatureResult> {
  const {
    voter,
    proposalId,
    support,
    nonce,
    deadline,
    chainId,
    governorAddress,
    tokenSymbol,
  } = params

  // EIP-712 domain
  const domain = {
    name: `${tokenSymbol} Governor`,
    version: '1',
    chainId: Number(chainId),
    verifyingContract: governorAddress,
  } as const

  // EIP-712 types for VOTE_TYPEHASH (v3.0.0 with nonce)
  // keccak256("Vote(address voter,bytes32 proposalId,uint256 support,uint256 nonce,uint256 deadline)")
  const types = {
    Vote: [
      { name: 'voter', type: 'address' },
      { name: 'proposalId', type: 'bytes32' },
      { name: 'support', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  } as const

  // Message to sign
  const message = {
    voter,
    proposalId,
    support: BigInt(support),
    nonce,
    deadline: BigInt(deadline),
  } as const

  try {
    // Sign typed data
    const signature = await walletClient.signTypedData({
      account: voter,
      domain,
      types,
      primaryType: 'Vote',
      message,
    })

    return {
      voter,
      nonce,
      deadline,
      signature,
    }
  } catch (error) {
    throw new Error(
      `Failed to generate vote signature: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
