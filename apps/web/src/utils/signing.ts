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
  if (safeConnector.cachedEOAAddress) {
    return safeConnector.cachedEOAAddress
  }

  const eoaAddress = await safeConnector.getEOAAddress()
  if (eoaAddress) {
    return eoaAddress
  }

  const savedEOAAddress = getSavedSafeInfo()?.eoaAddress
  if (savedEOAAddress) {
    return savedEOAAddress
  }

  throw new Error('Safe EOA address not available')
}

export function getCachedSigningAddress(
  connector: Connector | null | undefined,
  fallbackAddress: Address
): Address | null {
  if (connector?.id !== 'safeOwner') {
    return fallbackAddress
  }

  const safeConnector = connector as SafeOwnerConnectorType
  return safeConnector.cachedEOAAddress ?? getSavedSafeInfo()?.eoaAddress ?? null
}
