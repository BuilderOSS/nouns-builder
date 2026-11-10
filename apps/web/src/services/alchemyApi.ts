import {
  ALCHEMY_NETWORKS,
  ALCHEMY_PRICES_URL,
  getAlchemyServerNftUrl,
  getAlchemyServerRpcUrl,
} from '@buildeross/constants/alchemy'
import { CHAIN_ID, NftTokenType } from '@buildeross/types'
import {
  alchemyServerFetch,
  isAlchemyServerAuthConfigured,
} from '@buildeross/utils/alchemyAuth'

/**
 * Minimal server-side client for the Alchemy APIs we use. Requests go to
 * keyless URLs and authenticate with an `Authorization` header (a signed JWT,
 * or a server API key), which `alchemy-sdk` can't do: it always puts the key
 * in the URL path.
 */

/** A failed Alchemy request, with the JSON-RPC error code when Alchemy sent one */
export class AlchemyRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly rpcCode?: number
  ) {
    super(message)
    this.name = 'AlchemyRequestError'
  }
}

const JSON_RPC_INVALID_PARAMS = -32602

/**
 * Alchemy rejects contracts that aren't ERC-20 tokens (e.g. Permit2, NFTs)
 * with JSON-RPC "Invalid params".
 */
export const isAlchemyInvalidParamsError = (error: unknown): boolean =>
  error instanceof AlchemyRequestError && error.rpcCode === JSON_RPC_INVALID_PARAMS

const parseRpcErrorCode = (detail: string): number | undefined => {
  try {
    const code = JSON.parse(detail)?.error?.code
    return typeof code === 'number' ? code : undefined
  } catch {
    return undefined
  }
}

const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 500

const isRetryable = (status: number) => status === 429 || status >= 500

const request = async <T>(url: string, body?: unknown): Promise<T> => {
  const init: RequestInit =
    body === undefined
      ? { headers: { accept: 'application/json' } }
      : {
          method: 'POST',
          headers: { accept: 'application/json', 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }
  for (let attempt = 1; ; attempt++) {
    const response = await alchemyServerFetch(url, init)
    if (response.ok) return (await response.json()) as T

    if (attempt >= MAX_ATTEMPTS || !isRetryable(response.status)) {
      const detail = await response.text().catch(() => '')
      // JSON-RPC errors can arrive with a 4xx status and the error in the body
      throw new AlchemyRequestError(
        `Alchemy request to ${new URL(url).pathname} failed with ${response.status}: ${detail}`,
        response.status,
        parseRpcErrorCode(detail)
      )
    }
    await new Promise((resolve) =>
      setTimeout(resolve, RETRY_DELAY_MS * 2 ** (attempt - 1))
    )
  }
}

export type AlchemyTokenBalancesResponse = {
  address: string
  tokenBalances: { contractAddress: string; tokenBalance: string | null }[]
  pageKey?: string
}

export type AlchemyTokenMetadataResponse = {
  name: string | null
  symbol: string | null
  decimals: number | null
  logo: string | null
}

export type AlchemyNft = {
  contract: { address: string; isSpam?: boolean | null }
  tokenId: string
  tokenType: NftTokenType
  name?: string | null
  description?: string | null
  image?: { cachedUrl?: string | null; originalUrl?: string | null }
  collection?: { name?: string | null } | null
  tokenUri?: string | null
  balance?: string
}

export type AlchemyOwnedNftsResponse = {
  ownedNfts: AlchemyNft[]
  pageKey?: string | null
  totalCount: number
}

export type AlchemyTokenPricesResponse = {
  data: {
    network: string
    address: string
    prices: { currency: string; value: string; lastUpdatedAt: string }[]
    error: string | null
  }[]
}

export type AlchemyClient = ReturnType<typeof createAlchemyClient>

const createAlchemyClient = (chainId: CHAIN_ID, network: string) => {
  const rpcUrl = getAlchemyServerRpcUrl(chainId)!
  const nftUrl = getAlchemyServerNftUrl(chainId)!

  const rpc = async <T>(method: string, params: unknown[]): Promise<T> => {
    const response = await request<{
      result?: T
      error?: { code: number; message: string }
    }>(rpcUrl, { jsonrpc: '2.0', id: 1, method, params })
    if (response.error) {
      throw new AlchemyRequestError(
        `Alchemy ${method} failed: ${response.error.message}`,
        undefined,
        response.error.code
      )
    }
    return response.result as T
  }

  const nft = <T>(path: string, query: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params.set(key, value)
    }
    return request<T>(`${nftUrl}/${path}?${params}`)
  }

  return {
    /** ERC20 balances held by `owner`, for all tokens or the given contracts. */
    getTokenBalances: (owner: string, contractAddresses?: string[]) =>
      rpc<AlchemyTokenBalancesResponse>('alchemy_getTokenBalances', [
        owner,
        contractAddresses ?? 'erc20',
      ]),

    getTokenMetadata: (contractAddress: string) =>
      rpc<AlchemyTokenMetadataResponse>('alchemy_getTokenMetadata', [contractAddress]),

    getNftsForOwner: (owner: string, options?: { pageKey?: string }) =>
      nft<AlchemyOwnedNftsResponse>('getNFTsForOwner', {
        owner,
        withMetadata: 'true',
        pageKey: options?.pageKey,
      }),

    getNftMetadata: (contractAddress: string, tokenId: string) =>
      nft<AlchemyNft>('getNFTMetadata', { contractAddress, tokenId }),

    /** Up to 25 addresses per call. */
    getTokenPricesByAddress: (addresses: string[]) =>
      request<AlchemyTokenPricesResponse>(`${ALCHEMY_PRICES_URL}/tokens/by-address`, {
        addresses: addresses.map((address) => ({ network, address })),
      }),
  }
}

/** Null when the chain isn't on Alchemy or no server credentials are set. */
export const getAlchemyClient = (chainId: CHAIN_ID): AlchemyClient | null => {
  const network = ALCHEMY_NETWORKS[chainId]
  if (!network || !isAlchemyServerAuthConfigured()) {
    return null
  }
  return createAlchemyClient(chainId, network)
}
