import debug from 'debug'

import type { EIP1193Provider } from '../providers/types'
import { SafeTransactionError, SafeTransactionErrorCode } from './errors'

const debugSafeTx = debug('app:safe:tx')

/**
 * Ensures the provider is on the correct chain, switching if necessary.
 *
 * This function:
 * 1. Checks the current chain of the provider
 * 2. If on wrong chain, requests wallet to switch
 * 3. Handles error cases (chain not configured, user rejection)
 *
 * @param provider - EIP-1193 provider to check/switch
 * @param targetChainId - The required chain ID
 * @throws {SafeTransactionError} If chain not configured, user rejects, or switch fails
 */
export async function ensureCorrectChain(
  provider: EIP1193Provider,
  targetChainId: number
): Promise<void> {
  debugSafeTx('Checking current chain...')
  const currentChainId = await provider.request({ method: 'eth_chainId' })
  const currentChainIdNumber =
    typeof currentChainId === 'string'
      ? parseInt(currentChainId, 16)
      : Number(currentChainId)

  debugSafeTx(
    'Current chain: %d, Required chain: %d',
    currentChainIdNumber,
    targetChainId
  )

  if (currentChainIdNumber !== targetChainId) {
    // Request wallet to switch to the target chain
    debugSafeTx('Requesting chain switch...')
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
      const switchedChainId = await provider.request({ method: 'eth_chainId' })
      const switchedChainIdNumber =
        typeof switchedChainId === 'string'
          ? parseInt(switchedChainId, 16)
          : Number(switchedChainId)
      if (switchedChainIdNumber !== targetChainId) {
        throw new SafeTransactionError(
          `Wallet is still connected to chain ${switchedChainIdNumber}. Please switch to the required network.`,
          SafeTransactionErrorCode.UNKNOWN
        )
      }
      debugSafeTx('Chain switched successfully')
    } catch (switchError: any) {
      // Handle specific error codes
      if (switchError.code === 4902) {
        // Chain not added to wallet
        debugSafeTx('ERROR: Chain not configured in wallet')
        throw new SafeTransactionError(
          `Chain ${targetChainId} is not configured in your wallet. Please add it manually.`,
          SafeTransactionErrorCode.CHAIN_NOT_CONFIGURED
        )
      }
      if (switchError.code === 4001) {
        // User rejected the request
        debugSafeTx('ERROR: User rejected chain switch')
        throw new SafeTransactionError(
          'Chain switch was rejected',
          SafeTransactionErrorCode.CHAIN_SWITCH_REJECTED
        )
      }
      // Generic error - wrap in SafeTransactionError
      debugSafeTx('ERROR: Chain switch failed: %O', switchError)
      throw new SafeTransactionError(
        `Failed to switch to chain ${targetChainId}: ${switchError?.message || switchError?.toString() || 'Unknown error'}`,
        SafeTransactionErrorCode.UNKNOWN
      )
    }
  }
}
