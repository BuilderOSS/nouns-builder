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

type PersistedFavoriteDao = Pick<
  FavoriteDao,
  | 'chainId'
  | 'collectionAddress'
  | 'tokenId'
  | 'tokenName'
  | 'tokenImage'
  | 'collectionName'
>

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
  clearAddress: (address: string) => void
}

type FavoriteDaosPersistedState = {
  favoritesByAddress: Record<string, PersistedFavoriteDao[]>
}

export type FavoriteDaosStore = FavoriteDaosState & FavoriteDaosActions

const EMPTY_FAVORITES: FavoriteDao[] = []

const normalizeAddress = (address: string): string => address.toLowerCase()

const getFavoriteItemKey = (chainId: number, collectionAddress: string) =>
  `${chainId}:${collectionAddress.toLowerCase()}`

export const getFavoriteDaoKey = (
  favorite: Pick<FavoriteDao, 'chainId' | 'collectionAddress'>
) => getFavoriteItemKey(favorite.chainId, favorite.collectionAddress)

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

const toPersistedFavoriteDao = (favorite: FavoriteDao): PersistedFavoriteDao => ({
  chainId: favorite.chainId,
  collectionAddress: favorite.collectionAddress,
  tokenId: favorite.tokenId,
  tokenName: favorite.tokenName,
  tokenImage: favorite.tokenImage,
  collectionName: favorite.collectionName,
})

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
      partialize: (state: FavoriteDaosStore): FavoriteDaosPersistedState => ({
        favoritesByAddress: Object.entries(state.favoritesByAddress).reduce<
          Record<string, PersistedFavoriteDao[]>
        >((nextFavoritesByAddress, [address, favorites]) => {
          nextFavoritesByAddress[address] = favorites.map(toPersistedFavoriteDao)
          return nextFavoritesByAddress
        }, {}),
      }),
    }
  )
)
