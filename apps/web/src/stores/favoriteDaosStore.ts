import {
  type DaoSearchResult,
  type ExploreDaoWithChainId,
} from '@buildeross/sdk/subgraph'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const FAVORITE_DAO_LIMIT = 10

const FAVORITE_DAOS_STORE_NAMESPACE =
  process.env.NEXT_PUBLIC_NETWORK_TYPE?.trim().toLowerCase() || 'default'
const FAVORITE_DAOS_STORE_IDENTIFIER = `favorite-daos-${FAVORITE_DAOS_STORE_NAMESPACE}`
const LEGACY_FAVORITE_DAOS_STORAGE_KEY_PREFIX = 'favorite-daos:'

export type FavoriteDao = {
  chainId: number
  collectionAddress: string
  tokenId?: number | string
  tokenName?: string
  tokenImage?: string
  collectionName?: string
  bid?: string
  endTime?: number
}

type ToggleFavoriteResult =
  | {
      didToggle: true
      isFavorited: boolean
      reason?: never
    }
  | {
      didToggle: false
      isFavorited: false
      reason: 'limit' | 'no_wallet'
    }

type FavoriteDaosState = {
  favoritesByAddress: Record<string, FavoriteDao[]>
}

type FavoriteDaosActions = {
  toggleFavorite: (address: string, favorite: FavoriteDao) => ToggleFavoriteResult
  hydrateLegacyFavorites: (address: string) => void
  clearAddress: (address: string) => void
}

export type FavoriteDaosStore = FavoriteDaosState & FavoriteDaosActions

const EMPTY_FAVORITES: FavoriteDao[] = []

const normalizeAddress = (address: string): string => address.toLowerCase()

const getLegacyFavoriteDaosStorageKey = (address: string) =>
  `${LEGACY_FAVORITE_DAOS_STORAGE_KEY_PREFIX}${normalizeAddress(address)}`

const getFavoriteItemKey = (chainId: number, collectionAddress: string) =>
  `${chainId}:${collectionAddress.toLowerCase()}`

export const getFavoriteDaoKey = (
  favorite: Pick<FavoriteDao, 'chainId' | 'collectionAddress'>
) => getFavoriteItemKey(favorite.chainId, favorite.collectionAddress)

const isFavoriteDao = (value: unknown): value is FavoriteDao => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const allowedKeys = new Set<keyof FavoriteDao>([
    'chainId',
    'collectionAddress',
    'tokenId',
    'tokenName',
    'tokenImage',
    'collectionName',
    'bid',
    'endTime',
  ])

  const keys = Object.keys(value)
  if (keys.some((key) => !allowedKeys.has(key as keyof FavoriteDao))) {
    return false
  }

  const item = value as FavoriteDao
  return (
    typeof item.chainId === 'number' &&
    typeof item.collectionAddress === 'string' &&
    (typeof item.tokenId === 'undefined' ||
      typeof item.tokenId === 'number' ||
      typeof item.tokenId === 'string') &&
    (typeof item.tokenName === 'undefined' || typeof item.tokenName === 'string') &&
    (typeof item.tokenImage === 'undefined' || typeof item.tokenImage === 'string') &&
    (typeof item.collectionName === 'undefined' ||
      typeof item.collectionName === 'string') &&
    (typeof item.bid === 'undefined' || typeof item.bid === 'string') &&
    (typeof item.endTime === 'undefined' || typeof item.endTime === 'number')
  )
}

const parseStoredFavorites = (storedValue: string | null): FavoriteDao[] => {
  if (!storedValue) return EMPTY_FAVORITES

  try {
    const parsed = JSON.parse(storedValue)
    if (!Array.isArray(parsed)) return EMPTY_FAVORITES

    return parsed.filter(isFavoriteDao)
  } catch {
    return EMPTY_FAVORITES
  }
}

const dedupeFavorites = (favorites: FavoriteDao[]): FavoriteDao[] => {
  const seenKeys = new Set<string>()

  return favorites.filter((favorite) => {
    const key = getFavoriteDaoKey(favorite)
    if (seenKeys.has(key)) return false

    seenKeys.add(key)
    return true
  })
}

