import { Alchemy, Network, NftFilters, TokenBalanceType } from 'alchemy-sdk'
import { Hex, formatUnits, fromHex, zeroHash } from 'viem'

import { ALCHEMY_API_KEY, ALCHEMY_NETWORKS } from 'src/constants/alchemy'
import { AddressType, CHAIN_ID } from 'src/typings'

import { BackendFailedError } from './errors'
import { getRedisConnection } from './redisConnection'

// Cache key generation helpers
const getTokenPriceKey = (chainId: CHAIN_ID, address: string) =>
  `alchemy:token-price:${chainId}:${address.toLowerCase()}`

const getTokenMetadataKey = (chainId: CHAIN_ID, address: string) =>
  `alchemy:token-metadata:${chainId}:${address.toLowerCase()}`

const getTokenBalancesKey = (chainId: CHAIN_ID, address: string) =>
  `alchemy:token-balances:${chainId}:${address.toLowerCase()}`

const getNftBalancesKey = (chainId: CHAIN_ID, address: string) =>
  `alchemy:nft-balances:${chainId}:${address.toLowerCase()}`

// Serialized NFT type with only the data we need for frontend display
export type SerializedNft = {
  contract: {
    address: string
  }
  tokenId: string
  name: string | null
  image: {
    originalUrl: string
  }
  collection: {
    name: string | null
  }
}

// Parse Alchemy NFT data into our serialized type
const parseNftData = (nfts: any[]): SerializedNft[] => {
  return nfts.map((nft) => ({
    contract: {
      address: nft.contract?.address || '',
    },
    tokenId: nft.tokenId || '',
    name: nft.name || null,
    image: {
      originalUrl: nft.image?.originalUrl || '',
    },
    collection: {
      name: nft.collection?.name || null,
    },
  }))
}

// Custom token balance type for serialization
export type SerializedTokenBalance = {
  address: string
  balance: string
  name: string
  symbol: string
  decimals: number
  logo: string
  price: string
  valueInUSD: string
}

// Parse token balance data into serializable format
const parseTokenBalanceData = (
  balances: EnrichedTokenBalance[]
): SerializedTokenBalance[] => {
  return balances.map((balance) => ({
    address: balance.address || '',
    balance: balance.balance?.toString() || '0',
    name: balance.name || '',
    symbol: balance.symbol || '',
    decimals: balance.decimals || 18,
    logo: balance.logo || '',
    price: balance.price || '0',
    valueInUSD: balance.valueInUSD || '0',
  }))
}

// Type definitions
export type TokenBalance = {
  address: AddressType
  balance: string
}

export type TokenMetadata = {
  address: AddressType
  name: string
  symbol: string
  decimals: number
  logo: string
}

export type TokenPrice = {
  address: string
  price: string
}

export type CachedResult<T> = {
  data: T
  source: 'fetched' | 'cache'
}

export type EnrichedTokenBalance = TokenBalance &
  TokenMetadata &
  TokenPrice & {
    valueInUSD: string
  }

// Helper to create Alchemy instance
const createAlchemyInstance = (chainId: CHAIN_ID): Alchemy | null => {
  const network = ALCHEMY_NETWORKS[chainId]
  if (!network || !ALCHEMY_API_KEY) {
    return null
  }
  return new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: network as Network,
  })
}

export const getCachedTokenBalances = async (
  chainId: CHAIN_ID,
  address: AddressType
): Promise<CachedResult<TokenBalance[]> | null> => {
  const alchemy = createAlchemyInstance(chainId)
  if (!alchemy) {
    return null
  }

  const cacheKey = getTokenBalancesKey(chainId, address)
  const redis = getRedisConnection()

  // Check cache first
  const cached = await redis?.get(cacheKey)
  if (cached) {
    return {
      data: JSON.parse(cached),
      source: 'cache',
    }
  }

  try {
    // Fetch from Alchemy API
    const tokenBalances = await alchemy.core.getTokenBalances(address, {
      type: TokenBalanceType.ERC20,
    })

    const nonZeroBalances = tokenBalances.tokenBalances.filter(
      (balance) => !!balance.tokenBalance && balance.tokenBalance !== zeroHash
    )

    const result: TokenBalance[] = nonZeroBalances.map((balance) => ({
      address: balance.contractAddress as AddressType,
      balance: fromHex(balance.tokenBalance! as Hex, 'bigint').toString(),
    }))

    // Cache the result (5 minutes TTL)
    await redis?.setex(cacheKey, 300, JSON.stringify(result))

    return {
      data: result,
      source: 'fetched',
    }
  } catch (error) {
    console.error('getCachedTokenBalances error:', error)
    throw new BackendFailedError('Failed to fetch token balances')
  }
}

