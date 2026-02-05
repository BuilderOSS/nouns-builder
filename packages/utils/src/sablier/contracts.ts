import { CHAIN_ID } from '@buildeross/types'
import { type Sablier, sablier } from 'sablier'
import { Address } from 'viem'

import { LATEST_LOCKUP_RELEASE } from './constants'

/**
 * Shared helper to get a Sablier contract info for a given chain
 */
export function getSablierContract(opts: {
  chainId: CHAIN_ID
  contractAddress?: string
  contractName?: string
}): Sablier.Contract | null {
  const { chainId, contractAddress, contractName } = opts
  try {
    // Use the shared latest release from constants
    if (!LATEST_LOCKUP_RELEASE) {
      console.error('No latest Sablier lockup release found')
      return null
    }

    // Get the contract
    const contract = sablier.contracts.get({ ...opts, release: LATEST_LOCKUP_RELEASE })

    if (!contract) {
      console.error(
        `Contract address ${contractName || contractAddress} not found for chain ${chainId}`
      )
      return null
    }

    return contract
  } catch (error) {
    console.error(
      `Error getting contract ${contractName || contractAddress} for chain ${chainId}:`,
      error
    )
    return null
  }
}

/**
 * Shared helper to get a Sablier contract address for a given chain
 */
function getSablierContractAddress(
  chainId: CHAIN_ID,
  contractName: string
): Address | null {
  const contract = getSablierContract({ chainId, contractName })

  if (!contract) {
    return null
  }

  return contract.address
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
