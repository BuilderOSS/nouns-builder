import type { AddressType, BytesType, CHAIN_ID } from '@buildeross/types'
import type { Hex, WalletClient } from 'viem'

export interface UpdateSignatureParams {
  signer: AddressType
  proposer: AddressType
  oldProposalId: BytesType
  newProposalId: BytesType
  nonce: bigint
  deadline: number
  chainId: CHAIN_ID
  governorAddress: AddressType
  tokenSymbol: string
}

export interface UpdateSignatureResult {
  signer: AddressType
  nonce: bigint
  deadline: number
  signature: Hex
}

/**
 * Generate an EIP-712 signature for sponsoring a proposal update via updateProposalBySigs
 *
 * @param params - Signature parameters
 * @param walletClient - Viem wallet client for signing
 * @returns Signature data including signer address, nonce, deadline, and signature
 */
export async function generateUpdateSignature(
  params: UpdateSignatureParams,
  walletClient: WalletClient
): Promise<UpdateSignatureResult> {
  const {
    signer,
    proposer,
    oldProposalId,
    newProposalId,
    nonce,
    deadline,
    chainId,
    governorAddress,
    tokenSymbol,
  } = params

  // EIP-712 domain
  const domain = {
    name: `${tokenSymbol} GOV`,
    version: '1',
    chainId: Number(chainId),
    verifyingContract: governorAddress,
  } as const

  // EIP-712 types for UPDATE_PROPOSAL_TYPEHASH
  // keccak256("UpdateProposal(bytes32 proposalId,bytes32 updatedProposalId,address proposer,uint256 nonce,uint256 deadline)")
  const types = {
    UpdateProposal: [
      { name: 'proposalId', type: 'bytes32' },
      { name: 'updatedProposalId', type: 'bytes32' },
      { name: 'proposer', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  } as const

  // Message to sign
  const message = {
    proposalId: oldProposalId,
    updatedProposalId: newProposalId,
    proposer,
    nonce,
    deadline: BigInt(deadline),
  } as const

  try {
    // Sign typed data
    const signature = await walletClient.signTypedData({
      account: signer,
      domain,
      types,
      primaryType: 'UpdateProposal',
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
      `Failed to generate update signature: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
