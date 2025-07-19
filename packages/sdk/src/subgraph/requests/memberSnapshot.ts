import { SDK } from '../client'
import { DaoTokenOwner_OrderBy, OrderDirection } from '../sdk.generated'
import { applyL1ToL2Alias } from './applyL1ToL2Alias'
import { CHAIN_ID } from '@buildeross/types'
import { Address } from 'viem'

export type DaoMember = {
  ownerAlias: Address
  owner: Address
  delegate: Address
  tokens: number[]
  tokenCount: number
  timeJoined: number
}

export const memberSnapshotRequest = async (
  chainId: CHAIN_ID,
  collectionAddress: string,
): Promise<DaoMember[]> => {
  const data = await SDK.connect(chainId).daoMembersList({
    where: {
      dao: collectionAddress.toLowerCase(),
    },
    first: 1000,
    orderBy: DaoTokenOwner_OrderBy.DaoTokenCount,
    orderDirection: OrderDirection.Desc,
  })

  if (!data.daotokenOwners) throw new Error('No token owner found')

  const formattedMembers: DaoMember[] = await Promise.all(
    data.daotokenOwners.map(async (member) => {
      let tokenOwner = await applyL1ToL2Alias({
        l1ChainId: chainId,
        address: member.owner,
      })

      return {
        ownerAlias: tokenOwner as Address,
        owner: member.owner as Address,
        delegate: member.delegate as Address,
        tokens: member.daoTokens.map((token) => Number(token.tokenId)) as number[],
        tokenCount: Number(member.daoTokenCount),
        timeJoined: member.daoTokens
          .map((daoToken) => Number(daoToken.mintedAt))
          .sort((a, b) => a - b)[0] as number,
      }
    }),
  )

  return formattedMembers
}
