import { CHAIN_ID } from '@buildeross/types'
import { Address } from 'viem'

import { SDK } from 'src/data/subgraph/client'

export type DaoMembershipResponse = {
  member: Address
  delegate: Address
  tokenCount: number
  voteCount: number
  voteDistribution: Record<Address, number>
  timeJoined: number
}

export const daoMembershipRequest = async (
  chainId: CHAIN_ID,
  collectionAddress: string,
  memberAddress: string
): Promise<DaoMembershipResponse | null> => {
  const data = await SDK.connect(chainId).daoMembership({
    voterId: `${collectionAddress.toLowerCase()}:${memberAddress.toLowerCase()}`,
    ownerId: `${collectionAddress.toLowerCase()}:${memberAddress.toLowerCase()}`,
  })

  if (!data.daotokenOwner && !data.daovoter) return null

  return {
    member: data.daotokenOwner?.owner ?? data.daovoter?.voter,
    delegate: data.daotokenOwner?.delegate ?? data.daovoter?.voter,
    tokenCount: data.daotokenOwner?.daoTokenCount ?? 0,
    voteCount: data.daovoter?.daoTokenCount ?? 0,
    voteDistribution:
      data.daovoter?.daoTokens?.reduce(
        (acc, token) => {
          acc[token.owner] = (acc[token.owner] ?? 0) + 1
          return acc
        },
        {} as Record<Address, number>
      ) ?? {},
    timeJoined: [
      ...(data.daotokenOwner?.daoTokens ?? []),
      ...(data.daovoter?.daoTokens ?? []),
    ]
      .map((daoToken) => Number(daoToken.mintedAt))
      .sort((a, b) => a - b)[0] as number,
  }
}
