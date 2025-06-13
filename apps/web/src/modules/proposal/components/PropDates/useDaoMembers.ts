import useSWR from 'swr'
import { Address } from 'viem'

import {
  type DaoMember,
  memberSnapshotRequest,
} from 'src/data/subgraph/requests/memberSnapshot'

export const useDaoMembers = (chainId: number, token: string) => {
  const { data: members } = useSWR<DaoMember[], Error>(
    !!token ? ['members', chainId, token] : null,
    () => memberSnapshotRequest(chainId, token)
  )

  if (!members) {
    return []
  }

  return members.reduce(
    (acc: Address[], member: DaoMember) => [...acc, member.owner, member.delegate],
    []
  )
}
