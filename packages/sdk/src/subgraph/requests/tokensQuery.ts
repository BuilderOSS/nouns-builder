import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import {
  OrderDirection,
  Token_Filter,
  Token_OrderBy,
  TokenFragment,
} from '../sdk.generated'

export interface TokensQueryResponse {
  tokens: TokenFragment[]
  hasNextPage: boolean
}

export type ProfileTokenSort =
  | 'newest'
  | 'oldest'
  | 'dao-name-asc'
  | 'token-id-asc'
  | 'token-id-desc'

export type TokensQueryOptions = {
  sort?: ProfileTokenSort
  daoAddresses?: string[]
  hiddenDaoAddresses?: string[]
}

const getSortParams = (
  sort: ProfileTokenSort = 'newest'
): { orderBy: Token_OrderBy; orderDirection: OrderDirection } => {
  switch (sort) {
    case 'oldest':
      return { orderBy: Token_OrderBy.MintedAt, orderDirection: OrderDirection.Asc }
    case 'dao-name-asc':
      return { orderBy: Token_OrderBy.DaoName, orderDirection: OrderDirection.Asc }
    case 'token-id-asc':
      return { orderBy: Token_OrderBy.TokenId, orderDirection: OrderDirection.Asc }
    case 'token-id-desc':
      return { orderBy: Token_OrderBy.TokenId, orderDirection: OrderDirection.Desc }
    case 'newest':
    default:
      return { orderBy: Token_OrderBy.MintedAt, orderDirection: OrderDirection.Desc }
  }
}

export const tokensQuery = async (
  chain: CHAIN_ID,
  owner: string,
  page?: number,
  options: TokensQueryOptions = {}
): Promise<TokensQueryResponse> => {
  const limit = 12
  const where: Token_Filter = {
    owner: owner.toLowerCase(),
  }
  const daoAddresses = options.daoAddresses
    ?.filter(Boolean)
    .map((dao) => dao.toLowerCase())
  const hiddenDaoAddresses = options.hiddenDaoAddresses
    ?.filter(Boolean)
    .map((dao) => dao.toLowerCase())

  if (daoAddresses?.length) {
    where.tokenContract_in = daoAddresses
  }

  if (hiddenDaoAddresses?.length) {
    where.tokenContract_not_in = hiddenDaoAddresses
  }

  const { orderBy, orderDirection } = getSortParams(options.sort)

  const res = await SDK.connect(chain).tokens({
    where,
    orderBy,
    orderDirection,
    skip: page ? (page - 1) * limit : 0,
    first: limit,
  })

  return {
    tokens: res.tokens,
    hasNextPage: res.tokens.length === limit,
  }
}
