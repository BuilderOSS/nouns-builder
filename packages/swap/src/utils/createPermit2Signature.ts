import { PERMIT2_ADDRESS } from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import { Address, maxUint160, PublicClient, WalletClient } from 'viem'

import { permit2Abi } from '../abis/permit2'
import { Permit, SignatureWithPermit } from '../types'

/**
 * EIP-712 types for PermitSingle
 * Based on Permit2's AllowanceTransfer interface
 */
const PERMIT_SINGLE_TYPES = {
  PermitSingle: [
    { name: 'details', type: 'PermitDetails' },
    { name: 'spender', type: 'address' },
    { name: 'sigDeadline', type: 'uint256' },
  ],
  PermitDetails: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint160' },
    { name: 'expiration', type: 'uint48' },
    { name: 'nonce', type: 'uint48' },
  ],
} as const

/**
 * Create a Permit2 PermitSingle signature for gasless approval
 *
 * @param params Configuration for creating the permit signature
 * @returns Signature and permit data
 */
export async function createPermit2Signature({
  chainId,
  token,
  spender,
  amount,
  walletClient,
  publicClient,
}: {
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
  token: Address
  spender: Address
  amount: bigint
  walletClient: WalletClient
  publicClient: PublicClient
}): Promise<SignatureWithPermit> {
  if (!walletClient.account) throw new Error('Wallet client account not found')

  // Get current nonce from Permit2
  const [, , nonce] = await publicClient.readContract({
    address: PERMIT2_ADDRESS,
    abi: permit2Abi,
    functionName: 'allowance',
    args: [walletClient.account.address, token, spender],
  })

  const currentBlock = await publicClient.getBlock()
  const now = Number(currentBlock.timestamp)

  // Expiration: 30 days (matching previous on-chain approval)
  const expiration = now + 30 * 24 * 60 * 60

  // Signature deadline: 5 minutes
  const sigDeadline = BigInt(now + 300)

  // Convert amount to uint160 (Permit2 uses uint160 for amounts)
  const permitAmount = amount > maxUint160 ? maxUint160 : amount

  const permit: Permit = {
    details: {
      token,
      amount: permitAmount,
      expiration,
      nonce: Number(nonce),
    },
    spender,
    sigDeadline,
  }

  // Sign the permit
  const signature = await walletClient.signTypedData({
    account: walletClient.account,
    domain: {
      name: 'Permit2',
      chainId,
      verifyingContract: PERMIT2_ADDRESS,
    },
    types: PERMIT_SINGLE_TYPES,
    primaryType: 'PermitSingle',
    message: {
      details: {
        token: permit.details.token,
        amount: permit.details.amount,
        expiration: permit.details.expiration,
        nonce: permit.details.nonce,
      },
      spender: permit.spender,
      sigDeadline: permit.sigDeadline,
    },
  })

  return {
    signature,
    permit,
  }
}