export const getCachedNFTBalance = async (
  chainId: CHAIN_ID,
  address: AddressType
): Promise<CachedResult<SerializedNft[]> | null> => {
  const alchemy = createAlchemyInstance(chainId)
  if (!alchemy) {
    return null
  }

  const cacheKey = getNftBalancesKey(chainId, address)
  const redis = getRedisConnection()

  // Check cache first
  const cached = await redis?.get(cacheKey)
  if (cached) {
    return {
      data: JSON.parse(cached),
      source: 'cache',
    }
  }

  try {
    // Fetch from Alchemy API
    const nfts = await alchemy.nft.getNftsForOwner(address, {
      excludeFilters: [NftFilters.SPAM],
    })

    // Parse and cache the result (15 minutes TTL)
    const parsedNfts = parseNftData(nfts.ownedNfts)
    await redis?.setex(cacheKey, 900, JSON.stringify(parsedNfts))

    return {
      data: parsedNfts,
      source: 'fetched',
    }
  } catch (error) {
    console.error('getCachedNFTBalance error:', error)
    throw new BackendFailedError('Failed to fetch NFT balances')
  }
}

export const getCachedTokenMetadatas = async (
  chainId: CHAIN_ID,
  addresses: AddressType[]
): Promise<CachedResult<TokenMetadata[]> | null> => {
  const alchemy = createAlchemyInstance(chainId)
  if (!alchemy) {
    return null
  }

  const redis = getRedisConnection()
  const results: TokenMetadata[] = []
  const uncachedAddresses: AddressType[] = []
  let hasCache = false

  // Check cache for each token address
  for (const address of addresses) {
    const cacheKey = getTokenMetadataKey(chainId, address)
    const cached = await redis?.get(cacheKey)

    if (cached) {
      results.push(JSON.parse(cached))
      hasCache = true
    } else {
      uncachedAddresses.push(address)
    }
  }

  // Fetch uncached metadata from API
  if (uncachedAddresses.length > 0) {
    try {
      const metadatas = await Promise.all(
        uncachedAddresses.map((address) => alchemy.core.getTokenMetadata(address))
      )

      // Process and cache each metadata
      for (let i = 0; i < metadatas.length; i++) {
        const metadata = metadatas[i]
        const address = uncachedAddresses[i]

        const tokenMetadata: TokenMetadata = {
          address: address as AddressType,
          name: metadata.name ?? '',
          symbol: metadata.symbol ?? '',
          decimals: metadata.decimals ?? 18,
          logo: metadata.logo ?? '',
        }

        // Cache individual metadata (24 hours TTL)
        const cacheKey = getTokenMetadataKey(chainId, address)
        await redis?.setex(cacheKey, 86400, JSON.stringify(tokenMetadata))

        results.push(tokenMetadata)
      }
    } catch (error) {
      console.error('getCachedTokenMetadatas error:', error)
      throw new BackendFailedError('Failed to fetch token metadata')
    }
  }

  return {
    data: results,
    source: hasCache && uncachedAddresses.length === 0 ? 'cache' : 'fetched',
  }
}

