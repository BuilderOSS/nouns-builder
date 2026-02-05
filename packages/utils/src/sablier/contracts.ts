import { CHAIN_ID } from '@buildeross/types'
import { sablier } from 'sablier'
import { Address } from 'viem'

import { LATEST_LOCKUP_RELEASE } from './constants.js'

/**
 * Shared helper to get a Sablier contract address for a given chain
 */
function getSablierContractAddress(
  chainId: CHAIN_ID,
  contractName: string
): Address | null {
  try {
    // Use the shared latest release from constants
    if (!LATEST_LOCKUP_RELEASE) {
      console.error('No latest Sablier lockup release found')
      return null
    }

    // Get the contract
    const contract = sablier.contracts.get({
      chainId,
      contractName,
      release: LATEST_LOCKUP_RELEASE,
    })

    if (!contract?.address) {
      console.error(`${contractName} not found for chain ${chainId}`)
      return null
    }

    return contract.address as Address
  } catch (error) {
    console.error(`Error getting ${contractName} address for chain ${chainId}:`, error)
    return null
  }
}

/**
 * Get the SablierBatchLockup contract address for a given chain
 */
export function getSablierBatchLockupAddress(chainId: CHAIN_ID): Address | null {
  return getSablierContractAddress(chainId, 'SablierBatchLockup')
}

/**
 * Get the SablierLockup contract address for a given chain
 */
export function getSablierLockupAddress(chainId: CHAIN_ID): Address | null {
  return getSablierContractAddress(chainId, 'SablierLockup')
}

/**
 * Get both Sablier contract addresses needed for batch stream creation
 */
export function getSablierContracts(chainId: CHAIN_ID): {
  batchLockup: Address | null
  lockup: Address | null
} {
  const [batchLockup, lockup] = [
    getSablierBatchLockupAddress(chainId),
    getSablierLockupAddress(chainId),
  ]

  return {
    batchLockup,
    lockup,
  }
}
