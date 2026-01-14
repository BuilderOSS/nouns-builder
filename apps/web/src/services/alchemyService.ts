import { ALCHEMY_API_KEY, ALCHEMY_NETWORKS } from '@buildeross/constants/alchemy'
import { PUBLIC_IS_TESTNET } from '@buildeross/constants/chains'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import {
  Alchemy,
  Network,
  NftFilters,
  NftTokenType,
  OwnedNft,
  TokenBalanceType,
} from 'alchemy-sdk'
import axios from 'axios'
import { formatUnits, fromHex, getAddress, Hex, zeroHash } from 'viem'

import { BackendFailedError } from './errors'
import { getRedisConnection } from './redisConnection'

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY ?? ''
const COINGECKO_API_KEY_PARAM = COINGECKO_API_KEY ? `&x-api-key=${COINGECKO_API_KEY}` : ''

const chainTypeTag = PUBLIC_IS_TESTNET ? 'testnet' : 'mainnet'

const getTokenPriceKey = (chainId: CHAIN_ID, address: string) =>
  `alchemy:token-price:${chainTypeTag}:${chainId}:${address.toLowerCase()}`

const getTokenMetadataKey = (chainId: CHAIN_ID, address: string) =>
  `alchemy:token-metadata:${chainTypeTag}:${chainId}:${address.toLowerCase()}`

const getTokenBalancesKey = (chainId: CHAIN_ID, address: string) =>
  `alchemy:token-balances:${chainTypeTag}:${chainId}:${address.toLowerCase()}`

const getNftBalancesKey = (chainId: CHAIN_ID, address: string) =>
  `alchemy:nft-balances:${chainTypeTag}:${chainId}:${address.toLowerCase()}`

const getNftMetadataKey = (chainId: CHAIN_ID, contractAddress: string, tokenId: string) =>
  `alchemy:nft-metadata:${chainTypeTag}:${chainId}:${contractAddress.toLowerCase()}:${tokenId}`

const getCoinGeckoLogoKey = (chainId: CHAIN_ID, address: string) =>
  `coingecko:logo:${chainTypeTag}:${chainId}:${address.toLowerCase()}`

// Serialized NFT type with only the data we need for frontend display
export type SerializedNft = {
  tokenId: string
  tokenType: NftTokenType
  balance: string
  contract: {
    address: string
  }
  name: string | null
  image: {
    originalUrl: string
  }
  collection: {
    name: string | null
  }
}

// Serialized NFT metadata type for individual NFT metadata
export type SerializedNftMetadata = {
  contract: {
    address: string
  }
  tokenId: string
  tokenType: NftTokenType
  name: string | null
  description: string | null
  image: string | null
  tokenUri: string | null
}