export const getCachedTokenPrices = async (
  chainId: CHAIN_ID,
  addresses: AddressType[]
): Promise<CachedResult<TokenPrice[]> | null> => {
  const alchemy = createAlchemyInstance(chainId)
  if (!alchemy) {
    return null
  }

  const redis = getRedisConnection()
  const results: TokenPrice[] = []
  const uncachedAddresses: AddressType[] = []
  let hasCache = false

  // Check cache for each address
  for (const address of addresses) {
    const cacheKey = getTokenPriceKey(chainId, address)
    const cached = await redis?.get(cacheKey)

    if (cached) {
      results.push(JSON.parse(cached))
      hasCache = true
    } else {
      uncachedAddresses.push(address)
    }
  }

  // Fetch uncached prices from API in batches of 25 (Alchemy API limit)
  if (uncachedAddresses.length > 0) {
    try {
      const BATCH_SIZE = 25
      const batches: AddressType[][] = []

      // Split addresses into batches of 25
      for (let i = 0; i < uncachedAddresses.length; i += BATCH_SIZE) {
        batches.push(uncachedAddresses.slice(i, i + BATCH_SIZE))
      }

      // Process each batch
      for (const batch of batches) {
        // Create TokenAddressRequest objects for the batch
        const tokenAddressRequests = batch.map((address) => ({
          network: ALCHEMY_NETWORKS[chainId] as Network,
          address: address,
        }))

        // Call the API with the array of requests
        const priceResponse =
          await alchemy.prices.getTokenPriceByAddress(tokenAddressRequests)

        // Process and cache each price
        for (let i = 0; i < priceResponse.data.length; i++) {
          const priceResult = priceResponse.data[i]
          const address = batch[i]

          const tokenPrice: TokenPrice = {
            address: address,
            price:
              priceResult.prices?.find((p) => p.currency.toLowerCase() === 'usd')
                ?.value ?? '0',
          }

          // Cache individual price (5 minutes TTL)
          const cacheKey = getTokenPriceKey(chainId, address)
          await redis?.setex(cacheKey, 300, JSON.stringify(tokenPrice))

          results.push(tokenPrice)
        }
      }
    } catch (error) {
      console.error('getCachedTokenPrices error:', error)
      throw new BackendFailedError('Failed to fetch token prices')
    }
  }

  return {
    data: results,
    source: hasCache && uncachedAddresses.length === 0 ? 'cache' : 'fetched',
  }
}

const MINIMUM_USD_VALUE = 0.01

export const getEnrichedTokenBalances = async (
  chainId: CHAIN_ID,
  address: AddressType
): Promise<CachedResult<SerializedTokenBalance[]> | null> => {
  // Get token balances
  const balancesResult = await getCachedTokenBalances(chainId, address)
  if (!balancesResult || balancesResult.data.length === 0) {
    return { data: [], source: 'fetched' }
  }

  // Get metadata for all tokens
  const metadataResult = await getCachedTokenMetadatas(
    chainId,
    balancesResult.data.map((balance) => balance.address)
  )
  if (!metadataResult || metadataResult.data.length === 0) {
    return { data: [], source: 'fetched' }
  }

  // Get prices for all token addresses
  const tokenAddresses = balancesResult.data.map((balance) => balance.address)
  const pricesResult = await getCachedTokenPrices(chainId, tokenAddresses)
  if (!pricesResult || pricesResult.data.length === 0) {
    return { data: [], source: 'fetched' }
  }

  // Combine all data
  const enrichedBalances: EnrichedTokenBalance[] = balancesResult.data
    .map((balance) => {
      const metadata = metadataResult.data.find(
        (metadata) => metadata.address.toLowerCase() === balance.address.toLowerCase()
      )
      const price = pricesResult.data.find(
        (price) => price.address.toLowerCase() === balance.address.toLowerCase()
      )

      // Skip if metadata or price is missing
      if (!metadata || !price) {
        return null
      }

      const amount = parseFloat(formatUnits(BigInt(balance.balance), metadata.decimals))
      const valueInUSD = (amount * parseFloat(price.price)).toFixed(2)

      return {
        ...balance,
        ...metadata,
        symbol: metadata.symbol, // Keep symbol from metadata for backwards compatibility
        price: price.price,
        valueInUSD,
      }
    })
    .filter(Boolean) as EnrichedTokenBalance[]

  // Filter by minimum USD value
  const filteredBalances = enrichedBalances.filter(
    (balance) => parseFloat(balance.valueInUSD) >= MINIMUM_USD_VALUE
  )

  // Parse the data to ensure JSON serialization safety
  const parsedBalances = parseTokenBalanceData(filteredBalances)

  // Determine source based on cache hits
  const source =
    balancesResult.source === 'cache' &&
    metadataResult.source === 'cache' &&
    pricesResult.source === 'cache'
      ? 'cache'
      : 'fetched'

  return {
    data: parsedBalances,
    source,
  }
}