const sanitizeFavorites = (favorites: FavoriteDao[]): FavoriteDao[] =>
  dedupeFavorites(favorites).slice(0, FAVORITE_DAO_LIMIT)

const getFavoritesForAddress = (
  favoritesByAddress: Record<string, FavoriteDao[]>,
  address: string
): FavoriteDao[] => favoritesByAddress[address] ?? EMPTY_FAVORITES

export const buildFavoriteDao = (
  dao: ExploreDaoWithChainId | DaoSearchResult
): FavoriteDao => {
  const bid = dao.highestBid?.amount ?? undefined

  return {
    chainId: dao.chainId,
    collectionAddress: dao.dao.tokenAddress,
    tokenId:
      typeof dao.token?.tokenId === 'bigint'
        ? dao.token.tokenId.toString()
        : (dao.token?.tokenId ?? undefined),
    tokenImage: dao.token?.image ?? undefined,
    tokenName: dao.token?.name ?? undefined,
    collectionName: dao.dao.name ?? undefined,
    bid: bid ? bid.toString() : undefined,
    endTime: dao.endTime ?? undefined,
  }
}

export const useFavoriteDaosStore = create<FavoriteDaosStore>()(
  persist(
    (set) => ({
      favoritesByAddress: {},
      toggleFavorite: (address: string, favorite: FavoriteDao): ToggleFavoriteResult => {
        const normalizedAddress = normalizeAddress(address)
        let toggleResult: ToggleFavoriteResult = {
          didToggle: false,
          isFavorited: false,
          reason: 'limit',
        }

        set((state: FavoriteDaosStore) => {
          const currentFavorites = getFavoritesForAddress(
            state.favoritesByAddress,
            normalizedAddress
          )
          const favoriteKey = getFavoriteDaoKey(favorite)
          const isFavorited = currentFavorites.some(
            (item) => getFavoriteDaoKey(item) === favoriteKey
          )

          if (isFavorited) {
            toggleResult = {
              didToggle: true,
              isFavorited: false,
            }

            return {
              favoritesByAddress: {
                ...state.favoritesByAddress,
                [normalizedAddress]: currentFavorites.filter(
                  (item) => getFavoriteDaoKey(item) !== favoriteKey
                ),
              },
            }
          }

          if (currentFavorites.length >= FAVORITE_DAO_LIMIT) {
            toggleResult = {
              didToggle: false,
              isFavorited: false,
              reason: 'limit',
            }

            return state
          }

          toggleResult = {
            didToggle: true,
            isFavorited: true,
          }

          return {
            favoritesByAddress: {
              ...state.favoritesByAddress,
              [normalizedAddress]: sanitizeFavorites([favorite, ...currentFavorites]),
            },
          }
        })

        return toggleResult
      },
      hydrateLegacyFavorites: (address: string) => {
        if (typeof window === 'undefined') return

        const normalizedAddress = normalizeAddress(address)
        const storageKey = getLegacyFavoriteDaosStorageKey(normalizedAddress)
        const storedFavorites = parseStoredFavorites(
          window.localStorage.getItem(storageKey)
        )

        if (!storedFavorites.length) return

        set((state: FavoriteDaosStore) => {
          if (state.favoritesByAddress[normalizedAddress]?.length) {
            return state
          }

          return {
            favoritesByAddress: {
              ...state.favoritesByAddress,
              [normalizedAddress]: sanitizeFavorites(storedFavorites),
            },
          }
        })

        try {
          window.localStorage.removeItem(storageKey)
        } catch (error) {
          console.error('Failed to clean up legacy favorite DAO state', error)
        }
      },
      clearAddress: (address: string) => {
        const normalizedAddress = normalizeAddress(address)

        set((state: FavoriteDaosStore) => {
          if (!state.favoritesByAddress[normalizedAddress]) {
            return state
          }

          const nextFavoritesByAddress = { ...state.favoritesByAddress }
          delete nextFavoritesByAddress[normalizedAddress]

          return {
            favoritesByAddress: nextFavoritesByAddress,
          }
        })
      },
    }),
    {
      name: FAVORITE_DAOS_STORE_IDENTIFIER,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state: FavoriteDaosStore) => ({
        favoritesByAddress: state.favoritesByAddress,
      }),
    }
  )
)
