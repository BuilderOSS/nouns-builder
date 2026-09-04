import { SAFE_SERVICE_URL } from '@buildeross/constants/safe'
import type { CHAIN_ID } from '@buildeross/types'
import SafeApiKit from '@safe-global/api-kit'
import Safe from '@safe-global/protocol-kit'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import debug from 'debug'
import { getAddress } from 'viem'

import type { EIP1193Provider, SafeInfo, SendTransactionParams } from '../providers/types'

const debugSafeTx = debug('app:safe:tx')

/**
 * Propose a transaction to Safe Service API for multi-sig approval
 * Returns Safe transaction hash for deep linking
 */
export async function proposeSafeTransaction(
  safeInfo: SafeInfo,
  transaction: SendTransactionParams,
  eoaProvider: EIP1193Provider
): Promise<string> {
  debugSafeTx('proposeSafeTransaction called: %O', {
    safeAddress: safeInfo.safeAddress,
    chainId: safeInfo.chainId,
    to: transaction.to,
  })

  // Verify provider is on the correct chain, switch if necessary
  debugSafeTx('Checking current chain...')
  const currentChainId = await eoaProvider.request({ method: 'eth_chainId' })
  const currentChainIdNumber =
    typeof currentChainId === 'string'
      ? parseInt(currentChainId, 16)
      : Number(currentChainId)

  debugSafeTx(
    'Current chain: %d, Required chain: %d',
    currentChainIdNumber,
    safeInfo.chainId
  )

  if (currentChainIdNumber !== safeInfo.chainId) {
    // Request wallet to switch to the Safe's chain
    debugSafeTx('Requesting chain switch...')
    try {
      await eoaProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${safeInfo.chainId.toString(16)}` }],
      })
      debugSafeTx('Chain switched successfully')
    } catch (switchError: any) {
      // Handle specific error codes
      if (switchError.code === 4902) {
        // Chain not added to wallet
        debugSafeTx('ERROR: Chain not configured in wallet')
        throw new Error(
          `Chain ${safeInfo.chainId} is not configured in your wallet. Please add it manually.`
        )
      }
      if (switchError.code === 4001) {
        // User rejected the request
        debugSafeTx('ERROR: User rejected chain switch')
        throw new Error('Chain switch was rejected by user')
      }
      // Generic error
      debugSafeTx('ERROR: Chain switch failed: %O', switchError)
      throw new Error(
        `Failed to switch to chain ${safeInfo.chainId}: ${switchError?.message || switchError?.toString() || 'Unknown error'}`
      )
    }
  }

  const apiKey = process.env.NEXT_PUBLIC_SAFE_API_KEY
  if (!apiKey) {
    debugSafeTx('ERROR: NEXT_PUBLIC_SAFE_API_KEY is not set!')
    throw new Error(
      'NEXT_PUBLIC_SAFE_API_KEY is required for Safe multi-sig transactions'
    )
  }
  debugSafeTx('API key present')

  const serviceUrl = SAFE_SERVICE_URL[safeInfo.chainId as CHAIN_ID]
  if (!serviceUrl) {
    debugSafeTx('ERROR: No Safe Service URL for chain: %d', safeInfo.chainId)
    throw new Error(`Safe Service not available for chain ${safeInfo.chainId}`)
  }
  debugSafeTx('Safe Service URL: %s', serviceUrl)

  // Get EOA address (signer) and checksum it
  debugSafeTx('Getting EOA accounts...')
  const accounts = (await eoaProvider.request({ method: 'eth_accounts' })) as string[]
  const rawSenderAddress = accounts[0]

  if (!rawSenderAddress) {
    debugSafeTx('ERROR: No EOA account found')
    throw new Error('No EOA account connected')
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
  const targetAddress = getAddress(transaction.to)

  // Create Protocol Kit instance using EIP1193Provider directly
  debugSafeTx('Initializing Safe Protocol Kit...')
  const protocolKit = await Safe.init({
    provider: eoaProvider as any, // Safe SDK accepts EIP1193Provider
    signer: senderAddress,
    safeAddress,
  })
  debugSafeTx('Protocol Kit initialized')

  // Build Safe transaction with checksummed address
  const safeTransaction: MetaTransactionData = {
    to: targetAddress,
    value: transaction.value?.toString() || '0',
    data: transaction.data || '0x',
  }
  debugSafeTx('Creating Safe transaction...')

  const safeTx = await protocolKit.createTransaction({
    transactions: [safeTransaction],
  })
  debugSafeTx('Safe transaction created')

  // Get transaction hash
  debugSafeTx('Getting transaction hash...')
  const safeTxHash = await protocolKit.getTransactionHash(safeTx)
  debugSafeTx('Transaction hash: %s', safeTxHash)

  // Sign transaction hash with EOA
  debugSafeTx('Requesting signature from EOA...')
  const senderSignature = await protocolKit.signHash(safeTxHash)
  debugSafeTx('Transaction hash signed')

  // Propose to Safe Service
  debugSafeTx('Proposing transaction to Safe Service...')
  await apiKit.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTx.data,
    safeTxHash,
    senderAddress,
    senderSignature: senderSignature.data,
  })
  debugSafeTx('Transaction successfully proposed to Safe Service')

  return safeTxHash
}

/**
 * Execute a transaction directly for 1-of-N Safes
 * Returns Ethereum transaction hash
 */
export async function executeSafeTransaction(
  safeInfo: SafeInfo,
  transaction: SendTransactionParams,
  eoaProvider: EIP1193Provider
): Promise<string> {
  debugSafeTx('executeSafeTransaction called (threshold=1): %O', {
    safeAddress: safeInfo.safeAddress,
    chainId: safeInfo.chainId,
    to: transaction.to,
  })

  // Verify provider is on the correct chain, switch if necessary
  debugSafeTx('Checking current chain...')
  const currentChainId = await eoaProvider.request({ method: 'eth_chainId' })
  const currentChainIdNumber =
    typeof currentChainId === 'string'
      ? parseInt(currentChainId, 16)
      : Number(currentChainId)

  debugSafeTx(
    'Current chain: %d, Required chain: %d',
    currentChainIdNumber,
    safeInfo.chainId
  )

  if (currentChainIdNumber !== safeInfo.chainId) {
    // Request wallet to switch to the Safe's chain
    debugSafeTx('Requesting chain switch...')
    try {
      await eoaProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${safeInfo.chainId.toString(16)}` }],
      })
      debugSafeTx('Chain switched successfully')
    } catch (switchError: any) {
      // Handle specific error codes
      if (switchError.code === 4902) {
        // Chain not added to wallet
        debugSafeTx('ERROR: Chain not configured in wallet')
        throw new Error(
          `Chain ${safeInfo.chainId} is not configured in your wallet. Please add it manually.`
        )
      }
      if (switchError.code === 4001) {
        // User rejected the request
        debugSafeTx('ERROR: User rejected chain switch')
        throw new Error('Chain switch was rejected by user')
      }
      // Generic error
      debugSafeTx('ERROR: Chain switch failed: %O', switchError)
      throw new Error(
        `Failed to switch to chain ${safeInfo.chainId}: ${switchError?.message || switchError?.toString() || 'Unknown error'}`
      )
    }
  }

  // Get EOA address (signer) and checksum it
  debugSafeTx('Getting EOA accounts...')
  const accounts = (await eoaProvider.request({ method: 'eth_accounts' })) as string[]
  const rawSenderAddress = accounts[0]

  if (!rawSenderAddress) {
    debugSafeTx('ERROR: No EOA account found')
    throw new Error('No EOA account connected')
  }
  const senderAddress = getAddress(rawSenderAddress)
  debugSafeTx('EOA address (checksummed): %s', senderAddress)

  // Checksum addresses for Safe API
  const safeAddress = getAddress(safeInfo.safeAddress)
  const targetAddress = getAddress(transaction.to)

  // Create Protocol Kit instance using EIP1193Provider directly
  debugSafeTx('Initializing Safe Protocol Kit...')
  const protocolKit = await Safe.init({
    provider: eoaProvider as any, // Safe SDK accepts EIP1193Provider
    signer: senderAddress,
    safeAddress,
  })
  debugSafeTx('Protocol Kit initialized')

  // Build Safe transaction with checksummed address
  const safeTransaction: MetaTransactionData = {
    to: targetAddress,
    value: transaction.value?.toString() || '0',
    data: transaction.data || '0x',
  }
  debugSafeTx('Creating Safe transaction...')

  const safeTx = await protocolKit.createTransaction({
    transactions: [safeTransaction],
  })
  debugSafeTx('Safe transaction created')

  // Execute immediately (threshold = 1, so only one signature needed)
  debugSafeTx('Executing transaction (threshold=1)...')
  const executeTxResponse = await protocolKit.executeTransaction(safeTx)
  debugSafeTx('Transaction executed successfully, hash: %s', executeTxResponse.hash)

  return executeTxResponse.hash
}
