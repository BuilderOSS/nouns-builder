import { CHAIN_ID } from '@buildeross/types'
import { isChainIdSupportedByEAS } from '@buildeross/utils'
import { Hex, isAddress } from 'viem'

import { SDK } from '../client'

export interface PinnedAsset {
  id: Hex
  tokenType: 0 | 1 | 2 // 0=ERC20, 1=ERC721, 2=ERC1155
  token: Hex
  isCollection: boolean
  tokenId: string
  creator: Hex
  timestamp: number
  revoked: boolean
  revokedAt?: number
  revokedBy?: Hex
}

export async function getTreasuryAssetPins(
  tokenAddress: string,
  chainId: CHAIN_ID,
  includeRevoked: boolean = false
): Promise<PinnedAsset[]> {
  // Input validation
  if (!isAddress(tokenAddress)) {
    console.error('Invalid DAO token address')
    return []
  }

  if (!isChainIdSupportedByEAS(chainId)) {
    console.error('Chain ID not supported by EAS')
    return []
  }

  try {
    const variables = {
      daoId: tokenAddress.toLowerCase(),
      first: 1000,
      skip: 0,
    }

    const { treasuryAssetPins: pins } =
      await SDK.connect(chainId).treasuryAssetPins(variables)

    if (!pins || pins.length === 0) {
      return []
    }

    // Filter out revoked pins unless includeRevoked is true
    const filteredPins = includeRevoked ? pins : pins.filter((pin) => !pin.revoked)

    const pinnedAssets: PinnedAsset[] = filteredPins.map((pin) => ({
      id: pin.id as Hex,
      tokenType: pin.tokenType as 0 | 1 | 2,
      token: pin.token as Hex,
      isCollection: pin.isCollection as boolean,
      tokenId: pin.tokenId.toString(),
      creator: pin.creator as Hex,
      timestamp: Number(pin.timestamp),
      revoked: pin.revoked as boolean,
      revokedAt: pin.revokedAt ? Number(pin.revokedAt) : undefined,
      revokedBy: pin.revokedBy ? (pin.revokedBy as Hex) : undefined,
    }))

    // Sort by timestamp descending (most recent first)
    return pinnedAssets.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error(
      'Error fetching pinned assets:',
      error instanceof Error ? error.message : String(error)
    )
    return []
  }
}
