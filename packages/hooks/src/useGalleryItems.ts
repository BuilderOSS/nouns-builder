import { COINING_ENABLED } from '@buildeross/constants/coining'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import {
  daoZoraCoinsRequest,
  daoZoraDropsRequest,
  type ZoraCoinFragment,
  type ZoraDropFragment,
} from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { chainIdToName } from '@buildeross/utils/chains'
import { isChainIdSupportedByCoining } from '@buildeross/utils/coining'
import { isChainIdSupportedByDroposal } from '@buildeross/utils/droposal'
import { useMemo } from 'react'
import useSWR from 'swr'

export type GalleryItemType = 'coin' | 'drop'

export type GalleryItem =
  | (ZoraCoinFragment & { itemType: 'coin' })
  | (ZoraDropFragment & { itemType: 'drop' })

export interface UseGalleryItemsReturn {
  data: GalleryItem[] | undefined
  coins: ZoraCoinFragment[] | undefined
  drops: ZoraDropFragment[] | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: () => Promise<void>
}

export const useGalleryItems = ({
  chainId,
  collectionAddress,
  enabled = true,
  first = 100,
}: {
  chainId: CHAIN_ID
  collectionAddress?: AddressType
  enabled?: boolean
  first?: number
}): UseGalleryItemsReturn => {
  // Check if chains are supported
  const isCoinSupported = isChainIdSupportedByCoining(chainId)
  const isDropSupported = isChainIdSupportedByDroposal(chainId)

  // Only error if BOTH are not supported AND hook is enabled
  const supportError =
    enabled && !isCoinSupported && !isDropSupported
      ? new Error(`Gallery is not supported on ${chainIdToName(chainId)}`)
      : undefined

  // Fetch coins
  const {
    data: coinsData,
    error: coinsError,
    isLoading: isLoadingCoins,
    isValidating: isValidatingCoins,
    mutate: mutateCoins,
  } = useSWR(
    !!collectionAddress && enabled && isCoinSupported && COINING_ENABLED
      ? ([SWR_KEYS.ZORA_COINS, chainId, collectionAddress, first] as const)
      : null,
    async ([, _chainId, _collectionAddress, _first]) =>
      daoZoraCoinsRequest(
        _collectionAddress as AddressType,
        _chainId as CHAIN_ID,
        _first
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // Fetch drops
  const {
    data: dropsData,
    error: dropsError,
    isLoading: isLoadingDrops,
    isValidating: isValidatingDrops,
    mutate: mutateDrops,
  } = useSWR(
    !!collectionAddress && enabled && isDropSupported
      ? ([SWR_KEYS.ZORA_DROPS, chainId, collectionAddress, first] as const)
      : null,
    async ([, _chainId, _collectionAddress, _first]) =>
      daoZoraDropsRequest(
        _collectionAddress as AddressType,
        _chainId as CHAIN_ID,
        _first
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // Combine and sort items
  const combinedData = useMemo(() => {
    const coins = isCoinSupported ? coinsData : undefined
    const drops = isDropSupported ? dropsData : undefined

    if (!coins && !drops) return undefined

    const coinItems: GalleryItem[] = (coins || []).map((coin) => ({
      ...coin,
      itemType: 'coin' as const,
    }))

    const dropItems: GalleryItem[] = (drops || []).map((drop) => ({
      ...drop,
      itemType: 'drop' as const,
    }))

    // Combine and sort by creation timestamp (newest first)
    const combined = [...coinItems, ...dropItems].sort((a, b) => {
      const aTime = Number(a.createdAt)
      const bTime = Number(b.createdAt)
      return bTime - aTime // descending order
    })

    return combined
  }, [coinsData, dropsData, isCoinSupported, isDropSupported])

  // Combined mutate function
  const mutate = async () => {
    await Promise.all([mutateCoins(), mutateDrops()])
  }

  return {
    data: combinedData,
    coins: isCoinSupported ? coinsData : undefined,
    drops: isDropSupported ? dropsData : undefined,
    isLoading: isLoadingCoins || isLoadingDrops,
    isValidating: isValidatingCoins || isValidatingDrops,
    error: supportError || coinsError || dropsError,
    mutate,
  }
}
