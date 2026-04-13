import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { SubgraphSDK } from '@buildeross/sdk/subgraph'
import { type CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { isAddress } from 'viem'

type FavoriteDaoDetails = {
  chainId: number
  collectionAddress: string
  tokenId?: number | string
  tokenName?: string
  tokenImage?: string
  collectionName?: string
  bid?: string
  endTime?: number | string
}

const MAX_FAVORITES = 10
const SUBGRAPH_TIMEOUT_MS = 8000

const callWithTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: NodeJS.Timeout | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Subgraph call timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const favoritesParam = req.query.favorites

  if (!favoritesParam || typeof favoritesParam !== 'string') {
    return res.status(200).json({ daos: [] })
  }

  const items = favoritesParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_FAVORITES)

  if (!items.length) {
    return res.status(200).json({ daos: [] })
  }

  const validChainIds = new Set(PUBLIC_DEFAULT_CHAINS.map((chain) => chain.id))
  const favoritesByChain = new Map<CHAIN_ID, string[]>()

  for (const item of items) {
    const [chainIdPart, collectionAddressPart] = item.split(':')
    const chainId = Number(chainIdPart)
    const collectionAddress = collectionAddressPart?.toLowerCase()

    if (!Number.isInteger(chainId) || !validChainIds.has(chainId)) continue
    if (!collectionAddress || !isAddress(collectionAddress, { strict: false })) continue

    const chainFavorites = favoritesByChain.get(chainId as CHAIN_ID) ?? []
    if (!chainFavorites.includes(collectionAddress)) {
      chainFavorites.push(collectionAddress)
      favoritesByChain.set(chainId as CHAIN_ID, chainFavorites)
    }
  }

  if (!favoritesByChain.size) {
    return res.status(200).json({ daos: [] })
  }

  try {
    const daoDetailsByKey = new Map<string, FavoriteDaoDetails>()

    await Promise.all(
      Array.from(favoritesByChain.entries()).map(
        async ([chainId, collectionAddresses]) => {
          try {
            const response = await callWithTimeout(
              SubgraphSDK.connect(chainId).findAuctionsForDaos({
                daos: collectionAddresses,
              }),
              SUBGRAPH_TIMEOUT_MS
            )

            response.auctions.forEach((auction) => {
              const collectionAddress = auction.dao.tokenAddress.toLowerCase()
              const bid = auction.highestBid?.amount

              daoDetailsByKey.set(`${chainId}:${collectionAddress}`, {
                chainId,
                collectionAddress,
                tokenId:
                  typeof auction.token?.tokenId === 'bigint'
                    ? auction.token.tokenId.toString()
                    : (auction.token?.tokenId ?? undefined),
                tokenImage: auction.token?.image ?? undefined,
                tokenName: auction.token?.name ?? undefined,
                collectionName: auction.dao.name ?? undefined,
                bid: bid ? bid.toString() : undefined,
                endTime:
                  typeof auction.endTime === 'bigint'
                    ? auction.endTime.toString()
                    : (auction.endTime ?? undefined),
              })
            })
          } catch (err) {
            console.error(
              `Timeout or error fetching favorites for chain ${chainId}:`,
              err
            )
          }
        }
      )
    )

    const daos = items
      .map((item) => {
        const [chainIdPart, collectionAddressPart] = item.split(':')
        const chainId = Number(chainIdPart)
        const collectionAddress = collectionAddressPart?.toLowerCase()

        if (!Number.isInteger(chainId) || !collectionAddress) return undefined

        return daoDetailsByKey.get(`${chainId}:${collectionAddress}`)
      })
      .filter((dao): dao is FavoriteDaoDetails => !!dao)

    const { maxAge, swr } = CACHE_TIMES.EXPLORE
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )

    return res.status(200).json({ daos })
  } catch (error) {
    console.error('Favorite DAO details error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors()(
  withRateLimit({
    keyPrefix: 'favorite-daos',
  })(handler)
)
