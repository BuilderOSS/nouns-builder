import type { AddressType, BytesType, CHAIN_ID } from '@buildeross/types'
import type { Hex, WalletClient } from 'viem'

export interface ProposalSignatureParams {
  signer: AddressType
  proposer: AddressType
  proposalId: BytesType
  nonce: bigint
  deadline: number
  chainId: CHAIN_ID
  governorAddress: AddressType
  tokenSymbol: string
}

export interface ProposalSignatureResult {
  signer: AddressType
  nonce: bigint
  deadline: number
  signature: Hex
}

/**
 * Generate an EIP-712 signature for sponsoring a proposal via proposeBySigs
 *
 * @param params - Signature parameters
 * @param walletClient - Viem wallet client for signing
 * @returns Signature data including signer address, nonce, deadline, and signature
 */
export async function generateProposalSignature(
  params: ProposalSignatureParams,
  walletClient: WalletClient
): Promise<ProposalSignatureResult> {
  const {
    signer,
    proposer,
    proposalId,
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

  // EIP-712 types for PROPOSAL_TYPEHASH
  // keccak256("Proposal(address proposer,address signer,bytes32 proposalId,uint256 nonce,uint256 deadline)")
  const types = {
    Proposal: [
      { name: 'proposer', type: 'address' },
      { name: 'signer', type: 'address' },
      { name: 'proposalId', type: 'bytes32' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  } as const

  // Message to sign
  const message = {
    proposer,
    signer,
    proposalId,
    nonce,
    deadline: BigInt(deadline),
  } as const

  try {
    // Sign typed data
    const signature = await walletClient.signTypedData({
      account: signer,
      domain,
      types,
      primaryType: 'Proposal',
      message,
    })

    return {
      signer,
      nonce,
      deadline,
      signature,
    }
  } catch (error) {
    throw new Error(
      `Failed to generate proposal signature: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
