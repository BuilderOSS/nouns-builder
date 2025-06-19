import { Alchemy, Network, NftFilters, OwnedNft, TokenBalanceType } from 'alchemy-sdk'
import { Hex, fromHex, zeroHash } from 'viem'

import { ALCHEMY_API_KEY, ALCHEMY_NETWORKS } from 'src/constants/alchemy'
import { AddressType, CHAIN_ID } from 'src/typings'

export type TokenBalance = {
  address: AddressType
  balance: bigint
}

export const getTokenBalances = async (
  chainId: CHAIN_ID,
  address: AddressType
): Promise<TokenBalance[] | undefined> => {
  const network = ALCHEMY_NETWORKS[chainId]
  if (!network || !ALCHEMY_API_KEY) {
    return undefined
  }
  const settings = {
    apiKey: ALCHEMY_API_KEY,
    network: network as Network,
  }
  const alchemy = new Alchemy(settings)
  const tokenBalances = await alchemy.core.getTokenBalances(address, {
    type: TokenBalanceType.ERC20,
  })

  const nonZeroBalances = tokenBalances.tokenBalances.filter(
    (balance) => !!balance.tokenBalance && balance.tokenBalance !== zeroHash
  )

  return nonZeroBalances.map((balance) => ({
    address: balance.contractAddress as AddressType,
    balance: fromHex(balance.tokenBalance! as Hex, 'bigint'),
  }))
}

export const getNFTBalance = async (
  chainId: CHAIN_ID,
  address: AddressType
): Promise<OwnedNft[] | undefined> => {
  const network = ALCHEMY_NETWORKS[chainId]
  if (!network || !ALCHEMY_API_KEY) {
    return undefined
  }
  const settings = {
    apiKey: ALCHEMY_API_KEY,
    network: network as Network,
  }
  const alchemy = new Alchemy(settings)
  const nfts = await alchemy.nft.getNftsForOwner(address, {
    excludeFilters: [NftFilters.SPAM],
  })

  return nfts.ownedNfts
}

export type TokenMetadata = {
  address: AddressType
  name: string
  symbol: string
  decimals: number
  logo: string
}

export const getTokenMetadatas = async (
  chainId: CHAIN_ID,
  addresses: AddressType[]
): Promise<TokenMetadata[] | undefined> => {
  const network = ALCHEMY_NETWORKS[chainId]
  if (!network || !ALCHEMY_API_KEY) {
    return undefined
  }
  const settings = {
    apiKey: ALCHEMY_API_KEY,
    network: network as Network,
  }
  const alchemy = new Alchemy(settings)
  const metadatas = await Promise.all(
    addresses.map((address) => alchemy.core.getTokenMetadata(address))
  )
  return metadatas.map((metadata, i) => ({
    address: addresses[i] as AddressType,
    name: metadata.name ?? '',
    symbol: metadata.symbol ?? '',
    decimals: metadata.decimals ?? 18,
    logo: metadata.logo ?? '',
  }))
}

export type TokenPrice = {
  symbol: string
  price: string
}

export const getTokenPrices = async (
  chainId: CHAIN_ID,
  symbols: string[]
): Promise<TokenPrice[] | undefined> => {
  const network = ALCHEMY_NETWORKS[chainId]
  if (!network || !ALCHEMY_API_KEY) {
    return undefined
  }
  const settings = {
    apiKey: ALCHEMY_API_KEY,
    network: network as Network,
  }
  const alchemy = new Alchemy(settings)

  const prices = await alchemy.prices.getTokenPriceBySymbol(symbols)

  return prices.data.map((price) => ({
    symbol: price.symbol,
    price: price.prices.find((p) => p.currency.toLowerCase() === 'usd')?.value ?? '0',
  }))
}
