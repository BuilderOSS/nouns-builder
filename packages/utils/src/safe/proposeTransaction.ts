import { SAFE_SERVICE_URL } from '@buildeross/constants/safe'
import type { CHAIN_ID } from '@buildeross/types'
import SafeApiKit from '@safe-global/api-kit'
import Safe from '@safe-global/protocol-kit'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { getAddress } from 'viem'

import type { EIP1193Provider, SafeInfo, SendTransactionParams } from '../providers/types'

/**
 * Propose a transaction to Safe Service API for multi-sig approval
 * Returns Safe transaction hash for deep linking
 */
export async function proposeSafeTransaction(
  safeInfo: SafeInfo,
  transaction: SendTransactionParams,
  eoaProvider: EIP1193Provider
): Promise<string> {
  console.log('[SafeAPI] proposeSafeTransaction called:', {
    safeAddress: safeInfo.safeAddress,
    chainId: safeInfo.chainId,
    to: transaction.to,
  })

  const apiKey = process.env.NEXT_PUBLIC_SAFE_API_KEY
  if (!apiKey) {
    console.error('[SafeAPI] NEXT_PUBLIC_SAFE_API_KEY is not set!')
    throw new Error(
      'NEXT_PUBLIC_SAFE_API_KEY is required for Safe multi-sig transactions'
    )
  }
  console.log('[SafeAPI] API key is present')

  const serviceUrl = SAFE_SERVICE_URL[safeInfo.chainId as CHAIN_ID]
  if (!serviceUrl) {
    console.error('[SafeAPI] No Safe Service URL for chain:', safeInfo.chainId)
    throw new Error(`Safe Service not available for chain ${safeInfo.chainId}`)
  }
  console.log('[SafeAPI] Safe Service URL:', serviceUrl)

  // Get EOA address (signer) and checksum it
  console.log('[SafeAPI] Getting EOA accounts...')
  const accounts = (await eoaProvider.request({ method: 'eth_accounts' })) as string[]
  const rawSenderAddress = accounts[0]

  if (!rawSenderAddress) {
    console.error('[SafeAPI] No EOA account found')
    throw new Error('No EOA account connected')
  }
  const senderAddress = getAddress(rawSenderAddress)
  console.log('[SafeAPI] EOA address (checksummed):', senderAddress)

  // Create Safe API Kit with API key
  console.log('[SafeAPI] Initializing Safe API Kit...')
  const apiKit = new SafeApiKit({
    chainId: BigInt(safeInfo.chainId),
    apiKey,
  })

  // Checksum addresses for Safe API
  const safeAddress = getAddress(safeInfo.safeAddress)
  const targetAddress = getAddress(transaction.to)

  // Create Protocol Kit instance using EIP1193Provider directly
  console.log('[SafeAPI] Initializing Safe Protocol Kit...')
  const protocolKit = await Safe.init({
    provider: eoaProvider as any, // Safe SDK accepts EIP1193Provider
    signer: senderAddress,
    safeAddress,
  })
  console.log('[SafeAPI] Protocol Kit initialized')

  // Build Safe transaction with checksummed address
  const safeTransaction: MetaTransactionData = {
    to: targetAddress,
    value: transaction.value?.toString() || '0',
    data: transaction.data || '0x',
  }
  console.log('[SafeAPI] Creating Safe transaction...')

  const safeTx = await protocolKit.createTransaction({
    transactions: [safeTransaction],
  })
  console.log('[SafeAPI] Safe transaction created')

  // Get transaction hash
  console.log('[SafeAPI] Getting transaction hash...')
  const safeTxHash = await protocolKit.getTransactionHash(safeTx)
  console.log('[SafeAPI] Transaction hash:', safeTxHash)

  // Sign transaction hash with EOA
  console.log('[SafeAPI] Requesting signature from EOA...')
  const senderSignature = await protocolKit.signHash(safeTxHash)
  console.log('[SafeAPI] Transaction hash signed')

  // Propose to Safe Service
  console.log('[SafeAPI] Proposing transaction to Safe Service...')
  await apiKit.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTx.data,
    safeTxHash,
    senderAddress,
    senderSignature: senderSignature.data,
  })
  console.log('[SafeAPI] Transaction successfully proposed to Safe Service')

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
  console.log('[SafeAPI] executeSafeTransaction called (threshold=1):', {
    safeAddress: safeInfo.safeAddress,
    chainId: safeInfo.chainId,
    to: transaction.to,
  })

  // Verify provider is on the correct chain, switch if necessary
  console.log('[SafeAPI] Checking current chain...')
  const currentChainId = await eoaProvider.request({ method: 'eth_chainId' })
  const currentChainIdNumber =
    typeof currentChainId === 'string'
      ? parseInt(currentChainId, 16)
      : Number(currentChainId)

  console.log(
    '[SafeAPI] Current chain:',
    currentChainIdNumber,
    'Required chain:',
    safeInfo.chainId
  )

  if (currentChainIdNumber !== safeInfo.chainId) {
    // Request wallet to switch to the Safe's chain
    console.log('[SafeAPI] Requesting chain switch...')
    try {
      await eoaProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${safeInfo.chainId.toString(16)}` }],
      })
      console.log('[SafeAPI] Chain switched successfully')
    } catch (switchError: any) {
      // Handle case where chain is not added to wallet
      if (switchError.code === 4902) {
        console.error('[SafeAPI] Chain not configured in wallet')
        throw new Error(
          `Chain ${safeInfo.chainId} is not configured in your wallet. Please add it manually.`
        )
      }
      console.error('[SafeAPI] Chain switch failed:', switchError)
      throw new Error(
        `Failed to switch to chain ${safeInfo.chainId}: ${switchError.message || 'Unknown error'}`
      )
    }
  }

  // Get EOA address (signer) and checksum it
  console.log('[SafeAPI] Getting EOA accounts...')
  const accounts = (await eoaProvider.request({ method: 'eth_accounts' })) as string[]
  const rawSenderAddress = accounts[0]

  if (!rawSenderAddress) {
    console.error('[SafeAPI] No EOA account found')
    throw new Error('No EOA account connected')
  }
  const senderAddress = getAddress(rawSenderAddress)
  console.log('[SafeAPI] EOA address (checksummed):', senderAddress)

  // Checksum addresses for Safe API
  const safeAddress = getAddress(safeInfo.safeAddress)
  const targetAddress = getAddress(transaction.to)

  // Create Protocol Kit instance using EIP1193Provider directly
  console.log('[SafeAPI] Initializing Safe Protocol Kit...')
  const protocolKit = await Safe.init({
    provider: eoaProvider as any, // Safe SDK accepts EIP1193Provider
    signer: senderAddress,
    safeAddress,
  })
  console.log('[SafeAPI] Protocol Kit initialized')

  // Build Safe transaction with checksummed address
  const safeTransaction: MetaTransactionData = {
    to: targetAddress,
    value: transaction.value?.toString() || '0',
    data: transaction.data || '0x',
  }
  console.log('[SafeAPI] Creating Safe transaction...')

  const safeTx = await protocolKit.createTransaction({
    transactions: [safeTransaction],
  })
  console.log('[SafeAPI] Safe transaction created')

  // Execute immediately (threshold = 1, so only one signature needed)
  console.log('[SafeAPI] Executing transaction (threshold=1)...')
  const executeTxResponse = await protocolKit.executeTransaction(safeTx)
  console.log(
    '[SafeAPI] Transaction executed successfully, hash:',
    executeTxResponse.hash
  )

  return executeTxResponse.hash
}
