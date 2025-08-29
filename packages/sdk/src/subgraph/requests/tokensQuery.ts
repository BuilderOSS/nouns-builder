import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import { OrderDirection, Token_OrderBy, TokenFragment } from '../sdk.generated'

export interface TokensQueryResponse {
  tokens: TokenFragment[]
  hasNextPage: boolean
}

export const tokensQuery = async (
  chain: CHAIN_ID,
  owner: string,
  page?: number
): Promise<TokensQueryResponse> => {
  const limit = 12
  const res = await SDK.connect(chain).tokens({
    where: {
      owner: owner.toLowerCase(),
    },
    orderBy: Token_OrderBy.MintedAt,
    orderDirection: OrderDirection.Desc,
    skip: page ? (page - 1) * limit : undefined,
    first: limit,
  })

  return {
    tokens: res.tokens,
    hasNextPage: res.tokens.length === limit,
  }
}
