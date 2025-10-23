import { Address } from 'viem'

export type TokenMetadata = {
  address: Address
  name: string
  symbol: string
  decimals: number
  logo: string
}

export enum NftTokenType {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
  NO_SUPPORTED_NFT_STANDARD = 'NO_SUPPORTED_NFT_STANDARD',
  NOT_A_CONTRACT = 'NOT_A_CONTRACT',
  UNKNOWN = 'UNKNOWN',
}

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