// Parse Alchemy NFT data into our serialized type
const parseNftData = (nfts: OwnedNft[]): SerializedNft[] => {
  return nfts.map((nft) => ({
    tokenId: nft.tokenId || '',
    tokenType: nft.tokenType || NftTokenType.UNKNOWN,
    balance: nft.balance || '',
    contract: {
      address: nft.contract?.address || '',
    },
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

export type PinnedAssetInput = {
  tokenType: 0 | 1 | 2 // 0=ERC20, 1=ERC721, 2=ERC1155
  token: AddressType
  isCollection: boolean
  tokenId?: string
}

export type EnrichedPinnedAsset = {
  tokenType: 0 | 1 | 2
  token: AddressType
  isCollection: boolean
  tokenId?: string
  // ERC20 fields
  balance?: string
  name?: string
  symbol?: string
  decimals?: number
  logo?: string
  price?: string
  valueInUSD?: string
  // NFT fields
  nftName?: string
  image?: string
  collectionName?: string
  nftBalance?: string
  // Metadata
  isPinned: true
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

export type TokenBalanceOptions = {
  useCache?: boolean
}

export const getCachedTokenBalances = async (
  chainId: CHAIN_ID,
  address: AddressType,
  options?: TokenBalanceOptions
): Promise<CachedResult<TokenBalance[]> | null> => {
  const alchemy = createAlchemyInstance(chainId)
  if (!alchemy) {
    return null
  }

  const useCache = options?.useCache ?? true

  const cacheKey = getTokenBalancesKey(chainId, address)
  const redis = getRedisConnection()

  if (useCache) {
    // Check cache first
    const cached = await redis?.get(cacheKey)
    if (cached) {
      return {
        data: JSON.parse(cached),
        source: 'cache',
      }
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

export type NFTBalanceOptions = {
  filterSpam?: boolean
  useCache?: boolean
}

export const getCachedNFTBalance = async (
  chainId: CHAIN_ID,
  address: AddressType,
  options?: NFTBalanceOptions
): Promise<CachedResult<SerializedNft[]> | null> => {
  const alchemy = createAlchemyInstance(chainId)
  if (!alchemy) {
    return null
  }

  const useCache = options?.useCache ?? true
  const filterSpam = options?.filterSpam ?? true

  const cacheKey = getNftBalancesKey(chainId, address)
  const redis = getRedisConnection()

  if (useCache) {
    // Check cache first
    const cached = await redis?.get(cacheKey)
    if (cached) {
      return {
        data: JSON.parse(cached),
        source: 'cache',
      }
    }
  }

  try {
    // Fetch from Alchemy API
    const nfts = await alchemy.nft.getNftsForOwner(address, {
      excludeFilters: filterSpam ? [NftFilters.SPAM] : [],
    })

    // Parse and cache the result (15 minutes TTL)
    const parsedNfts = parseNftData(nfts.ownedNfts)

    // Cache the result (15 minutes TTL)
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

// Trust Wallet network mapping
const TRUSTWALLET_NETWORKS: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'ethereum',
  [CHAIN_ID.OPTIMISM]: 'optimism',
  [CHAIN_ID.BASE]: 'base',
}

const getTrustWalletTokenLogo = async (
  chainId: CHAIN_ID,
  address: AddressType
): Promise<string | null> => {
  const network = TRUSTWALLET_NETWORKS[chainId]
  if (!network) return ''

  const logoUrl = `https://raw.githubusercontent.com/trustwallet/assets/refs/heads/master/blockchains/${network}/assets/${getAddress(address)}/logo.png`

  try {
    const response = await fetch(logoUrl, { method: 'HEAD' })

    const isImage = response.headers.get('Content-Type')?.startsWith('image/')
    const exists = response.status === 200

    return exists && isImage ? logoUrl : ''
  } catch (error) {
    console.error('getTrustWalletTokenLogo error:', error)
    return ''
  }
}

// Coingecko network mapping
const COINGECKO_PLATFORMS: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'ethereum',
  [CHAIN_ID.OPTIMISM]: 'optimistic-ethereum',
  [CHAIN_ID.BASE]: 'base',
  [CHAIN_ID.ZORA]: 'zora-network',
}

// Fetch token logo from Coingecko API
const getCoinGeckoTokenLogo = async (
  chainId: CHAIN_ID,
  address: AddressType
): Promise<string> => {
  const platform = COINGECKO_PLATFORMS[chainId]
  if (!platform) return ''

  const redis = getRedisConnection()
  const cacheKey = getCoinGeckoLogoKey(chainId, address)

  // Check cache first
  const cached = await redis?.get(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${address.toLowerCase()}?${COINGECKO_API_KEY_PARAM}`

    const response = await axios.get(url)

    if (response.status !== 200) {
      throw new BackendFailedError('Coingecko API request failed')
    }
    const data = response.data
    const logoUrl = data?.image?.small || data?.image?.thumb || data?.image?.large || ''

    // Cache the result (24 hours TTL for successful responses)
    await redis?.setex(cacheKey, 86400, logoUrl)

    return logoUrl
  } catch (error) {
    console.error('getCoinGeckoTokenLogo error:', error)
    return ''
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

        let logoUrl = metadata.logo
        if (!logoUrl) {
          logoUrl = await getCoinGeckoTokenLogo(chainId, address)
        }
        if (!logoUrl) {
          logoUrl = await getTrustWalletTokenLogo(chainId, address)
        }

        const tokenMetadata: TokenMetadata = {
          address: address as AddressType,
          name: metadata.name ?? '',
          symbol: metadata.symbol ?? '',
          decimals: metadata.decimals ?? 18,
          logo: logoUrl ?? '',
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

const MINIMUM_USD_VALUE = 5

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

  // Filter by minimum USD value (only on mainnet, show all tokens on testnet)
  const filteredBalances = PUBLIC_IS_TESTNET
    ? enrichedBalances
    : enrichedBalances.filter(
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

// Get cached NFT metadata for a specific NFT
export const getCachedNftMetadata = async (
  chainId: CHAIN_ID,
  contractAddress: AddressType,
  tokenId: string
): Promise<CachedResult<SerializedNftMetadata> | null> => {
  const alchemy = createAlchemyInstance(chainId)
  if (!alchemy) {
    return null
  }

  const redis = getRedisConnection()
  const cacheKey = getNftMetadataKey(chainId, contractAddress, tokenId)

  try {
    // Check cache first
    const cached = await redis?.get(cacheKey)
    if (cached) {
      return {
        data: JSON.parse(cached),
        source: 'cache',
      }
    }

    // Fetch from Alchemy API
    const metadata = await alchemy.nft.getNftMetadata(contractAddress, tokenId)

    // Process image URL - handle Zora API replacement
    let imageUrl = metadata.image?.originalUrl || metadata.image?.cachedUrl || null
    if (imageUrl && typeof imageUrl === 'string') {
      if (imageUrl.startsWith('https://api.zora.co')) {
        imageUrl = imageUrl.replace('https://api.zora.co', 'https://nouns.build/api')
      }
    }

    // Create serialized metadata
    const serializedMetadata: SerializedNftMetadata = {
      contract: {
        address: metadata.contract?.address || contractAddress,
      },
      tokenId: metadata.tokenId || tokenId,
      tokenType: metadata.tokenType || NftTokenType.UNKNOWN,
      name: metadata.name || null,
      description: metadata.description || null,
      image: imageUrl,
      tokenUri: metadata.tokenUri || null,
    }

    // Cache the result (15 minutes TTL)
    await redis?.setex(cacheKey, 900, JSON.stringify(serializedMetadata))

    return {
      data: serializedMetadata,
      source: 'fetched',
    }
  } catch (error) {
    console.error('getCachedNftMetadata error:', error)
    throw new BackendFailedError('Failed to fetch NFT metadata')
  }
}

export const getEnrichedPinnedAssets = async (
  chainId: CHAIN_ID,
  treasuryAddress: AddressType,
  pinnedAssets: PinnedAssetInput[]
): Promise<EnrichedPinnedAsset[]> => {
  if (pinnedAssets.length === 0) return []

  const alchemy = createAlchemyInstance(chainId)
  if (!alchemy) {
    throw new BackendFailedError('Failed to create Alchemy instance')
  }

  // Separate by token type
  const erc20Assets = pinnedAssets.filter((a) => a.tokenType === 0)
  const nftAssets = pinnedAssets.filter((a) => a.tokenType === 1 || a.tokenType === 2)

  const results: EnrichedPinnedAsset[] = []

  // ===== BATCH FETCH ERC20 TOKENS =====
  if (erc20Assets.length > 0) {
    try {
      const erc20Addresses = erc20Assets.map((a) => a.token)

      // Step 1: Get balances for specific tokens using contractAddresses parameter
      const tokenBalancesResponse = await alchemy.core.getTokenBalances(
        treasuryAddress,
        erc20Addresses
      )

      // Step 2: Batch fetch metadata (reuse existing method)
      const metadataResult = await getCachedTokenMetadatas(chainId, erc20Addresses)

      // Step 3: Batch fetch prices (reuse existing method)
      const pricesResult = await getCachedTokenPrices(chainId, erc20Addresses)

      // Step 4: Combine data
      for (const asset of erc20Assets) {
        const balance = tokenBalancesResponse.tokenBalances.find(
          (b) => b.contractAddress.toLowerCase() === asset.token.toLowerCase()
        )
        const metadata = metadataResult?.data.find(
          (m) => m.address.toLowerCase() === asset.token.toLowerCase()
        )
        const price = pricesResult?.data.find(
          (p) => p.address.toLowerCase() === asset.token.toLowerCase()
        )

        const balanceAmount =
          balance?.tokenBalance && balance.tokenBalance !== zeroHash
            ? fromHex(balance.tokenBalance as Hex, 'bigint').toString()
            : '0'

        const valueInUSD =
          metadata && price && balanceAmount !== '0'
            ? (
                parseFloat(formatUnits(BigInt(balanceAmount), metadata.decimals)) *
                parseFloat(price.price)
              ).toFixed(2)
            : '0'

        results.push({
          tokenType: 0,
          token: asset.token,
          isCollection: asset.isCollection,
          balance: balanceAmount,
          name: metadata?.name || '',
          symbol: metadata?.symbol || '',
          decimals: metadata?.decimals || 18,
          logo: metadata?.logo || '',
          price: price?.price || '0',
          valueInUSD,
          isPinned: true,
        })
      }
    } catch (error) {
      console.error('Error fetching ERC20 pinned assets:', error)
      // Continue with partial results instead of throwing
    }
  }

  // ===== BATCH FETCH NFTs =====
  if (nftAssets.length > 0) {
    const nftPromises = nftAssets.map(async (asset) => {
      try {
        if (asset.isCollection) {
          // For collections, return basic info without specific NFT data
          return {
            tokenType: asset.tokenType,
            token: asset.token,
            isCollection: true,
            isPinned: true,
          } as EnrichedPinnedAsset
        } else if (asset.tokenId) {
          // Fetch specific NFT
          const metadata = await getCachedNftMetadata(chainId, asset.token, asset.tokenId)

          if (!metadata) return null

          return {
            tokenType: asset.tokenType,
            token: asset.token,
            isCollection: false,
            tokenId: asset.tokenId,
            name: metadata.data.name || undefined,
            image: metadata.data.image || undefined,
            collectionName: undefined, // Could fetch from contract metadata if needed
            balance: '1', // Simplified, could check actual balance for ERC1155
            isPinned: true,
          } as EnrichedPinnedAsset
        }
        return null
      } catch (error) {
        console.error(`Error fetching NFT ${asset.token}:${asset.tokenId}:`, error)
        return null
      }
    })

    const nftResults = await Promise.all(nftPromises)
    results.push(...(nftResults.filter(Boolean) as EnrichedPinnedAsset[]))
  }

  return results
}
