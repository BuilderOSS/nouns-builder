import { CHAIN_ID } from '@buildeross/types'
import { sablier } from 'sablier'
import { Address } from 'viem'

/**
 * Shared helper to get a Sablier contract address for a given chain
 */
async function getSablierContractAddress(
  chainId: CHAIN_ID,
  contractName: string
): Promise<Address | null> {
  try {
    // Get the latest release first
    const latestRelease = sablier.releases.getLatest({
      protocol: 'lockup',
    })

    if (!latestRelease) {
      console.error('No latest Sablier lockup release found')
      return null
    }

    // Get the contract
    const contract = sablier.contracts.get({
      chainId,
      contractName,
      release: latestRelease,
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
export async function getSablierBatchLockupAddress(
  chainId: CHAIN_ID
): Promise<Address | null> {
  return getSablierContractAddress(chainId, 'SablierBatchLockup')
}

/**
 * Get the SablierLockup contract address for a given chain
 */
export async function getSablierLockupAddress(
  chainId: CHAIN_ID
): Promise<Address | null> {
  return getSablierContractAddress(chainId, 'SablierLockup')
}

/**
 * Get both Sablier contract addresses needed for batch stream creation
 */
export async function getSablierContracts(chainId: CHAIN_ID): Promise<{
  batchLockup: Address | null
  lockup: Address | null
}> {
  const [batchLockup, lockup] = await Promise.all([
    getSablierBatchLockupAddress(chainId),
    getSablierLockupAddress(chainId),
  ])

  return {
    batchLockup,
    lockup,
  }
}
