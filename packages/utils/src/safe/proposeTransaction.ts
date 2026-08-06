import { SAFE_SERVICE_URL } from '@buildeross/constants/safe'
import type { CHAIN_ID } from '@buildeross/types'
import SafeApiKit from '@safe-global/api-kit'
import Safe from '@safe-global/protocol-kit'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import debug from 'debug'
import { getAddress } from 'viem'

import type { EIP1193Provider, SafeInfo, SendTransactionParams } from '../providers/types'
import { ensureCorrectChain } from './ensureCorrectChain'
import { SafeTransactionError, SafeTransactionErrorCode } from './errors'
import { recordSafeProposalHash } from './transactionResult'

const debugSafeTx = debug('app:safe:tx')

/**
 * Propose a transaction to Safe Service API for multi-sig approval.
 *
 * This function handles the complete flow of proposing a transaction to a multi-signature Safe:
 * 1. Validates and switches to the correct chain if needed
 * 2. Initializes Safe Protocol Kit with the EOA signer
 * 3. Creates a Safe transaction from the provided parameters
 * 4. Re-validates chain before requesting signature (prevents race conditions)
 * 5. Requests EOA to sign the Safe transaction hash
 * 6. Submits the signed transaction to Safe Service API
 *
 * The transaction will NOT execute immediately. Other Safe owners must sign it
 * through the Safe UI before it can be executed.
 *
 * @param safeInfo - Safe wallet information (address, chain, threshold, owners)
 * @param transaction - Transaction parameters (to, value, data)
 * @param eoaProvider - EIP-1193 provider for the EOA wallet that will sign
 * @returns Safe transaction hash (used for tracking/deep linking to Safe UI)
 * @throws {SafeTransactionError} If chain not configured, user rejects, or API error
 * @throws {Error} If Safe Service unavailable or signature fails
 *
 * @example
 * ```typescript
 * const safeTxHash = await proposeSafeTransaction(
 *   {
 *     safeAddress: '0x123...',
 *     chainId: 1,
 *     threshold: 2,
 *     owners: ['0xabc...', '0xdef...'],
 *   },
 *   {
 *     to: '0x789...',
 *     value: '1000000000000000000', // 1 ETH
 *     data: '0x...',
 *   },
 *   eoaProvider
 * )
 *
 * // Deep link to Safe UI
 * const safeUrl = `https://app.safe.global/transactions/queue?safe=eth:${safeAddress}`
 * ```
 */
