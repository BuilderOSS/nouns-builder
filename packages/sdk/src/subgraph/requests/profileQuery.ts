import type { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import type { ProfileQuery } from '../sdk.generated'

export type ProfileResponse = NonNullable<ProfileQuery['profile']>

export const profileQuery = async (
  chainId: CHAIN_ID,
  address: string
): Promise<ProfileResponse | null> => {
  const sdk = SDK.connect(chainId)
  const normalizedAddress = address.toLowerCase()

  const data = await sdk.profile({
    address: normalizedAddress,
    firstOwner: 100,
    firstVoter: 100,
  })

  return data.profile ?? null
}

// Helper to merge ownerDaos and voterDaos into unique DAO list
export const getUniqueDaosFromProfile = (profile: ProfileResponse) => {
  const daoMap = new Map()

  profile.ownerDaos.forEach(({ dao }) => {
    daoMap.set(dao.tokenAddress, dao)
  })

  profile.voterDaos.forEach(({ dao }) => {
    if (!daoMap.has(dao.tokenAddress)) {
      daoMap.set(dao.tokenAddress, dao)
    }
  })

  return Array.from(daoMap.values())
}
