import { CHAIN_ID } from '@buildeross/types'
import { type Sablier, sablier } from 'sablier'
import { Address } from 'viem'

import { LATEST_AIRDROPS_RELEASE, LATEST_LOCKUP_RELEASE } from './constants'

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
 * Shared helper to get a Sablier airdrops contract info for a given chain
 */
export function getSablierAirdropsContract(opts: {
  chainId: CHAIN_ID
  contractAddress?: string
  contractName?: string
}): Sablier.Contract | null {
  const { chainId, contractAddress, contractName } = opts
  try {
    if (!LATEST_AIRDROPS_RELEASE) {
      console.error('No latest Sablier airdrops release found')
      return null
    }

    const contract = sablier.contracts.get({ ...opts, release: LATEST_AIRDROPS_RELEASE })

    if (!contract) {
      console.error(
        `Airdrops contract address ${contractName || contractAddress} not found for chain ${chainId}`
      )
      return null
    }

    return contract
  } catch (error) {
    console.error(
      `Error getting airdrops contract ${contractName || contractAddress} for chain ${chainId}:`,
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
 * Shared helper to get a Sablier airdrops contract address for a given chain
 */
function getSablierAirdropsContractAddress(
  chainId: CHAIN_ID,
  contractName: string
): Address | null {
  const contract = getSablierAirdropsContract({ chainId, contractName })

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

/**
 * Get the SablierFactoryMerkleInstant contract address for a given chain
 */
export function getSablierFactoryMerkleInstantAddress(chainId: CHAIN_ID): Address | null {
  return getSablierAirdropsContractAddress(chainId, 'SablierFactoryMerkleInstant')
}

/**
 * Get the SablierFactoryMerkleLL contract address for a given chain
 */
export function getSablierFactoryMerkleLLAddress(chainId: CHAIN_ID): Address | null {
  return getSablierAirdropsContractAddress(chainId, 'SablierFactoryMerkleLL')
}

/**
 * Get both Sablier airdrops factory addresses needed for campaign creation
 */
export function getSablierAirdropFactories(chainId: CHAIN_ID): {
  factoryMerkleInstant: Address | null
  factoryMerkleLL: Address | null
} {
  const [factoryMerkleInstant, factoryMerkleLL] = [
    getSablierFactoryMerkleInstantAddress(chainId),
    getSablierFactoryMerkleLLAddress(chainId),
  ]

  return {
    factoryMerkleInstant,
    factoryMerkleLL,
  }
}