export async function proposeSafeTransaction(
  safeInfo: SafeInfo,
  transaction: SendTransactionParams | SendTransactionParams[],
  eoaProvider: EIP1193Provider
): Promise<string> {
  debugSafeTx('proposeSafeTransaction called: %O', {
    safeAddress: safeInfo.safeAddress,
    chainId: safeInfo.chainId,
    to: Array.isArray(transaction) ? transaction.map(({ to }) => to) : transaction.to,
  })

  // Verify provider is on the correct chain, switch if necessary
  await ensureCorrectChain(eoaProvider, safeInfo.chainId)

  const apiKey = process.env.NEXT_PUBLIC_SAFE_API_KEY
  if (!apiKey) {
    debugSafeTx('ERROR: NEXT_PUBLIC_SAFE_API_KEY is not set!')
    throw new SafeTransactionError(
      'NEXT_PUBLIC_SAFE_API_KEY is required for Safe multi-sig transactions',
      SafeTransactionErrorCode.API_ERROR
    )
  }
  debugSafeTx('API key present')

  const serviceUrl = SAFE_SERVICE_URL[safeInfo.chainId as CHAIN_ID]
  if (!serviceUrl) {
    debugSafeTx('ERROR: No Safe Service URL for chain: %d', safeInfo.chainId)
    throw new SafeTransactionError(
      `Safe Service not available for chain ${safeInfo.chainId}`,
      SafeTransactionErrorCode.API_ERROR
    )
  }
  debugSafeTx('Safe Service URL: %s', serviceUrl)

  // Get EOA address (signer) and checksum it
  debugSafeTx('Getting EOA accounts...')
  const accounts = (await eoaProvider.request({ method: 'eth_accounts' })) as string[]
  const rawSenderAddress = accounts[0]

  if (!rawSenderAddress) {
    debugSafeTx('ERROR: No EOA account found')
    throw new SafeTransactionError(
      'No EOA account connected',
      SafeTransactionErrorCode.EOA_NOT_CONNECTED
    )
  }
  const senderAddress = getAddress(rawSenderAddress)
  debugSafeTx('EOA address (checksummed): %s', senderAddress)

  // Create Safe API Kit with API key
  debugSafeTx('Initializing Safe API Kit...')
  const apiKit = new SafeApiKit({
    chainId: BigInt(safeInfo.chainId),
    apiKey,
  })

  // Checksum addresses for Safe API
  const safeAddress = getAddress(safeInfo.safeAddress)
  const transactions = Array.isArray(transaction) ? transaction : [transaction]

  // Create Protocol Kit instance using EIP1193Provider directly
  debugSafeTx('Initializing Safe Protocol Kit...')
  let protocolKit: Safe
  try {
    protocolKit = await Safe.init({
      // Safe SDK's Eip1193Provider type has slightly different params signature than our EIP1193Provider,
      // but they are functionally compatible. The difference is in the params type definition only.
      provider: eoaProvider as any,
      signer: senderAddress,
      safeAddress,
    })
    debugSafeTx('Protocol Kit initialized')
  } catch (error) {
    debugSafeTx('ERROR: Failed to initialize Protocol Kit: %O', error)
    throw new SafeTransactionError(
      `Failed to initialize Safe: ${error instanceof Error ? error.message : 'Unknown error'}`,
      SafeTransactionErrorCode.SAFE_INIT_FAILED
    )
  }

  // Validate that the connected EOA is actually a Safe owner
  debugSafeTx('Validating Safe ownership...')
  let owners: string[]
  try {
    owners = await protocolKit.getOwners()
  } catch (error) {
    debugSafeTx('ERROR: Failed to read Safe owners: %O', error)
    throw new SafeTransactionError(
      `Failed to validate Safe ownership: ${error instanceof Error ? error.message : 'Unknown error'}`,
      SafeTransactionErrorCode.SAFE_INIT_FAILED
    )
  }
  debugSafeTx('Safe owners: %O', owners)
  if (!owners.map((owner) => owner.toLowerCase()).includes(senderAddress.toLowerCase())) {
    debugSafeTx('ERROR: EOA %s is not an owner of Safe %s', senderAddress, safeAddress)
    throw new SafeTransactionError(
      'Your connected wallet is not an owner of this Safe',
      SafeTransactionErrorCode.NOT_SAFE_OWNER
    )
  }
  debugSafeTx('Ownership validated: EOA is a Safe owner')

  // Build Safe transaction with checksummed address
  const safeTransactions: MetaTransactionData[] = transactions.map((tx) => ({
    to: getAddress(tx.to),
    value: tx.value?.toString() || '0',
    data: tx.data || '0x',
  }))
  debugSafeTx('Creating Safe transaction...')

  const safeTx = await protocolKit.createTransaction({
    transactions: safeTransactions,
  })
  debugSafeTx('Safe transaction created')

  // Get transaction hash
  debugSafeTx('Getting transaction hash...')
  const safeTxHash = await protocolKit.getTransactionHash(safeTx)
  debugSafeTx('Transaction hash: %s', safeTxHash)

  // Re-validate chain before requesting signature (user may have switched)
  debugSafeTx('Re-validating chain before signature request...')
  await ensureCorrectChain(eoaProvider, safeInfo.chainId)

  // Sign transaction hash with EOA
  debugSafeTx('Requesting signature from EOA...')
  const senderSignature = await protocolKit.signHash(safeTxHash)
  debugSafeTx('Transaction hash signed')

  // Propose to Safe Service
  debugSafeTx('Proposing transaction to Safe Service...')
  try {
    await apiKit.proposeTransaction({
      safeAddress,
      safeTransactionData: safeTx.data,
      safeTxHash,
      senderAddress,
      senderSignature: senderSignature.data,
    })
    debugSafeTx('Transaction successfully proposed to Safe Service')
  } catch (error) {
    debugSafeTx('ERROR: Failed to propose transaction to Safe Service: %O', error)
    throw new SafeTransactionError(
      `Failed to propose transaction to Safe Service: ${error instanceof Error ? error.message : 'Unknown error'}`,
      SafeTransactionErrorCode.API_ERROR
    )
  }

  recordSafeProposalHash(safeTxHash as `0x${string}`)

  return safeTxHash
}

