import { CHAIN_ID } from '@buildeross/types'
import { Address } from 'viem'

import { SDK } from '../client'
import { DaoVoter_OrderBy, OrderDirection } from '../sdk.generated'

export type DaoVoter = {
  voter: Address
  tokens: number[]
  tokenCount: number
  timeJoined: number
}

export const votersRequest = async (
  chainId: CHAIN_ID,
  collectionAddress: string,
  page?: number,
  limit = 10
): Promise<DaoVoter[] | undefined> => {
  try {
    const data = await SDK.connect(chainId).daoVoters({
      where: {
        dao: collectionAddress.toLowerCase(),
      },
      first: limit,
      skip: page ? (page - 1) * limit : 0,
      orderBy: DaoVoter_OrderBy.DaoTokenCount,
      orderDirection: OrderDirection.Desc,
    })

    if (!data.daovoters) return undefined

    return data.daovoters.map((member) => ({
      voter: member.voter as Address,
      tokens: member.daoTokens.map((token) => Number(token.tokenId)) as number[],
      tokenCount: Number(member.daoTokenCount),
      timeJoined: member.daoTokens
        .map((daoToken) => Number(daoToken.mintedAt))
        .sort((a, b) => a - b)[0] as number,
    }))
  } catch (error) {
    console.error(error)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(error)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
  }
}
