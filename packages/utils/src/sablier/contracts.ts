import { CHAIN_ID } from '@buildeross/types'
import { sablier } from 'sablier'
import { Address } from 'viem'

/**
 * Get the SablierBatchLockup contract address for a given chain
 */
export async function getSablierBatchLockupAddress(
  chainId: CHAIN_ID
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

    // Get the SablierBatchLockup contract
    const contract = sablier.contracts.get({
      chainId,
      contractName: 'SablierBatchLockup',
      release: latestRelease,
    })

    if (!contract?.address) {
      console.error(`SablierBatchLockup not found for chain ${chainId}`)
      return null
    }

    return contract.address as Address
  } catch (error) {
    console.error(`Error getting SablierBatchLockup address for chain ${chainId}:`, error)
    return null
  }
}

/**
 * Get the SablierLockupLinear contract address for a given chain
 */
export async function getSablierLockupLinearAddress(
  chainId: CHAIN_ID
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

    // Get the SablierLockupLinear contract
    const contract = sablier.contracts.get({
      chainId,
      contractName: 'SablierLockupLinear',
      release: latestRelease,
    })

    if (!contract?.address) {
      console.error(`SablierLockupLinear not found for chain ${chainId}`)
      return null
    }

    return contract.address as Address
  } catch (error) {
    console.error(
      `Error getting SablierLockupLinear address for chain ${chainId}:`,
      error
    )
    return null
  }
}

/**
 * Get both Sablier contract addresses needed for batch stream creation
 */
export async function getSablierContracts(chainId: CHAIN_ID): Promise<{
  batchLockup: Address | null
  lockupLinear: Address | null
}> {
  const [batchLockup, lockupLinear] = await Promise.all([
    getSablierBatchLockupAddress(chainId),
    getSablierLockupLinearAddress(chainId),
  ])

  return {
    batchLockup,
    lockupLinear,
  }
}