/**
 * Execute a transaction directly for 1-of-N Safes where threshold = 1.
 *
 * This function is used for Safe wallets with threshold = 1, where only one
 * signature is needed (1 out of N owners). The transaction executes immediately
 * on-chain, just like an EOA transaction.
 *
 * Flow:
 * 1. Validates and switches to the correct chain if needed
 * 2. Initializes Safe Protocol Kit with the EOA signer
 * 3. Creates and executes the Safe transaction immediately
 * 4. Returns the Ethereum transaction hash
 *
 * @param safeInfo - Safe wallet information (must have threshold = 1, can have N owners)
 * @param transaction - Transaction parameters (to, value, data)
 * @param eoaProvider - EIP-1193 provider for the EOA wallet that will sign and execute
 * @returns Ethereum transaction hash (regular on-chain tx hash, not Safe tx hash)
 * @throws {Error} If chain not configured, user rejects, or execution fails
 *
 * @example
 * ```typescript
 * const txHash = await executeSafeTransaction(
 *   {
 *     safeAddress: '0x123...',
 *     chainId: 1,
 *     threshold: 1, // Important: must be 1
 *     owners: ['0xabc...', '0xdef...'], // Can have multiple owners
 *   },
 *   {
 *     to: '0x789...',
 *     value: '0',
 *     data: '0xa9059cbb...', // transfer function
 *   },
 *   eoaProvider
 * )
 *
 * // Wait for transaction receipt like a normal transaction
 * const receipt = await waitForTransactionReceipt(config, { hash: txHash })
 * ```
 */
export async function executeSafeTransaction(
  safeInfo: SafeInfo,
  transaction: SendTransactionParams | SendTransactionParams[],
  eoaProvider: EIP1193Provider
): Promise<string> {
  debugSafeTx('executeSafeTransaction called (threshold=1): %O', {
    safeAddress: safeInfo.safeAddress,
    chainId: safeInfo.chainId,
    to: Array.isArray(transaction) ? transaction.map(({ to }) => to) : transaction.to,
  })

  // Verify provider is on the correct chain, switch if necessary
  await ensureCorrectChain(eoaProvider, safeInfo.chainId)

  // Get EOA address (signer) and checksum it
  debugSafeTx('Getting EOA accounts...')
  const accounts = (await eoaProvider.request({ method: 'eth_accounts' })) as string[]
  const rawSenderAddress = accounts[0]

  if (!rawSenderAddress) {
    debugSafeTx('ERROR: No EOA account found')
    throw new SafeTransactionError(
      'No EOA account connected',
      SafeTransactionErrorCode.EOA_NOT_CONNECTED
    )
  }
  const senderAddress = getAddress(rawSenderAddress)
  debugSafeTx('EOA address (checksummed): %s', senderAddress)

  // Checksum addresses for Safe API
  const safeAddress = getAddress(safeInfo.safeAddress)
  const transactions = Array.isArray(transaction) ? transaction : [transaction]

  // Create Protocol Kit instance using EIP1193Provider directly
  debugSafeTx('Initializing Safe Protocol Kit...')
  let protocolKit: Safe
  try {
    protocolKit = await Safe.init({
      // Safe SDK's Eip1193Provider type has slightly different params signature than our EIP1193Provider,
      // but they are functionally compatible. The difference is in the params type definition only.
      provider: eoaProvider as any,
      signer: senderAddress,
      safeAddress,
    })
    debugSafeTx('Protocol Kit initialized')
  } catch (error) {
    debugSafeTx('ERROR: Failed to initialize Protocol Kit: %O', error)
    throw new SafeTransactionError(
      `Failed to initialize Safe: ${error instanceof Error ? error.message : 'Unknown error'}`,
      SafeTransactionErrorCode.SAFE_INIT_FAILED
    )
  }

  // Build Safe transaction with checksummed address
  const safeTransactions: MetaTransactionData[] = transactions.map((tx) => ({
    to: getAddress(tx.to),
    value: tx.value?.toString() || '0',
    data: tx.data || '0x',
  }))
  debugSafeTx('Creating Safe transaction...')

  const safeTx = await protocolKit.createTransaction({
    transactions: safeTransactions,
  })
  debugSafeTx('Safe transaction created')

  // Execute immediately (threshold = 1, so only one signature needed)
  debugSafeTx('Executing transaction (threshold=1)...')
  try {
    const executeTxResponse = await protocolKit.executeTransaction(safeTx)
    debugSafeTx('Transaction executed successfully, hash: %s', executeTxResponse.hash)
    return executeTxResponse.hash
  } catch (error) {
    debugSafeTx('ERROR: Transaction execution failed: %O', error)
    throw new SafeTransactionError(
      `Transaction execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      SafeTransactionErrorCode.EXECUTION_FAILED
    )
  }
}
