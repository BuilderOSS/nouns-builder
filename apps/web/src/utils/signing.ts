import { getSavedSafeInfo } from '@buildeross/utils'
import type { Address } from 'viem'
import type { Connector } from 'wagmi'

import type { SafeOwnerConnectorType } from '../types/connectors'

export async function resolveSigningAddress(
  connector: Connector | null | undefined,
  fallbackAddress: Address
): Promise<Address> {
  if (connector?.id !== 'safeOwner') {
    return fallbackAddress
  }

  const safeConnector = connector as SafeOwnerConnectorType
  const ownerAddress = await safeConnector.getOwnerAddress()
  if (ownerAddress) {
    return ownerAddress
  }

  if (safeConnector.cachedOwnerAddress) {
    return safeConnector.cachedOwnerAddress
  }

  const savedOwnerAddress = getSavedSafeInfo()?.ownerAddress
  if (savedOwnerAddress) {
    return savedOwnerAddress
  }

  throw new Error('Safe owner address not available')
}

export function getCachedSigningAddress(
  connector: Connector | null | undefined,
  fallbackAddress: Address
): Address | null {
  if (connector?.id !== 'safeOwner') {
    return fallbackAddress
  }

  const safeConnector = connector as SafeOwnerConnectorType
  return safeConnector.cachedOwnerAddress ?? getSavedSafeInfo()?.ownerAddress ?? null
}
